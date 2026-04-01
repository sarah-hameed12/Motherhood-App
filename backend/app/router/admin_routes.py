from fastapi import APIRouter, Depends, Response, Cookie
from app.database.postgres import connect_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.middleware.protect_endpoints import verify_authentication
from app.schemas.admin_schemas import AdminDashboardChilDistribution, AdminStatsInfo, AdminDashBoardUserMini, AdminDashboardVaccinationCompletion
from app.controllers.admin_controllers import AdminDashboardController
from typing import List



admin_router = APIRouter(
    prefix='/api/admin',
    tags=['Admin Routes']
)


@admin_router.get('/dashboard/stats', response_model=AdminStatsInfo)
async def dashboard_stats(
    payload: dict = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    return await AdminDashboardController.get_dashboard_stats(db)


@admin_router.get('/dashboard/users-mini-info')
async def dashboard_users_mini(
    payload: dict = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    return await AdminDashboardController.get_dashboard_users_mini(db)


@admin_router.get('/dashboard/child-age-distribution')
async def dashboard_child_distribution(
    payload: dict = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    return await AdminDashboardController.get_dashboard_child_distribution(db)


@admin_router.get('/dashboard/system-health')
async def dashboard_child_distribution(
    payload: dict = Depends(verify_authentication), 
    db: AsyncSession = Depends(connect_db)
):
    return await AdminDashboardController.get_system_status(db)



# @admin_router.get('/dashboard/vaccination-completed-stats', response_model=AdminDashboardVaccinationCompletion)
# async def dashboard_vaccination_completion(
#     payload: dict = Depends(verify_authentication), 
#     db: AsyncSession = Depends(connect_db)
# ):
#     return await AdminDashboardController.get_dashboard_vaccination_completion(db)