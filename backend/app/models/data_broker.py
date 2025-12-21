import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, String, Text, Uuid

from app.database import Base


class DataBroker(Base):
    __tablename__ = "data_brokers"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True, index=True)

    # Domains associated with this broker (stored as JSON for cross-db compatibility)
    domains = Column(JSON, nullable=False, default=list)

    # Contact information
    privacy_email = Column(String, nullable=True)
    opt_out_url = Column(String, nullable=True)

    # Categorization
    category = Column(String, nullable=True)  # e.g., "data_aggregator", "people_search", etc.

    # Additional metadata
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
