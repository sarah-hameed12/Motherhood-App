from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.models.tutorial import VideoTutorial
from app.schemas.tutorial_schemas import VideoTutorialCreate


class VideoTutorialControllers:

    @staticmethod
    async def create(data: VideoTutorialCreate, db: AsyncSession):
        tutorial = VideoTutorial(
            url=data.url,
            name=data.name,
            category=data.category
        )

        db.add(tutorial)
        await db.commit()
        await db.refresh(tutorial)
        
        return tutorial

    @staticmethod
    async def get_all(db: AsyncSession):
        result = await db.execute(
            select(VideoTutorial)
        )
        return result.scalars().all()
    

    @staticmethod
    async def get_by_id(tutorial_id: UUID, db: AsyncSession):
        result = await db.execute(
            select(VideoTutorial).where(VideoTutorial.id == tutorial_id)
        )
        return result.scalar_one_or_none()
