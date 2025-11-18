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
    OPENROUTER_EMBEDDING_MODEL: str = "text-embedding-3-small"
    OPENROUTER_EMBEDDING_BASE_URL: str = "https://openrouter.ai/api/v1"
    LOCAL_MODEL: str = "llama3.1:8b"
    LOCAL_EMBEDDING_MODEL: str = "nomic-embed-text"
    OLLAMA_URL: str = "http://host.docker.internal:11434"

    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: str = ""
    LANGFUSE_HOST: str = "https://cloud.langfuse.com"
    LANGFUSE_ENABLED: bool = True

    # Image Generation Settings
    ENABLE_IMAGE_GENERATION: bool = True
    IMAGE_PROVIDER: str = "local"  # Options: 'replicate', 'local'
    REPLICATE_API_TOKEN: str = ""  # Get from https://replicate.com/account/api-tokens
    AUTOMATIC1111_URL: str = (
        "http://host.docker.internal:7860"  # For local Automatic1111 WebUI
    )

    # R2 Storage Settings (S3-compatible)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_ENDPOINT_URL: str = ""
    R2_BUCKET_NAME: str = ""
    R2_PUBLIC_URL: str = ""


@lru_cache()
def get_settings() -> Settings:
    return Settings()
