"""Application settings, read from the environment."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration for the API.

    Every field can be overridden by an environment variable of the same name
    (case-insensitive), or by a `.env` file sitting next to the backend.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://pianonobil:pianonobil@localhost:5432/pianonobil"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    seed_on_startup: bool = True
    environment: str = "development"

    api_prefix: str = "/api/v1"
    project_name: str = "The Piano Nobile"

    @property
    def cors_origin_list(self) -> list[str]:
        """CORS_ORIGINS as a list. `*` is honoured as a single wildcard entry."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
