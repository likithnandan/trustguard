import pytest
import hashlib
from fastapi.testclient import TestClient
import database

def test_telemetry_ingestion_nominal(client: TestClient):
    """Verify live telemetry packet ingestion."""
    # 1. Setup test patient and device
    test_patient_id = "TEST-PT-999"
    test_device_id = "TEST-DEV-999"
    raw_key = "test_secret_api_key_999"
    key_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    if not database.get_patient_by_id(test_patient_id):
        database.create_patient(
            patient_id=test_patient_id,
            full_name="Test Patient 999",
            age=45,
            gender="Male",
            room="ICU-99",
            department="ICU"
        )

    if not database.get_device_by_id(test_device_id):
        database.create_device(
            device_id=test_device_id,
            device_name="Test ECG Monitor",
            device_type="ECG",
            location="ICU-99",
            api_key_hash=key_hash,
            department="ICU"
        )
    else:
        database.update_device(test_device_id, api_key_hash=key_hash, status="Active")

    database.assign_device_to_patient(patient_id=test_patient_id, device_id=test_device_id)

    payload = {
        "device_id": test_device_id,
        "api_key": raw_key,
        "vitals": {
            "heart_rate": 74.0,
            "spo2": 98.5,
            "systolic_bp": 120.0,
            "diastolic_bp": 80.0,
            "body_temperature": 37.0
        },
        "device_features": {
            "Battery_Level": 92.0,
            "Previous_Battery_Level": 93.0,
            "Device_Type": "ECG"
        },
        "network_features": {
            "Network_Flow_Jitter": 0.01,
            "Packet_Loss": 0.0
        }
    }
    res = client.post("/api/v1/telemetry/ingest", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "evaluation" in data
    assert "trust_score" in data["evaluation"]
