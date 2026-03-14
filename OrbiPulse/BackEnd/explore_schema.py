import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

async def explore_schema():
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
        print("Tables in 'telemetry' schema:")
        res = await db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'telemetry'"))
        tables = [row[0] for row in res.fetchall()]
        for t in tables:
            print(f" - {t}")
            res_cols = await db.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_schema = 'telemetry' AND table_name = '{t}'"))
            cols = [r[0] for r in res_cols.fetchall()]
            print(f"   Columns: {', '.join(cols)}")
            
        print("\nTables in 'network' schema:")
        res = await db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'network'"))
        tables = [row[0] for row in res.fetchall()]
        for t in tables:
            print(f" - {t}")
            res_cols = await db.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_schema = 'network' AND table_name = '{t}'"))
            cols = [r[0] for r in res_cols.fetchall()]
            print(f"   Columns: {', '.join(cols)}")

if __name__ == "__main__":
    asyncio.run(explore_schema())
