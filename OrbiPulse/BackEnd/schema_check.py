"""Discover all columns in telemetry + network schemas and write to schema_report.txt"""
import asyncio, os, sys
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

async def main():
    db_url = None
    with open(".env") as f:
        for line in f:
            if line.startswith("DATABASE_URL="):
                db_url = line.split("=", 1)[1].strip().strip('"').strip("'")
    if not db_url:
        print("DATABASE_URL not found"); return
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    engine = create_async_engine(db_url, connect_args={"statement_cache_size": 0})
    SL = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    lines = []
    async with SL() as db:
        for schema in ["telemetry", "network"]:
            res = await db.execute(text(
                f"SELECT table_name FROM information_schema.tables WHERE table_schema='{schema}'"
            ))
            tables = [r[0] for r in res.fetchall()]
            lines.append(f"=== SCHEMA: {schema} ({len(tables)} tables) ===")
            for t in tables:
                res2 = await db.execute(text(
                    f"SELECT column_name, data_type, is_nullable FROM information_schema.columns "
                    f"WHERE table_schema='{schema}' AND table_name='{t}' ORDER BY ordinal_position"
                ))
                cols = res2.fetchall()
                lines.append(f"\nTABLE: {schema}.{t}")
                for c in cols:
                    lines.append(f"  {c[0]:30s} {c[1]:30s} nullable={c[2]}")
    with open("schema_report.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print("Done. Written to schema_report.txt")

asyncio.run(main())
