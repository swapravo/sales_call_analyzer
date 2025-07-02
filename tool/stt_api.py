from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, Response
from fastapi.responses import JSONResponse
from io import BytesIO
import threading
import uuid
import os
from openai import OpenAI, OpenAIError
import requests
import re
from elevenlabs import ElevenLabs
import json
import os
from dotenv import load_dotenv
from prompts import hindi_correction_prompt, translation_prompt, sales_call_analysis_prompt
import msgpack


# Load environment variables
load_dotenv()

# Get API keys from environment variables
openai_api_key = os.getenv('OPENAI_API_KEY')
elevenlabs_api_key = os.getenv('ELEVENLABS_API_KEY')

if not openai_api_key:
    raise ValueError("OpenAI API key not found in environment variables.")
if not elevenlabs_api_key:
    raise ValueError("ElevenLabs API key not found in environment variables.")

app = FastAPI()

# Clients
openai_client = OpenAI(api_key=openai_api_key)
elevenlabs_client = ElevenLabs(api_key=elevenlabs_api_key)


# ----------------------- UTILITY FUNCTIONS -----------------------

def split_by_speaker_sentences(text: str) -> list[str]:
    """Splits transcript into sentences per speaker."""
    blocks = re.split(r'(Speaker\s+\d+:)', text)
    chunks, current_speaker = [], ""
    for part in blocks:
        if re.match(r'Speaker\s+\d+:', part):
            current_speaker = part.strip()
        elif part.strip():
            sentences = re.split(r'(?<=[।!?])\s+', part.strip())
            chunks.extend(f"{current_speaker} {s.strip()}" for s in sentences if s)
    return chunks


def group_chunks_by_size(chunks: list[str], max_chars: int = 1500) -> list[str]:
    """Groups sentence chunks under a character limit."""
    grouped, buffer = [], ""
    for chunk in chunks:
        if len(buffer) + len(chunk) < max_chars:
            buffer += chunk + " "
        else:
            grouped.append(buffer.strip())
            buffer = chunk + " "
    if buffer:
        grouped.append(buffer.strip())
    return grouped


def request_openai(prompt: str, model: str = "gpt-4", temperature: float = 0.3) -> str:
    """Handles OpenAI chat completion requests."""
    try:
        response = openai_client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature
        )
        return response.choices[0].message.content.strip()
    except OpenAIError as e:
        # Return a structured error
        return {"error": str(e), "type": "openai_error"}
    except Exception as e:
        return {"error": str(e), "type": "general_error"}


# ----------------------- NLP PROCESSING -----------------------

def correct_hindi_conversation(raw_conversation: str) -> str:
    chunks = group_chunks_by_size(split_by_speaker_sentences(raw_conversation))
#    return "\n\n".join(request_openai(hindi_correction_prompt(raw_conversation)) for chunk in chunks)
    return "\n\n".join(request_openai(hindi_correction_prompt(chunk)) for chunk in chunks)


def translate_hindi_to_english(hindi_text: str) -> str:
    chunks = group_chunks_by_size(split_by_speaker_sentences(hindi_text))
#    return "\n".join(request_openai(translation_prompt(hindi_text), model="gpt-4o") for chunk in chunks)
    return "\n".join(request_openai(translation_prompt(chunk), model="gpt-4o") for chunk in chunks)


def analyze_sales_call(transcript: str) -> str:
    content = request_openai(sales_call_analysis_prompt(transcript), model="gpt-4o")
    return content[8:-4]  # clean unwanted prefix/suffix


def format_transcription(words: list) -> str:
    """Formats word-level transcription into speaker-tagged lines."""
    output, current_line = [], []
    speaker_map, speaker_count = {}, 1
    current_speaker = None

    for word in words:
        if getattr(word, "type", None) not in ["word", "spacing"]:
            continue

        speaker_id = getattr(word, "speaker_id", None)
        text = getattr(word, "text", "")

        if speaker_id not in speaker_map:
            speaker_map[speaker_id] = f"Speaker {speaker_count}"
            speaker_count += 1

        if speaker_id == current_speaker:
            current_line.append(text)
        else:
            if current_line:
                output.append(f"{speaker_map[current_speaker]}: {''.join(current_line).strip()}")
            current_line, current_speaker = [text], speaker_id

    if current_line:
        output.append(f"{speaker_map[current_speaker]}: {''.join(current_line).strip()}")

    return '\n'.join(output)


