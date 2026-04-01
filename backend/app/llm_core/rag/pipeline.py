from .retrieve import search
from ..llm_client import get_global_client
import asyncio


def build_prompt(query, contexts):
    context_text = "\n\n".join(
        f"[{i+1}] {ctx}" for i, ctx in enumerate(contexts)
    )

    prompt = f"""
        You are a medical assistant.
        Answer ONLY from the provided context below.

        If the answer is not in the context, say "I don't know".

        Context:
        {context_text}

        Question:
        {query}

        Answer:
        """
    return prompt


async def call_llm(prompt: str) -> str:
    client = await get_global_client()

    messages = [
        {"role": "user", "content": prompt}
    ]

    return await client.chat(messages)


async def call_llm_streamed(prompt: str):
    client = await get_global_client()

    messages = [
        {"role": "user", "content": prompt}
    ]

    async for chunk in client.generate_streamed_response(messages):
        yield chunk


async def rag_pipeline(query: str, stream: bool = False):
    contexts = search(query)
    prompt = build_prompt(query, contexts)
    
    if stream:
        return call_llm_streamed(prompt)
    else:
        return await call_llm(prompt)


async def print_streamed_response(stream_generator):
    full_response = ""

    async for chunk in stream_generator:
        print(chunk, end="", flush=True)
        full_response += chunk
        
    print("\n")  

    return full_response


async def main():
    print("Medical RAG System Ready (type 'exit' to quit)\n")
    print("Commands:")
    print("  - Type your question for non-streaming response")
    print("  - Prefix with 'stream: ' for streaming response (e.g., 'stream: What is hypertension?')\n")

    while True:
        user_input = input("Ask: ")

        if user_input.lower() in ["exit", "quit"]:
            break

        # Check if streaming is requested
        if user_input.lower().startswith("stream:"):
            query = user_input[7:].strip()  # Remove "stream:" prefix
            use_stream = True
            print("\nAnswer (streaming):\n", end="", flush=True)
        else:
            query = user_input
            use_stream = False
            print("\nAnswer:\n", end="", flush=True)

        # Get response (streaming or non-streaming)
        result = await rag_pipeline(query, stream=use_stream)
        
        if use_stream:
            # Handle streaming response
            await print_streamed_response(result)
        else:
            # Handle non-streaming response
            print(result, "\n")


async def interactive_streaming_example():
    """Alternative example showing how to use streaming in different scenarios."""
    print("Streaming RAG Example\n")
    
    while True:
        q = input("Ask (or 'exit' to quit): ")
        if q.lower() in ["exit", "quit"]:
            break
        
        print("\nResponse: ", end="", flush=True)
        
        # Get streamed response
        contexts = search(q)
        prompt = build_prompt(q, contexts)
        
        # Stream the response
        full_response = ""
        async for chunk in call_llm_streamed(prompt):
            print(chunk, end="", flush=True)
            full_response += chunk
        
        print("\n")  # Add newline after completion
        
        # Optional: do something with the full response
        if "blood pressure" in full_response.lower():
            print("[Note: Response mentions blood pressure]\n")


if __name__ == "__main__":
    # Use either main() or interactive_streaming_example()
    asyncio.run(main())