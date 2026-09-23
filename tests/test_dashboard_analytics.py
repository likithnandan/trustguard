import pytest
from fastapi.testclient import TestClient

def _get_admin_token(client: TestClient) -> str:
    res = client.post("/auth/login", json={"email": "admin@gmail.com", "password": "Admin@12345"})
    return res.json()["token"]

def test_dashboard_summary(client: TestClient):
    """Verify KPI dashboard summary endpoint."""
    token = _get_admin_token(client)
    res = client.get("/api/v1/dashboard/summary", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert data["kpis"]["total_devices"] >= 6
    assert data["kpis"]["total_patients"] >= 6

def test_dashboard_heatmap(client: TestClient):
    """Verify hospital floor plan heat map endpoint."""
    token = _get_admin_token(client)
    res = client.get("/api/v1/dashboard/heatmap", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "departments" in data
    assert "units" in data
    assert len(data["departments"]) >= 5

def test_dashboard_trust_trend(client: TestClient):
    """Verify continuous trust trend series endpoint."""
    token = _get_admin_token(client)
    res = client.get("/api/v1/dashboard/trust-trend?period=7d", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "labels" in data
    assert "scores" in data

def test_dashboard_reports(client: TestClient):
    """Verify analytical reports for each operational view."""
    token = _get_admin_token(client)
    for tab in ["overview", "device", "maintenance", "security", "compliance"]:
        res = client.get(f"/api/v1/dashboard/reports?tab={tab}", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        data = res.json()
        assert data["type"] == tab
        assert "kpis" in data
        assert "table" in data
