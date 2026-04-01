from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.child_schemas import ChildCreateSchema, ChildBaseUpdateSchema, ChildPhysicalInfoUpdate
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from app.models.child import Child
from uuid import UUID


class ChildController():
    @staticmethod
    async def create(data: ChildCreateSchema, auth_id: UUID, db: AsyncSession):
        try:
            child = Child(mother_id=auth_id, firstname=data.firstname, lastname=data.lastname, profile_pic=data.profile_pic, gender=data.gender, date_of_birth=data.date_of_birth)
            
            db.add(child)
            await db.commit()
            await db.refresh(child)
            
            return {"message": "Child info added!", "child_id": child.id}
        
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
        

    @staticmethod
    async def detail(child_id: UUID, db: AsyncSession):
        try:
            child = await db.get(Child, child_id)
            
            if not child:
                raise HTTPException(status_code=404, detail='Child not found!')
            
            print(child)
            return child
        
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
                
    
    @staticmethod
    async def update_personal_info(child_id: UUID, data: ChildBaseUpdateSchema, auth_id: UUID, db: AsyncSession):
        try:
            child = await db.get(Child, child_id)
                        
            if not child:
                raise HTTPException(status_code=404, detail='Child not found!')
            
            if str(auth_id) != str(child.mother_id):
                raise HTTPException(status_code=403, detail='You cannot update child info')
            
            for key, value in data:
                if value != None:
                    setattr(child, key, value)
                    
            await db.commit()
            await db.refresh(child)
            
            return f"Child with ID {child_id} updated!"
        
        except SQLAlchemyError:
            await db.rollback()
            
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            
            raise HTTPException(
                status_code=error_dict.get('status_code', 500),
                detail=error_dict.get('detail', 'Internal server error')
            )
    
    
    @staticmethod
    async def update_physical_info(id: UUID, data: ChildPhysicalInfoUpdate, auth_id: UUID, db: AsyncSession):
        try:
            child = await db.get(Child, id)
            
            if not child:
                raise HTTPException(status_code=404, detail='Child not found')
            
            if str(child.mother_id) != str(auth_id):
                raise HTTPException(status_code=403, detail='You cannot update this profile!')
            
            for key, value in data:
                if value != None:
                    setattr(child, key, value)
                    
            await db.commit()
            await db.refresh(child)
            
            return f'Child with ID {id} physical info updated!'
        
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
            
    @staticmethod
    async def delete(child_id: UUID, auth_id: UUID, db: AsyncSession):
        try:
            child = await db.get(Child, child_id)
            
            if not child:
                raise HTTPException(status_code=404, detail='Child not found')
            
            if str(child.mother_id) != str(auth_id):
                raise HTTPException(status_code=403, detail='You cannot delete this profile!')
            
            await db.delete(child)
            await db.commit()
            
            return f'Child with ID {child_id} deleted!'
        
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
    
    
  