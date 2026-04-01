from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional
from app.models.child import GenderEnum
from uuid import UUID
from datetime import date, datetime


class ChildBaseSchema(BaseModel):
    firstname: str
    lastname: str
    profile_pic: str
    gender: Optional[GenderEnum] = None
    date_of_birth: datetime | None
    
    
class ChildBaseUpdateSchema(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    profile_pic: Optional[str] = None
    gender: Optional[GenderEnum] = None
    date_of_birth: Optional[datetime] = None


class ChildCreateSchema(ChildBaseSchema):
    pass


class ChildMiniResponseSchema(ChildBaseSchema):
    id: UUID
    class Config():
        orm_mode = True
        
    
class ChildPhysicalInfoSchema(BaseModel):
    blood_type: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    head_circumference: Optional[float] = None


class ChildPhysicalInfoUpdate(BaseModel):
    blood_type: Optional[str] = Field(default="B+")
    height: Optional[float] = Field(default=50)
    weight: Optional[float] = Field(default=5)
    head_circumference: Optional[float] = Field(default=20)


class ChildResponseSchema(ChildBaseSchema, ChildPhysicalInfoSchema):
    id: UUID
    class Config:
        orm_mode = True  
