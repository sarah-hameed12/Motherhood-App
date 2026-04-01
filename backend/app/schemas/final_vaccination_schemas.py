from pydantic import BaseModel
from uuid import UUID
from pydantic import ConfigDict


class VaccineRecordRequest(BaseModel):
    given_date: str
    child_id: UUID
    vaccine_id: UUID
    schedule_id: UUID


class VaccinationOptionBaseSchema(BaseModel):
    vaccine_name: str
    description: str
    protect_against: str
    doses_needed: int
    is_mandatory: bool


class VaccinationOptionCreateSchema(VaccinationOptionBaseSchema):
    pass


class VaccinationOptionResponseSchema(VaccinationOptionBaseSchema):
    id: UUID

    model_config = ConfigDict(from_attributes=True)




class VaccinationScheduleBaseSchemas(BaseModel):
    vaccine_id: UUID
    dose_num: int
    min_age_days: int
    max_age_days: int


class VaccinationScheduleCreateSchema(VaccinationScheduleBaseSchemas):
    pass



# Vaccination UserView Schemas
class VaccinationMiniSchedule(BaseModel):
    dose_num: int
    min_days_age: int
    max_days_age: int


class VaccinationUserViewSchema(BaseModel):
    vaccine_option_id: UUID
    vaccine_name: str
    vaccine_description: str
    doses_needed: int
    is_mandatory: bool

    schedules: list[VaccinationMiniSchedule]

    model_config = ConfigDict(from_attributes=True)


# (UUID('35808979-4d3e-4afd-92ff-61ef484c6846'), 'BCG', 'Given at birth to protect infants from severe forms of tuberculosis.', 'Tuberculosis', True, 1, UUID('be9e0c11-0cdd-47ad-971c-214655fe4cbd'), 1, 0, 56)
class VaccinationSchema(BaseModel):
    vaccine_id: UUID
    vaccine_name: str
    description: str
    protect_against: str
    is_mandatory: bool
    schedule_id: UUID
    dose_num: int
    min_days_age: int
    max_days_age: int

    model_config = ConfigDict(from_attributes=True)




class ChildAge(BaseModel):
    child_age: int