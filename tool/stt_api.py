import os
import re
import uuid
import base64
import json
from fastapi import FastAPI, BackgroundTasks, Response, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from openai import OpenAI, OpenAIError
from elevenlabs import ElevenLabs
import msgpack
from prompts import hindi_correction_prompt, translation_prompt, sales_call_analysis_prompt

load_dotenv()

app = FastAPI()
JOBS = {}  # In-memory job store (use a database or Redis in production)

def split_by_speaker_sentences(text: str) -> list[str]:
    """Split text into sentences, preserving speaker labels."""
    blocks = re.split(r'(Speaker\s+\d+:)', text)
    chunks, current_speaker = [], ""
    for part in blocks:
        if re.match(r'Speaker\s+\d+:', part):
            current_speaker = part.strip()
        elif part.strip():
            sentences = re.split(r'(?<=[।!?])\s+', part.strip())
            chunks.extend(f"{current_speaker} {s.strip()}" for s in sentences if s)
    return chunks

def group_chunks_by_size(chunks: list[str], max_chars: int = 2500) -> list[str]:
    """Group text chunks so each group is under max_chars."""
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

def request_openai(prompt: str, openai_api_key: str, model: str = "gpt-4", temperature: float = 0) -> str:
    """Send a prompt to OpenAI and return the response text."""
    try:
        openai_client = OpenAI(api_key=openai_api_key)
        response = openai_client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature
        )
        return response.choices[0].message.content.strip()
    except OpenAIError as e:
        return f"Error: {str(e)}"
    except Exception as e:
        return f"Error: {str(e)}"

def correct_hindi_conversation(raw_conversation: str, openai_api_key: str) -> str:
    """Correct Hindi conversation using OpenAI."""
    chunks = group_chunks_by_size(split_by_speaker_sentences(raw_conversation))
    return "\n".join(request_openai(hindi_correction_prompt(chunk), openai_api_key) for chunk in chunks)

def translate_hindi_to_english(hindi_text: str, openai_api_key: str) -> str:
    """Translate Hindi text to English using OpenAI."""
    chunks = group_chunks_by_size(split_by_speaker_sentences(hindi_text))
    return "\n".join(request_openai(translation_prompt(chunk), openai_api_key, model="gpt-4o") for chunk in chunks)

def analyze_sales_call(transcript: str, prompts, openai_api_key: str) -> str:
    """Analyze sales call transcript using OpenAI."""
    content = request_openai(sales_call_analysis_prompt(prompts, transcript), openai_api_key, model="gpt-4o")
    if content.startswith("Error:"):
        return content
    return content[6:-4] if content.startswith('{"user') else content

def format_transcription(words: list) -> str:
    """Format transcription words into speaker-labeled text."""
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

def strip_triple_quotes(s: str) -> str:
    """Remove triple quotes from a string if present."""
    if s.startswith('"""') and s.endswith('"""'):
        return s[3:-3].strip()
    return s

def strip_all_triple_quotes(s: str) -> str:
    """Remove all triple quotes from a string, anywhere they appear."""
    return s.replace('"""', '').strip()

def remove_double_asterisks(s: str) -> str:
    """Remove all double asterisks (markdown bold) from a string."""
    return s.replace('**', '')

def clean_and_parse_json_string(s: str) -> dict:
    """Clean and parse a JSON string, handling common formatting issues."""
    s = s.strip()
    if s.startswith("```"):
        s = re.sub(r"^```(?:json)?\n?", "", s)
        s = re.sub(r"\n?```$", "", s)
    s = s.replace("\\n", "\n").replace('\\"', '"')
    s = s.strip()
    try:
        return json.loads(s)
    except Exception:
        return {"error": "Failed to parse analysis JSON", "raw_analysis": s}

