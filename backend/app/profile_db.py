from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

PROFILE_DB_PATH = os.getenv('PROFILE_DB_PATH_DOCKER') if os.getenv('IS_DOCKER') == '1' else os.getenv('PROFILE_DB_PATH_LOCAL', './profiles.db')
DATABASE_URL = f"sqlite:///{PROFILE_DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    print("Database tables created successfully")
