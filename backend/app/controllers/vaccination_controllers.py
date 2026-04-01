from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.vaccination import VaccinationOption, VaccinationSchedule, VaccinationRecord
from sqlalchemy import select, and_, or_
from uuid import UUID
from app.models.user import User
from datetime import datetime, date, timedelta

from app.models.child import Child


class VaccinationControllers():
    @staticmethod
    async def get_all_vaccines(db: AsyncSession):
        try:
            result = await db.execute(
            select(VaccinationOption).order_by(VaccinationOption.vaccine_name)
            )
            vaccines = result.scalars().all()
            
            all_vaccines_data = []
            
            for vaccine in vaccines:
                schedule_result = await db.execute(
                    select(VaccinationSchedule)
                    .where(VaccinationSchedule.vaccine_id == vaccine.id)
                    .order_by(VaccinationSchedule.dose_num)
                )
                schedules = schedule_result.scalars().all()
                
                schedules_list = []
                
                for schedule in schedules:
                    schedules_list.append({
                        "id": str(schedule.id),
                        "dose_num": schedule.dose_num,
                        "min_age_days": schedule.min_age_days,
                        "max_age_days": schedule.max_age_days,
                        "vaccine_id": str(schedule.vaccine_id)
                    })
                
                all_vaccines_data.append({
                    "vaccine_id": str(vaccine.id),
                    "vaccine_name": vaccine.vaccine_name,
                    "description": vaccine.description,
                    "protect_against": vaccine.protect_against,
                    "doses_needed": vaccine.doses_needed,
                    "is_mandatory": vaccine.is_mandatory,
                    "total_schedules": len(schedules_list),
                    "schedules": schedules_list
                })
            
            return all_vaccines_data
        
        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            
            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))
        
        
    @staticmethod
    async def get_pending_vaccines(auth_id: UUID, db: AsyncSession):
        try:
            user = await db.get(User, auth_id)
            
            if not user:
                raise HTTPException(status_code=401, detail='Unauthorized request!')
            
            # Get today's date
            today = date.today()
            
            # Get all children for the mother
            children_stmt = select(
                Child.id,
                Child.firstname, 
                Child.lastname, 
                Child.date_of_birth
            ).where(Child.mother_id == auth_id)
            
            children_result = await db.execute(children_stmt)
            children_rows = children_result.fetchall()
            
            children_with_pending_vaccines = []
            
            for child in children_rows:
                child_dob = child.date_of_birth
                
                if isinstance(child_dob, datetime):
                    child_dob_date = child_dob.date()
                else:
                    child_dob_date = child_dob
                
                if not child_dob_date:
                    continue  
                
                child_age_days = (today - child_dob_date).days
                child_id_str = str(child.id)
                
                # Get pending vaccines for this child (vaccines that don't have a record)
                stmt = (
                    select(VaccinationOption, VaccinationSchedule)
                    .join(VaccinationSchedule, VaccinationOption.id == VaccinationSchedule.vaccine_id)
                    .outerjoin(
                        VaccinationRecord,
                        and_(
                            VaccinationRecord.child_id == child.id,
                            VaccinationRecord.vaccine_id == VaccinationOption.id,
                            VaccinationRecord.schedule_id == VaccinationSchedule.id
                        )
                    )
                    .where(
                        VaccinationSchedule.min_age_days <= child_age_days,
                        or_(
                            VaccinationSchedule.max_age_days >= child_age_days,
                            VaccinationSchedule.max_age_days.is_(None)
                        ),
                        VaccinationRecord.id.is_(None)  # Only vaccines without records
                    )
                    .order_by(VaccinationOption.vaccine_name, VaccinationSchedule.dose_num)
                )
                
                result = await db.execute(stmt)
                pending_vaccines = result.fetchall()
                
                pending_vaccines_list = []
                for vaccine_option, schedule in pending_vaccines:
                    pending_vaccines_list.append({
                        "vaccine_id": str(vaccine_option.id),
                        "vaccine_name": vaccine_option.vaccine_name,
                        "description": vaccine_option.description,
                        "protect_against": vaccine_option.protect_against,
                        "is_mandatory": vaccine_option.is_mandatory,
                        "doses_needed": vaccine_option.doses_needed,
                        "dose_info": {
                            "dose_num": schedule.dose_num,
                            "dose_name": f"Dose {schedule.dose_num}",
                            "schedule_id": str(schedule.id),
                            "min_age_days": schedule.min_age_days,
                            "max_age_days": schedule.max_age_days,
                            "child_current_age_days": child_age_days,
                            "is_age_eligible": True
                        }
                    })
                
                children_with_pending_vaccines.append({
                    "child_id": child_id_str,
                    "firstname": child.firstname,
                    "lastname": child.lastname,
                    "date_of_birth": child_dob_date.isoformat(),
                    "age_days": child_age_days,
                    "total_pending_vaccines": len(pending_vaccines_list),
                    "pending_vaccines": pending_vaccines_list
                })
            
            total_pending = sum(child["total_pending_vaccines"] for child in children_with_pending_vaccines)
            
            return {
                "total_children": len(children_with_pending_vaccines),
                "total_pending_vaccines": total_pending,
                "children": children_with_pending_vaccines
            }
                    
        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get('status_code', 500), 
                detail=error_dict.get('detail', 'Internal server error!')
            )
        
    # @staticmethod
    # async def get_missed_vaccines(db: AsyncSession):
    #     try:
    #         # Get all children with their date of birth and parent info
    #         children_stmt = select(
    #             Child.id,
    #             Child.firstname,
    #             Child.lastname,
    #             Child.date_of_birth,
    #             User.firstname.label('parent_firstname'),
    #             User.lastname.label('parent_lastname'),
    #             User.id.label('parent_id'),
    #             User.phone_number.label('parent_phone'),
    #             User.email.label('parent_email')
    #         ).join(User, Child.mother_id == User.id)
            
    #         children_result = await db.execute(children_stmt)
    #         children_rows = children_result.fetchall()
            
    #         # Get all vaccines with schedules
    #         vaccines_stmt = (
    #             select(VaccinationOption, VaccinationSchedule)
    #             .join(VaccinationSchedule, VaccinationOption.id == VaccinationSchedule.vaccine_id)
    #             .order_by(VaccinationOption.vaccine_name, VaccinationSchedule.dose_num)
    #         )
            
    #         vaccines_result = await db.execute(vaccines_stmt)
    #         vaccines_data = vaccines_result.fetchall()
            
    #         # Get all completed vaccinations
            
    #         # Create a set of completed (child_id, vaccine_id, dose_num) fo
            
    #         # Process each child
    #         children_with_missed_vaccines = []
    #         today = date.today()
            
    #         for child in children_rows:
    #             # Calculate child's age in days
    #             child_dob = child.date_of_birth
                
    #             # Handle datetime/date conversion
    #             if isinstance(child_dob, datetime):
    #                 child_dob_date = child_dob.date()
    #             else:
    #                 child_dob_date = child_dob
                
    #             if not child_dob_date:
    #                 continue  # Skip if no date of birth
                
    #             child_age_days = (today - child_dob_date).days
                
    #             # Find MISSED vaccines (child age > max_age_days AND not completed)
    #             missed_vaccines_for_child = []
                
    #             for vaccine_option, schedule in vaccines_data:
    #                 # Only check if schedule has a max_age_days (otherwise it never expires)
    #                 if schedule.max_age_days is not None:
    #                     # Check if child has passed the max age
    #                     if child_age_days > schedule.max_age_days:
    #                         # Check if this dose is completed
    #                         is_completed = (
    #                             str(child.id), 
    #                             str(schedule.vaccine_id), 
    #                             schedule.dose_num
    #                         ) in completed_set
                            
    #                         if not is_completed:
    #                             # Calculate how many days overdue
    #                             days_overdue = child_age_days - schedule.max_age_days
                                
    #                             # Calculate actual dates
    #                             min_age_date = child_dob_date + timedelta(days=schedule.min_age_days)
    #                             max_age_date = child_dob_date + timedelta(days=schedule.max_age_days)
                                
    #                             missed_vaccines_for_child.append({
    #                                 "vaccine_id": str(vaccine_option.id),
    #                                 "vaccine_name": vaccine_option.vaccine_name,
    #                                 "description": vaccine_option.description,
    #                                 "protect_against": vaccine_option.protect_against,
    #                                 "is_mandatory": vaccine_option.is_mandatory,
    #                                 "doses_needed": vaccine_option.doses_needed,
    #                                 "dose_info": {
    #                                     "dose_num": schedule.dose_num,
    #                                     "dose_name": f"Dose {schedule.dose_num}",
    #                                     "schedule_id": str(schedule.id),
    #                                     "min_age_days": schedule.min_age_days,
    #                                     "max_age_days": schedule.max_age_days,
    #                                     "child_current_age_days": child_age_days,
    #                                     "days_overdue": days_overdue,
    #                                     "status": "MISSED",
    #                                     "eligibility_dates": {
    #                                         "eligible_from": min_age_date.isoformat(),
    #                                         "deadline": max_age_date.isoformat(),
    #                                         "eligible_age_range": f"{schedule.min_age_days}-{schedule.max_age_days} days"
    #                                     },
    #                                     "completion_status": {
    #                                         "is_completed": False,
    #                                         "completed_on": None,
    #                                         "completed_at_facility": None
    #                                     }
    #                                 }
    #                             })
                
    #             # Only include child if they have missed vaccines
    #             if missed_vaccines_for_child:
    #                 children_with_missed_vaccines.append({
    #                     "child_id": str(child.id),
    #                     "firstname": child.firstname,
    #                     "lastname": child.lastname,
    #                     "date_of_birth": child_dob_date.isoformat(),
    #                     "age_days": child_age_days,
    #                     "age_years": child_age_days // 365,
    #                     "age_months": child_age_days // 30,
    #                     "parent_info": {
    #                         "parent_id": str(child.parent_id),
    #                         "parent_name": f"{child.parent_firstname} {child.parent_lastname}",
    #                         "parent_phone": child.parent_phone,
    #                         "parent_email": child.parent_email
    #                     },
    #                     "total_missed_vaccines": len(missed_vaccines_for_child),
    #                     "missed_vaccines": missed_vaccines_for_child
    #                 })
            
    #         # Calculate summary statistics
    #         total_children_checked = len(children_rows)
    #         children_with_missed = len(children_with_missed_vaccines)
    #         total_missed = sum(child["total_missed_vaccines"] for child in children_with_missed_vaccines)
            
    #         # Generate vaccine summary
    #         vaccine_summary = {}
    #         for child in children_with_missed_vaccines:
    #             for vaccine in child["missed_vaccines"]:
    #                 vaccine_name = vaccine["vaccine_name"]
    #                 dose_num = vaccine["dose_info"]["dose_num"]
                    
    #                 key = f"{vaccine_name}_dose_{dose_num}"
                    
    #                 if key not in vaccine_summary:
    #                     vaccine_summary[key] = {
    #                         "vaccine_name": vaccine_name,
    #                         "dose_num": dose_num,
    #                         "total_children_missed": 0,
    #                         "children": []
    #                     }
                    
    #                 vaccine_summary[key]["total_children_missed"] += 1
    #                 vaccine_summary[key]["children"].append({
    #                     "child_id": child["child_id"],
    #                     "child_name": f"{child['firstname']} {child['lastname']}",
    #                     "parent_name": child["parent_info"]["parent_name"],
    #                     "days_overdue": vaccine["dose_info"]["days_overdue"],
    #                     "age_days": child["age_days"]
    #                 })
            
    #         # Sort vaccine summary by most missed
    #         sorted_vaccine_summary = sorted(
    #             vaccine_summary.values(),
    #             key=lambda x: x["total_children_missed"],
    #             reverse=True
    #         )
            
    #         return {
    #             "report_date": today.isoformat(),
    #             "report_generated_at": datetime.now().isoformat(),
    #             "total_children_checked": total_children_checked,
    #             "children_with_missed_vaccines": children_with_missed,
    #             "children_up_to_date": total_children_checked - children_with_missed,
    #             "total_missed_vaccines": total_missed,
    #             "summary": {
    #                 "percentage_with_missed": round((children_with_missed / total_children_checked * 100), 2) if total_children_checked > 0 else 0,
    #                 "avg_missed_per_child": round(total_missed / children_with_missed, 2) if children_with_missed > 0 else 0,
    #                 "most_missed_vaccine": sorted_vaccine_summary[0]["vaccine_name"] if sorted_vaccine_summary else None,
    #                 "total_mandatory_missed": sum(
    #                     1 for child in children_with_missed_vaccines 
    #                     for vaccine in child["missed_vaccines"] 
    #                     if vaccine["is_mandatory"]
    #                 )
    #             },
    #             "vaccine_summary": sorted_vaccine_summary,
    #             "children": children_with_missed_vaccines
    #         }
                    
    #     except SQLAlchemyError:
    #         await db.rollback()
    #         raise HTTPException(status_code=500, detail='Database error!')
        
    #     except Exception as e:
    #         await db.rollback()
    #         error_dict = e.__dict__
    #         raise HTTPException(
    #             status_code=error_dict.get('status_code', 500), 
    #             detail=error_dict.get('detail', 'Internal server error!')
    #         )
    
    @staticmethod
    async def add_vaccine_record(date_given: str, child_id: UUID, vaccine_id: UUID, schedule_id: UUID, db: AsyncSession):
        try:
            given_date = datetime.strptime(date_given, "%Y-%m-%d").date()
            
            # Check if record already exists
            existing_record = await db.execute(
                select(VaccinationRecord).where(
                    VaccinationRecord.child_id == child_id,
                    VaccinationRecord.vaccine_id == vaccine_id,
                    VaccinationRecord.schedule_id == schedule_id
                )
            )
            existing_record = existing_record.scalar_one_or_none()
            
            if existing_record:
                # Update the existing record's date if needed
                if existing_record.date_given != given_date:
                    existing_record.date_given = given_date
                    await db.commit()
                    await db.refresh(existing_record)
                return existing_record
            
            # Create new vaccination record if it doesn't exist
            new_record = VaccinationRecord(
                child_id=child_id,
                vaccine_id=vaccine_id,
                schedule_id=schedule_id,
                date_given=given_date
            )
            
            db.add(new_record)
            await db.commit()
            await db.refresh(new_record)
            
            return new_record
            
        except ValueError as e:
            await db.rollback()
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid date format. Please use YYYY-MM-DD format. Error: {str(e)}"
            )
        
        except SQLAlchemyError as e:
            await db.rollback()
            raise HTTPException(
                status_code=500, 
                detail=f'Database error: {str(e)}'
            )
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get('status_code', 500), 
                detail=error_dict.get('detail', 'Internal server error!')
            )