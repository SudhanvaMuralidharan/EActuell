import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

async def explore():
    db_url = None
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            for line in f:
                if line.startswith("DATABASE_URL="):
                    db_url = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    engine = create_async_engine(db_url, connect_args={"statement_cache_size": 0})
    SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with SessionLocal() as db:
        for schema in ["telemetry", "network"]:
            print(f"--- SCHEMA: {schema} ---")
            res = await db.execute(text(f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{schema}'"))
            tables = [row[0] for row in res.fetchall()]
            for t in tables:
                print(f"TABLE: {t}")
                res_cols = await db.execute(text(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = '{schema}' AND table_name = '{t}'"))
                for col in res_cols.fetchall():
                    print(f"  - {col[0]} ({col[1]})")
                print("")

if __name__ == "__main__":
    asyncio.run(explore())
