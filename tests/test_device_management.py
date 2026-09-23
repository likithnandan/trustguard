import pytest
from fastapi.testclient import TestClient

def _get_admin_token(client: TestClient) -> str:
    res = client.post("/auth/login", json={"email": "admin@gmail.com", "password": "Admin@12345"})
    return res.json()["token"]

def test_list_all_devices(client: TestClient):
    """Verify device inventory listing endpoint."""
    token = _get_admin_token(client)
    res = client.get("/api/v1/devices", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "devices" in data
    assert len(data["devices"]) >= 6
    d = data["devices"][0]
    assert "device_id" in d
    assert "device_type" in d
    assert "department" in d

def test_list_all_patients(client: TestClient):
    """Verify patient registry listing endpoint."""
    token = _get_admin_token(client)
    res = client.get("/api/v1/patients", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "patients" in data
    assert len(data["patients"]) >= 6
