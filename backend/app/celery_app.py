from celery import Celery

celery = Celery(
    'audio_tasks',
    broker='redis://localhost:6379/0',  # Make sure Redis is running
    backend='redis://localhost:6379/0'
)
