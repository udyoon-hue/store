from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database (using SQLite for simplicity)
    DATABASE_URL: str = "sqlite:///./food_delivery.db"

    # Redis (optional for now)
    REDIS_URL: str = "redis://localhost:6379"

    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:19006"]

    class Config:
        env_file = ".env"


settings = Settings()
