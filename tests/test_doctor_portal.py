import pytest
from fastapi.testclient import TestClient

def _get_admin_token(client: TestClient) -> str:
    res = client.post("/auth/login", json={"email": "admin@gmail.com", "password": "Admin@12345"})
    return res.json()["token"]

def test_doctor_patients_list(client: TestClient):
    """Verify doctor patient vital streaming endpoint."""
    token = _get_admin_token(client)
    res = client.get("/api/v1/doctor/patients", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "patients" in data
    assert data["count"] >= 1
    assert len(data["patients"]) >= 1
    p = data["patients"][0]
    assert "id" in p
    assert "name" in p
    assert "room" in p

def test_single_patient_telemetry(client: TestClient):
    """Verify single patient telemetry inspection."""
    token = _get_admin_token(client)
    res = client.get("/api/v1/doctor/patients", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert len(data["patients"]) > 0
    target_id = data["patients"][0]["id"]
    
    single_res = client.get(f"/api/v1/doctor/patients/{target_id}", headers={"Authorization": f"Bearer {token}"})
    assert single_res.status_code == 200
    p = single_res.json()
    assert p["id"] == target_id
    assert "trust" in p
    assert "decision" in p
