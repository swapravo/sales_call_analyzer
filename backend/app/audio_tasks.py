from .celery_app import celery
from .send_audio_for_processing import process_audio_files

@celery.task
def process_audio_files_task(file_ids, table_uuid):
    process_audio_files(file_ids, table_uuid)
