from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class VideoTutorialCreate(BaseModel):
    url: str
    name: str
    category: Optional[str] = None


class VideoTutorialResponse(BaseModel):
    id: UUID
    url: str
    name: str
    category: Optional[str] = None

    class Config:
        from_attributes = True
