from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import aiohttp
import asyncio
import time
from typing import List, Optional
from dataclasses import dataclass
import os
import json

# Pydantic models for request/response

    

class AdvancedGeminiClient:
    def __init__(self, api_key: str, max_concurrent: int = 5, requests_per_minute: int = 15):
        self.api_key = api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.requests_per_minute = requests_per_minute
        self.last_request_time = 0
        self.available_models = []
        self.active_model = None
        
    async def discover_models(self):
        """Discover available models and set the active one"""
        url = f"{self.base_url}?key={self.api_key}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=30) as response:
                    if response.status == 200:
                        data = await response.json()
                        models = [model["name"].split("/")[-1] for model in data.get("models", [])]
                        self.available_models = models
                        print(f"Discovered models: {models}")
                        
                        # Prefer these models in order
                        preferred_models = [
                            "gemini-1.5-pro-latest",
                            "gemini-1.5-flash-latest", 
                            "gemini-pro",
                            "gemini-1.0-pro"
                        ]
                        
                        for model in preferred_models:
                            if model in models:
                                self.active_model = model
                                print(f"Using model: {model}")
                                return
                        
                        # If no preferred models found, use the first available
                        if models:
                            self.active_model = models[0]
                            print(f"Using first available model: {models[0]}")
                        else:
                            raise Exception("No available models found")
                    else:
                        error_text = await response.text()
                        raise Exception(f"Failed to fetch models: HTTP {response.status} - {error_text}")
        except Exception as e:
            print(f"Error discovering models: {e}")
            # Fallback to common models
            self.available_models = ["gemini-pro", "gemini-1.0-pro"]
            self.active_model = "gemini-pro"
    
    def get_model_url(self):
        """Get the correct URL for the active model"""
        if not self.active_model:
            raise HTTPException(status_code=500, detail="No active model configured")
        return f"{self.base_url}/{self.active_model}:generateContent?key={self.api_key}"
        
    async def _rate_limit(self):
        """Implement rate limiting"""
        now = time.time()
        time_since_last = now - self.last_request_time
        min_interval = 60.0 / self.requests_per_minute
        
        if time_since_last < min_interval:
            await asyncio.sleep(min_interval - time_since_last)
        
        self.last_request_time = time.time()
    
    async def generate_with_retry(self, prompt: str, max_retries: int = 3) -> GeminiResponse:
        if not self.active_model:
            await self.discover_models()
            
        url = self.get_model_url()
        
        # Enhanced prompt for better chatbot responses
        enhanced_prompt = f"""You are a helpful AI assistant. Respond to the user's message in a friendly, conversational tone.

        User: {prompt}

        Assistant:"""
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": enhanced_prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            }
        }
        
        for attempt in range(max_retries):
            try:
                await self._rate_limit()
                
                async with self.semaphore:
                    start_time = time.time()
                    
                    async with aiohttp.ClientSession() as session:
                        async with session.post(
                            url,
                            json=payload,
                            headers={'Content-Type': 'application/json'},
                            timeout=aiohttp.ClientTimeout(total=30)
                        ) as response:
                            
                            response_text = await response.text()
                            
                            if response.status == 200:
                                data = json.loads(response_text)
                                latency = time.time() - start_time
                                
                                if "candidates" in data and data["candidates"]:
                                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                                    return GeminiResponse(
                                        prompt=prompt,
                                        response_text=text.strip(),
                                        error=None,
                                        latency=latency
                                    )
                                else:
                                    return GeminiResponse(
                                        prompt=prompt,
                                        response_text=None,
                                        error="No response generated from Gemini",
                                        latency=latency
                                    )
                            else:
                                latency = time.time() - start_time
                                
                                if response.status == 429:  # Rate limited
                                    wait_time = 2 ** attempt
                                    print(f"Rate limited, waiting {wait_time}s...")
                                    await asyncio.sleep(wait_time)
                                    continue
                                
                                # Try to parse error response
                                try:
                                    error_data = json.loads(response_text)
                                    error_msg = error_data.get("error", {}).get("message", response_text)
                                except:
                                    error_msg = response_text
                                
                                return GeminiResponse(
                                    prompt=prompt,
                                    response_text=None,
                                    error=f"HTTP {response.status}: {error_msg}",
                                    latency=latency
                                )
                                
            except asyncio.TimeoutError:
                if attempt == max_retries - 1:
                    return GeminiResponse(
                        prompt=prompt,
                        response_text=None,
                        error="Request timeout after 30 seconds",
                        latency=0
                    )
                await asyncio.sleep(2 ** attempt)
                
            except Exception as e:
                if attempt == max_retries - 1:
                    return GeminiResponse(
                        prompt=prompt,
                        response_text=None,
                        error=f"Unexpected error: {str(e)}",
                        latency=0
                    )
                await asyncio.sleep(2 ** attempt)
        
        return GeminiResponse(
            prompt=prompt,
            response_text=None,
            error="Max retries exceeded",
            latency=0
        )

