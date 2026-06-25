from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, computed_field
from datetime import datetime, timezone
import uuid


class JobStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    STOPPED = "stopped"


class Account(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    username: str = ""
    monthly_allowance: int = 1000
    pages_used: int = 0

    @computed_field
    @property
    def pages_remaining(self) -> int:
        return max(0, self.monthly_allowance - self.pages_used)


class Job(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    account_id: str
    name: str
    target_url: str
    pages_per_run: int = 10
    status: JobStatus = JobStatus.IDLE
    pages_extracted: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
