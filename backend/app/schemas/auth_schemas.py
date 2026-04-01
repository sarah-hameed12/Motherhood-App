from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional
from app.models.user import UserRole


class UserBaseSchema(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    username: str


class UserCreateSchema(UserBaseSchema):
    password: str
    
    
class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str


class UserResponseSchema(UserBaseSchema):
    id: UUID
    profile_pic: str | None = None
    role: UserRole

    class Config:
        orm_mode = True  


class TokenPayload(BaseModel):
    id: str


class ChangePassword(BaseModel):
    password: str
    new_password: str


class AuthResponseModel(BaseModel):
    access_token: str
    user: UserResponseSchema