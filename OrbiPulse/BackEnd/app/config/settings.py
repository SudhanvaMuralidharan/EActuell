import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./irrigation.db"  # Default to SQLite for dev
)

# For PostgreSQL (Supabase):
# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres")

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Application settings
APP_NAME = "Smart Irrigation Monitoring System"
APP_VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# JWT settings (if not using Supabase auth)
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# AI Agent settings
ANOMALY_THRESHOLD = 0.7
TELEMETRY_BATCH_SIZE = 100

# Paths
DATASET_DIR = BASE_DIR / "dataset"
SIMULATOR_DIR = BASE_DIR / "simulator"
