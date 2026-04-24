from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, Response
from sqlalchemy import text
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.orm.attributes import flag_modified

from app.models.ai import AiConversation
from app.llm_core.llm_client import get_global_client
from uuid import UUID
from app.llm_core.rag.pipeline import call_llm_streamed

from app.schemas.llm_schemas import AiConversationCreate, AiConversationUpdate
from app.models.ai import AiConversation, MessageType

from app.llm_core.utils.agents_response import generate_agent_response
from fastapi.responses import StreamingResponse


class LLMConversationControllers:
    @staticmethod
    async def create_llm_conversation(data: AiConversationCreate, user_id: UUID, db: AsyncSession):
        try:
            new_conversation = AiConversation(user_id=user_id, topic=data.topic)

            db.add(new_conversation)
            await db.commit()
            await db.refresh(new_conversation)

            return new_conversation

        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail='Database error!')
        
        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            raise HTTPException(status_code=error_dict.get('status_code', 500), detail=error_dict.get('detail', 'Internal server error!'))
    

    @staticmethod
    async def get_all_llm_conversations(user_id: UUID, db: AsyncSession):
        try:
            query = select(AiConversation).where(
                AiConversation.user_id == user_id
            ).order_by(AiConversation.created_at.desc())

            result = await db.execute(query)
            conversations = result.scalars().all()

            return conversations

        except SQLAlchemyError:
            raise HTTPException(status_code=500, detail="Database error!")

        except HTTPException:
            raise

        except Exception as e:
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get("status_code", 500),
                detail=error_dict.get("detail", "Internal server error!")
            )
        

    @staticmethod
    async def get_llm_conversation(conversation_id: UUID, user_id: UUID, db: AsyncSession):
        try:
            query = select(AiConversation).where(
                and_(
                    AiConversation.id == conversation_id,
                    AiConversation.user_id == user_id
                )
            )

            result = await db.execute(query)
            conversation = result.scalar_one_or_none()

            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")

            return conversation

        except SQLAlchemyError:
            raise HTTPException(status_code=500, detail="Database error!")
        
        except HTTPException:
            raise
            
        except Exception as e:
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get("status_code", 500),
                detail=error_dict.get("detail", "Internal server error!")
            )
    

    @staticmethod
    async def delete_llm_conversation(conversation_id: UUID, user_id: UUID, db: AsyncSession):
        try:
            query = select(AiConversation).where(
                and_(
                    AiConversation.id == conversation_id,
                    AiConversation.user_id == user_id
                )
            )

            result = await db.execute(query)
            conversation = result.scalar_one_or_none()

            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")

            await db.delete(conversation)
            await db.commit()

            return {"message": "Conversation deleted successfully"}

        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=500, detail="Database error!")

        except Exception as e:
            await db.rollback()
            error_dict = e.__dict__
            
            raise HTTPException(
                status_code=error_dict.get("status_code", 500),
                detail=error_dict.get("detail", "Internal server error!")
            )
        


from app.schemas.llm_schemas import ChatbotMessageCreate
from app.models.ai import ChatbotMessage


