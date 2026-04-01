from fastapi import APIRouter, status
from app.schemas.mood_schemas import MoodCreateSchema, MoodResponseSchema
from app.controllers.mood_controllers import MoodController

# Create router
router = APIRouter(
    prefix="/api/mood",
    tags=["Mood Calculation"]
)


@router.post(
    "/calculate",
    response_model=MoodResponseSchema,
    status_code=status.HTTP_200_OK,
    summary="Calculate mood based on ratings",
    description="Calculate mood status based on 5 rating parameters (1-5 scale). No data is stored."
)
def calculate_mood(mood_data: MoodCreateSchema):
    """
    Calculate mood based on user ratings.
    
    - **sleep_quality**: Sleep quality rating (1-5)
    - **food_quality**: Food quality rating (1-5)
    - **energy_level**: Energy level rating (1-5)
    - **stress_level**: Stress level rating (1-5)
    - **overall_happiness**: Overall happiness rating (1-5)
    - **notes**: Optional notes (max 500 characters)
    
    Returns the average score and mood status without storing any data.
    """
    return MoodController.calculate_mood(mood_data)