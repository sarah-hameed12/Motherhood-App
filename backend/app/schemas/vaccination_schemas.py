from pydantic import BaseModel, ConfigDict
from uuid import UUID
from enum import Enum
from datetime import date


class VaccinationStatus(str, Enum):
    PENDING = "PENDING"
    GIVEN = "GIVEN"
    MISSED = "MISSED"



class VaccinationListResponse(BaseModel):
    id: UUID
    vaccine_name: str
    description: str
    protect_against: str
    doses_needed: int
    is_mandatory: bool
    dose_num: int
    min_age_days: int
    max_age_days: int
    
    
    
class VaccinationOptionBase(BaseModel):
    vaccine_name: str
    description: str | None = None
    protect_against: str | None = None
    doses_needed: int
    is_mandatory: bool


class VaccinationOptionCreate(VaccinationOptionBase):
    pass


class VaccinationOptionResponse(VaccinationOptionBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class VaccinationScheduleBase(BaseModel):
    vaccine_id: UUID
    dose_num: int
    min_age_days: int
    max_age_days: int


class VaccinationScheduleCreate(VaccinationScheduleBase):
    pass


class VaccinationScheduleResponse(VaccinationScheduleBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class VaccinationRecordBase(BaseModel):
    child_id: UUID
    vaccine_id: UUID
    schedule_id: UUID
    dose_num: int
    date_given: date | None = None
    status: VaccinationStatus = VaccinationStatus.PENDING


class VaccinationRecordCreate(VaccinationRecordBase):
    pass


class VaccinationRecordUpdate(BaseModel):
    date_given: date | None = None
    status: VaccinationStatus = VaccinationStatus.PENDING


class VaccinationRecordResponse(VaccinationRecordBase):
    id: UUID
    
    model_config = ConfigDict(from_attributes=True)



# These are the vaccination reminder schemas
class VaccinationReminderBase(BaseModel):    
    child_id: UUID
    vaccine_id: UUID
    reminder: str
    
    
class VaccinationReminderCreate(VaccinationReminderBase):    
    pass
   
   
class VaccinationReminderResponse(VaccinationReminderBase):    
    id: UUID