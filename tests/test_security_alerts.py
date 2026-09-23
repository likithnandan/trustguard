import pytest
from fastapi.testclient import TestClient
import database

def _get_admin_token(client: TestClient) -> str:
    res = client.post("/auth/login", json={"email": "admin@gmail.com", "password": "Admin@12345"})
    return res.json()["token"]

def test_get_security_alerts(client: TestClient):
    """Verify security alerts retrieval."""
    token = _get_admin_token(client)
    res = client.get("/api/v1/dashboard/alerts", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "alerts" in data
    assert "tabs" in data

def test_acknowledge_single_alert(client: TestClient):
    """Verify acknowledging a specific security alert."""
    token = _get_admin_token(client)
    # Create a test alert
    alert = database.create_security_alert(
        device_id="TEMP-SURG-007",
        severity="Warning",
        alert_type="Telemetry Quality Degradation",
        message="Test alert for unit testing acknowledgment"
    )
    alert_id = alert["id"]

    res = client.post(f"/api/v1/dashboard/alerts/{alert_id}/acknowledge", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"

def test_acknowledge_all_alerts(client: TestClient):
    """Verify mass acknowledgment of security alerts with state preservation."""
    token = _get_admin_token(client)
    conn = database.get_db()
    # Save current active alert IDs
    unack_ids = [r[0] for r in conn.execute("SELECT id FROM security_alerts WHERE is_acknowledged = 0").fetchall()]
    conn.close()

    res = client.post("/api/v1/dashboard/alerts/acknowledge-all", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"

    # Restore unacknowledged status so permanent baseline remains intact
    if unack_ids:
        conn = database.get_db()
        placeholders = ",".join("?" * len(unack_ids))
        conn.execute(f"UPDATE security_alerts SET is_acknowledged = 0 WHERE id IN ({placeholders})", tuple(unack_ids))
        conn.commit()
        conn.close()
