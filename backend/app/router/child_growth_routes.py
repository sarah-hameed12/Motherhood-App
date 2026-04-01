from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List, Optional
from datetime import date

from app.database.postgres import connect_db
from app.middleware.protect_endpoints import verify_authentication

from app.controllers.child_growth_controllers import ChildGrowthController
from app.schemas.child_growth_schemas import GrowthRecordCreate, GrowthRecordUpdate, GrowthRecordResponse


child_growth_router = APIRouter(
    prefix="/api/child-growth",
    tags=["Child Growth"]
)


@child_growth_router.post("/create", response_model=GrowthRecordResponse, status_code=201)
async def create_growth_record(
    data: GrowthRecordCreate,
    payload=Depends(verify_authentication),
    db: AsyncSession = Depends(connect_db),
):
    return await ChildGrowthController.create(data, payload["id"], db)


@child_growth_router.get("/list/{child_id}", response_model=List[GrowthRecordResponse])
async def list_growth_records(
    child_id: UUID,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    payload=Depends(verify_authentication),
    db: AsyncSession = Depends(connect_db),
):
    return await ChildGrowthController.list(child_id, payload["id"], db, start_date, end_date)


@child_growth_router.get("/detail/{record_id}", response_model=GrowthRecordResponse)
async def growth_record_detail(
    record_id: UUID,
    payload=Depends(verify_authentication),
    db: AsyncSession = Depends(connect_db),
):
    return await ChildGrowthController.detail(record_id, payload["id"], db)


@child_growth_router.put("/update/{record_id}", response_model=GrowthRecordResponse)
async def update_growth_record(
    record_id: UUID,
    data: GrowthRecordUpdate,
    payload=Depends(verify_authentication),
    db: AsyncSession = Depends(connect_db),
):
    return await ChildGrowthController.update(record_id, data, payload["id"], db)


@child_growth_router.delete("/delete/{record_id}")
async def delete_growth_record(
    record_id: UUID,
    payload=Depends(verify_authentication),
    db: AsyncSession = Depends(connect_db),
):
    return await ChildGrowthController.delete(record_id, payload["id"], db)
