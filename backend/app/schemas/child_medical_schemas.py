from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import date, datetime

class MedicalConditionBase(BaseModel):
    child_id: UUID = Field(..., description="ID of the child")
    condition_name: str = Field(..., min_length=1, max_length=255, description="Name of the medical condition")
    diagnosis_date: date = Field(..., description="Date when condition was diagnosed")
    treatment: Optional[str] = Field(default=None, max_length=1000)
    notes: Optional[str] = Field(default=None, max_length=2000)
    is_active: bool = Field(default=True, description="Whether the condition is currently active")


class MedicalConditionCreate(MedicalConditionBase):
    pass


class MedicalConditionUpdate(BaseModel):
    treatment: Optional[str] = Field(default=None, max_length=1000)
    notes: Optional[str] = Field(default=None, max_length=2000)
    is_active: Optional[bool] = Field(default=None)
    

class MedicalConditionResponse(MedicalConditionBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
    
    
    
# Vaccination schemes are here

class VaccinationBase(BaseModel):
    child_id: UUID = Field(..., description="ID of the child")
    vaccine_name: str = Field(..., min_length=1, max_length=255, description="Name of the vaccine")
    date_given: Optional[date] = Field(default=None, description="Date when vaccine was administered")
    dose: Optional[str] = Field(default=None, max_length=100, description="Dose information")
    notes: Optional[str] = Field(default=None, max_length=1000, description="Additional notes")


class VaccinationCreate(VaccinationBase):
    pass


class VaccinationUpdate(BaseModel):
    vaccine_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    date_given: Optional[date] = Field(default=None)
    dose: Optional[str] = Field(default=None, max_length=100)
    notes: Optional[str] = Field(default=None, max_length=1000)


class VaccinationResponse(VaccinationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
    

class VaccinationMiniResponse(BaseModel):
    id: UUID
    child_id: UUID
    vaccine_name: str = Field(..., min_length=1, max_length=255, description="Name of the vaccine")
    date_given: Optional[date] = Field(default=None, description="Date when vaccine was administered")
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

    
    