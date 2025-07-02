FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY app ./app

# Copy static files
COPY static ./static

# Create db directory and copy database files
RUN mkdir -p /app/db
COPY audio.db /app/db/
COPY profiles.db /app/db/

# Copy uploads directory
COPY uploads ./uploads

# Copy .env file
COPY .env ./

# Expose FastAPI port
EXPOSE 8001

# Default command (can be overridden in docker-compose)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "4"]
