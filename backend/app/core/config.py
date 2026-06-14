from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "StitchSense"
    app_version: str = "1.0.0"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@postgres:5432/ai_textile_admin"

    # Redis
    redis_url: str = "redis://redis:6379/0"

    # Ollama
    ollama_base_url: str = "https://unshunted-clora-duodecimally.ngrok-free.dev"
    ollama_model: str = "qwen2.5vl:7b"
    ollama_timeout_seconds: int = 600
    ollama_temperature: float = 0.2
    ollama_top_p: Optional[float] = None
    ollama_top_k: Optional[int] = None
    ollama_repeat_penalty: Optional[float] = None

    # Server
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: str = "http://localhost:5173"

    # Storage
    media_root: str = "/app/media"
    max_upload_mb: int = 10

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
