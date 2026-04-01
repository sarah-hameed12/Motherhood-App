from fastapi import HTTPException, status
from app.schemas.mood_schemas import MoodCreateSchema, MoodResponseSchema
from app.utils.mood_calculation_service import MoodCalculationService


class MoodController:
    """Controller for mood calculation operations"""

    @staticmethod
    def calculate_mood(mood_data: MoodCreateSchema) -> MoodResponseSchema:
        """
        Calculate mood based on user ratings (no storage)
        
        Args:
            mood_data: MoodCreateSchema with 5 ratings
            
        Returns:
            MoodResponseSchema with average_score and mood_status
            
        Raises:
            HTTPException: If calculation fails
        """
        try:
            # Prepare ratings dictionary
            ratings = {
                'sleep_quality': mood_data.sleep_quality,
                'food_quality': mood_data.food_quality,
                'energy_level': mood_data.energy_level,
                'stress_level': mood_data.stress_level,
                'overall_happiness': mood_data.overall_happiness
            }

            # Calculate mood using service
            result = MoodCalculationService.calculate_mood(ratings)

            # Return response
            return MoodResponseSchema(
                average_score=result['average_score'],
                mood_status=result['mood_status'],
                message=result['message']
            )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to calculate mood: {str(e)}"
            )