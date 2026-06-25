from app import storage


def _register(client, account_id="default", name="J", url="https://x.com", pages=10):
    res = client.post("/api/jobs/", json={
        "account_id": account_id, "name": name, "target_url": url, "pages_per_run": pages,
    })
    assert res.status_code == 201
    return res.json()


# --- Registration ---

def test_register_job_returns_idle(client):
    job = _register(client)
    assert job["status"] == "idle"
    assert job["pages_extracted"] == 0
    assert "id" in job


def test_register_job_response_shape(client):
    job = _register(client, name="MyJob", url="https://x.com", pages=25)
    assert job["name"] == "MyJob"
    assert job["target_url"] == "https://x.com"
    assert job["pages_per_run"] == 25
    assert job["account_id"] == "default"


def test_register_job_unknown_account_returns_404(client):
    res = client.post("/api/jobs/", json={
        "account_id": "does-not-exist", "name": "J", "target_url": "https://x.com",
    })
    assert res.status_code == 404


# --- Listing ---

def test_list_jobs_empty(client):
    res = client.get("/api/jobs?account_id=default")
    assert res.status_code == 200
    assert res.json() == []


def test_list_jobs_returns_all_for_account(client):
    _register(client, name="A")
    _register(client, name="B")
    jobs = client.get("/api/jobs?account_id=default").json()
    assert len(jobs) == 2


def test_list_jobs_filters_by_account(client):
    client.post("/api/accounts/", json={"name": "Other", "monthly_allowance": 100})
    _register(client, name="Mine")
    jobs = client.get("/api/jobs?account_id=default").json()
    assert all(j["account_id"] == "default" for j in jobs)


def test_list_all_jobs_no_filter(client):
    _register(client, name="J1")
    _register(client, name="J2")
    jobs = client.get("/api/jobs").json()
    assert len(jobs) == 2


# --- Get single job ---

def test_get_job_by_id(client):
    job = _register(client, name="GetMe")
    res = client.get(f"/api/jobs/{job['id']}")
    assert res.status_code == 200
    assert res.json()["name"] == "GetMe"


def test_get_nonexistent_job_returns_404(client):
    res = client.get("/api/jobs/bad-id")
    assert res.status_code == 404


# --- Start ---

def test_start_job_sets_running(client):
    job = _register(client, pages=50)
    res = client.post(f"/api/jobs/{job['id']}/start")
    assert res.status_code == 200
    assert res.json()["status"] == "running"


def test_start_job_deducts_pages(client):
    job = _register(client, pages=50)
    client.post(f"/api/jobs/{job['id']}/start")
    acc = client.get("/api/accounts/default").json()
    assert acc["pages_used"] == 50
    assert acc["pages_remaining"] == 450


def test_start_job_deducts_pages_visible_via_username(client):
    job = _register(client, pages=50)
    client.post(f"/api/jobs/{job['id']}/start")
    acc = client.get("/api/accounts/demo").json()
    assert acc["pages_used"] == 50


def test_start_job_increments_pages_extracted(client):
    job = _register(client, pages=50)
    result = client.post(f"/api/jobs/{job['id']}/start").json()
    assert result["pages_extracted"] == 50


def test_start_already_running_returns_409(client):
    job = _register(client)
    client.post(f"/api/jobs/{job['id']}/start")
    res = client.post(f"/api/jobs/{job['id']}/start")
    assert res.status_code == 409


def test_start_insufficient_allowance_returns_402(client):
    storage.accounts["default"].pages_used = 490  # 10 remaining, need 50
    job = _register(client, pages=50)
    res = client.post(f"/api/jobs/{job['id']}/start")
    assert res.status_code == 402
    assert "Insufficient" in res.json()["detail"]


def test_start_insufficient_allowance_job_stays_idle(client):
    storage.accounts["default"].pages_used = 500  # fully exhausted
    job = _register(client, pages=1)
    client.post(f"/api/jobs/{job['id']}/start")
    assert client.get(f"/api/jobs/{job['id']}").json()["status"] == "idle"


def test_start_insufficient_allowance_does_not_deduct(client):
    storage.accounts["default"].pages_used = 500
    job = _register(client, pages=1)
    client.post(f"/api/jobs/{job['id']}/start")
    assert storage.accounts["default"].pages_used == 500


def test_start_nonexistent_job_returns_404(client):
    res = client.post("/api/jobs/bad-id/start")
    assert res.status_code == 404


# --- Stop ---

def test_stop_running_job_sets_stopped(client):
    job = _register(client)
    client.post(f"/api/jobs/{job['id']}/start")
    res = client.post(f"/api/jobs/{job['id']}/stop")
    assert res.status_code == 200
    assert res.json()["status"] == "stopped"


def test_stop_idle_job_returns_409(client):
    job = _register(client)
    res = client.post(f"/api/jobs/{job['id']}/stop")
    assert res.status_code == 409


def test_stop_already_stopped_returns_409(client):
    job = _register(client)
    client.post(f"/api/jobs/{job['id']}/start")
    client.post(f"/api/jobs/{job['id']}/stop")
    res = client.post(f"/api/jobs/{job['id']}/stop")
    assert res.status_code == 409


def test_stop_nonexistent_job_returns_404(client):
    res = client.post("/api/jobs/bad-id/stop")
    assert res.status_code == 404


# --- State machine: restart ---

def test_stopped_job_can_restart(client):
    job = _register(client, pages=10)
    client.post(f"/api/jobs/{job['id']}/start")
    client.post(f"/api/jobs/{job['id']}/stop")
    res = client.post(f"/api/jobs/{job['id']}/start")
    assert res.status_code == 200
    assert res.json()["status"] == "running"


def test_restart_deducts_allowance_again(client):
    job = _register(client, pages=10)
    client.post(f"/api/jobs/{job['id']}/start")
    client.post(f"/api/jobs/{job['id']}/stop")
    client.post(f"/api/jobs/{job['id']}/start")
    assert storage.accounts["default"].pages_used == 20


# --- Allowance boundary ---

def test_exact_allowance_boundary_succeeds(client):
    storage.accounts["default"].pages_used = 490  # exactly 10 remaining
    job = _register(client, pages=10)
    res = client.post(f"/api/jobs/{job['id']}/start")
    assert res.status_code == 200


def test_one_over_allowance_boundary_fails(client):
    storage.accounts["default"].pages_used = 490  # 10 remaining, need 11
    job = _register(client, pages=11)
    res = client.post(f"/api/jobs/{job['id']}/start")
    assert res.status_code == 402


# --- Full lifecycle ---

def test_full_lifecycle(client):
    job = _register(client, pages=100)
    jid = job["id"]

    assert client.get(f"/api/jobs/{jid}").json()["status"] == "idle"
    client.post(f"/api/jobs/{jid}/start")
    assert client.get(f"/api/jobs/{jid}").json()["status"] == "running"
    client.post(f"/api/jobs/{jid}/stop")
    assert client.get(f"/api/jobs/{jid}").json()["status"] == "stopped"
    client.post(f"/api/jobs/{jid}/start")
    assert client.get(f"/api/jobs/{jid}").json()["status"] == "running"
