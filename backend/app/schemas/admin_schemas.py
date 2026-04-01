from pydantic import BaseModel
from datetime import datetime

from uuid import UUID


class AdminStatsInfo(BaseModel):
    user_count: int
    children_count: int
    vaccination_given: int
    new_users_count: int

    

class AdminDashBoardUserMini(BaseModel):
    fullname: str
    email: str
    id: UUID
    no_of_children: int
    account_created_at: datetime


class AdminDashboardChilDistribution(BaseModel):
    start_month: int
    end_montj: int
    child_count: int



class AdminDashboardVaccinationCompletion(BaseModel):
    on_time: float
    late: float
    missed: float




