import pytest
from fastapi.testclient import TestClient

def test_trust_formula_fusion(client: TestClient):
    """
    Verify Continuous Trust Engine formula:
    Final Trust Score = 0.45 * Device Trust + 0.55 * Data Authenticity
    """
    payload = {
        "device_id": "ECG-ICU-001",
        "device_features": {"Battery_Level": 95, "Previous_Battery_Level": 96, "Device_Type": "ECG Monitor", "Operating_System": "FreeRTOS"},
        "network_features": {"Network_Flow_Jitter": 0.01, "Inter_Arrival_Time": 1.0, "Packet_Loss": 0.0}
    }
    res = client.post("/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "trust_score" in data
    assert "device_trust_subscore" in data
    assert "data_authenticity_subscore" in data
    
    expected_score = round(0.45 * data["device_trust_subscore"] + 0.55 * data["data_authenticity_subscore"], 2)
    assert abs(data["trust_score"] - expected_score) <= 0.2

def test_trust_decision_boundaries(client: TestClient):
    """
    Verify strict decision boundaries:
    - >= 80: Accept
    - 50 - 79.9: Monitor
    - < 50: Isolate
    """
    res = client.post("/evaluate", json={
        "device_id": "ECG-ICU-001",
        "device_features": {"Battery_Level": 98, "Previous_Battery_Level": 99, "Device_Type": "ECG Monitor"},
        "network_features": {"Network_Flow_Jitter": 0.005, "Packet_Loss": 0.0}
    })
    assert res.status_code == 200
    data = res.json()
    assert data["decision"] in ["Accept", "Monitor", "Isolate"]
    if data["trust_score"] >= 80:
        assert data["decision"] == "Accept"
    elif data["trust_score"] >= 50:
        assert data["decision"] == "Monitor"
    else:
        assert data["decision"] == "Isolate"
