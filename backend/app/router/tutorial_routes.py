from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.postgres import connect_db
from app.middleware.protect_endpoints import verify_authentication
from app.controllers.tutorial_controllers import VideoTutorialControllers
from app.schemas.tutorial_schemas import (
    VideoTutorialCreate,
    VideoTutorialResponse
)

video_tutorial_router = APIRouter(
    prefix='/api/video-tutorials',
    tags=['Video Tutorials']
)


@video_tutorial_router.post(
    '/create',
    status_code=201,
    response_model=VideoTutorialResponse
)
async def create_video_tutorial(
    data: VideoTutorialCreate,
    payload = Depends(verify_authentication),
    db: AsyncSession = Depends(connect_db)
):
    return await VideoTutorialControllers.create(data, db)


@video_tutorial_router.get(
    '/all',
    response_model=List[VideoTutorialResponse]
)
async def get_all_video_tutorials(
    payload = Depends(verify_authentication),
    db: AsyncSession = Depends(connect_db)
):
    return await VideoTutorialControllers.get_all(db)


@video_tutorial_router.get(
    '/{tutorial_id}',
    response_model=VideoTutorialResponse
)
async def get_single_video_tutorial(
    tutorial_id: str,
    payload = Depends(verify_authentication),
    db: AsyncSession = Depends(connect_db)
):
    tutorial = await VideoTutorialControllers.get_by_id(UUID(tutorial_id), db)
    if not tutorial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video tutorial not found"
        )
    return tutorial
