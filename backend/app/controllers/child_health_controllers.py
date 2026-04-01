from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.child_medical_schemas import VaccinationCreate, VaccinationUpdate
from uuid import UUID
from app.schemas.child_medical_schemas import MedicalConditionCreate, MedicalConditionUpdate
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from app.models.child import Vaccination, Child
from sqlalchemy import select


class ChildVaccinationController():
    @staticmethod
    async def create(data: VaccinationCreate, auth_id: UUID, db: AsyncSession):
        try:
            child = await db.get(Child, data.child_id)
                        
            if not child:
                raise HTTPException(status_code=404, detail=f'Child with ID {data.child_id} does not exist!')

            if str(child.mother_id) != str(auth_id):
                raise HTTPException(status_code=403, detail='You cannot create vaccine for this child!')
            
            new_vaccination  = Vaccination(child_id=data.child_id, vaccine_name=data.vaccine_name, date_given=data.date_given, dose=data.dose, notes=data.notes)
            
            db.add(new_vaccination)
            await db.commit()
            
            await db.refresh(new_vaccination)
            
            return new_vaccination
        
        except SQLAlchemyError:
            await db.rollback()
            
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            
            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))


    @staticmethod
    async def v_list(child_id: UUID, auth_id: UUID, db: AsyncSession):
        try:
            statement = select(Vaccination.child_id, Vaccination.date_given, Vaccination.id, Vaccination.updated_at, Vaccination.vaccine_name).where(Vaccination.child_id==child_id)
            
            result = await db.execute(statement)
            
            vaccinations = result.all()
            
            return vaccinations
        
        except SQLAlchemyError:
            await db.rollback()
            
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            
            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))


    @staticmethod
    async def detail(vaccine_id: UUID, auth_id: UUID, db: AsyncSession):
        try:
            vaccine = await db.get(Vaccination, vaccine_id)
            
            if not vaccine:
                raise HTTPException(status_code=404, detail='Vaccination detail not found!')
            
            return vaccine
        
        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))


    @staticmethod
    async def update(vaccine_id: UUID, data: VaccinationUpdate, auth_id: UUID, db: AsyncSession):
        try:
            vaccine = await db.get(Vaccination, vaccine_id)
            
            if not vaccine:
                raise HTTPException(status_code=404, detail='Vaccine detail not found!')
            
            
            pass
        
        except SQLAlchemyError:
            await db.rollback()
            
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            
            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))


    @staticmethod
    async def delete(vaccine_id: UUID, auth_id: UUID, db: AsyncSession):
        try:
            pass
        
        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))


class MedicalConditionController():
    @staticmethod
    async def create(data: MedicalConditionCreate, auth_id: UUID, db: AsyncSession):
        try:
            pass
        
        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))


    @staticmethod
    async def v_list(child_id: UUID, auth_id: UUID, db: AsyncSession):
        try:
            pass
        
        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))


    @staticmethod
    async def detail(condition_id: UUID, auth_id: UUID, db: AsyncSession):
        try:
            pass
        
        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))

    @staticmethod
    async def update(condition_id: UUID, data: MedicalConditionUpdate, auth_id: UUID, db: AsyncSession):
        try:
            pass
        
        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))

    @staticmethod
    async def delete(condition_id: UUID, auth_id: UUID, db: AsyncSession):
        try:
            pass
        
        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))