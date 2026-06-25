from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..models import Account
from ..storage import accounts

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


class CreateAccountRequest(BaseModel):
    name: str
    monthly_allowance: int = 1000


@router.get("/")
def list_accounts() -> List[Account]:
    return list(accounts.values())


@router.get("/{account_id}")
def get_account(account_id: str) -> Account:
    account = accounts.get(account_id) or next(
        (a for a in accounts.values() if a.username == account_id), None
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.post("/", status_code=201)
def create_account(req: CreateAccountRequest) -> Account:
    account = Account(name=req.name, monthly_allowance=req.monthly_allowance)
    accounts[account.id] = account
    return account
