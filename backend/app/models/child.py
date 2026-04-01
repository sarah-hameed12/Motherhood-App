from app.database.postgres import Base
from sqlalchemy.orm import Mapped, mapped_column
from uuid import UUID as u, uuid4
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy import String, Integer, DateTime, ForeignKey, Date
from datetime import datetime, time
from typing import List
from enum import Enum as PyEnum
from sqlalchemy import Enum as SAEnum, String, Time




class GenderEnum(PyEnum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"
    

class Child(Base):
    __tablename__ = 'children'
    
    id: Mapped[u] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    firstname: Mapped[str] = mapped_column(String, nullable=False)
    lastname: Mapped[str] = mapped_column(String, nullable=True)
    profile_pic: Mapped[str | None] = mapped_column(String, nullable=True)

    
    mother_id: Mapped[u] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    
    gender: Mapped[GenderEnum | None] = mapped_column(
        SAEnum(GenderEnum, name="gender_enum"),  
        nullable=True
    )    
    date_of_birth: Mapped[datetime | None] = mapped_column(nullable=True, default=datetime.now)

    blood_type: Mapped[str | None] = mapped_column(String, nullable=True)
    pictures: Mapped[List[str] | None] = mapped_column(JSON, nullable=True)

    
    height: Mapped[float | None] = mapped_column(nullable=True)
    weight: Mapped[float | None] = mapped_column(nullable=True)
    
    head_circumference: Mapped[float | None] = mapped_column(nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
   

class SleepSchedule(Base):
    __tablename__ = 'sleep_schedules'
    
    id: Mapped[u] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    child_id: Mapped[u] = mapped_column(UUID(as_uuid=True), ForeignKey("children.id"), nullable=False)
    
    bedtime: Mapped[time | None] = mapped_column(Time, nullable=True)
    wake_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    nap_times: Mapped[str | None] = mapped_column(String, nullable=True)  # Simple description like "2 naps: 10am and 2pm"
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Allergy(Base):
    __tablename__ = 'allergies'
    
    id: Mapped[u] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    child_id: Mapped[u] = mapped_column(UUID(as_uuid=True), ForeignKey("children.id"), nullable=False)
    
    allergy_name: Mapped[str] = mapped_column(String, nullable=False)
    severity: Mapped[str | None] = mapped_column(String, nullable=True)  # Mild, Moderate, Severe
    reaction: Mapped[str | None] = mapped_column(String, nullable=True)  # Description of reaction
    medication: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MedicalCondition(Base):
    __tablename__ = 'medical_conditions'
    
    id: Mapped[u] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    child_id: Mapped[u] = mapped_column(UUID(as_uuid=True), ForeignKey("children.id"), nullable=False)
    
    condition_name: Mapped[str] = mapped_column(String, nullable=False)
    diagnosis_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    treatment: Mapped[str | None] = mapped_column(String, nullable=True)
    medication: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)