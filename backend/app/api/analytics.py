from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Optional

from app.database import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/stats")
def get_user_stats(
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
) -> Dict:
    """
    Get overall statistics for a user

    Returns total requests, status breakdown, success rate, and average response time
    """
    service = AnalyticsService(db)
    return service.get_user_stats(user_id)


@router.get("/broker-ranking")
def get_broker_ranking(
    user_id: Optional[str] = Query(None, description="User ID (optional, for user-specific ranking)"),
    db: Session = Depends(get_db)
) -> List[Dict]:
    """
    Get broker compliance ranking

    Shows brokers sorted by success rate and response time.
    If user_id is provided, shows ranking based on that user's requests only.
    """
    service = AnalyticsService(db)
    return service.get_broker_compliance_ranking(user_id)


@router.get("/timeline")
def get_timeline(
    user_id: str = Query(..., description="User ID"),
    days: int = Query(30, description="Number of days to look back"),
    db: Session = Depends(get_db)
) -> List[Dict]:
    """
    Get timeline data for requests sent and confirmations received

    Returns daily counts for the specified time period
    """
    service = AnalyticsService(db)
    return service.get_timeline_data(user_id, days)


@router.get("/response-distribution")
def get_response_distribution(
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
) -> List[Dict]:
    """
    Get distribution of broker response types

    Shows count of each response type (confirmation, rejection, acknowledgment, etc.)
    """
    service = AnalyticsService(db)
    return service.get_response_type_distribution(user_id)
