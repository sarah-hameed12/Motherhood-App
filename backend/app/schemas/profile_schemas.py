from pydantic import BaseModel, EmailStr, constr, Field
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime, date
from typing import List
from app.models.child import GenderEnum


class MotherProfileResponse(BaseModel):
    id: UUID = Field(default_factory=uuid4) 
    firstname: str
    lastname: str
    username: str
    email: EmailStr
    profile_pic: str | None = None  
    
    date_of_birth: datetime | None
    phone_number: constr(pattern=r'^\+?\d{10,15}$') | None # type: ignore
    address: str | None
    city: str | None
    country: str | None
    
    number_of_children: int = 0
    blood_type: str | None = None
    account_created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config():
        orm_mode = True


class MotherProfileUpdate(BaseModel):
    firstname: str | None = Field(default=None, max_length=50)
    lastname: str | None = Field(default=None, max_length=50)
    address: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    country: str | None = Field(default=None, max_length=100)
    date_of_birth: date | None = None
    blood_type: str | None = Field(default=None, pattern=r'^(A|B|AB|O)[+-]$')  
    profile_pic: str | None = None