class LLMMessageController:
    @staticmethod
    async def generate_conversation_summary(last_messages: list) -> str:
        client = await get_global_client()

        conversation_text = ""
        user_msg_idx = 1

        for i in range(0, len(last_messages) - 1, 2):
            user_message = last_messages[i] if i < len(last_messages) else ""
            ai_response = last_messages[i + 1] if i + 1 < len(last_messages) else ""

            conversation_text += f"User {user_msg_idx}: {user_message}\n"
            conversation_text += f"Assistant {user_msg_idx}: {ai_response}\n\n"
            user_msg_idx += 1

        messages = [
            {
                "role": "system",
                "content": (
                    "Summarize conversations from 6 messages (3 user + 3 assistant). "
                    "Return 3-4 sentences."
                )
            },
            {
                "role": "user",
                "content": f"Summarize this conversation:\n\n{conversation_text}\n\nSummary:"
            }
        ]

        try:
            summary = await client.chat(messages, temperature=0.3, num_predict=120)
            return summary.strip()
        
        except Exception as e:
            print(f"Summary error: {e}")
            return "Summary unavailable"


    @staticmethod
    async def generate_topic(first_message: str) -> str:
        client = await get_global_client()

        messages = [
            {
                "role": "system",
                "content": "Generate a 1-3 word topic label. Return only the topic."
            },
            {"role": "user", "content": first_message}
        ]

        try:
            topic = await client.chat(messages, temperature=0.2, num_predict=15)
            return topic.strip().lower()
        except Exception as e:
            print(f"Topic error: {e}")
            return "general"


    @staticmethod
    async def update_llm_conversation(
        conversation: AiConversation,
        data: AiConversationUpdate
    ):
        try:
            if not conversation.messages_exist:
                conversation.messages_exist = True
                topic = await LLMMessageController.generate_topic(data.last_message)

                conversation.topic_message = topic.title()

            if data.last_message:
                conversation.last_messages = (conversation.last_messages or []) + [data.last_message]

                if len(conversation.last_messages) > 6:
                    conversation.last_messages = conversation.last_messages[-6:]

                if len(conversation.last_messages) >= 2 and len(conversation.last_messages) % 2 == 0:
                    conversation.summary = await LLMMessageController.generate_conversation_summary(
                        conversation.last_messages
                    )

            conversation.updated_at = datetime.utcnow()

            return conversation

        except Exception as e:
            print("update_llm_conversation error:", e)
            raise

    @staticmethod
    async def chat_with_llm(user_id: UUID, data: ChatbotMessageCreate, db: AsyncSession):
        try:
            query = select(AiConversation).where(
                AiConversation.id == data.conversation_id,
                AiConversation.user_id == user_id
            )

            print(data.conv_type.value)

            result = await db.execute(query)
            conversation = result.scalar_one_or_none()

            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")

            await LLMMessageController.update_llm_conversation(
                conversation,
                AiConversationUpdate(last_message=data.content)
            )

            if data.conv_type == 'general_parent':
                response_generator = call_llm_streamed(data.content)
            else:
                response_generator = await generate_agent_response(
                    data.conv_type, data.content, user_id, db
                )

            # Save human message and conversation update
            new_message_human = ChatbotMessage(
                content=data.content,
                conversation_id=conversation.id,
                message_type=MessageType.HUMAN
            )

            db.add(new_message_human)
            await db.commit()

            async def stream_and_save():
                full_response = ""

                try:
                    async for chunk in response_generator:
                        full_response += chunk
                        yield chunk

                finally:
                    if full_response:
                        try:
                            new_message_ai = ChatbotMessage(
                                content=full_response,
                                conversation_id=conversation.id,
                                message_type=MessageType.AI
                            )

                            # Pass the string, not the ORM object
                            await LLMMessageController.update_llm_conversation(
                                conversation,
                                AiConversationUpdate(last_message=full_response)
                            )

                            
                            flag_modified(conversation, "last_messages")
                            flag_modified(conversation, "summary")

                            db.add(new_message_ai)
                            await db.commit()

                        except Exception as e:
                            await db.rollback()
                            print("Failed to save AI message:", e)

            return StreamingResponse(
                stream_and_save(),
                media_type="text/plain",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Content-Type": "text/plain; charset=utf-8",
                }
            )

        except SQLAlchemyError as e:
            await db.rollback()
            print("DB error:", e)
            raise HTTPException(status_code=500, detail="Database error while creating message")

        except HTTPException:
            raise

        except Exception as e:
            await db.rollback()
            print("Unexpected error:", e)
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    async def get_conversation_messages(conversation_id: UUID, user_id: UUID, db: AsyncSession):
        try:
            conversation_query = select(AiConversation).where(
                and_(
                    AiConversation.id == conversation_id,
                    AiConversation.user_id == user_id
                )
            )
            
            conversation_result = await db.execute(conversation_query)
            conversation = conversation_result.scalar_one_or_none()
            
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")
            
            messages_query = select(ChatbotMessage).where(
                ChatbotMessage.conversation_id == conversation_id
            ).order_by(ChatbotMessage.created_at.asc())
            
            messages_result = await db.execute(messages_query)
            messages = messages_result.scalars().all()
            
            return messages
            
        except SQLAlchemyError:
            raise HTTPException(status_code=500, detail="Database error while fetching messages!")
        
        except HTTPException:
            raise
            
        except Exception as e:
            error_dict = e.__dict__
            raise HTTPException(
                status_code=error_dict.get("status_code", 500),
                detail=error_dict.get("detail", "Internal server error while fetching messages!")
            )