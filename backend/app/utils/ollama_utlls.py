from app.llm_core.utils.ollama_utills import get_llm_client  
from app.schemas.llm_schemas import ConversationSummarySchema
from app.schemas.ai_schemas import AiGenerateMessageSchema


async def generate_conversation_topic(message: str):    
    client = await get_llm_client()
        
    response = await client.generate_with_retry(message)
    
    if response.error:
        return f"Error: {response.error}"
    
    return response.response_text


async def summerize_conversation(con: ConversationSummarySchema) -> str:
    client = await get_llm_client()
        
    prompt = f"""This conversation is about: {con['topic']}

        Recent messages:
        {chr(10).join(con['last_messages'])}

        What is this conversation about? Provide a brief summary:"""
    
    response = await client.generate_with_retry(prompt)
    
    if response.error:
        return f"Error: {response.error}"
    
    return response.response_text.strip()


async def chat_with_user(data: AiGenerateMessageSchema) -> str:
    client = await get_llm_client()
 
    prompt = f"""
        The username is {data.user_fullname}.

        Conversation summary so far:
        {data.summary}

        Last messages from the user:
        {chr(10).join(data.last_messages)}

        Generate a helpful, relevant, and context-aware response:
        """.strip()

    response = await client.generate_with_retry(prompt)

    if response.error:
        return f"Error: {response.error}"

    return response.response_text.strip()
