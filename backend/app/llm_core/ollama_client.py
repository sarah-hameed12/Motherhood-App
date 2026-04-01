import aiohttp
import asyncio
from app.schemas.ai_schemas import GeminiResponse
import time
import json
from typing import List, Dict, Optional
from collections import defaultdict
from datetime import datetime


class AdvancedOllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434", max_concurrent: int = 3, requests_per_minute: int = 30):
        self.base_url = base_url
        
        self.semaphore = asyncio.Semaphore(max_concurrent)
        
        self.requests_per_minute = requests_per_minute
        self.last_request_time = 0
        
        # Using only gemma3:1b model
        self.working_models = [
            "gemma3:1b"
        ]
        
        self.model_health = {
            model: {
                'available': True,
                'last_error': None,
                'error_time': None,
                'consecutive_failures': 0,
                'success_count': 0,
                'total_calls': 0,
                'last_success': None,
                'last_checked': None
            }
            for model in self.working_models
        }
        
        self.active_model = self.working_models[0]
        
        self.model_blacklist_time = {}
        
        print(f"Ollama client initialized with model: {self.working_models[0]}")
        print(f"Ollama API URL: {self.base_url}")
    
    async def _rate_limit(self):
        now = time.time()
        time_since_last = now - self.last_request_time
        
        min_interval = 60.0 / self.requests_per_minute
        
        if time_since_last < min_interval:
            await asyncio.sleep(min_interval - time_since_last)
        
        self.last_request_time = time.time()
    
    def _select_next_model(self) -> str:
        current_time = time.time()
        
        for model in self.working_models:
            health = self.model_health[model]
            
            if model in self.model_blacklist_time:
                blacklist_until = self.model_blacklist_time[model]
                if current_time < blacklist_until:
                    continue
            
            if health['consecutive_failures'] >= 3:
                continue
            
            return model
        
        return self.working_models[0]
    
    def _handle_error(self, model: str, error_message: str):
        print(f"Model {model} error: {error_message}")
        
        # For temporary errors, blacklist for 30 seconds
        if "context length exceeded" in error_message.lower() or "timeout" in error_message.lower():
            blacklist_time = time.time() + 30
        else:
            blacklist_time = time.time() + 60
        
        self.model_blacklist_time[model] = blacklist_time
        self.model_health[model]['available'] = False
        self.model_health[model]['last_error'] = error_message
        self.model_health[model]['error_time'] = time.time()
    
    def _update_model_health(self, model: str, success: bool, error: str = None):
        health = self.model_health[model]
        health['total_calls'] += 1
        health['last_checked'] = time.time()
        
        if success:
            health['consecutive_failures'] = 0
            health['success_count'] += 1
            health['last_success'] = time.time()
            health['available'] = True
            health['last_error'] = None
            
            if model in self.model_blacklist_time:
                del self.model_blacklist_time[model]
        else:
            health['consecutive_failures'] += 1
            health['last_error'] = error
            health['error_time'] = time.time()
            
            if health['consecutive_failures'] >= 3:
                blacklist_time = time.time() + 30
                self.model_blacklist_time[model] = blacklist_time
    
    async def generate_with_retry(self, prompt: str, max_retries: int = 3) -> GeminiResponse:
        last_error = None
        
        for attempt in range(max_retries):
            current_model = self._select_next_model()
            
            url = f"{self.base_url}/api/generate"
            
            # Ollama API payload
            payload = {
                "model": current_model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 1000,
                    "top_p": 0.9,
                    "top_k": 40,
                    "repeat_penalty": 1.1
                }
            }
            
            # Adjust parameters for gemma3:1b model
            if "gemma3" in current_model or "1b" in current_model:
                payload["options"]["temperature"] = 0.8
                payload["options"]["num_predict"] = 1500
            
            try:
                await self._rate_limit()
                
                async with self.semaphore:
                    start_time = time.time()
                    
                    async with aiohttp.ClientSession() as session:
                        async with session.post(
                            url,
                            json=payload,
                            headers={
                                'Content-Type': 'application/json',
                            },
                            timeout=aiohttp.ClientTimeout(total=30)  # Longer timeout for local model
                        ) as response:
                            
                            response_text = await response.text()
                            latency = time.time() - start_time
                            
                            if response.status == 200:
                                data = json.loads(response_text)
                                
                                if "response" in data:
                                    text = data["response"]
                                    
                                    self._update_model_health(current_model, True)
                                    self.active_model = current_model
                                    
                                    return GeminiResponse(
                                        prompt=prompt,
                                        response_text=text.strip(),
                                        error=None,
                                        latency=latency,
                                        model_used=current_model
                                    )
                                else:
                                    last_error = "No response field in API response"
                                    self._update_model_health(current_model, False, last_error)
                                    
                            else:
                                error_msg = f"HTTP {response.status}"
                                try:
                                    error_data = json.loads(response_text)
                                    error_msg = error_data.get("error", error_msg)
                                except:
                                    error_msg = response_text[:200]
                                
                                last_error = error_msg
                                self._update_model_health(current_model, False, error_msg)
                                
                                # Handle specific errors
                                if "model not found" in error_msg.lower():
                                    print(f"Error: Model {current_model} not found. Please ensure it's pulled in Ollama.")
                                    print(f"Run: ollama pull {current_model}")
                                    break
                                
                                wait_time = 2 ** attempt
                                await asyncio.sleep(wait_time)
                                
            except asyncio.TimeoutError:
                last_error = f"Timeout with model {current_model}"
                self._update_model_health(current_model, False, "Timeout")
                await asyncio.sleep(2 ** attempt)
                
            except aiohttp.ClientError as e:
                last_error = f"Network error: {str(e)}"
                self._update_model_health(current_model, False, str(e))
                
                # Check if Ollama is running
                if attempt == 0:
                    print("⚠️  Cannot connect to Ollama. Please ensure Ollama is running.")
                    print(f"   Run: ollama serve (or start the Ollama application)")
                
                await asyncio.sleep(2 ** attempt)
                
            except Exception as e:
                last_error = f"Unexpected error: {str(e)}"
                self._update_model_health(current_model, False, str(e))
                await asyncio.sleep(2 ** attempt)
        
        return GeminiResponse(
            prompt=prompt,
            response_text=None,
            error=last_error or "All attempts failed",
            latency=0,
            model_used=None
        )
    
    async def quick_health_check(self) -> List[str]:
        """Check if Ollama is accessible and the model is available."""
        current_time = time.time()
        healthy_models = []
        
        for model in self.working_models:
            health = self.model_health[model]
            
            if model in self.model_blacklist_time:
                if current_time < self.model_blacklist_time[model]:
                    continue
            
            if health['consecutive_failures'] >= 3:
                continue
            
            healthy_models.append(model)
        
        # Additionally, try to ping Ollama API
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/tags", timeout=5) as response:
                    if response.status == 200:
                        data = await response.json()
                        available_models = [m["name"] for m in data.get("models", [])]
                        
                        # Check if our model is available
                        if self.active_model in available_models:
                            print(f"✅ Ollama is running. Model '{self.active_model}' is available.")
                        else:
                            print(f"⚠️  Ollama is running, but model '{self.active_model}' not found.")
                            print(f"   Available models: {available_models}")
                            print(f"   Run: ollama pull {self.active_model}")
                    else:
                        print("⚠️  Ollama API responded with error")
        except Exception as e:
            print(f"❌ Cannot connect to Ollama: {str(e)}")
            print("   Please ensure Ollama is running (ollama serve)")
        
        return healthy_models
    
    def get_model_stats(self) -> Dict:
        stats = {
            'total_models': len(self.working_models),
            'active_model': self.active_model,
            'base_url': self.base_url,
            'blacklisted_models': [],
            'available_models': [],
            'model_health': {}
        }
        
        current_time = time.time()
        
        for model, health in self.model_health.items():
            is_blacklisted = (
                model in self.model_blacklist_time and 
                current_time < self.model_blacklist_time[model]
            )
            
            if is_blacklisted:
                stats['blacklisted_models'].append(model)
            elif health['consecutive_failures'] < 3:
                stats['available_models'].append(model)
            
            stats['model_health'][model] = {
                'available': not is_blacklisted and health['consecutive_failures'] < 3,
                'success_count': health['success_count'],
                'total_calls': health['total_calls'],
                'consecutive_failures': health['consecutive_failures'],
                'success_rate': health['success_count'] / health['total_calls'] if health['total_calls'] > 0 else 0,
                'last_success': health['last_success'],
                'last_error': health['last_error']
            }
        
        return stats
    
    async def batch_generate(self, prompts: List[str], max_concurrent: int = None) -> List[GeminiResponse]:
        if max_concurrent:
            self.semaphore = asyncio.Semaphore(max_concurrent)
        
        tasks = [self.generate_with_retry(prompt) for prompt in prompts]
        results = await asyncio.gather(*tasks)
        
        return results
    
    async def get_available_models(self) -> List[str]:
        """Get list of models available in Ollama"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/tags", timeout=5) as response:
                    if response.status == 200:
                        data = await response.json()
                        return [model["name"] for model in data.get("models", [])]
        except:
            return []
        return []
    