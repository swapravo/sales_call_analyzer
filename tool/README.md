# Sales Call Analyzer – Speech-to-Text & Analysis API

This service provides a REST API for transcribing Hindi audio sales calls, correcting and translating the transcript, and analyzing the salesperson's performance. It leverages ElevenLabs for speech-to-text and OpenAI for language processing and analysis.

---

## Table of Contents
- [Features](#features)
- [Setup & Installation](#setup--installation)
- [API Endpoints](#api-endpoints)
  - [POST /transcribe](#post-transcribe)
  - [GET /status/{job_id}](#get-statusjob_id)
- [Data Formats](#data-formats)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [License](#license)

---

## Features
- **Audio Transcription**: Converts Hindi audio (with speaker diarization) to text.
- **Text Correction**: Cleans up transcription, fixes spelling, spacing, and transliterated terms.
- **Translation**: Translates corrected Hindi text to fluent English.
- **Sales Call Analysis**: Provides a detailed, structured JSON analysis of the salesperson's performance.
- **Webhook Support**: Optional callback when transcription is complete.

---

## Setup & Installation

1. **Clone the repository** and enter the `tool/` directory.

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env` and fill in your API keys:
     - `OPENAI_API_KEY`
     - `ELEVENLABS_API_KEY`

4. **Run the API server**:
   ```bash
   uvicorn stt_api:app --host 0.0.0.0 --port 8002
   ```
   Or use Docker:
   ```bash
   docker build -t stt-api .
   docker run -p 8002:8002 --env-file .env stt-api
   ```

---

## API Endpoints

### POST `/transcribe`
**Description:**
Submit an audio file for transcription and analysis. The job is processed asynchronously.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `audio` (file, required): Hindi audio file (WAV format recommended)
  - `webhook_url` (string, optional): URL to receive a callback when the job is complete

**Response:**
- **Status:** `202 Accepted`
- **Body:**
  ```json
  {
    "job_id": "<uuid>",
    "status": "queued"
  }
  ```

---

### GET `/status/{job_id}`
**Description:**
Check the status or result of a transcription job.

**Request:**
- **Path Parameter:** `job_id` (string): The job ID returned by `/transcribe`

**Response:**
- **Status:**
  - `200 OK` if job is complete
  - `202 Accepted` if job is still processing
  - `404 Not Found` if job ID is invalid
- **Body:**
  - **Content-Type:** `application/x-msgpack`
  - **Data:**
    - If complete: a dictionary with the transcription, translation, and analysis (see below)
    - If processing: a dictionary with job status
    - If error: a dictionary with error details

---

## Data Formats

### Transcription & Analysis Result (on job completion)
Returned as a dictionary (MessagePack-encoded) with the following structure:

```
{
  "transcription": "<English translation of the corrected transcript>",
  "pitch_followed_analysis": "...",
  "pitch_followed_positive_example": "...",
  "pitch_followed_negative_example": "...",
  "pitch_followed_suggestions": "...",
  "confidence_analysis": "...",
  "confidence_positive_example": "...",
  "confidence_negative_example": "...",
  "confidence_suggestions": "...",
  "tonality_analysis": "...",
  "tonality_positive_example": "...",
  "tonality_negative_example": "...",
  "tonality_suggestions": "...",
  "energy_analysis": "...",
  "energy_positive_example": "...",
  "energy_negative_example": "...",
  "energy_suggestions": "...",
  "objection_handling_analysis": "...",
  "objection_handling_positive_example": "...",
  "objection_handling_negative_example": "...",
  "objection_handling_suggestions": "...",
  "strengths": "...",
  "areas_for_improvement": "...",
  "pitch_followed_score": 7,
  "confidence_score": 8,
  "tonality_score": 7,
  "energy_score": 8,
  "objection_handling_score": 6,
  "overall_score": 7.2
}
```

If an error occurs, the result will include an `error` key with details.

---

## Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key (required)

---

## Development
- Main API code: [`stt_api.py`](./stt_api.py)
- Prompt templates: [`prompts.py`](./prompts.py)
- Docker support: [`Dockerfile`](./Dockerfile)

---

## License
MIT License (see LICENSE file) 