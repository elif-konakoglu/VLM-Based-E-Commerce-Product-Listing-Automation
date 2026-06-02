import base64
import json
import logging
import time
from pathlib import Path
from typing import Optional

import httpx

from app.core.config import settings
from app.core.errors import AIUnavailableError, AITimeoutError, AIInvalidResponseError

logger = logging.getLogger(__name__)


class OllamaClient:
    def __init__(self):
        self.base_url = settings.ollama_base_url.rstrip("/")
        self.model = settings.ollama_model
        self.timeout = settings.ollama_timeout_seconds
        self.temperature = settings.ollama_temperature
        self.top_p = settings.ollama_top_p
        self.top_k = settings.ollama_top_k
        self.repeat_penalty = settings.ollama_repeat_penalty

    def _build_options(self) -> dict:
        options = {"temperature": self.temperature}
        if self.top_p is not None:
            options["top_p"] = self.top_p
        if self.top_k is not None:
            options["top_k"] = self.top_k
        if self.repeat_penalty is not None:
            options["repeat_penalty"] = self.repeat_penalty
        return options

    async def generate(
        self,
        prompt: str,
        image_base64: Optional[str] = None,
        format_json: bool = True,
    ) -> dict:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": self._build_options(),
        }
        if format_json:
            payload["format"] = "json"
        if image_base64:
            payload["images"] = [image_base64]

        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )
                response.raise_for_status()
        except httpx.TimeoutException:
            logger.error("Ollama request timed out after %ds", self.timeout)
            raise AITimeoutError(self.timeout)
        except httpx.ConnectError:
            logger.error("Cannot connect to Ollama at %s", self.base_url)
            raise AIUnavailableError()
        except httpx.HTTPStatusError as e:
            logger.error("Ollama returned HTTP %d: %s", e.response.status_code, e.response.text[:200])
            raise AIUnavailableError(f"AI service returned error: HTTP {e.response.status_code}")
        except Exception as e:
            logger.error("Unexpected Ollama error: %s", str(e))
            raise AIUnavailableError()

        latency_ms = int((time.time() - start_time) * 1000)

        try:
            data = response.json()
        except json.JSONDecodeError:
            raise AIInvalidResponseError("Ollama returned non-JSON response")

        response_text = data.get("response", "")
        if not response_text:
            raise AIInvalidResponseError("Ollama returned empty response")

        return {
            "response_text": response_text,
            "latency_ms": latency_ms,
            "model": data.get("model", self.model),
            "done": data.get("done", False),
        }

    async def check_health(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                return resp.status_code == 200
        except Exception:
            return False

    @staticmethod
    def encode_image_base64(file_path: str, max_dimension: int = 1024) -> str:
        """Encode image to base64, resizing if larger than max_dimension."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Image file not found: {file_path}")

        from PIL import Image
        import io

        with Image.open(path) as img:
            if img.mode == "RGBA":
                img = img.convert("RGB")

            # Resize if too large
            w, h = img.size
            if w > max_dimension or h > max_dimension:
                ratio = min(max_dimension / w, max_dimension / h)
                new_size = (int(w * ratio), int(h * ratio))
                img = img.resize(new_size, Image.LANCZOS)
                logger.info("Resized image from %dx%d to %dx%d for AI", w, h, *new_size)

            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=85)
            buf.seek(0)
            return base64.b64encode(buf.getvalue()).decode("utf-8")


ollama_client = OllamaClient()