def generate_combined_output(raw_convo: str) -> dict:
    """Runs correction, translation, and analysis on raw transcript."""
    corrected = correct_hindi_conversation(raw_convo)
    translated = translate_hindi_to_english(corrected)
    analysis_str = analyze_sales_call(translated)

    # Parse the analysis JSON string into a proper Python dictionary
    try:
        analysis = json.loads(analysis_str)
    except json.JSONDecodeError:
        # If parsing fails, return the raw string
        analysis = {"error": "Failed to parse analysis JSON", "raw_analysis": analysis_str}

    # Create a flat dictionary with all fields
    return_val = {
        "transcription": translated,
        **analysis  # This spreads all the analysis fields into the top level
    }
    
    return return_val

# ----------------------- FLASK ROUTES -----------------------

# In-memory job store (use a database or Redis in production)
JOBS = {}

@app.post('/transcribe')
async def transcribe_audio(background_tasks: BackgroundTasks, audio: UploadFile = File(...), webhook_url: str = Form(None)):
    """Receives audio file and starts background transcription job."""
    job_id = str(uuid.uuid4())
    audio_path = f'/tmp/{job_id}.wav'
    with open(audio_path, 'wb') as f:
        f.write(await audio.read())

    JOBS[job_id] = {
        'status': 'queued',
        'webhook_url': webhook_url
    }
    background_tasks.add_task(process_audio_job, job_id, audio_path)
    return JSONResponse({'job_id': job_id, 'status': 'queued'}, status_code=202)


def process_audio_job(job_id, audio_path):
    """Performs transcription and processing in the background."""
    try:
        print(f"[{job_id}] 🎙️ Starting transcription...")

        with open(audio_path, 'rb') as audio_data:
            transcription = elevenlabs_client.speech_to_text.convert(
                file=audio_data,
                model_id="scribe_v1",
                tag_audio_events=True,
                num_speakers=2,
                timestamps_granularity="word",
                diarize=True
            )

        print(f"[{job_id}] 📝 Formatting transcription...")
        formatted = format_transcription(transcription.words)
        result = generate_combined_output(formatted)

        JOBS[job_id]['status'] = 'complete'
        JOBS[job_id]['result'] = result

        print(f"[{job_id}] ✅ Job completed successfully.")

        # Webhook callback if provided
        webhook_url = JOBS[job_id].get('webhook_url')
        if webhook_url:
            try:
                print(f"[{job_id}] 📡 Sending callback to webhook...")
                requests.post(webhook_url, json={
                    'job_id': job_id,
                    'status': 'complete',
                    'result': result
                })
            except Exception as e:
                print(f"[{job_id}] ❌ Webhook failed: {e}")

    except Exception as e:
        print(f"[{job_id}] ❌ Error: {str(e)}")
        JOBS[job_id]['status'] = 'failed'
        JOBS[job_id]['error'] = str(e)

    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)

@app.get('/status/{job_id}')
def check_status(job_id: str):
    """Check the status of a transcription job."""
    job = JOBS.get(job_id)
    if not job:
        return Response(msgpack.packb({'error': 'Job not found'}), status_code=404, media_type='application/x-msgpack')
    if job['status'] == 'complete':
        print("being returned from the server")
        print(job['result'])
        return Response(msgpack.packb(job['result']), status_code=200, media_type='application/x-msgpack')
    else:
        return Response(msgpack.packb(job), status_code=202, media_type='application/x-msgpack')


# ----------------------- MAIN ENTRY -----------------------

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("stt_api:app", host="0.0.0.0", port=8002, reload=True)
