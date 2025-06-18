from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    minutes: int = 10000

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    minutes: int

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class UserSettings(BaseModel):
    name: Optional[str] = None  # Make name optional if it can be null
    email: EmailStr
    minutes: int

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class PaymentRequest(BaseModel):
    amount: int  # in paise or cents
    currency: str = "INR"

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
