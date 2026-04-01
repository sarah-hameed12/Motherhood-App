from app.schemas.final_vaccination_schemas import VaccinationOptionCreateSchema, VaccinationScheduleCreateSchema
from app.models.vaccination import VaccinationOption, VaccinationSchedule, VaccinationRecord
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from sqlalchemy import select

from app.schemas.final_vaccination_schemas import VaccinationMiniSchedule, VaccinationUserViewSchema, VaccinationSchema, ChildAge
from sqlalchemy import select, and_


 # Check if child exists
            # from models.child import Child
            # from models.vaccine_record import VaccineRecord
            # from models.vaccine import Vaccine
            # from models.schedule import Schedule

from app.models.child import Child




class VaccinationOptionControllers():
    @staticmethod
    async def create_option_record(data: VaccinationOptionCreateSchema, db: AsyncSession):
        try:
            new_option = VaccinationOption(vaccine_name=data.vaccine_name, description=data.description, protect_against=data.protect_against, doses_needed=data.doses_needed, is_mandatory=data.is_mandatory)

            db.add(new_option)
            await db.commit()

            await db.refresh(new_option)

            return True

        except SQLAlchemyError: 
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__

            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))
        

    @staticmethod
    async def retrive_vaccine_options(db: AsyncSession):
        try:
            statement = select(VaccinationOption)
            vaccine_options = await db.execute(statement)

            vaccine_options = vaccine_options.scalars().all()

            return vaccine_options
            
        except SQLAlchemyError: 
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__

            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))
        

    @staticmethod
    async def retrive_option_details(vaccine_id: UUID, db: AsyncSession):
        try:
            vaccine_option = await db.get(VaccinationOption, vaccine_id)

            if not vaccine_option:
                raise HTTPException(status_code=404, detail='Vaccination option not found!')
            
            return vaccine_option
            
        except SQLAlchemyError: 
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__

            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))
        


class VaccinationScheduleControllers():
    @staticmethod
    async def create_schedule_record(data: VaccinationScheduleCreateSchema, db: AsyncSession):
        try:
            print(data)
            vaccine_schedule = VaccinationSchedule(dose_num=data.dose_num, vaccine_id=data.vaccine_id, min_age_days=data.min_age_days, max_age_days=data.max_age_days)

            db.add(vaccine_schedule)

            await db.commit()
            print("dasd")
            await db.refresh(vaccine_schedule)

            print("Hello")

            return True

        except SQLAlchemyError: 
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__

            print(e)

            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))
        






class VaccinationUserViewControllers():
    @staticmethod
    async def vaccination_list_view(db: AsyncSession):
        try:
            query = (
                select(VaccinationOption, VaccinationSchedule)
                .join(
                    VaccinationSchedule, 
                    VaccinationOption.id == VaccinationSchedule.vaccine_id,
                    isouter=True  
                )
                .order_by(VaccinationOption.vaccine_name, VaccinationSchedule.dose_num)
            )
            
            result = await db.execute(query)
            rows = result.all()
            
            if not rows:
                return []
            
            vaccines_dict = {}
            
            for vaccine_option, schedule in rows:
                if vaccine_option.id not in vaccines_dict:
                    vaccines_dict[vaccine_option.id] = {
                        'vaccine': vaccine_option,
                        'schedules': []
                    }
                
                if schedule:
                    vaccines_dict[vaccine_option.id]['schedules'].append(schedule)
            
            response_list = []
            
            for vaccine_data in vaccines_dict.values():
                vaccine = vaccine_data['vaccine']
                schedules = vaccine_data['schedules']
                
                schedules_list = [
                    VaccinationMiniSchedule(
                        dose_num=schedule.dose_num,
                        min_days_age=schedule.min_age_days,
                        max_days_age=schedule.max_age_days
                    )
                    for schedule in schedules
                ]
                
                response_list.append(
                    VaccinationUserViewSchema(
                        vaccine_option_id=vaccine.id,
                        vaccine_name=vaccine.vaccine_name,
                        vaccine_description=vaccine.description or "",
                        doses_needed=vaccine.doses_needed,
                        is_mandatory=vaccine.is_mandatory,
                        schedules=sorted(schedules_list, key=lambda x: x.dose_num)
                    )
                )
            
            return response_list

        except SQLAlchemyError: 
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__

            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))
        