# Dependency to get Gemini client
async def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY environment variable not set")
    
    client = AdvancedGeminiClient(
        api_key=api_key,
        max_concurrent=3,
        requests_per_minute=10
    )
    
    # Discover available models on startup
    await client.discover_models()
    return client

ai_chatbot_router = APIRouter(
    prefix='/api/ai-chatbot',
    tags=['AI Chatbot Routes']
)

@ai_chatbot_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    message: ChatMessage,
    gemini_client: AdvancedGeminiClient = Depends(get_gemini_client)
):
    """
    Chat with Gemini AI with advanced error handling and rate limiting
    """
    if not message.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    print(f"Using model: {gemini_client.active_model}")
    
    # Process the message with retry logic and rate limiting
    result = await gemini_client.generate_with_retry(message.message)
    
    if result.error:
        raise HTTPException(
            status_code=500, 
            detail=f"AI service error: {result.error}"
        )
    
    return ChatResponse(
        response=result.response_text,
        conversation_id=message.conversation_id,
        latency=round(result.latency, 2),
        error=None
    )

@ai_chatbot_router.get("/models")
async def get_models(gemini_client: AdvancedGeminiClient = Depends(get_gemini_client)):
    """
    Get list of available Gemini models
    """
    return {
        "available_models": gemini_client.available_models,
        "active_model": gemini_client.active_model
    }

@ai_chatbot_router.get("/health")
async def health_check(gemini_client: AdvancedGeminiClient = Depends(get_gemini_client)):
    """
    Health check endpoint to verify Gemini API connectivity
    """
    test_result = await gemini_client.generate_with_retry("Hello, respond with just 'OK'")
    
    if test_result.error:
        raise HTTPException(
            status_code=503,
            detail=f"Gemini API is not available: {test_result.error}"
        )
    
    return {
        "status": "healthy",
        "gemini_connected": True,
        "active_model": gemini_client.active_model,
        "test_response": test_result.response_text,
        "latency": round(test_result.latency, 2)
    }

# Manual model selection endpoint
@ai_chatbot_router.post("/chat-with-model")
async def chat_with_model_selection(
    message: ChatMessage,
    model_name: str,
    gemini_client: AdvancedGeminiClient = Depends(get_gemini_client)
):
    """
    Chat with a specific Gemini model
    """
    if model_name not in gemini_client.available_models:
        raise HTTPException(
            status_code=400, 
            detail=f"Model {model_name} not available. Available models: {gemini_client.available_models}"
        )
    
    # Temporarily switch model
    original_model = gemini_client.active_model
    gemini_client.active_model = model_name
    
    try:
        result = await gemini_client.generate_with_retry(message.message)
        
        if result.error:
            raise HTTPException(
                status_code=500, 
                detail=f"AI service error: {result.error}"
            )
        
        return ChatResponse(
            response=result.response_text,
            conversation_id=message.conversation_id,
            latency=round(result.latency, 2),
            error=None
        )
    finally:
        # Restore original model
        gemini_client.active_model = original_model