from typing import Dict


class MoodCalculationService:
    """Service for calculating mood based on ratings"""

    @staticmethod
    def calculate_mood(ratings: Dict[str, int]) -> Dict[str, any]:
        """
        Calculate mood based on 5 rating parameters
        
        Args:
            ratings: Dictionary containing the 5 rating values
            
        Returns:
            Dictionary with average_score, mood_status, and message
        """
        # Extract the 5 ratings
        sleep_quality = ratings.get('sleep_quality', 0)
        food_quality = ratings.get('food_quality', 0)
        energy_level = ratings.get('energy_level', 0)
        stress_level = ratings.get('stress_level', 0)
        overall_happiness = ratings.get('overall_happiness', 0)

        # Calculate average
        total = sleep_quality + food_quality + energy_level + stress_level + overall_happiness
        average_score = round(total / 5, 2)

        # Determine mood status and message based on average
        if average_score >= 4.5:
            mood_status = "Excellent"
            message = "Your overall mood is Excellent! You're doing amazing, keep it up!"
        elif average_score >= 3.5:
            mood_status = "Good"
            message = "Your overall mood is Good! Keep up the positive energy."
        elif average_score >= 2.5:
            mood_status = "Fair"
            message = "Your overall mood is Fair. Consider taking some time for self-care."
        elif average_score >= 1.5:
            mood_status = "Poor"
            message = "Your overall mood is Poor. Please reach out to someone you trust or consider professional support."
        else:
            mood_status = "Very Poor"
            message = "Your overall mood needs attention. Please seek support from loved ones or a healthcare professional."

        return {
            "average_score": average_score,
            "mood_status": mood_status,
            "message": message
        }

    @staticmethod
    def get_mood_breakdown(ratings: Dict[str, int]) -> Dict[str, str]:
        """
        Get individual mood status for each rating category
        
        Args:
            ratings: Dictionary containing the 5 rating values
            
        Returns:
            Dictionary with individual status for each category
        """
        def get_status(rating: int) -> str:
            if rating >= 5:
                return "Excellent"
            elif rating >= 4:
                return "Good"
            elif rating >= 3:
                return "Fair"
            elif rating >= 2:
                return "Poor"
            else:
                return "Very Poor"

        return {
            "sleep_quality_status": get_status(ratings.get('sleep_quality', 0)),
            "food_quality_status": get_status(ratings.get('food_quality', 0)),
            "energy_level_status": get_status(ratings.get('energy_level', 0)),
            "stress_level_status": get_status(ratings.get('stress_level', 0)),
            "overall_happiness_status": get_status(ratings.get('overall_happiness', 0))
        }