class VaccinationMainControllers():
    @staticmethod
    async def vaccination_list(data: ChildAge, child_id: UUID, db: AsyncSession):
        try:
            query = (
                select(
                    VaccinationOption.id.label("vaccine_id"),
                    VaccinationOption.vaccine_name,
                    VaccinationOption.description,
                    VaccinationOption.protect_against,
                    VaccinationOption.is_mandatory,
                    VaccinationOption.doses_needed,
                    VaccinationSchedule.id.label("schedule_id"),
                    VaccinationSchedule.dose_num,
                    VaccinationSchedule.min_age_days,
                    VaccinationSchedule.max_age_days
                )
                .join(
                    VaccinationSchedule,
                    VaccinationOption.id == VaccinationSchedule.vaccine_id
                )
                .outerjoin(
                    VaccinationRecord,
                    and_(
                        VaccinationRecord.vaccine_id == VaccinationOption.id,
                        VaccinationRecord.schedule_id == VaccinationSchedule.id,
                        VaccinationRecord.child_id == child_id
                    )
                )
                .where(
                    and_(
                          VaccinationSchedule.min_age_days <= data.child_age,  # child reached the starting age

                        VaccinationRecord.id.is_(None)  # Efficient NULL check
                    )
                )
                .order_by(
                    VaccinationOption.vaccine_name,
                    VaccinationSchedule.dose_num
                )
            )
            
            result = await db.execute(query)

            rows = result.all()

            vaccination_list = []
            for row in rows:
                row_dict = {
                    "vaccine_id": row.vaccine_id,
                    "vaccine_name": row.vaccine_name,
                    "description": row.description or "",
                    "protect_against": row.protect_against or "",
                    "is_mandatory": row.is_mandatory,
                    "schedule_id": row.schedule_id,
                    "dose_num": row.dose_num,
                    "min_days_age": row.min_age_days,
                    "max_days_age": row.max_age_days
                }
                vaccination_list.append(VaccinationSchema(**row_dict))
            
            return vaccination_list

        except SQLAlchemyError: 
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(status_code=error_dict.get('status_code', 500), 
                            detail=error_dict.get('detail', 'Internal server error!'))



from datetime import datetime
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.models.vaccination import VaccinationRecord, VaccinationOption, VaccinationSchedule
from app.models.child import Child

class VaccinationRecordControllers():
    @staticmethod
    async def record_create(data, child_id: UUID, db: AsyncSession):
        try:
            # 1. Convert string date to Python date object
            # This fixes the 'str object has no attribute toordinal' error
            if isinstance(data.given_date, str):
                date_obj = datetime.strptime(data.given_date, "%Y-%m-%d").date()
            else:
                date_obj = data.given_date

            # 2. Create record using the correct model field 'date_given'
            # Inside your Python controller
            new_record = VaccinationRecord(
    date_given=date_obj, # This is the database column name
    child_id=data.child_id, # This comes from the schema
    vaccine_id=data.vaccine_id,
    schedule_id=data.schedule_id
)
            
            db.add(new_record)
            await db.commit()
            await db.refresh(new_record)
            return new_record

        except Exception as e:
            await db.rollback()
            print(f"BACKEND ERROR: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    async def get_child_medical_report(child_id: UUID, db: AsyncSession):
        try:
            # Simple query to get all records for this child
            stmt = select(VaccinationRecord).where(VaccinationRecord.child_id == child_id)
            result = await db.execute(stmt)
            records = result.scalars().all()
            
            # Return a list of IDs so the frontend can filter
            return {
                "vaccination_history": [
                    {"vaccine_id": str(r.vaccine_id)} for r in records
                ]
            }
        except Exception as e:
            print(f"REPORT ERROR: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to fetch history")