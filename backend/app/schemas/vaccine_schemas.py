from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, List


class VaccinationScheduleResponse(BaseModel):
    id: UUID
    dose_num: int
    min_age_days: int
    max_age_days: int
    vaccine_id: UUID

    class Config:
        from_attributes = True
        

class VaccineWithSchedulesResponse(BaseModel):
    vaccine_id: UUID
    vaccine_name: str
    description: Optional[str] = None
    protect_against: Optional[str] = None
    doses_needed: int
    is_mandatory: bool
    total_schedules: int = Field(..., description="Number of schedules for this vaccine")
    schedules: List[VaccinationScheduleResponse]

    class Config:
        from_attributes = True
        
        
class VaccinationPendingSchemaResponse(BaseModel):
    vaccine_id: UUID
    vaccine_name: str
    description: Optional[str] = None
    protect_against: Optional[str] = None
    doses_needed: int
    is_mandatory: bool
    total_schedules: int = Field(..., description="Number of schedules for this vaccine")
    dose_num: int
    min_age_days: int
    max_age_days: int
    
    class Config:
        from_attributes = True
