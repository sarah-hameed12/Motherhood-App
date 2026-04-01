from pydantic import BaseModel, EmailStr
from uuid import UUID


class EmailBaseSchema(BaseModel):
    receiver_email: EmailStr
    email_body: str


class EmailCreateSchema(EmailBaseSchema):
    pass


class EmailResponseSchema(EmailBaseSchema):
    id: UUID

    # Correct for Pydantic v2
    model_config = {
        "from_attributes": True
    }