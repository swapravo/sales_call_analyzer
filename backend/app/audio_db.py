import os
from sqlalchemy import create_engine, select, func, MetaData, Table, Column, Integer, String, LargeBinary, DateTime
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from dotenv import load_dotenv
import uuid

load_dotenv()

print("AUDIO_DB_PATH_LOCAL:", os.getenv("AUDIO_DB_PATH_LOCAL"))

# Determine audio DB path
AUDIO_DB_PATH = os.getenv('AUDIO_DB_PATH_DOCKER') if os.getenv('IS_DOCKER') == '1' else os.getenv('AUDIO_DB_PATH_LOCAL', './audio.db')
DATABASE_URL = f"sqlite:///{AUDIO_DB_PATH}"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base for audio database
Base = declarative_base()

# Define analysis columns for audio metadata
ANALYSIS_COLUMNS = [
    "transcription",
    "pitch_followed_analysis",
    "pitch_followed_positive_example",
    "pitch_followed_negative_example",
    "pitch_followed_suggestions",
    "confidence_analysis",
    "confidence_positive_example",
    "confidence_negative_example",
    "confidence_suggestions",
    "tonality_analysis",
    "tonality_positive_example",
    "tonality_negative_example",
    "tonality_suggestions",
    "energy_analysis",
    "energy_positive_example",
    "energy_negative_example",
    "energy_suggestions",
    "objection_handling_analysis",
    "objection_handling_positive_example",
    "objection_handling_negative_example",
    "objection_handling_suggestions",
    "strengths",
    "areas_for_improvement",
    "pitch_followed_score",
    "confidence_score",
    "tonality_score",
    "energy_score",
    "objection_handling_score",
    "overall_score"
]

def get_user_audio_table(table_uuid: str) -> Table:
    """Get or create a user-specific audio table."""
    metadata = MetaData()
    return Table(
        table_uuid,  # Use table_uuid directly as the table name
        metadata,
        Column('id', Integer, primary_key=True, index=True),
        Column('name', String, nullable=False),
        Column('file', LargeBinary, nullable=False),
        Column('created_at', DateTime(timezone=True), server_default=func.now()),
        Column('transcription', String),
        Column('pitch_followed_analysis', String),
        Column('pitch_followed_positive_example', String),
        Column('pitch_followed_negative_example', String),
        Column('pitch_followed_suggestions', String),
        Column('confidence_analysis', String),
        Column('confidence_positive_example', String),
        Column('confidence_negative_example', String),
        Column('confidence_suggestions', String),
        Column('tonality_analysis', String),
        Column('tonality_positive_example', String),
        Column('tonality_negative_example', String),
        Column('tonality_suggestions', String),
        Column('energy_analysis', String),
        Column('energy_positive_example', String),
        Column('energy_negative_example', String),
        Column('energy_suggestions', String),
        Column('objection_handling_analysis', String),
        Column('objection_handling_positive_example', String),
        Column('objection_handling_negative_example', String),
        Column('objection_handling_suggestions', String),
        Column('strengths', String),
        Column('areas_for_improvement', String),
        Column('pitch_followed_score', Integer),
        Column('confidence_score', Integer),
        Column('tonality_score', Integer),
        Column('energy_score', Integer),
        Column('objection_handling_score', Integer),
        Column('overall_score', Integer)
    )

def init_user_audio_table(table_uuid: str):
    """Initialize a new user's audio table."""
    table = get_user_audio_table(table_uuid)
    table.create(engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def add_audio_file(file_path: str, file_name: str, table_uuid: str) -> int:
    """
    Add an audio file to the user's audio table.
    
    Args:
        file_path (str): Path to the audio file
        file_name (str): Name to store in the database
        table_uuid (str): User's table UUID
        
    Returns:
        int: file_id is the ID of the new record if successful, else -1
    """
    try:
        # Read the audio file
        with open(file_path, 'rb') as f:
            file_content = f.read()
            
        # Create new audio record
        db = SessionLocal()
        table = get_user_audio_table(table_uuid)
        
        # Insert the record
        result = db.execute(
            table.insert().values(
                name=file_name,
                file=file_content
            )
        )
        db.commit()
        file_id = result.lastrowid
        db.close()
        return file_id
        
    except Exception as e:
        print(f"Error adding audio file: {str(e)}")
        return -1

def add_audio_metadata(audio_id: int, table_uuid: str, metadata: dict) -> bool:
    """
    Add or update metadata for an existing audio record.

    Args:
        audio_id (int): The ID of the audio record to update
        table_uuid (str): User's table UUID
        metadata (dict): Dictionary containing the metadata values.
                        Keys should match the column names in the Audio model.

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        db = SessionLocal()
        table = get_user_audio_table(table_uuid)
        
        # Update all metadata fields
        update_data = {}
        for key, value in metadata.items():
            if key in ANALYSIS_COLUMNS:
                update_data[key] = value
        
        db.execute(
            table.update()
            .where(table.c.id == audio_id)
            .values(**update_data)
        )
        db.commit()
        db.close()
        return True
        
    except Exception as e:
        print(f"Error updating audio metadata: {str(e)}")
        return False

def get_audio_by_id(audio_id: int, table_uuid: str) -> tuple:
    """
    Get audio file content and name by ID.
    
    Args:
        audio_id (int): The ID of the audio record
        table_uuid (str): User's table UUID
        
    Returns:
        tuple: (name, file_content) or (None, None) if not found
    """
    try:
        db = SessionLocal()
        table = get_user_audio_table(table_uuid)
        
        result = db.execute(
            table.select().where(table.c.id == audio_id)
        ).first()
        
        if not result:
            return None, None
            
        return result.name, result.file
    except Exception as e:
        print(f"Error getting audio by ID: {str(e)}")
        return None, None
    finally:
        db.close()

def fetch_audio_metadata_by_user(table_uuid: str, page_number: int = 1, items_per_page: int = 10) -> tuple:
    """
    Fetch paginated audio metadata for a specific user.
    
    Args:
        table_uuid (str): User's table UUID
        page_number (int): The page number (1-based)
        items_per_page (int): Number of items per page
        
    Returns:
        tuple: (total_count, list of audio records)
    """
    try:
        db = SessionLocal()
        table = get_user_audio_table(table_uuid)
        
        # Get total count for pagination
        total_count = db.execute(
            select(func.count()).select_from(table)
        ).scalar()
        
        # Calculate offset
        offset = (page_number - 1) * items_per_page
        
        # Get paginated records
        results = db.execute(
            table.select()
            .order_by(table.c.created_at.desc())
            .offset(offset)
            .limit(items_per_page)
        ).fetchall()
        
        # Convert to list of dictionaries
        records = []
        for row in results:
            record = dict(row._mapping)
            records.append(record)
        
        return total_count, records
        
    except Exception as e:
        print(f"Error fetching audio metadata: {str(e)}")
        return 0, []
    finally:
        db.close()

print("Resolved AUDIO_DB_PATH:", AUDIO_DB_PATH)
print("CWD:", os.getcwd())
print("audio.db exists:", os.path.exists(AUDIO_DB_PATH))
