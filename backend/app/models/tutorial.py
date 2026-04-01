# # from app.database.postgres import Base
# # from uuid import UUID as u, uuid4
# # from sqlalchemy.orm import Mapped, mapped_column
# # from sqlalchemy.dialects.postgresql import UUID, ARRAY
# # from sqlalchemy import ForeignKey, text
# # from datetime import datetime
# # from sqlalchemy import DateTime, String, Boolean, Enum as E
# # from typing import List
# # from enum import Enum


# # class VideoTutorial(Base):
# #     __tablename__ = 'video_tutorials'
    
# #     id: Mapped[u] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
# #     url: Mapped[u] = mapped_column(String, nullable=False)
# #     name: Mapped[u] = mapped_column(String, nullable=False)
# #     category: Mapped[u] = mapped_column(String)

# from app.database.postgres import Base
# from uuid import UUID as u, uuid4
# from sqlalchemy.orm import Mapped, mapped_column
# from sqlalchemy.dialects.postgresql import UUID, ARRAY
# from sqlalchemy import ForeignKey, text, Integer, Float
# from datetime import datetime
# from sqlalchemy import DateTime, String, Boolean, Enum as E
# from typing import List
# from enum import Enum


# class TutorialCategory(Enum):
#     FEEDING = "FEEDING"
#     BATHING = "BATHING"
#     SLEEP_TRAINING = "SLEEP_TRAINING"
#     HEALTH = "HEALTH"
#     DEVELOPMENT = "DEVELOPMENT"
#     SAFETY = "SAFETY"


# class TutorialLanguage(Enum):
#     URDU = "URDU"
#     ENGLISH = "ENGLISH"
#     BOTH = "BOTH"


# class VideoTutorial(Base):
#     __tablename__ = 'video_tutorials'
    
#     id: Mapped[u] = mapped_column(
#         UUID(as_uuid=True), 
#         primary_key=True, 
#         default=uuid4
#     )
#     url: Mapped[str] = mapped_column(String, nullable=False)
#     name: Mapped[str] = mapped_column(String, nullable=False)
#     description: Mapped[str] = mapped_column(String, nullable=True)
#     category: Mapped[TutorialCategory] = mapped_column(
#         E(TutorialCategory, name="tutorial_category_enum"),
#         nullable=False
#     )
#     language: Mapped[TutorialLanguage] = mapped_column(
#         E(TutorialLanguage, name="tutorial_language_enum"),
#         nullable=False,
#         default=TutorialLanguage.BOTH
#     )
#     thumbnail_url: Mapped[str] = mapped_column(String, nullable=True)
#     duration_minutes: Mapped[int] = mapped_column(Integer, nullable=True)
#     is_active: Mapped[bool] = mapped_column(Boolean, default=True)
#     created_at: Mapped[datetime] = mapped_column(
#         DateTime,
#         default=datetime.utcnow,
#         server_default=text('now()'),
#         nullable=False,
#         index=True
#     )
#     updated_at: Mapped[datetime] = mapped_column(
#         DateTime,
#         default=datetime.utcnow,
#         onupdate=datetime.utcnow,
#         server_default=text('now()'),
#         nullable=False
#     )


# class TutorialView(Base):
#     __tablename__ = 'tutorial_views'
    
#     id: Mapped[u] = mapped_column(
#         UUID(as_uuid=True), 
#         primary_key=True, 
#         default=uuid4
#     )
#     tutorial_id: Mapped[u] = mapped_column(
#         UUID(as_uuid=True),
#         ForeignKey("video_tutorials.id", ondelete="CASCADE"),
#         nullable=False
#     )
#     user_id: Mapped[u] = mapped_column(
#         UUID(as_uuid=True),
#         ForeignKey("users.id"),
#         nullable=False
#     )
#     watched_at: Mapped[datetime] = mapped_column(
#         DateTime,
#         default=datetime.utcnow,
#         server_default=text('now()'),
#         nullable=False,
#         index=True
#     )
#     watch_duration_minutes: Mapped[int] = mapped_column(
#         Integer, 
#         nullable=True,
#         comment="How long the user watched in minutes"
#     )
#     completed: Mapped[bool] = mapped_column(
#         Boolean, 
#         default=False,
#         comment="Whether user watched till the end"
#     )


# class TutorialRating(Base):
#     __tablename__ = 'tutorial_ratings'
    
#     id: Mapped[u] = mapped_column(
#         UUID(as_uuid=True), 
#         primary_key=True, 
#         default=uuid4
#     )
#     tutorial_id: Mapped[u] = mapped_column(
#         UUID(as_uuid=True),
#         ForeignKey("video_tutorials.id", ondelete="CASCADE"),
#         nullable=False
#     )
#     user_id: Mapped[u] = mapped_column(
#         UUID(as_uuid=True),
#         ForeignKey("users.id"),
#         nullable=False
#     )
#     rating: Mapped[int] = mapped_column(
#         Integer,
#         nullable=False,
#         comment="Rating from 1-5 stars"
#     )
#     review: Mapped[str] = mapped_column(String, nullable=True)
#     created_at: Mapped[datetime] = mapped_column(
#         DateTime,
#         default=datetime.utcnow,
#         server_default=text('now()'),
#         nullable=False
#     )
#     updated_at: Mapped[datetime] = mapped_column(
#         DateTime,
#         default=datetime.utcnow,
#         onupdate=datetime.utcnow,
#         server_default=text('now()'),
#         nullable=False
#     )




from app.database.postgres import Base
from uuid import UUID as u, uuid4
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy import ForeignKey, text
from datetime import datetime
from sqlalchemy import DateTime, String, Boolean, Enum as E
from typing import List
from enum import Enum


class VideoTutorial(Base):
    __tablename__ = 'video_tutorials'
    
    id: Mapped[u] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    url: Mapped[u] = mapped_column(String, nullable=False)
    name: Mapped[u] = mapped_column(String, nullable=False)
    category: Mapped[u] = mapped_column(String)