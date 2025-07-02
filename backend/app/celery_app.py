import os
from celery import Celery
from .docker_utils import is_docker

if is_docker():
    redis_host = 'redis'  # Docker service name
else:
    redis_host = 'localhost'

celery = Celery(
    'audio_tasks',
    broker=f'redis://{redis_host}:6379/0',
    backend=f'redis://{redis_host}:6379/0'
)