def generate_combined_output(raw_convo: str, prompts, openai_api_key: str) -> dict:
    """Run correction, translation, and analysis on a conversation."""

    print("raw_convo output")
    print(raw_convo)

    corrected = correct_hindi_conversation(raw_convo, openai_api_key)

    print("corrected output")
    print(corrected)

    # Remove all triple quotes from the corrected output
    corrected = strip_all_triple_quotes(corrected)

    print("corrected output after strip_all_triple_quotes")
    print(corrected)

    translated = translate_hindi_to_english(corrected, openai_api_key)

    print("translated output")
    print(translated)

    # Remove all double asterisks from the translated output
    translated = remove_double_asterisks(translated)

    print("translated output after remove_double_asterisks")
    print(translated)

    analysis_str = analyze_sales_call(translated, prompts, openai_api_key)

    print("analysis_str output")
    print(analysis_str)

    if analysis_str.startswith("Error:"):
        analysis = {"error": analysis_str}
    else:
        analysis = clean_and_parse_json_string(analysis_str)

    print("analysis output")
    print(analysis)

    return_val = {
        "actual": corrected,
        "translated": translated,
        **analysis
    }
    print("return_val output")
    print(return_val)
    return return_val

@app.post('/transcribe')
async def transcribe_audio(background_tasks: BackgroundTasks, request: Request):
    """Endpoint to transcribe audio and start background processing."""
    body = await request.json()
    openai_api_key = body.get('openai_api_key')
    elevenlabs_api_key = body.get('elevenlabs_api_key')
    prompts = body.get('prompts', {})
    audio_b64 = body.get('audio')
    if not (openai_api_key and elevenlabs_api_key and audio_b64):
        return JSONResponse({'error': 'Missing required fields.'}, status_code=400)
    job_id = str(uuid.uuid4())
    audio_path = f'/tmp/{job_id}.wav'
    try:
        audio_bytes = base64.b64decode(audio_b64)
        with open(audio_path, 'wb') as f:
            f.write(audio_bytes)
    except Exception as e:
        return JSONResponse({'error': f'Invalid audio encoding: {e}'}, status_code=400)
    JOBS[job_id] = {'status': 'queued'}
    background_tasks.add_task(process_audio_job, job_id, audio_path, openai_api_key, elevenlabs_api_key, prompts)
    return JSONResponse({'job_id': job_id, 'status': 'queued'}, status_code=202)

def process_audio_job(job_id, audio_path, openai_api_key, elevenlabs_api_key, prompts):
    """Background task to process audio, transcribe, and analyze."""
    try:
        elevenlabs_client = ElevenLabs(api_key=elevenlabs_api_key)
        with open(audio_path, 'rb') as audio_data:
            transcription = elevenlabs_client.speech_to_text.convert(
                file=audio_data,
                model_id="scribe_v1",
                tag_audio_events=True,
                num_speakers=2,
                timestamps_granularity="word",
                diarize=True
            )
        formatted = format_transcription(transcription.words)

        #print("Raw analysis output")
        #print(formatted)

        result = generate_combined_output(formatted, prompts, openai_api_key)

        JOBS[job_id]['status'] = 'complete'
        JOBS[job_id]['result'] = result
    except Exception as e:
        JOBS[job_id]['status'] = 'failed'
        JOBS[job_id]['error'] = str(e)
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)

def parse_transcription_response(response: dict) -> dict:
    """Parse the transcription/analysis response, ensuring it's a dict."""
    try:
        if isinstance(response, str):
            try:
                response = json.loads(response)
            except json.JSONDecodeError:
                raise ValueError("Response is a string but not valid JSON")
        return response
    except Exception as e:
        raise ValueError(f"Failed to parse response: {e}")

@app.get('/status/{job_id}')
def check_status(job_id: str):
    """Endpoint to check the status/result of a transcription job."""
    job = JOBS.get(job_id)
    if not job:
        return Response(msgpack.packb({'error': 'Job not found'}), status_code=404, media_type='application/x-msgpack')
    if job['status'] == 'complete':
        #print(type(job['result']))
        #return Response(msgpack.packb(job['result']), status_code=200, media_type='application/x-msgpack')
        return Response(json.dumps(job['result']), status_code=200, media_type='application/x-msgpack')
    return Response(msgpack.packb(job), status_code=202, media_type='application/x-msgpack')

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("stt_api:app", host="0.0.0.0", port=8002, reload=True)
