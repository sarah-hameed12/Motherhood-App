import asyncio
from typing import Optional, AsyncGenerator
import aiohttp
import json


class OllamaClient:
    def __init__(
        self,
        model: str = "qwen2.5:3b",
        temperature: float = 0.1,
        top_p: float = 0.9,
        num_predict: int = 150,
        keep_alive: str = "10m"
    ):
        self.model = model
        self.temperature = temperature
        self.top_p = top_p
        self.num_predict = num_predict
        self.keep_alive = keep_alive
        self.url = "http://127.0.0.1:8080/v1/chat/completions"
        self.session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session

    def _build_payload(
        self,
        messages: list,
        stream: bool,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        num_predict: Optional[int] = None,
    ) -> dict:
        return {
            "model": self.model,
            "messages": messages,
            "stream": stream,
            "keep_alive": self.keep_alive,
            "options": {
                "temperature": temperature if temperature is not None else self.temperature,
                "top_p": top_p if top_p is not None else self.top_p,
                "num_predict": num_predict if num_predict is not None else self.num_predict,
                "stop": [";"],
            },
        }

    async def chat(
        self,
        messages: list,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        num_predict: Optional[int] = None,
    ) -> str:
        session = await self._get_session()
        payload = self._build_payload(messages, stream=False, temperature=temperature,
                                      top_p=top_p, num_predict=num_predict)

        async with session.post(self.url, json=payload) as response:
            response.raise_for_status()
            data = await response.json()
            return data["choices"][0]["message"]["content"]

    async def generate_streamed_response(
        self,
        messages: list,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        num_predict: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        session = await self._get_session()
        payload = self._build_payload(messages, stream=True, temperature=temperature,
                                      top_p=top_p, num_predict=num_predict)

        async with session.post(self.url, json=payload) as response:
            response.raise_for_status()

            async for line in response.content:
                line = line.decode("utf-8").strip()
                if not line or line == "data: [DONE]":
                    continue
                
                if line.startswith("data: "):
                    line = line[len("data: "):]
                try:
                    msg = json.loads(line)
                except json.JSONDecodeError:
                    continue

                choice = msg.get("choices", [{}])[0]
                if choice.get("finish_reason") == "stop":
                    break

                content = choice.get("delta", {}).get("content", "")
                if content:
                    yield content

    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()
            self.session = None


# ---- Global client ----
_global_client: Optional[OllamaClient] = None


async def get_global_client() -> OllamaClient:
    global _global_client
    if _global_client is None:
        _global_client = OllamaClient()
    return _global_client


async def close_global_client():
    global _global_client
    if _global_client:
        await _global_client.close()
        _global_client = None