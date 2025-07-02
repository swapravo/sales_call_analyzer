from celery import Celery

try:
    celery = Celery(
        'audio_tasks',
        broker='redis://redis:6379/0',  # Use Docker service name
        backend='redis://redis:6379/0'
    )
except Exception as e:
    celery = Celery(
    'audio_tasks',
    broker='redis://localhost:6379/0',  # Use local redis name
    backend='redis://localhost:6379/0'
)
