from app.database.postgres import Base
from uuid import UUID as u, uuid4
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy import ForeignKey, text
from datetime import datetime
from sqlalchemy import DateTime, String, Boolean, Enum as E
from typing import List
from enum import Enum


class PostType(Enum):
    ADVICE = "Advice"
    DISCUSSION = "Discussion" 
    SUPPORT = "Support"


class Post(Base):
    __tablename__ = 'posts'
    
    id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid4
    )
    user_id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        server_default=text('now()'), 
        nullable=False,
        index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow,
        server_default=text('now()'),  
        nullable=False
    )
    post_category: Mapped[str] = mapped_column(String, nullable=True)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    tags: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=True)
    images: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=True)
    visible: Mapped[bool] = mapped_column(Boolean, default=True)
    post_type: Mapped[PostType] = mapped_column(
        E(PostType, name="post_type_enum"), 
        nullable=True
    )


class PostLike(Base):
    __tablename__ = 'post_likes'
    
    id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid4
    )
    user_id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    post_id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("posts.id"),  
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow,
        server_default=text('now()'),
        nullable=False
    )
    

class PostComplain(Base):
    __tablename__ = 'post_complains'
    
    id: Mapped[u] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    post_id: Mapped[u] = mapped_column(UUID(as_uuid=True), ForeignKey('posts.id'), nullable=False)
    user_id: Mapped[u] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    content: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)




class Comment(Base):
    __tablename__ = 'comments'
        
    id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid4
    )
    post_id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("posts.id", ondelete="CASCADE"), 
        nullable=False
    )
    user_id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    content: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow,
        server_default=text('now()'),
        nullable=False,
        index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        server_default=text('now()'),
        nullable=False
    )


class CommentLike(Base):
    __tablename__ = 'comment_likes'
    
    id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid4
    )
    comment_id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("comments.id", ondelete="CASCADE"), 
        nullable=False
    )
    user_id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow,
        server_default=text('now()'),
        nullable=False
    )

class ReportReason(Enum):
    SPAM = "Spam"
    OFFENSIVE = "Offensive"
    MISINFORMATION = "Misinformation"
    HARASSMENT = "Harassment"
    INAPPROPRIATE_CONTENT = "Inappropriate Content"
    OTHER = "Other"


class ReportStatus(Enum):
    PENDING = "Pending"
    UNDER_REVIEW = "Under Review"
    RESOLVED = "Resolved"
    DISMISSED = "Dismissed"


class PostReport(Base):
    __tablename__ = 'post_reports'
    
    id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid4
    )
    post_id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("posts.id", ondelete="CASCADE"), 
        nullable=False
    )
    reporter_id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    reason: Mapped[ReportReason] = mapped_column(
        E(ReportReason, name="report_reason_enum"), 
        nullable=False
    )
    description: Mapped[str] = mapped_column(String, nullable=True)
    status: Mapped[ReportStatus] = mapped_column(
        E(ReportStatus, name="report_status_enum"),
        default=ReportStatus.PENDING,
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow,
        server_default=text('now()'),
        nullable=False,
        index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        server_default=text('now()'),
        nullable=False
    )
    reviewed_by: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"),
        nullable=True
    )
    reviewed_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True
    )
    admin_notes: Mapped[str] = mapped_column(String, nullable=True)



class UserSavedPost(Base):
    __tablename__ = 'user_save_posts'

    id: Mapped[u] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid4
    )

