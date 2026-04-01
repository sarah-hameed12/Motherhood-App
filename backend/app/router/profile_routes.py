from fastapi import APIRouter, Depends
from app.schemas.profile_schemas import MotherProfileResponse, MotherProfileUpdate
from app.middleware.protect_endpoints import verify_authentication
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.postgres import connect_db
from app.controllers.profile_controllers import ProfileController
from app.schemas.child_schemas import ChildMiniResponseSchema
from typing import List
from uuid import UUID
from fastapi import HTTPException


profile_router = APIRouter(
    prefix='/api/user-profile',
    tags=['User Profile Routes']
)


@profile_router.get('/get-children', response_model=List[ChildMiniResponseSchema])
async def mother_children_route(payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    return await ProfileController.get_children(payload['id'], db)


@profile_router.get('/mother/{id}', response_model=MotherProfileResponse)
async def mother_profile_detail(id: str, payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    return await ProfileController.detail(id, db)


@profile_router.put('/update')
async def mother_profile_update(data: MotherProfileUpdate ,payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    return await ProfileController.update(payload['id'], data, db)


@profile_router.delete('/delete')
async def delete_route(payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    return await ProfileController.delete(payload['id'], db)



@profile_router.post('/save-post/{post_id}', status_code=201)
async def save_post(post_id: UUID, payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    auth_id = payload['id']

    if not auth_id:
        raise HTTPException(status_code=401, detail='Unauthorized request!')

    return await ProfileController.archive_post_create(post_id, auth_id, db)



@profile_router.get('/archive-posts', status_code=201)
async def archive(payload = Depends(verify_authentication), db: AsyncSession = Depends(connect_db)):
    auth_id = payload['id']

    if not auth_id:
        raise HTTPException(status_code=401, detail='Unauthorized request!')

    return await ProfileController.archive_post(post_id, auth_id)








