from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta
from app.models.activity_log import ActivityLog, ActivityType


class ActivityLogService:
    """Service for creating and querying activity logs"""

    def __init__(self, db: Session):
        self.db = db

    def log_activity(
        self,
        user_id: str,
        activity_type: ActivityType,
        message: str,
        details: Optional[str] = None,
        broker_id: Optional[str] = None,
        deletion_request_id: Optional[str] = None,
        response_id: Optional[str] = None,
        email_scan_id: Optional[str] = None
    ) -> ActivityLog:
        """Create an activity log entry"""
        activity = ActivityLog(
            user_id=user_id,
            activity_type=activity_type,
            message=message,
            details=details,
            broker_id=broker_id,
            deletion_request_id=deletion_request_id,
            response_id=response_id,
            email_scan_id=email_scan_id
        )
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        return activity

    def get_user_activities(
        self,
        user_id: str,
        broker_id: Optional[str] = None,
        activity_type: Optional[ActivityType] = None,
        days_back: int = 30,
        limit: int = 100
    ) -> List[ActivityLog]:
        """Get activity logs for a user"""
        query = self.db.query(ActivityLog).filter(
            ActivityLog.user_id == user_id
        )

        if broker_id:
            query = query.filter(ActivityLog.broker_id == broker_id)

        if activity_type:
            query = query.filter(ActivityLog.activity_type == activity_type)

        cutoff_date = datetime.utcnow() - timedelta(days=days_back)
        query = query.filter(ActivityLog.created_at >= cutoff_date)

        return query.order_by(ActivityLog.created_at.desc()).limit(limit).all()
