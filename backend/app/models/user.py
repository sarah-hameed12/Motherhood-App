from app.database.postgres import Base
from sqlalchemy.orm import Mapped, mapped_column
from uuid import UUID as u, uuid4
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import String,  Enum as SQLAlchemyEnum,Integer
from datetime import datetime
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

  

class User(Base):
    __tablename__ = 'users'
    
    id: Mapped[u] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    firstname: Mapped[str] = mapped_column(String, nullable=False)
    lastname: Mapped[str] = mapped_column(String, nullable=False)
    username: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    email: Mapped[str] =  mapped_column(String, nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String, nullable=False)
    profile_pic: Mapped[str | None] = mapped_column(String, nullable=True)
    
    date_of_birth: Mapped[datetime | None] = mapped_column(nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String, nullable=True)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    city: Mapped[str | None] = mapped_column(String, nullable=True)
    country: Mapped[str | None] = mapped_column(String, nullable=True)
    
    number_of_children: Mapped[int | None] = mapped_column(Integer, default=0)
    blood_type: Mapped[str | None] = mapped_column(String, nullable=True)
    
    notification_enabled: Mapped[bool] = mapped_column(default=True, nullable=True)
    preferred_language: Mapped[str | None] = mapped_column(String, nullable=True)
    account_created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    role: Mapped[str] = mapped_column(SQLAlchemyEnum(UserRole), default=UserRole.USER, nullable=True)



class UserArchivePost(Base):
    __tablename__ = 'user_archives'

    id: Mapped[u] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[u] = mapped_column(UUID(as_uuid=True), default=uuid4)
    post_id: Mapped[u] = mapped_column(UUID(as_uuid=True), default=uuid4)



    

