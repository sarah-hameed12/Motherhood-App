from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Date, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4
from datetime import datetime
from app.database.postgres import Base
from enum import Enum as PyEnum
from sqlalchemy import Enum


# class VaccinationStatus(PyEnum):
#     PENDING = "Pending"
#     GIVEN = "Given"
#     MISSED = "Missed"


class VaccinationOption(Base):
    __tablename__ = "vaccination_options"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    vaccine_name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(String, nullable=True)
    protect_against: Mapped[str] = mapped_column(String, nullable=True)
    doses_needed: Mapped[int] = mapped_column(Integer, nullable=False)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True)


class VaccinationSchedule(Base):
    __tablename__ = "vaccination_schedules"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    vaccine_id: Mapped[UUID] = mapped_column(ForeignKey("vaccination_options.id", ondelete="CASCADE"), nullable=False)
    dose_num: Mapped[int] = mapped_column(Integer, default=1)
    min_age_days: Mapped[int] = mapped_column(Integer, default=0)
    max_age_days: Mapped[int] = mapped_column(Integer, default=None)
   


class VaccinationRecord(Base):
    __tablename__ = "vaccination_records"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    child_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    vaccine_id: Mapped[UUID] = mapped_column(ForeignKey("vaccination_options.id", ondelete="CASCADE"), nullable=False)
    schedule_id: Mapped[UUID] = mapped_column(ForeignKey("vaccination_schedules.id", ondelete="SET NULL"), nullable=True)

    date_given: Mapped[datetime | None] = mapped_column(Date, nullable=True)
   


class VaccinationReminder(Base):
    __tablename__ = 'vaccination_reminders'
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    child_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    vaccine_id: Mapped[UUID] = mapped_column(ForeignKey("vaccination_options.id", ondelete="CASCADE"), nullable=False)
    
    reminder: Mapped[str] = mapped_column(String, nullable=False)
    