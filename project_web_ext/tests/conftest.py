import pytest
from fastapi.testclient import TestClient

from app.main import app
from app import storage
from app.models import Account


@pytest.fixture(autouse=True)
def reset_storage():
    storage.jobs.clear()
    storage.accounts.clear()
    storage.accounts["default"] = Account(
        id="default", name="Demo Account", username="demo",
        monthly_allowance=500, pages_used=0
    )
    yield


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def default_account_id() -> str:
    return "default"


@pytest.fixture
def default_username() -> str:
    return "demo"
