from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime
from app.models.ai import MessageType
from enum import Enum
from typing import Optional, List


class AiConversationBase(BaseModel):
    topic: str = Field(..., min_length=1)
  



class AiConversationCreate(AiConversationBase):
    pass



class AiConversationUpdate(BaseModel):
    last_message: str



class AiConversationResponse(AiConversationBase):
    id: UUID
    user_id: UUID
    topic_message: str | None = None
    created_at: datetime
    messages_exist: Optional[bool] = False
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)




from enum import Enum


class MessageType(str, Enum):
    HUMAN = "human"
    AI = "ai"

class ChatbotMessageBase(BaseModel):
    content: str
    conversation_id: UUID


class AIChatOption(str, Enum):
    VACCINATION_GENERAL = "vaccination_general"
    VACCINATION_RECORD = "child_vaccine_record"
    CHILD_GROWTH = "chid_growth"
    GENERAL_PARENTING = "general_parent"


class ChatbotMessageCreate(ChatbotMessageBase):
    conv_type: AIChatOption
    pass


class ChatbotMessageResponse(ChatbotMessageBase):
    id: UUID
    created_at: datetime
    message_type: MessageType
    
    model_config = ConfigDict(from_attributes=True)
    





class AIBotVaccinationOption(str, Enum):
    VACCINATION_GENERAL = 'vaccination_general'
    VACCINATION_RECORD = 'vaccination_record'



class DatabaseAgentSchemas(str, Enum):
    DELETE = 'delete'
    SELECT = 'select'
    UPDATE = 'update'
    INSERT = 'insert'


# NEW SCHEMAS
class UserPrompt(BaseModel):
    conv_type: AIBotVaccinationOption = AIBotVaccinationOption.VACCINATION_RECORD
    prompt: str