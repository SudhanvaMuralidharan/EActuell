from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    APP_NAME: str = "OrbiPulse Smart Irrigation API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    DATABASE_URL: str = ""

    # JWT
    SECRET_KEY: str = "orbipulse-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Dataset path
    DATASET_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "dataset", "telemetry_data.json"
    )

    # Telemetry thresholds
    THRESHOLDS: dict = {
        "flow_rate_min": 5.0,
        "flow_rate_max": 25.0,
        "pressure_min": 1.0,
        "pressure_max": 4.0,
        "temperature_max": 40.0,
        "battery_critical": 20,
        "battery_low": 30,
        "motor_current_max": 3.0,
        "signal_strength_min": -80,
    }

    # Anthropic (optional – set via env for AI features)
    ANTHROPIC_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
