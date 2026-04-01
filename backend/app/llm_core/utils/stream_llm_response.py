from app.llm_core.llm_client import get_global_client

from typing import AsyncGenerator
from typing import Optional
import json

async def generate_streamed_response(
    self,
    messages: list,
    temperature: Optional[float] = None,
    top_p: Optional[float] = None,
    num_predict: Optional[int] = None
) -> AsyncGenerator[str, None]:
    payload = {
        "model": self.model,
        "messages": messages,
        "stream": True,
        "keep_alive": self.keep_alive,
        "options": {
            "temperature": temperature if temperature is not None else self.temperature,
            "top_p": top_p if top_p is not None else self.top_p,
            "num_predict": num_predict if num_predict is not None else self.num_predict,
            "stop": [";"]
        }
    }
    
    async with self.session.post(self.url, json=payload) as response:
        response.raise_for_status()
        
        async for line in response.content:
            line = line.decode("utf-8").strip()
            if not line:
                continue
                
            try:
                msg = json.loads(line)
                
                # Extract content from the message
                if "message" in msg and "content" in msg["message"]:
                    content = msg["message"]["content"]
                    if content:  # Only yield non-empty content
                        print(content)
                        yield content
                
                if msg.get("done"):
                    break
                    
            except json.JSONDecodeError:
                continue