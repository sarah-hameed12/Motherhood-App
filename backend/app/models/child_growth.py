from app.database.postgres import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from uuid import UUID as u, uuid4
from sqlalchemy import ForeignKey, Date, DateTime, Float, Text, UniqueConstraint, Index
from datetime import datetime, date


class ChildGrowthRecord(Base):
    __tablename__ = "child_growth_records"

    id: Mapped[u] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    child_id: Mapped[u] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("children.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    recorded_at: Mapped[date] = mapped_column(Date, nullable=False, default=date.today, index=True)

    weight: Mapped[float | None] = mapped_column(Float, nullable=True)  # kg
    height: Mapped[float | None] = mapped_column(Float, nullable=True)  # cm
    head_circumference: Mapped[float | None] = mapped_column(Float, nullable=True)  # cm

    milestone_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        # Prevent duplicate record for same child on same day (matches your UC flow well).
        UniqueConstraint("child_id", "recorded_at", name="uq_child_growth_child_date"),
        Index("ix_child_growth_child_date", "child_id", "recorded_at"),
    )
