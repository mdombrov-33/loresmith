from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    AI_PROVIDER: str = "local"  # Options: 'local', 'openrouter'
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "gpt-5"
    LOCAL_MODEL: str = "llama3.1:8b"
    OLLAMA_URL: str = "http://host.docker.internal:11434"

    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: str = ""
    LANGFUSE_HOST: str = "https://cloud.langfuse.com"
    LANGFUSE_ENABLED: bool = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
