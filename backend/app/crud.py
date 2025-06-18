from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext
import uuid
from .audio_db import init_user_audio_table

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    table_uuid = str(uuid.uuid4())
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password,
        minutes=600,
        table_uuid=table_uuid
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create user's audio table
    init_user_audio_table(table_uuid)
    
    return db_user


def update_user_settings(db: Session, user: models.User, **kwargs):
    for key, value in kwargs.items():
        if hasattr(user, key):
            setattr(user, key, value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def update_user_password(db: Session, user: models.User, new_password: str):
    hashed_password = pwd_context.hash(new_password)
    user.hashed_password = hashed_password
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def deduct_user_minutes(db: Session, user: models.User, minutes: int):
    """Deducts the specified number of minutes from the user's minutes."""
    # Ensure user is attached to the current session
    db_user = db.query(models.User).filter(models.User.id == user.id).first()
    if not db_user:
        # This shouldn't happen if the user object is from the current session,
        # but it's good practice to handle potential detached instances.
        db_user = db.merge(user)

    # Deduct minutes, ensuring the limit doesn't go below zero
    db_user.minutes = max(0, db_user.minutes - minutes)

    db.add(db_user) # Add or merge the updated user object
    db.commit()    # Commit the changes to the database
    db.refresh(db_user) # Refresh the object to get the latest data

    return db_user
