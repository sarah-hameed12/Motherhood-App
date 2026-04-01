from app.llm_core.agents.db_agent import DatabaseAgent
from app.llm_core.llm_client import get_global_client
from app.llm_core.utils.generate_prompts import generate_stream_prompt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import AsyncGenerator, Optional


async def generate_agent_response(
    agent_type: str,
    prompt: str,
    mother_id: str,
    db: AsyncSession
) -> AsyncGenerator[str, None]:
    """
    Returns an async generator for streaming responses.
    """
    try:
        ollama_client = await get_global_client()
        database_agent = DatabaseAgent(ollama_client)

        sql_query = await database_agent.generate_query(prompt, mother_id, agent_type)
        print(sql_query)

        if sql_query is None:
            async def _error():
                yield "Error: Could not generate SQL query"
            return _error()

        if not sql_query.strip().lower().startswith("select"):
            async def _error():
                yield "Error: Invalid query generated - not a SELECT statement"
            return _error()

        result = await db.execute(text(sql_query))
        rows = result.mappings().all()

        print(rows)

        # Call generate_streamed_response on the client directly,
        # passing a properly formatted messages list
        messages = generate_stream_prompt(rows, prompt)

        return ollama_client.generate_streamed_response(messages)

    except Exception as e:
        # Capture e in a local variable before the except block closes
        # to avoid the NameError closure bug in Python 3
        error_msg = str(e)
        print(f"Error in generate_agent_response: {error_msg}")

        async def _error():
            yield f"Error: {error_msg}"
        return _error()