FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy .env file
COPY .env ./

COPY . .

EXPOSE 8002

CMD ["uvicorn", "stt_api:app", "--host", "stt", "--port", "8002"]
