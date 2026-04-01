from pydantic import BaseModel, ConfigDict
from uuid import UUID
from app.models.community import PostType
from typing import List
from datetime import datetime
from app.models.community import ReportReason, ReportStatus


class PostBase(BaseModel):
    user_id: UUID
    title: str
    tags: List[str] | None = None
    images: List[str] | None = None
    description: str
    post_type: PostType | None = None
    
    
class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    description: str | None = None


class PostChangeVisiblity(BaseModel):
    visible: bool | None = None
    
    
class MiniUserSchema(BaseModel):
    firstname: str
    lastname: str
    username: str
    profile_pic: str | None = None
    
    
class PostResponse(BaseModel):
    user_id: UUID
    user: MiniUserSchema
    title: str
    tags: List[str] | None = None
    images: List[str] | None = None
    description: str
    post_type: PostType | None = None
    id: UUID
    visible: bool
    post_category: str
    like_count: int
    created_at: datetime
    likers: List[UUID] = []
    
    
    
    model_config = ConfigDict(from_attributes=True)



class CommentCreate(BaseModel):
    content: str


class CommentUpdate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: UUID
    post_id: UUID
    user_id: UUID
    content: str
    created_at: datetime
    updated_at: datetime
    user: MiniUserSchema
    like_count: int
    
    model_config = ConfigDict(from_attributes=True)




class PostReportCreate(BaseModel):
    reason: ReportReason
    description: str | None = None


class PostReportResponse(BaseModel):
    id: UUID
    post_id: UUID
    reporter_id: UUID
    reason: ReportReason
    description: str | None
    status: ReportStatus
    created_at: datetime
    updated_at: datetime
    reporter: MiniUserSchema
    
    model_config = ConfigDict(from_attributes=True)


class PostReportDetailResponse(BaseModel):
    id: UUID
    post_id: UUID
    reporter_id: UUID
    reason: ReportReason
    description: str | None
    status: ReportStatus
    created_at: datetime
    updated_at: datetime
    reviewed_by: UUID | None
    reviewed_at: datetime | None
    admin_notes: str | None
    reporter: MiniUserSchema
    post: PostResponse
    
    model_config = ConfigDict(from_attributes=True)


class PostReportUpdateStatus(BaseModel):
    status: ReportStatus
    admin_notes: str | None = None

