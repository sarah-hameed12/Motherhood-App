from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import List, Optional
from datetime import datetime
from enum import Enum


class ChatMessage(BaseModel):
    message: str
    conversation_id: UUID
    chatbot_id: UUID

class ChatResponse(BaseModel):
    response: str
    
    
class MessageType(str, Enum):
    HUMAN = "human"
    AI = "ai"
    SYSTEM = "system"


class AIBotBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class AIBotCreate(AIBotBase):
    pass


class AIBotUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class AIBotResponse(AIBotBase):
    id: UUID
    user_id: UUID
    
    model_config = ConfigDict(from_attributes=True)


class AiConversationBase(BaseModel):
    topic: str
    last_messages: Optional[List[str]] = None
    summary: Optional[str] = None


class AiConversationCreate(AiConversationBase):
    user_id: UUID


class AiConversationUpdate(BaseModel):
    topic: Optional[str] = None
    last_messages: Optional[List[str]] = None
    summary: Optional[str] = None


class AiConversationResponse(AiConversationBase):
    id: UUID
    user_id: UUID
    
    model_config = ConfigDict(from_attributes=True)


class ChatbotMessageBase(BaseModel):
    message_type: MessageType
    content: str
    tokens_used: Optional[int] = None
    metadata: Optional[List[str]] = None


class ChatbotMessageCreate(ChatbotMessageBase):
    chatbot_id: UUID
    conversation_id: UUID
    user_id: UUID


class ChatbotMessageUpdate(BaseModel):
    content: Optional[str] = None
    tokens_used: Optional[int] = None
    metadata: Optional[List[str]] = None


class ChatbotMessageResponse(ChatbotMessageBase):
    id: UUID
    chatbot_id: UUID
    conversation_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ChatbotMessageWithBot(ChatbotMessageResponse):
    chatbot: AIBotResponse


class AiConversationWithMessages(AiConversationResponse):
    messages: List[ChatbotMessageResponse] = []


class AIBotWithConversations(AIBotResponse):
    conversations: List[AiConversationResponse] = []