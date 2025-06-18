import requests
import os
import time
import json
import msgpack
import pickle
import json
import os

from .audio_db import add_audio_file, add_audio_metadata, get_audio_by_id

#FLASK_TRANSCRIBE_URL = "http://13.202.147.27:8001/transcribe"
#FLASK_STATUS_URL = "http://13.202.147.27:8001/status"
FLASK_TRANSCRIBE_URL = "http://0.0.0.0:8001/transcribe"
FLASK_STATUS_URL = "http://0.0.0.0:8001/status"
DOWNLOADED_FOLDER = "uploads"
SUPPORTED_AUDIO_EXTENSIONS = {
    ".aac", ".aiff", ".flac", ".m4a", ".mp3", ".mp4", ".ogg", ".opus", ".wav", ".webm"
}

# Upload audio file and return job_id
def send_file_to_flask(file_path: str):
    with open(file_path, 'rb') as audio:
        files = {'audio': (os.path.basename(file_path), audio)}
        try:
            response = requests.post(FLASK_TRANSCRIBE_URL, files=files)
            if response.status_code == 202:
                job_id = response.json().get("job_id")
                print(f"[{file_path}] 🚀 Job submitted. ID: {job_id}")
                return job_id
            else:
                print(f"[{file_path}] ❌ Submission failed: {response.status_code}, {response.text}")
        except Exception as e:
            print(f"[{file_path}] ❌ Request error: {e}")
    return None

def poll_job_status(job_id: str, max_attempts: int = 10, delay_sec: int = 60):
    print(f"[{job_id}] ⏳ Starting polling for up to {max_attempts} minutes...")
    for attempt in range(1, max_attempts + 1):
        try:
            response = requests.get(f"{FLASK_STATUS_URL}/{job_id}", headers={"Accept": "application/x-msgpack"})
            if response.status_code == 200:
                decoded = msgpack.unpackb(response.content, raw=False)

                # Log type and content
                print(f"[{job_id}] ✅ Transcription complete on attempt {attempt}")

                '''
                # Save the decoded response as a binary pickle file
                with open(f"{job_id}_response.pkl", "wb") as f:
                    pickle.dump(decoded, f)

                # Save the decoded response as a human-readable JSON file
                with open(f"{job_id}_response.json", "w", encoding="utf-8") as f:
                    json.dump(decoded, f, ensure_ascii=False, indent=4)
                '''

                return decoded

            elif response.status_code == 202:
                print(f"[{job_id}] 🕐 Attempt {attempt}: Still processing...")

            else:
                print(f"[{job_id}] ❌ Unexpected status: {response.status_code}")
                return None

        except Exception as e:
            print(f"[{job_id}] ❌ Polling error on attempt {attempt}: {e}")
            return None

        time.sleep(delay_sec)

    print(f"[{job_id}] ⏳ Max polling attempts reached. Job may still be processing.")
    return None

# Parses response into transcription and analysis parts
def parse_transcription_response(response: dict) -> dict:
    try:
        # Handle case where response might be a string
        if isinstance(response, str):
            try:
                response = json.loads(response)
            except json.JSONDecodeError:
                raise ValueError("Response is a string but not valid JSON")
        
        # The response is already flat, just return it directly
        return response

    except Exception as e:
        print(f"Error in parse_transcription_response: {str(e)}")
        print(f"Response type: {type(response)}")
        print(f"Response content: {response}")
        raise ValueError(f"Failed to parse response: {e}")

def process_audio_files(file_ids, table_uuid):
    for file_id in file_ids:
        # Get file information from database
        result = get_audio_by_id(file_id, table_uuid)
        
        if not result:
            print(f"[{file_id}] ❌ File not found in database")
            continue
            
        filename, file_content = result
        
        # Create a temporary file
        temp_path = os.path.join(DOWNLOADED_FOLDER, f"temp_{file_id}_{filename}")
        try:
            with open(temp_path, 'wb') as f:
                f.write(file_content)

            # Process the file
            job_id = send_file_to_flask(temp_path)
            if job_id:
                result = poll_job_status(job_id)
                if result:
                    # Parse the response (which is already flat)
                    parsed = parse_transcription_response(result)
                    if parsed:
                        # The parsed result is already flat, use it directly
                        add_audio_metadata(file_id, table_uuid, parsed)
                    else:
                        print(f"[{file_id}] ❌ Failed to parse response")

        except Exception as e:
            print(f"[{file_id}] ❌ Processing error: {e}")
        finally:
            # Clean up temporary file
            try:
                os.remove(temp_path)
            except Exception as e:
                print(f"[{file_id}] ⚠️ Failed to remove temporary file: {e}")
