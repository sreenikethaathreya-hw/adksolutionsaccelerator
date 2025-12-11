"""
PostgreSQL Database Connector for Financial Agent
"""

import os
from typing import Optional
from urllib.parse import quote_plus


class PostgreSQLConnector:
    """Helper class for PostgreSQL connection management"""
    
    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        database: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
    ):
        """
        Initialize PostgreSQL connector.
        
        Args:
            host: Database host (defaults to env var DB_HOST)
            port: Database port (defaults to env var DB_PORT or 5432)
            database: Database name (defaults to env var DB_NAME)
            user: Database user (defaults to env var DB_USER)
            password: Database password (defaults to env var DB_PASSWORD)
        """
        self.host = host or os.getenv("DB_HOST", "localhost")
        self.port = port or int(os.getenv("DB_PORT", "5432"))
        self.database = database or os.getenv("DB_NAME", "financial_agent")
        self.user = user or os.getenv("DB_USER", "postgres")
        self.password = password or os.getenv("DB_PASSWORD", "")
    
    def get_conn_string(self, driver: str = "postgresql+psycopg2") -> str:
        """
        Get SQLAlchemy connection string.
        
        Args:
            driver: Database driver (default: postgresql+psycopg2)
        
        Returns:
            Connection string for SQLAlchemy
        """
        # URL-encode password to handle special characters
        encoded_password = quote_plus(self.password) if self.password else ""
        
        if encoded_password:
            conn_string = (
                f"{driver}://{self.user}:{encoded_password}"
                f"@{self.host}:{self.port}/{self.database}"
            )
        else:
            conn_string = (
                f"{driver}://{self.user}@{self.host}:{self.port}/{self.database}"
            )
        
        return conn_string
    
    def get_async_conn_string(self) -> str:
        """Get async PostgreSQL connection string (asyncpg)"""
        return self.get_conn_string(driver="postgresql+asyncpg")


# For in-memory development (no database needed)
class InMemoryConnector:
    """Mock connector for development without database"""
    
    def get_conn_string(self) -> str:
        """Returns SQLite in-memory connection string"""
        return "sqlite:///:memory:"