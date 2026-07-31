"""
Application settings, read from environment variables / .env.
No secrets are hardcoded here -- see .env.example for what's required.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Local sqlite is a convenient default for dev/tests without a Postgres
    # server running; production points DATABASE_URL at real Postgres.
    database_url: str = "sqlite:///./app.db"

    # Required -- no default. A missing secret must fail loudly at startup,
    # not silently run auth with a weak built-in key (RULES.md #4).
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    cors_allowed_origins: str = "http://localhost:5173"


# pydantic-settings populates required fields from the environment at
# runtime; mypy can't see that, hence the call-arg ignore (standard for
# this pattern).
settings = Settings()  # type: ignore[call-arg]
