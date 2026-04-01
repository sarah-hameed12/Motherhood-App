from pydantic import BaseModel, Field, validator
from typing import Optional


class MoodCreateSchema(BaseModel):
    """Schema for mood calculation request"""
    sleep_quality: int = Field(..., ge=1, le=5, description="Sleep quality rating (1-5)")
    food_quality: int = Field(..., ge=1, le=5, description="Food quality rating (1-5)")
    energy_level: int = Field(..., ge=1, le=5, description="Energy level rating (1-5)")
    stress_level: int = Field(..., ge=1, le=5, description="Stress level rating (1-5)")
    overall_happiness: int = Field(..., ge=1, le=5, description="Overall happiness rating (1-5)")
    notes: Optional[str] = Field(None, max_length=500, description="Optional notes")

    @validator('sleep_quality', 'food_quality', 'energy_level', 'stress_level', 'overall_happiness')
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "sleep_quality": 4,
                "food_quality": 3,
                "energy_level": 4,
                "stress_level": 2,
                "overall_happiness": 5,
                "notes": "Feeling good today!"
            }
        }


class MoodResponseSchema(BaseModel):
    """Schema for mood calculation response"""
    average_score: float = Field(..., description="Average of all ratings")
    mood_status: str = Field(..., description="Mood status based on average")
    message: str = Field(..., description="Descriptive message about the mood")

    class Config:
        json_schema_extra = {
            "example": {
                "average_score": 3.6,
                "mood_status": "Good",
                "message": "Your overall mood is Good! Keep up the positive energy."
            }
        }