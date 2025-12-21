import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Set test environment variables before importing app modules
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test-client-secret")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("ENCRYPTION_KEY", "dGVzdC1lbmNyeXB0aW9uLWtleS0zMmJ5dGVzISE=")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("ENVIRONMENT", "test")

from app.database import Base, get_db
from app.main import app
from app.models.data_broker import DataBroker
from app.models.user import User

# Test database engine (SQLite in-memory)
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """Create a fresh database session for each test"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """Create a test client with database override"""

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db: Session) -> User:
    """Create a test user"""
    user = User(
        email="test@example.com",
        google_id="google-123",
        encrypted_access_token="encrypted-token",
        encrypted_refresh_token="encrypted-refresh",
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_user(db: Session) -> User:
    """Create an admin test user"""
    user = User(
        email="admin@example.com",
        google_id="google-admin-123",
        encrypted_access_token="encrypted-token",
        encrypted_refresh_token="encrypted-refresh",
        is_admin=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_broker(db: Session) -> DataBroker:
    """Create a test data broker"""
    broker = DataBroker(
        name="Test Broker",
        domains=["testbroker.com", "test-broker.net"],
        privacy_email="privacy@testbroker.com",
        opt_out_url="https://testbroker.com/opt-out",
        category="people_search",
    )
    db.add(broker)
    db.commit()
    db.refresh(broker)
    return broker


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Generate auth headers for test user"""
    from app.dependencies.auth import create_access_token

    token = create_access_token(
        subject=str(test_user.id),
        email=test_user.email,
        is_admin=test_user.is_admin,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(admin_user: User) -> dict:
    """Generate auth headers for admin user"""
    from app.dependencies.auth import create_access_token

    token = create_access_token(
        subject=str(admin_user.id),
        email=admin_user.email,
        is_admin=admin_user.is_admin,
    )
    return {"Authorization": f"Bearer {token}"}
