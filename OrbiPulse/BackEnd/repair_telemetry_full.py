import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

async def repair_full_schema():
    print("Repairing ALL columns in telemetry.device_telemetry...")
    
    # Manually parse .env to get DATABASE_URL
    db_url = None
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            for line in f:
                if line.startswith("DATABASE_URL="):
                    db_url = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
    
    if not db_url:
        print("Error: DATABASE_URL not found in .env")
        return

    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    engine = create_async_engine(db_url, connect_args={"statement_cache_size": 0})
    SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with SessionLocal() as db:
        cols = [
            ("device_id", "VARCHAR"),
            ("position", "INTEGER"),
            ("motor_current", "FLOAT"),
            ("temperature", "FLOAT"),
            ("battery_voltage", "FLOAT"),
            ("flow_rate", "FLOAT"),
            ("pressure", "FLOAT"),
            ("timestamp", "TIMESTAMP WITH TIME ZONE")
        ]
        
        for col, col_type in cols:
            try:
                await db.execute(text(f"ALTER TABLE telemetry.device_telemetry ADD COLUMN IF NOT EXISTS {col} {col_type}"))
                print(f"Verified/Added {col} to telemetry.device_telemetry")
            except Exception as e:
                print(f"Error adding {col}: {e}")

        await db.commit()
    print("Schema repair complete.")

if __name__ == "__main__":
    asyncio.run(repair_full_schema())
