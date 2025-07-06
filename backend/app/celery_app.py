import os
from celery import Celery

if os.getenv('IS_DOCKER') == '1':
    redis_host = 'redis'  # Docker service name
else:
    redis_host = 'localhost'

celery = Celery(
    'audio_tasks',
    broker=f'redis://{redis_host}:6379/0',
    backend=f'redis://{redis_host}:6379/0'
)
