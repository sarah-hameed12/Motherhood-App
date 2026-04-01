from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy import select
from fastapi import HTTPException
from uuid import UUID
from datetime import date

from app.models.child import Child
from app.models.child_growth import ChildGrowthRecord
from app.schemas.child_growth_schemas import GrowthRecordCreate, GrowthRecordUpdate


class ChildGrowthController:
    @staticmethod
    async def create(data: GrowthRecordCreate, auth_id: UUID, db: AsyncSession):
        try:
            # Ownership check: child must belong to this mother
            stmt_child = select(Child).where((Child.id == data.child_id) & (Child.mother_id == auth_id))
            res_child = await db.execute(stmt_child)
            child = res_child.scalar_one_or_none()

            if not child:
                raise HTTPException(status_code=403, detail="You do not own this child.")

            record = ChildGrowthRecord(
                child_id=data.child_id,
                recorded_at=data.recorded_at,
                weight=data.weight,
                height=data.height,
                head_circumference=data.head_circumference,
                milestone_notes=data.milestone_notes,
            )

            db.add(record)

            try:
                await db.commit()
            except IntegrityError:
                await db.rollback()
                raise HTTPException(
                    status_code=409,
                    detail="Growth record already exists for this child on this date. Use update instead.",
                )

            await db.refresh(record)
            return record

        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail="Database error!")

        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get("status_code", 500),
                detail=error_dict.get("detail", "Internal server error!"),
            )

    @staticmethod
    async def list(child_id: UUID, auth_id: UUID, db: AsyncSession, start_date: date | None = None, end_date: date | None = None):
        try:
            # Ownership check
            stmt_child = select(Child).where((Child.id == child_id) & (Child.mother_id == auth_id))
            res_child = await db.execute(stmt_child)
            child = res_child.scalar_one_or_none()

            if not child:
                raise HTTPException(status_code=403, detail="You do not own this child.")

            stmt = select(ChildGrowthRecord).where(ChildGrowthRecord.child_id == child_id)

            if start_date:
                stmt = stmt.where(ChildGrowthRecord.recorded_at >= start_date)
            if end_date:
                stmt = stmt.where(ChildGrowthRecord.recorded_at <= end_date)

            stmt = stmt.order_by(ChildGrowthRecord.recorded_at.asc())

            res = await db.execute(stmt)
            records = res.scalars().all()
            return records

        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail="Database error!")

        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get("status_code", 500),
                detail=error_dict.get("detail", "Internal server error!"),
            )

    @staticmethod
    async def detail(record_id: UUID, auth_id: UUID, db: AsyncSession):
        try:
            record = await db.get(ChildGrowthRecord, record_id)
            if not record:
                raise HTTPException(status_code=404, detail="Growth record not found!")

            # Ownership check via child
            child = await db.get(Child, record.child_id)
            if not child or str(child.mother_id) != str(auth_id):
                raise HTTPException(status_code=403, detail="You cannot view this record!")

            return record

        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail="Database error!")

        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get("status_code", 500),
                detail=error_dict.get("detail", "Internal server error!"),
            )

    @staticmethod
    async def update(record_id: UUID, data: GrowthRecordUpdate, auth_id: UUID, db: AsyncSession):
        try:
            record = await db.get(ChildGrowthRecord, record_id)
            if not record:
                raise HTTPException(status_code=404, detail="Growth record not found!")

            child = await db.get(Child, record.child_id)
            if not child or str(child.mother_id) != str(auth_id):
                raise HTTPException(status_code=403, detail="You cannot update this record!")

            for key, value in data:
                if value is not None:
                    setattr(record, key, value)

            try:
                await db.commit()
            except IntegrityError:
                await db.rollback()
                raise HTTPException(status_code=409, detail="This date already has a growth record for the child.")

            await db.refresh(record)
            return record

        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail="Database error!")

        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get("status_code", 500),
                detail=error_dict.get("detail", "Internal server error!"),
            )

    @staticmethod
    async def delete(record_id: UUID, auth_id: UUID, db: AsyncSession):
        try:
            record = await db.get(ChildGrowthRecord, record_id)
            if not record:
                raise HTTPException(status_code=404, detail="Growth record not found!")

            child = await db.get(Child, record.child_id)
            if not child or str(child.mother_id) != str(auth_id):
                raise HTTPException(status_code=403, detail="You cannot delete this record!")

            await db.delete(record)
            await db.commit()
            return {"deleted": True, "record_id": str(record_id)}

        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail="Database error!")

        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get("status_code", 500),
                detail=error_dict.get("detail", "Internal server error!"),
            )
