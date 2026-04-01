from fastapi import HTTPException
from app.llm_core.ollama_client import AdvancedOllamaClient  # Updated import
import os
from dotenv import load_dotenv

load_dotenv()

_ollama_client = None  # Renamed variable

async def get_llm_client() -> AdvancedOllamaClient:  # Renamed function
    global _ollama_client  # Updated global variable
    
    if _ollama_client is not None:
        return _ollama_client
    
    # For Ollama, we might want to get the base URL from env, but it's optional
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    try:
        client = AdvancedOllamaClient(
            base_url=base_url,
            max_concurrent=3,  # Can be higher for local model
            requests_per_minute=30  # Higher rate limit for local model
        )
        
        # Perform health check to see if Ollama is running
        available_models = await client.quick_health_check()
        
        if not available_models:
            print("⚠️ Warning: No models available. Ollama might not be running or model is not pulled.")
            print(f"   Make sure Ollama is running at: {base_url}")
            print(f"   And the model is pulled: ollama pull gemma3:1b")
        
        _ollama_client = client
        print(f"✅ Ollama client initialized successfully")
        print(f"   Base URL: {base_url}")
        print(f"   Model: gemma3:1b")
        return _ollama_client
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize Ollama client: {str(e)}"
        )


# Optional: Create an alias for backward compatibility if needed
async def get_gemini_client() -> AdvancedOllamaClient:
    """Alias for backward compatibility - returns Ollama client"""
    print("⚠️ Note: get_gemini_client() is deprecated, use get_llm_client() instead")
    return await get_llm_client()