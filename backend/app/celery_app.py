from celery import Celery
from celery.schedules import crontab
from app.config import settings

celery_app = Celery(
    "antispam",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.email_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    result_extended=True,
)

# Celery Beat Schedule
celery_app.conf.beat_schedule = {
    'scan-responses-daily': {
        'task': 'app.tasks.email_tasks.scan_all_users_for_responses',
        'schedule': crontab(hour=2, minute=0),  # Run at 2 AM daily
    },
}
