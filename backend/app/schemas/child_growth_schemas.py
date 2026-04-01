from pydantic import BaseModel, Field, ConfigDict, model_validator
from typing import Optional
from uuid import UUID
from datetime import date, datetime


class GrowthRecordCreate(BaseModel):
    child_id: UUID
    recorded_at: date = Field(..., description="Date of measurement")

    weight: Optional[float] = Field(default=None, gt=0)
    height: Optional[float] = Field(default=None, gt=0)
    head_circumference: Optional[float] = Field(default=None, gt=0)

    milestone_notes: Optional[str] = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def validate_at_least_one_value(self):
        if not any([self.weight, self.height, self.head_circumference, self.milestone_notes]):
            raise ValueError("Provide at least one measurement or milestone note")
        return self


class GrowthRecordUpdate(BaseModel):
    recorded_at: Optional[date] = None

    weight: Optional[float] = Field(default=None, gt=0)
    height: Optional[float] = Field(default=None, gt=0)
    head_circumference: Optional[float] = Field(default=None, gt=0)

    milestone_notes: Optional[str] = Field(default=None, max_length=2000)


class GrowthRecordResponse(BaseModel):
    id: UUID
    child_id: UUID
    recorded_at: date

    weight: Optional[float]
    height: Optional[float]
    head_circumference: Optional[float]

    milestone_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
