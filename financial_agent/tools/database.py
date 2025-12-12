# app/database.py
from google.cloud.sql.connector import Connector, IPTypes
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
import os

connector = Connector()
Base = declarative_base()

async def get_connection():
    """Create secure connection using Cloud SQL Connector."""
    conn = await connector.connect_async(
        os.environ["INSTANCE_CONNECTION_NAME"],
        "asyncpg",
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        db=os.environ["DB_NAME"],
        ip_type=IPTypes.PRIVATE,
    )
    return conn

engine = create_async_engine(
    "postgresql+asyncpg://",
    async_creator=get_connection,
    pool_size=5,
    max_overflow=2,
    pool_recycle=1800,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    """Dependency for database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise