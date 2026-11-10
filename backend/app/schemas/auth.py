from typing import Optional
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "buyer" # buyer, investor, seller, broker, analyst
    phone_number: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

