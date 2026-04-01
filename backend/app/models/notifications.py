from app.database.postgres import Base
from sqlalchemy.orm import mapped_column, Mapped
from uuid import UUID, uuid4
from sqlalchemy.dialects.postgresql import UUID as u
from sqlalchemy import String, DateTime, text, ForeignKey, Boolean
from enum import Enum
from datetime import datetime
from app.models.user import User
from sqlalchemy import Enum as SQLEnum





class NotificationType(Enum):
    VACCINATION = "Vaccination"
    GROWTH = "Growth" 
    MILESTONE = "Milestone"
    SETTINGS = "Settings"
    COMMENT = "Comment"
    MENTION = "Mention"
    LIKE = "Like"


class Notification(Base):
    __tablename__  = "notifications"
    
    id: Mapped[UUID] = mapped_column(u(as_uuid=True), primary_key=True, default=uuid4)
    
    notification_type: Mapped[NotificationType] = mapped_column(
        SQLEnum(NotificationType, name="notification_type_enum"),
        nullable=False,
        default=NotificationType.COMMENT
    )
    
    content: Mapped[str] = mapped_column(String, nullable=False, default="You have received a notification")
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, server_default=text('now()'), nullable=False)
    
    receiver: Mapped[UUID] = mapped_column(u(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    sender: Mapped[UUID] = mapped_column(u(as_uuid=True), ForeignKey('users.id'), nullable=True)
    
    seen:  Mapped[bool] = mapped_column(Boolean, default=False)
    
    
                                                 
    
                                                 
                                                

    
    
