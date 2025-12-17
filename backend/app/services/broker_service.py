import json
import os
from typing import List
from sqlalchemy.orm import Session

from app.models.data_broker import DataBroker


class BrokerService:
    def __init__(self, db: Session):
        self.db = db

    def load_brokers_from_json(self) -> int:
        """Load data brokers from JSON file into database"""
        json_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'data',
            'data_brokers.json'
        )

        with open(json_path, 'r') as f:
            data = json.load(f)

        count = 0
        for broker_data in data['brokers']:
            # Check if broker already exists
            existing = self.db.query(DataBroker).filter(
                DataBroker.name == broker_data['name']
            ).first()

            if existing:
                # Update existing broker
                existing.domains = broker_data['domains']
                existing.privacy_email = broker_data.get('privacy_email')
                existing.opt_out_url = broker_data.get('opt_out_url')
                existing.category = broker_data.get('category')
            else:
                # Create new broker
                broker = DataBroker(
                    name=broker_data['name'],
                    domains=broker_data['domains'],
                    privacy_email=broker_data.get('privacy_email'),
                    opt_out_url=broker_data.get('opt_out_url'),
                    category=broker_data.get('category')
                )
                self.db.add(broker)
                count += 1

        self.db.commit()
        return count

    def get_all_brokers(self) -> List[DataBroker]:
        """Get all data brokers"""
        return self.db.query(DataBroker).order_by(DataBroker.name).all()

    def get_broker_by_domain(self, domain: str) -> DataBroker:
        """Find broker by domain"""
        brokers = self.db.query(DataBroker).all()

        for broker in brokers:
            if domain in broker.domains or any(d in domain for d in broker.domains):
                return broker

        return None

    def get_broker_by_id(self, broker_id: str) -> DataBroker:
        """Get broker by ID"""
        return self.db.query(DataBroker).filter(DataBroker.id == broker_id).first()
