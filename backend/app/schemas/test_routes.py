# app/api/routes/vaccines.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from database.postgres import connect_db

router = APIRouter(prefix="/vaccines", tags=["vaccines"])
logger = logging.getLogger(__name__)


@router.post(
    "/setup-default-vaccines",
    status_code=status.HTTP_201_CREATED,
    summary="Create all important childhood vaccines",
    description="Creates essential childhood vaccines with their vaccination schedules"
)
async def create_default_vaccines(db: AsyncSession = Depends(connect_db)):
    """
    Creates all important vaccines for children with their recommended schedules.
    Based on standard immunization guidelines.
    """
    
    # Import models inside the function
    from models.vaccination import VaccinationOption, VaccinationSchedule
    
    # Define vaccines and their schedules
    vaccines_data = [
        {
            "vaccine_name": "BCG",
            "description": "Bacillus Calmette-Guérin vaccine for tuberculosis",
            "protect_against": "Tuberculosis",
            "doses_needed": 1,
            "is_mandatory": True,
            "schedules": [
                {"dose_num": 1, "min_age_days": 0, "max_age_days": 30}
            ]
        },
        {
            "vaccine_name": "Hepatitis B",
            "description": "Hepatitis B vaccine",
            "protect_against": "Hepatitis B",
            "doses_needed": 3,
            "is_mandatory": True,
            "schedules": [
                {"dose_num": 1, "min_age_days": 0, "max_age_days": 1},
                {"dose_num": 2, "min_age_days": 30, "max_age_days": 60},
                {"dose_num": 3, "min_age_days": 180, "max_age_days": 210}
            ]
        },
        {
            "vaccine_name": "DTaP",
            "description": "Diphtheria, Tetanus, and acellular Pertussis vaccine",
            "protect_against": "Diphtheria, Tetanus, Whooping Cough",
            "doses_needed": 5,
            "is_mandatory": True,
            "schedules": [
                {"dose_num": 1, "min_age_days": 42, "max_age_days": 70},
                {"dose_num": 2, "min_age_days": 70, "max_age_days": 98},
                {"dose_num": 3, "min_age_days": 98, "max_age_days": 126},
                {"dose_num": 4, "min_age_days": 365, "max_age_days": 455},
                {"dose_num": 5, "min_age_days": 1460, "max_age_days": 2190}
            ]
        },
        {
            "vaccine_name": "IPV",
            "description": "Inactivated Polio Vaccine",
            "protect_against": "Polio",
            "doses_needed": 4,
            "is_mandatory": True,
            "schedules": [
                {"dose_num": 1, "min_age_days": 42, "max_age_days": 70},
                {"dose_num": 2, "min_age_days": 70, "max_age_days": 98},
                {"dose_num": 3, "min_age_days": 98, "max_age_days": 126},
                {"dose_num": 4, "min_age_days": 1460, "max_age_days": 2190}
            ]
        },
        {
            "vaccine_name": "Hib",
            "description": "Haemophilus influenzae type b vaccine",
            "protect_against": "Hib meningitis, pneumonia, epiglottitis",
            "doses_needed": 4,
            "is_mandatory": True,
            "schedules": [
                {"dose_num": 1, "min_age_days": 42, "max_age_days": 70},
                {"dose_num": 2, "min_age_days": 70, "max_age_days": 98},
                {"dose_num": 3, "min_age_days": 98, "max_age_days": 126},
                {"dose_num": 4, "min_age_days": 365, "max_age_days": 455}
            ]
        },
        {
            "vaccine_name": "PCV13",
            "description": "Pneumococcal Conjugate Vaccine (13-valent)",
            "protect_against": "Pneumococcal disease, meningitis, pneumonia",
            "doses_needed": 4,
            "is_mandatory": True,
            "schedules": [
                {"dose_num": 1, "min_age_days": 42, "max_age_days": 70},
                {"dose_num": 2, "min_age_days": 70, "max_age_days": 98},
                {"dose_num": 3, "min_age_days": 98, "max_age_days": 126},
                {"dose_num": 4, "min_age_days": 365, "max_age_days": 455}
            ]
        },
        {
            "vaccine_name": "Rotavirus",
            "description": "Rotavirus vaccine (oral)",
            "protect_against": "Rotavirus gastroenteritis",
            "doses_needed": 3,
            "is_mandatory": False,
            "schedules": [
                {"dose_num": 1, "min_age_days": 42, "max_age_days": 70},
                {"dose_num": 2, "min_age_days": 70, "max_age_days": 98},
                {"dose_num": 3, "min_age_days": 98, "max_age_days": 126}
            ]
        },
        {
            "vaccine_name": "MMR",
            "description": "Measles, Mumps, and Rubella vaccine",
            "protect_against": "Measles, Mumps, Rubella",
            "doses_needed": 2,
            "is_mandatory": True,
            "schedules": [
                {"dose_num": 1, "min_age_days": 365, "max_age_days": 455},
                {"dose_num": 2, "min_age_days": 1460, "max_age_days": 2190}
            ]
        },
        {
            "vaccine_name": "Varicella",
            "description": "Chickenpox vaccine",
            "protect_against": "Chickenpox",
            "doses_needed": 2,
            "is_mandatory": True,
            "schedules": [
                {"dose_num": 1, "min_age_days": 365, "max_age_days": 455},
                {"dose_num": 2, "min_age_days": 1460, "max_age_days": 2190}
            ]
        },
        {
            "vaccine_name": "Hepatitis A",
            "description": "Hepatitis A vaccine",
            "protect_against": "Hepatitis A",
            "doses_needed": 2,
            "is_mandatory": True,
            "schedules": [
                {"dose_num": 1, "min_age_days": 365, "max_age_days": 730},
                {"dose_num": 2, "min_age_days": 730, "max_age_days": 1095}
            ]
        }
    ]
    
    created_vaccines = []
    skipped_vaccines = []
    
    try:
        for vaccine_data in vaccines_data:
            # Check if vaccine already exists
            result = await db.execute(
                select(VaccinationOption).where(
                    VaccinationOption.vaccine_name == vaccine_data["vaccine_name"]
                )
            )
            existing_vaccine = result.scalar_one_or_none()
            
            if existing_vaccine:
                logger.info(f"Vaccine '{vaccine_data['vaccine_name']}' already exists")
                skipped_vaccines.append(vaccine_data["vaccine_name"])
                continue
            
            # Create vaccine - extract vaccine data without schedules
            vaccine_dict = {
                "vaccine_name": vaccine_data["vaccine_name"],
                "description": vaccine_data["description"],
                "protect_against": vaccine_data["protect_against"],
                "doses_needed": vaccine_data["doses_needed"],
                "is_mandatory": vaccine_data["is_mandatory"]
            }
            
            vaccine_db = VaccinationOption(**vaccine_dict)
            db.add(vaccine_db)
            await db.flush()  # Get the ID
            
            # Create schedules
            schedules_created = 0
            for schedule in vaccine_data["schedules"]:
                schedule_db = VaccinationSchedule(
                    vaccine_id=vaccine_db.id,
                    dose_num=schedule["dose_num"],
                    min_age_days=schedule["min_age_days"],
                    max_age_days=schedule["max_age_days"]
                )
                db.add(schedule_db)
                schedules_created += 1
            
            created_vaccines.append({
                "name": vaccine_db.vaccine_name,
                "id": str(vaccine_db.id),
                "schedules": schedules_created,
                "mandatory": vaccine_db.is_mandatory
            })
        
        await db.commit()
        
        return {
            "message": "Childhood vaccines created successfully",
            "created": len(created_vaccines),
            "skipped": len(skipped_vaccines),
            "vaccines_created": created_vaccines,
            "vaccines_skipped": skipped_vaccines
        }
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating vaccines: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create vaccines: {str(e)}"
        )