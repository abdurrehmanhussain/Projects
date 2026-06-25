from app import storage


# --- List ---

def test_list_accounts_includes_default(client):
    res = client.get("/api/accounts/")
    assert res.status_code == 200
    ids = [a["id"] for a in res.json()]
    assert "default" in ids


def test_list_accounts_includes_username(client):
    accounts = client.get("/api/accounts/").json()
    default = next(a for a in accounts if a["id"] == "default")
    assert default["username"] == "demo"


def test_pages_remaining_in_list_response(client):
    accounts = client.get("/api/accounts/").json()
    default = next(a for a in accounts if a["id"] == "default")
    assert "pages_remaining" in default


# --- Get by ID ---

def test_get_account_by_id(client):
    res = client.get("/api/accounts/default")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "default"
    assert data["name"] == "Demo Account"
    assert data["username"] == "demo"
    assert data["monthly_allowance"] == 500
    assert data["pages_used"] == 0
    assert data["pages_remaining"] == 500


def test_get_nonexistent_id_returns_404(client):
    res = client.get("/api/accounts/nope")
    assert res.status_code == 404


# --- Get by username ---

def test_get_account_by_username(client):
    res = client.get("/api/accounts/demo")
    assert res.status_code == 200
    assert res.json()["id"] == "default"
    assert res.json()["username"] == "demo"


def test_get_account_by_username_returns_same_as_by_id(client):
    by_id = client.get("/api/accounts/default").json()
    by_username = client.get("/api/accounts/demo").json()
    assert by_id == by_username


def test_get_unknown_username_returns_404(client):
    res = client.get("/api/accounts/nobody")
    assert res.status_code == 404


# --- Create ---

def test_create_account(client):
    res = client.post("/api/accounts/", json={"name": "New Org", "monthly_allowance": 2000})
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "New Org"
    assert data["monthly_allowance"] == 2000
    assert data["pages_used"] == 0
    assert data["pages_remaining"] == 2000
    assert "id" in data


def test_created_account_username_defaults_empty(client):
    res = client.post("/api/accounts/", json={"name": "NoUser", "monthly_allowance": 100})
    assert res.json()["username"] == ""


# --- pages_remaining ---

def test_pages_remaining_reflects_used(client):
    storage.accounts["default"].pages_used = 200
    acc = client.get("/api/accounts/default").json()
    assert acc["pages_remaining"] == 300


def test_pages_remaining_floors_at_zero(client):
    storage.accounts["default"].pages_used = 600  # over allowance
    acc = client.get("/api/accounts/default").json()
    assert acc["pages_remaining"] == 0


def test_pages_remaining_also_correct_via_username(client):
    storage.accounts["default"].pages_used = 100
    acc = client.get("/api/accounts/demo").json()
    assert acc["pages_remaining"] == 400
