from fastapi import APIRouter, Depends, HTTPException
from app.schemas.llm_schemas import UserPrompt, AIChatOption, AiConversationCreate,AiConversationResponse, AiConversationUpdate, AIBotVaccinationOption, ChatbotMessageCreate
from app.middleware.protect_endpoints import verify_authentication
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.postgres import connect_db
from uuid import UUID


from app.controllers.llm_controllers import LLMConversationControllers, LLMMessageController
from typing import List


llm_router = APIRouter(prefix='/api/llm')

from sqlalchemy import text

@llm_router.post('/chat', status_code=201)
async def generate_ai_response(
    data: ChatbotMessageCreate,
    db: AsyncSession = Depends(connect_db),
    payload = Depends(verify_authentication)
):
    user_id = payload['id']

    if not user_id:
        raise HTTPException(status_code=401, detail='Unauthorized request!')

    return await LLMMessageController.chat_with_llm(user_id, data, db)
    

@llm_router.post('/conversations', status_code=201, response_model=AiConversationResponse)
async def create_conversation(data: AiConversationCreate, db: AsyncSession = Depends(connect_db), payload = Depends(verify_authentication)):
    user_id = payload['id']

    if not user_id:
        raise HTTPException(status_code=401, detail='Unauthorized request!')
    
    conversation = await LLMConversationControllers.create_llm_conversation(data, user_id, db)
    
    return conversation


@llm_router.get('/conversations', response_model=List[AiConversationResponse])
async def get_all_conversations(db: AsyncSession = Depends(connect_db), payload = Depends(verify_authentication)):
    user_id = payload['id']

    if not user_id:
        raise HTTPException(status_code=401, detail='Unauthorized request!')
    
    conversations = await LLMConversationControllers.get_all_llm_conversations(user_id, db)
    
    return conversations


@llm_router.get('/conversations/{conversation_id}', response_model=AiConversationResponse)
async def get_conversation(conversation_id: UUID, db: AsyncSession = Depends(connect_db), payload = Depends(verify_authentication)):
    user_id = payload['id']

    if not user_id:
        raise HTTPException(status_code=401, detail='Unauthorized request!')
    
    conversation = await LLMConversationControllers.get_llm_conversation(conversation_id, user_id, db)
    
    return conversation


@llm_router.put('/conversations/{conversation_id}')
async def update_conversation(conversation_id: UUID, data: AiConversationUpdate, db: AsyncSession = Depends(connect_db), payload = Depends(verify_authentication)):
    user_id = payload['id']

    if not user_id:
        raise HTTPException(status_code=401, detail='Unauthorized request!')
    
    conversation = await LLMConversationControllers.update_llm_conversation(conversation_id, user_id, data, db)
    
    return conversation


@llm_router.delete('/conversations/{conversation_id}')
async def delete_conversation(conversation_id: UUID, db: AsyncSession = Depends(connect_db), payload = Depends(verify_authentication)):
    user_id = payload['id']

    if not user_id:
        raise HTTPException(status_code=401, detail='Unauthorized request!')
    
    result = await LLMConversationControllers.delete_llm_conversation(conversation_id, user_id, db)
    
    return result



@llm_router.get('/conversations/{conversation_id}/messages')
async def delete_conversation(conversation_id: UUID, db: AsyncSession = Depends(connect_db), payload = Depends(verify_authentication)):
    user_id = payload['id']

    if not user_id:
        raise HTTPException(status_code=401, detail='Unauthorized request!')
    
    result = await LLMMessageController.get_conversation_messages(conversation_id, user_id, db)
    
    return result