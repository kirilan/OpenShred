import logging
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base

from app.config import settings

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,
    max_overflow=10,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency for getting database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize database tables.

    Note: In production, use Alembic migrations instead:
        alembic upgrade head

    This method is kept for development convenience but will be
    deprecated in favor of migrations.
    """
    logger.warning(
        "Using init_db() to create tables. "
        "Consider using Alembic migrations for production: 'alembic upgrade head'"
    )
    Base.metadata.create_all(bind=engine)
