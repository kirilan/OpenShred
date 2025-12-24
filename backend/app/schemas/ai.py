from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class AiSettingsUpdate(BaseModel):
    api_key: str | None = Field(default=None)
    model: str | None = None


class AiSettingsStatus(BaseModel):
    has_key: bool
    updated_at: datetime | None = None
    model: str
    available_models: list[str] = Field(default_factory=list)


class AiResponseClassification(BaseModel):
    response_id: str
    response_type: Literal[
        "confirmation",
        "rejection",
        "acknowledgment",
        "action_required",
        "request_info",
        "unknown",
    ]
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    rationale: str | None = None


class AiThreadClassification(BaseModel):
    model: str
    responses: list[AiResponseClassification]


class AiClassifyResult(BaseModel):
    request_id: str
    updated_responses: int
    status_updated: bool
    request_status: str
    model: str
    ai_output: AiThreadClassification
