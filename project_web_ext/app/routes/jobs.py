from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..models import Job, JobStatus
from ..storage import jobs, accounts

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


class RegisterJobRequest(BaseModel):
    account_id: str
    name: str
    target_url: str
    pages_per_run: int = 10


@router.post("/", status_code=201)
def register_job(req: RegisterJobRequest) -> Job:
    if req.account_id not in accounts:
        raise HTTPException(status_code=404, detail="Account not found")
    job = Job(
        account_id=req.account_id,
        name=req.name,
        target_url=req.target_url,
        pages_per_run=req.pages_per_run,
    )
    jobs[job.id] = job
    return job


@router.get("/")
def list_jobs(account_id: Optional[str] = None) -> List[Job]:
    all_jobs = list(jobs.values())
    if account_id:
        all_jobs = [j for j in all_jobs if j.account_id == account_id]
    return all_jobs


@router.get("/{job_id}")
def get_job(job_id: str) -> Job:
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/{job_id}/start")
def start_job(job_id: str) -> Job:
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status == JobStatus.RUNNING:
        raise HTTPException(status_code=409, detail="Job is already running")

    account = accounts.get(job.account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if account.pages_remaining < job.pages_per_run:
        raise HTTPException(
            status_code=402,
            detail=(
                f"Insufficient page allowance. "
                f"Remaining: {account.pages_remaining}, needed: {job.pages_per_run}"
            ),
        )

    account.pages_used += job.pages_per_run
    job.pages_extracted += job.pages_per_run
    job.status = JobStatus.RUNNING
    return job


@router.post("/{job_id}/stop")
def stop_job(job_id: str) -> Job:
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != JobStatus.RUNNING:
        raise HTTPException(
            status_code=409,
            detail=f"Job is not running (current status: {job.status.value})",
        )
    job.status = JobStatus.STOPPED
    return job
