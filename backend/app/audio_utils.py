from pydub import AudioSegment
import io
import os

SUPPORTED_AUDIO_EXTENSIONS = {
    ".aac", ".aiff", ".flac", ".m4a", ".mp3", ".mp4",
    ".ogg", ".opus", ".wav", ".webm"
}

def get_audio_duration(audio_path: str) -> float:
    """
    Returns the duration (in seconds) of an audio file.

    Parameters:
    audio_path (str): Path to the audio file (e.g., MP3, WAV).

    Returns:
    float: Duration of the audio in seconds.
    """
    ext = os.path.splitext(audio_path)[-1].lower()

    if ext not in SUPPORTED_AUDIO_EXTENSIONS:
        return False

    try:
        # Load the audio file using pydub
        audio = AudioSegment.from_file(audio_path)

        # Get duration in seconds
        duration = round(audio.duration_seconds, 2)
        return duration

    except Exception as e:
        print(f"Error processing audio file: {str(e)}")
        return False
