from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database.postgres import connect_db
from app.middleware.protect_endpoints import verify_authentication
from app.schemas.vaccination_schemas import VaccinationReminderCreate, VaccinationReminderResponse
from app.controllers.vaccination_reminder_controller import VaccinationReminderController


vaccination_reminder_router = APIRouter(
    prefix='/api/vaccination-reminders',
    tags=['Vaccination Reminders']
)


@vaccination_reminder_router.post('/', response_model=VaccinationReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_vaccination_reminder(
    data: VaccinationReminderCreate,
    db: AsyncSession = Depends(connect_db),
    payload: dict = Depends(verify_authentication)
):
    user_id = payload['id']
    return await VaccinationReminderController.create_reminder(data, user_id, db)


@vaccination_reminder_router.get('/', response_model=list[VaccinationReminderResponse])
async def get_vaccination_reminders(
    db: AsyncSession = Depends(connect_db),
    payload: dict = Depends(verify_authentication)
):
    """
    Get all vaccination reminders for all children owned by the authenticated user
    """
    user_id = payload['id']
    return await VaccinationReminderController.getList(user_id, db)


@vaccination_reminder_router.get('/{child_id}/{reminder_id}')
async def get_vaccination_reminder_detail(
    child_id: UUID,
    reminder_id: UUID,
    db: AsyncSession = Depends(connect_db),
    payload: dict = Depends(verify_authentication)
):
    user_id = payload['id']
    return await VaccinationReminderController.getDetail(user_id, reminder_id, child_id, db)


@vaccination_reminder_router.get('/child/{child_id}', response_model=list[VaccinationReminderResponse])
async def get_vaccination_reminders_by_child(
    child_id: UUID,
    db: AsyncSession = Depends(connect_db),
    payload: dict = Depends(verify_authentication)
):
    user_id = payload['id']
    reminders = await VaccinationReminderController.getList(user_id, db)
    return [reminder for reminder in reminders if str(reminder['child_id']) == str(child_id)]