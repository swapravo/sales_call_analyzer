sudo apt install tmux ffmpeg python3-pip redis
pip3 install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8001 --workers 4
celery -A app.audio_tasks worker --loglevel=info --concurrency=1
