from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class BrokerBase(BaseModel):
    name: str
    domains: List[str]
    privacy_email: Optional[str] = None
    opt_out_url: Optional[str] = None
    category: Optional[str] = None


class Broker(BrokerBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BrokerSyncResult(BaseModel):
    message: str
    brokers_added: int
    total_brokers: int
