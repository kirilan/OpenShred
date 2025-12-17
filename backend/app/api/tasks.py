from fastapi import APIRouter, HTTPException
from celery.result import AsyncResult
from pydantic import BaseModel
from typing import Optional, List

from app.celery_app import celery_app
from app.tasks.email_tasks import scan_inbox_task

router = APIRouter()


class ScanTaskRequest(BaseModel):
    days_back: int = 90
    max_emails: int = 100


class BatchRequestsTaskRequest(BaseModel):
    broker_ids: List[str]
    framework: str = "GDPR/CCPA"


class TaskResponse(BaseModel):
    task_id: str
    status: str


class TaskStatusResponse(BaseModel):
    task_id: str
    state: str
    info: Optional[dict] = None
    result: Optional[dict] = None


@router.post("/scan", response_model=TaskResponse)
def start_scan_task(user_id: str, request: ScanTaskRequest):
    """Start an async email scan task"""
    task = scan_inbox_task.delay(
        user_id,
        days_back=request.days_back,
        max_emails=request.max_emails
    )
    return TaskResponse(task_id=task.id, status="started")


@router.get("/{task_id}", response_model=TaskStatusResponse)
def get_task_status(task_id: str):
    """Get the status of a Celery task"""
    result = AsyncResult(task_id, app=celery_app)

    response = TaskStatusResponse(
        task_id=task_id,
        state=result.status
    )

    if result.status == "PROGRESS":
        response.info = result.info
    elif result.status == "SUCCESS":
        response.result = result.result
    elif result.status == "FAILURE":
        response.info = {"error": str(result.result) if result.result else "Unknown error"}

    return response


@router.delete("/{task_id}")
def cancel_task(task_id: str):
    """Cancel/revoke a running task"""
    celery_app.control.revoke(task_id, terminate=True)
    return {"task_id": task_id, "status": "cancelled"}
