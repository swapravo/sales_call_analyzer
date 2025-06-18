from sqlalchemy import Column, Integer, String, LargeBinary, DateTime, func
from sqlalchemy.sql import func
from .profile_db import Base as ProfileBase
from .audio_db import Base as AudioBase

from pydantic import BaseModel
from typing import Optional
from pydantic import EmailStr

class User(ProfileBase):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    minutes = Column(Integer, default=0)
    table_uuid = Column(String, unique=True, nullable=False)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    minutes: Optional[int] = None

class Audio(AudioBase):
    __tablename__ = "audios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    file = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Analysis fields
    transcription = Column(String)
    pitch_followed_analysis = Column(String)
    pitch_followed_positive_example = Column(String)
    pitch_followed_negative_example = Column(String)
    pitch_followed_suggestions = Column(String)
    confidence_analysis = Column(String)
    confidence_positive_example = Column(String)
    confidence_negative_example = Column(String)
    confidence_suggestions = Column(String)
    tonality_analysis = Column(String)
    tonality_positive_example = Column(String)
    tonality_negative_example = Column(String)
    tonality_suggestions = Column(String)
    energy_analysis = Column(String)
    energy_positive_example = Column(String)
    energy_negative_example = Column(String)
    energy_suggestions = Column(String)
    objection_handling_analysis = Column(String)
    objection_handling_positive_example = Column(String)
    objection_handling_negative_example = Column(String)
    objection_handling_suggestions = Column(String)
    strengths = Column(String)
    areas_for_improvement = Column(String)
    pitch_followed_score = Column(Integer)
    confidence_score = Column(Integer)
    tonality_score = Column(Integer)
    energy_score = Column(Integer)
    objection_handling_score = Column(Integer)
    overall_score = Column(Integer)
