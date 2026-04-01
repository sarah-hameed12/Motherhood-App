from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging
from uuid import UUID
from typing import List
from app.schemas.vaccine_schemas import VaccineWithSchedulesResponse, VaccinationPendingSchemaResponse
from datetime import date
from app.database.postgres import connect_db
from app.middleware.protect_endpoints import verify_authentication

from app.controllers.final_vaccination_controllers import VaccinationRecordControllers



from app.schemas.final_vaccination_schemas import VaccineRecordRequest, VaccinationOptionCreateSchema, VaccinationOptionResponseSchema, VaccinationScheduleCreateSchema, VaccinationUserViewSchema, VaccinationSchema, ChildAge



from app.controllers.final_vaccination_controllers import VaccinationOptionControllers, VaccinationScheduleControllers, VaccinationUserViewControllers, VaccinationMainControllers


vaccine_router = APIRouter(prefix="/api/vaccines", tags=["vaccines"])
logger = logging.getLogger(__name__)




@vaccine_router.post('/required-vaccines/{child_id}', response_model=List[VaccinationSchema])
async def vaccines_required(child_id: UUID, data: ChildAge, payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    auth_id = payload['id']

    if not auth_id:
        raise HTTPException(status_code=401, detail='You are not authorized!')
    
    return await VaccinationMainControllers.vaccination_list(data, child_id, db)


@vaccine_router.post('/create-vaccine-option', status_code=201)
async def create_vaccine(data: VaccinationOptionCreateSchema, db: AsyncSession = Depends(connect_db)):
    # auth_id = payload['id']

    # if not auth_id:
    #     raise HTTPException(status_code=401, detail='You are not authorized!')
    
    return await VaccinationOptionControllers.create_option_record(data, db)

#kjhk

@vaccine_router.get('/retrive-vaccine-options', response_model=List[VaccinationOptionResponseSchema])
async def vaccine_options_list(db: AsyncSession = Depends(connect_db)):
    # auth_id = payload['id']

    # if not auth_id:
    #     raise HTTPException(status_code=401, detail='You are not authorized!')
    
    return await VaccinationOptionControllers.retrive_vaccine_options(db)



@vaccine_router.get('/retrive-option-details/{vaccine_id}', response_model=VaccinationOptionResponseSchema)
async def vaccine_options_details(vaccine_id: UUID, payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    auth_id = payload['id']

    if not auth_id:
        raise HTTPException(status_code=401, detail='You are not authorized!')
    
    return await VaccinationOptionControllers.retrive_option_details(vaccine_id, db)



@vaccine_router.post('/create-vaccine-schedule', status_code=201)
async def vaccine_schedule_create(data: VaccinationScheduleCreateSchema, db: AsyncSession = Depends(connect_db)):
    # auth_id = payload['id']

    # if not auth_id:
    #     raise HTTPException(status_code=401, detail='You are not authorized!')
    
    return await VaccinationScheduleControllers.create_schedule_record(data, db)



@vaccine_router.get('/fetch-all', response_model=List[VaccinationUserViewSchema])
async def vaccine_user_list(payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    auth_id = payload['id']

    if not auth_id:
        raise HTTPException(status_code=401, detail='You are not authorized!')
    
    return await VaccinationUserViewControllers.vaccination_list_view(db)




@vaccine_router.post('/create-record/{child_id}')
async def create_vaccination_record(
    child_id: UUID,
    data: VaccineRecordRequest,
    payload = Depends(verify_authentication),
    db: AsyncSession = Depends(connect_db)
):
    auth_id = payload['id']
    
    if not auth_id:
        raise HTTPException(status_code=401, detail='You are not authorized!')
    
    # REMOVED THE "return he" 
    # Calling the controller properly
    return await VaccinationRecordControllers.record_create(data, child_id, db)


@vaccine_router.get('/child/{child_id}/medical-report')
async def get_child_medical_report(
    child_id: UUID,
    payload = Depends(verify_authentication),
    db: AsyncSession = Depends(connect_db)
):
    auth_id = payload['id']
    
    if not auth_id:
        raise HTTPException(status_code=401, detail='You are not authorized!')
    
    return await VaccinationRecordControllers.get_child_medical_report(child_id, db)

# 


# @vaccine_router.get('/all', response_model=List[VaccineWithSchedulesResponse])
# async def get_all_vaccines(payload = Depends(verify_authentication), db: AsyncSession =  Depends(connect_db)):
#     return await VaccinationControllers.get_all_vaccines(db)


# @vaccine_router.get('/pending')
# async def get_pending_vaccines(payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
#     return await VaccinationControllers.get_pending_vaccines(payload['id'], db)




# @vaccine_router.post('/add-record')
# async def add_vaccine_record(
#     request: VaccineRecordRequest,
#     payload = Depends(verify_authentication), 
#     db: AsyncSession = Depends(connect_db)
# ):
#     return await VaccinationControllers.add_vaccine_record(
#         request.given_date, 
#         request.child_id, 
#         request.vaccine_id, 
#         request.schedule_id, 
#         db
#     )