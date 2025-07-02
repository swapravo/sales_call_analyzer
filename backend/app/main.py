from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Request, Query, Body
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional, List
import os
import shutil
import sqlite3
import hmac
import hashlib
import razorpay
from datetime import datetime
import base64
from dotenv import load_dotenv

from . import models, schemas, crud, auth, deps, profile_db
from .audio_db import fetch_audio_metadata_by_user, ANALYSIS_COLUMNS, add_audio_file, init_user_audio_table
from .audio_tasks import process_audio_files_task
from .audio_utils import get_audio_duration, SUPPORTED_AUDIO_EXTENSIONS

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise ValueError("Razorpay API keys not found in environment variables")

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Initialize only the profiles database
profile_db.Base.metadata.create_all(bind=profile_db.engine)

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://bot.qhtclinic.co.in"],  # allow frontend only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/", response_class=FileResponse)
def root():
    return FileResponse("static/home.html")

@app.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(deps.get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user)

@app.get("/login", response_class=FileResponse)
def get_login():
    return FileResponse("static/login.html")

@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(deps.get_db)):
    user = crud.get_user_by_email(db, form_data.username)
    if not user or not crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=schemas.UserOut)
def read_users_me(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/settings", response_model=schemas.UserSettings)
def get_user_settings(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "name": current_user.name,
        "email": current_user.email,
        "minutes": current_user.minutes
    }

@app.patch("/settings")
def update_settings(
    payload: schemas.UserSettings,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_user = crud.get_user_by_email(db, current_user.email)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.email and payload.email != db_user.email:
        existing_user = crud.get_user_by_email(db, payload.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        db_user.email = payload.email

    if payload.name is not None:
        db_user.name = payload.name
    if payload.minutes is not None:
        db_user.minutes = payload.minutes

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {
        "name": db_user.name,
        "email": db_user.email,
        "minutes": db_user.minutes
    }

@app.post("/settings/change-password")
def change_password(
    password_data: schemas.PasswordChange,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not crud.verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    crud.update_user_password(db, current_user, password_data.new_password)
    return {"message": "Password updated successfully"}

@app.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        saved_files = []
        saved_file_ids = []  # Track the IDs of saved files
        temp_files = []  # Keep track of files to clean up
        # Create user-specific directory
        user_upload_dir = os.path.join(UPLOAD_DIR, str(current_user.id))
        os.makedirs(user_upload_dir, exist_ok=True)

        for file in files:
            relative_path = file.filename
            file_ext = os.path.splitext(relative_path)[1].lower()

            if file_ext not in SUPPORTED_AUDIO_EXTENSIONS:
                continue

            # Save file in user's directory
            destination_path = os.path.join(user_upload_dir, relative_path)
            os.makedirs(os.path.dirname(destination_path), exist_ok=True)

            # Save the file
            with open(destination_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            temp_files.append(destination_path)  # Add to cleanup list

            # Check audio duration
            duration = get_audio_duration(destination_path)
            if not duration:
                # Clean up the file if duration check fails
                # it might be a malicious file
                os.remove(destination_path)
                temp_files.remove(destination_path)  # Remove from cleanup list
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid or corrupted audio file: {relative_path}. Please ensure the file is a valid audio file."
                )

            # Add file to database and get the ID
            file_id = add_audio_file(
                file_path=destination_path,
                file_name=relative_path,
                table_uuid=current_user.table_uuid
            )

            if not file_id:
                # Clean up the file if database insertion fails
                os.remove(destination_path)
                temp_files.remove(destination_path)  # Remove from cleanup list
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to save file metadata: {relative_path}"
                )

            saved_files.append(relative_path)
            saved_file_ids.append(file_id)

        # Clean up all temporary files after successful processing
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            except Exception as e:
                print(f"Warning: Failed to remove temporary file {temp_file}: {str(e)}")

        # Queue the file IDs for processing
        if saved_file_ids:
            # TODO: deduct credits
            process_audio_files_task.delay(saved_file_ids, current_user.table_uuid)

        return {
            "message": f"Successfully uploaded {len(saved_files)} files",
            "files": saved_files,
            "file_ids": saved_file_ids
        }
    except HTTPException as he:
        # Clean up any remaining files if an error occurred
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            except Exception as e:
                print(f"Warning: Failed to remove temporary file {temp_file}: {str(e)}")
        raise he
    except Exception as e0:
        # Clean up any remaining files if an error occurred
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            except Exception as e1:
                print(f"Warning: Failed to remove temporary file {temp_file}: {str(e1)}")
        print(f"Upload error: {str(e0)}")
        raise HTTPException(status_code=500, detail=str(e0))

@app.get("/upload", response_class=HTMLResponse)
async def upload_form():
    return FileResponse("static/upload.html")

@app.get("/transcriptions", response_class=HTMLResponse)
async def transcriptions(request: Request, page: int = 1):
    return FileResponse("static/transcriptions.html")

@app.get("/api/transcriptions")
async def api_transcriptions(
    page: int = 1,
    current_user: models.User = Depends(auth.get_current_user)
):
    total_count, audios_data = fetch_audio_metadata_by_user(
        table_uuid=current_user.table_uuid,
        page_number=page
    )

    # # Drop column at index 2 (3rd column)
    # audios_data = [[item for i, item in enumerate(row) if i != 2] for row in audios_data]


    # print(len(audios_data), type(audios_data))
    # print(len(audios_data[0]), type(audios_data[0]))



    # Define the columns to include (basic + analysis)
    basic_columns = ["ID", "Name", "Time", "Transcription"]
    # Filter out "transcription" from ANALYSIS_COLUMNS since it's already in basic_columns
    analysis_headers = [col for col in ANALYSIS_COLUMNS if col != "transcription"]
    headers = basic_columns + analysis_headers

    def safe_value(val):
        if isinstance(val, bytes):
            try:
                # Try decoding if it might be UTF-8 text
                return val.decode("utf-8")
            except UnicodeDecodeError:
                # Otherwise, Base64-encode it
                return base64.b64encode(val).decode("utf-8")
        return val

    # table_data = []
    # for row in audios_data:
    #     safe_row = [safe_value(val) for val in row]
    #     table_data.append(safe_row)

    table_data = []
    for row in audios_data:
        values = list(row.values())
        if len(values) > 2:
            del values[2]  # Drop the 3rd column
        safe_row = [safe_value(val) for val in values]
        table_data.append(safe_row)
    

    return {
        "headers": headers,
        "table_data": table_data,
        "total_count": total_count,
        "current_page": page,
        "total_pages": (total_count + 9) // 10  # Ceiling division
    }

@app.get("/transcriptions/by-date")
async def get_transcriptions_by_date(
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(deps.get_db)
):
    try:
        # Validate date format
        datetime.strptime(start_date, "%Y-%m-%d")
    except ValueError:
        return JSONResponse(content={"error": "Invalid date format. Use YYYY-MM-DD."}, status_code=400)

    try:
        # Get the user's audio table
        audio_table = models.Audio.get_table(current_user.table_uuid)
        
        # Query using SQLAlchemy
        query = (
            db.query(audio_table)
            .filter(audio_table.created_at >= start_date)
            .order_by(audio_table.created_at.asc())
        )
        
        # Execute query and get results
        results = query.all()
        
        # Convert results to list of dictionaries
        return JSONResponse(content=[{
            "id": row.id,
            "name": row.name,
            "transcription": row.transcription,
            "created_at": row.created_at,
            **{col: getattr(row, col) for col in ANALYSIS_COLUMNS}
        } for row in results])
        
    except Exception as e:
        return JSONResponse(
            content={"error": f"Failed to fetch transcriptions: {str(e)}"},
            status_code=500
        )

# Create order
@app.post("/create-payment-order")
def create_payment_order(
    payment: schemas.PaymentRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        order = razorpay_client.order.create({
            "amount": payment.amount,
            "currency": payment.currency,
            "payment_capture": 1
        })
        return {
            "order_id": order["id"],
            "amount": payment.amount,
            "currency": payment.currency,
            "user_email": current_user.email
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment order creation failed: {e}")

# Verify and update Minutes
@app.post("/verify-payment")
def verify_payment(
    payload: schemas.PaymentVerify,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    body = payload.razorpay_order_id + "|" + payload.razorpay_payment_id
    generated_signature = hmac.new(
        bytes(RAZORPAY_KEY_SECRET, 'utf-8'),
        msg=bytes(body, 'utf-8'),
        digestmod=hashlib.sha256
    ).hexdigest()

    if generated_signature != payload.razorpay_signature:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # ✅ Add Minutes on successful payment
    # Example: ₹900 or $10 adds 1000 minutes
    updated_user = crud.update_user_settings(
        db, current_user,
        minutes=current_user.minutes + 1000
    )

    return JSONResponse(content={
        "message": "Payment verified and Minutes updated",
        "new_minutes": updated_user.minutes
    })

@app.get("/settings-page", response_class=HTMLResponse)
async def settings_page():
    return FileResponse("static/settings.html")
