import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ARRAY, Text
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class DataBroker(Base):
    __tablename__ = "data_brokers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True, index=True)

    # Domains associated with this broker
    domains = Column(ARRAY(String), nullable=False, default=[])

    # Contact information
    privacy_email = Column(String, nullable=True)
    opt_out_url = Column(String, nullable=True)

    # Categorization
    category = Column(String, nullable=True)  # e.g., "data_aggregator", "people_search", etc.

    # Additional metadata
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
