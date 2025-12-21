from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Google OAuth Configuration
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str = "http://localhost:8000/auth/callback"

    # Database Configuration
    database_url: str

    # Security
    secret_key: str
    encryption_key: str

    # Redis/Celery Configuration
    redis_url: str = "redis://localhost:6379/0"

    # Frontend URL (for OAuth redirects)
    frontend_url: str = "http://localhost:3000"

    # CORS Configuration
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Rate Limiting Configuration
    rate_limit_requests: int = 100
    rate_limit_period: int = 60  # seconds

    # Application Settings
    environment: str = "development"
    log_level: str = "INFO"

    # Rate limiting (per user)
    email_scan_rate_limit: int = 5
    email_scan_rate_window_seconds: int = 60 * 60  # 1 hour
    response_scan_rate_limit: int = 5
    response_scan_rate_window_seconds: int = 60 * 60
    task_trigger_rate_limit: int = 8
    task_trigger_rate_window_seconds: int = 60 * 60

    # Gemini AI configuration
    gemini_timeout_seconds: int = 20

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


settings = Settings()
