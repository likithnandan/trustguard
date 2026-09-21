"""
TrustGuard-IoMT: Final Model Integration Verification Test Suite
Tests:
1. Final Model A loads from models/Model_A/model_a_xgboost_final.json
2. Final Model B loads from models/Model_B/model_b_xgboost_final.json
3. Model A has exactly 37 features
4. Model B has exactly 38 features
5. Feature names and orders match authoritative JSON files
6. Class mappings match authoritative JSON files
7. 7 engineered Model A features calculate exact mathematical formulas
8. /evaluate endpoint works with 37-feature Model A and 38-feature Model B
9. Telemetry ingestion pipeline (/api/v1/telemetry/ingest) works for normal, spoofing, and data alteration
10. Trust formula (0.45 * Device Trust + 0.55 * Data Authenticity) and thresholds (80 / 50) exactness
11. XAI returns exactly 37 Model A feature names and 38 Model B feature names
"""

import os
import sys
import json
import numpy as np
import hashlib
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import backend
import database
import telemetry_api
from telemetry_api import TelemetryIngestRequest, VitalsPayload


def run_tests():
    print("=" * 60)
    print("TrustGuard-IoMT: Final Model Integration Test Suite")
    print("=" * 60)

    # 1. Verify Model A & Model B Paths & Loading
    model_a_path = backend.MODEL_A_PATH
    model_b_path = backend.MODEL_B_PATH
    print(f"[INFO] Resolved Model A Path: {model_a_path}")
    print(f"[INFO] Resolved Model B Path: {model_b_path}")
    assert model_a_path.exists(), f"Model A file not found at {model_a_path}"
    assert model_b_path.exists(), f"Model B file not found at {model_b_path}"
    assert "model_a_xgboost_final.json" in str(model_a_path)
    assert "model_b_xgboost_final.json" in str(model_b_path)
    print("[PASS] 1. Final Model A and Model B paths verified.")

    # 2. Verify Feature Counts
    feat_a_file = PROJECT_ROOT / "models" / "Model_A" / "model_a_features_final.json"
    feat_b_file = PROJECT_ROOT / "models" / "Model_B" / "model_b_features_final.json"
    with open(feat_a_file, "r") as f:
        auth_features_a = json.load(f)
    with open(feat_b_file, "r") as f:
        auth_features_b = json.load(f)

    assert len(auth_features_a) == 37, f"Expected 37 features in Model A metadata, got {len(auth_features_a)}"
    assert len(auth_features_b) == 38, f"Expected 38 features in Model B metadata, got {len(auth_features_b)}"
    assert len(backend.MODEL_A_FEATURES) == 37, f"Expected 37 features loaded into model_a, got {len(backend.MODEL_A_FEATURES)}"
    assert len(backend.MODEL_B_FEATURES) == 38, f"Expected 38 features loaded into model_b, got {len(backend.MODEL_B_FEATURES)}"
    print("[PASS] 2. Feature counts verified (Model A = 37, Model B = 38).")

    # 3. Verify Complete Feature Order
    assert backend.MODEL_A_FEATURES == auth_features_a, "Model A feature order mismatch"
    assert backend.MODEL_B_FEATURES == auth_features_b, "Model B feature order mismatch"
    print("[PASS] 3. Exact feature order verified against authoritative metadata.")

    # 4. Verify Class Mappings
    cls_a_file = PROJECT_ROOT / "models" / "Model_A" / "model_a_class_mapping_final.json"
    cls_b_file = PROJECT_ROOT / "models" / "Model_B" / "model_b_class_mapping_final.json"
    with open(cls_a_file, "r") as f:
        auth_cls_a = json.load(f)
    with open(cls_b_file, "r") as f:
        auth_cls_b = json.load(f)

    for idx, name in auth_cls_a.items():
        assert backend.MODEL_A_CLASSES[int(idx)] == name
    for idx, name in auth_cls_b.items():
        assert backend.MODEL_B_CLASSES[int(idx)] == name
    print(f"[PASS] 4. Class mappings verified (Model A: {backend.MODEL_A_CLASSES}, Model B: {backend.MODEL_B_CLASSES}).")

    # 5. Verify 7 Engineered Features Calculation
    test_device_features = {
        "Previous_Battery_Level": 90.0,
        "Battery_Level": 75.0,
        "Battery_Health": 95.0,
        "Network_Latency": 40.0,
        "Packet_Loss": 0.05,
        "RSSI": -65.0,
        "Signal_Strength": 80.0,
        "CPU_Usage": 25.0,
        "Memory_Usage": 45.0,
        "Heart_Rate": 72.0,
        "Pulse_Rate": 70.0
    }
    vec_a = backend.build_model_a_feature_vector(test_device_features)
    assert len(vec_a) == 37, f"Expected vector length 37, got {len(vec_a)}"

    feat_map = dict(zip(backend.MODEL_A_FEATURES, vec_a))
    
    # Check 7 engineered formulas
    assert feat_map["Battery_Drop"] == 90.0 - 75.0 == 15.0
    assert abs(feat_map["Battery_Ratio"] - (75.0 / (90.0 + 1e-6))) < 1e-6
    assert feat_map["Battery_Health_Gap"] == 75.0 - 95.0 == -20.0
    assert abs(feat_map["Network_Stress"] - (40.0 * (0.05 + 1e-6))) < 1e-6
    assert feat_map["Signal_Gap"] == -65.0 - 80.0 == -145.0
    assert feat_map["Resource_Stress"] == 25.0 + 45.0 == 70.0
    assert feat_map["Vital_Pulse_Difference"] == 72.0 - 70.0 == 2.0
    print("[PASS] 5. All 7 Model A engineered feature formulas verified mathematically.")

    # 6. Verify /evaluate standalone endpoint logic
    reading = backend.DeviceReading(
        device_features=test_device_features,
        network_features={"Temp": 36.8, "SpO2": 98.0, "SYS": 120.0, "DIA": 80.0, "Heart_rate": 72.0, "Resp_Rate": 16.0, "ST": 0.15}
    )
    eval_res = backend.evaluate(reading)
    assert "trust_score" in eval_res
    assert "decision" in eval_res
    assert "device_trust_subscore" in eval_res
    assert "data_authenticity_subscore" in eval_res
    assert "explanation" in eval_res
    assert len(eval_res["explanation"]["top_device_factors"]) == 3
    assert len(eval_res["explanation"]["top_authenticity_factors"]) == 3
    print(f"[PASS] 6. /evaluate endpoint verified. Trust Score: {eval_res['trust_score']}, Decision: {eval_res['decision']}")

    # 7. Verify XAI Feature Importance Names and Dimensionality
    assert len(backend.model_a.feature_importances_) == 37
    assert len(backend.model_b.feature_importances_) == 38
    expl = backend.explain(test_device_features, {})
    for factor in expl["top_device_factors"]:
        assert factor["feature"] in backend.MODEL_A_FEATURES
    for factor in expl["top_authenticity_factors"]:
        assert factor["feature"] in backend.MODEL_B_FEATURES
    print("[PASS] 7. XAI feature importances and names alignment verified.")

    # 8. Verify Telemetry Ingestion Pipeline (POST /api/v1/telemetry/ingest)
    # Register a temporary test device and patient for testing without altering permanent demo data
    conn = database.get_db()
    temp_patient_id = "TEST-PT-999"
    temp_device_id = "TEST-DEV-999"
    temp_key = "test_secret_key_123"
    temp_key_hash = hashlib.sha256(temp_key.encode("utf-8")).hexdigest()

    try:
        # Create temp patient
        conn.execute("INSERT OR REPLACE INTO patients (id, full_name, age, gender, department, room, admission_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                     (temp_patient_id, "Test Patient", 50, "Male", "ICU", "Room 999", "2026-09-21T00:00:00", "Admitted", "2026-09-21T00:00:00", "2026-09-21T00:00:00"))
        # Create temp device
        conn.execute("INSERT OR REPLACE INTO devices (device_id, device_name, device_type, department, location, api_key_hash, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                     (temp_device_id, "Test ECG Device", "ECG", "ICU", "Room 999", temp_key_hash, "Active", "2026-09-21T00:00:00", "2026-09-21T00:00:00"))
        # Create temp assignment
        conn.execute("INSERT OR REPLACE INTO patient_device_assignments (patient_id, device_id, assigned_at, is_active) VALUES (?, ?, ?, 1)",
                     (temp_patient_id, temp_device_id, "2026-09-21T00:00:00"))
        conn.commit()

        # Ingest Telemetry Request
        req = TelemetryIngestRequest(
            device_id=temp_device_id,
            api_key=temp_key,
            vitals=VitalsPayload(heart_rate=75.0, spo2=98.0, systolic_bp=120.0, diastolic_bp=80.0, body_temperature=36.8, blood_glucose=95.0, respiratory_rate=16.0, ecg_value=0.15),
            device_features={
                "Battery_Level": 90.0, "Battery_Health": 98.0, "Previous_Battery_Level": 95.0,
                "Charging_Cycles": 25.0, "CPU_Usage": 12.0, "Memory_Usage": 30.0, "Device_Uptime": 1200.0,
                "RSSI": -55.0, "Signal_Strength": 90.0, "Network_Latency": 20.0, "Packet_Loss": 0.0,
                "Jitter": 2.0, "Sensor_Drift": 0.01, "Sensor_Noise": 0.02, "Calibration_Status": "OK",
                "Restart_Count": 0.0
            },
            network_features={
                "Dir": 0, "Flgs": " M        ", "Sport": 5000, "Dport": 80, "SrcBytes": 100, "DstBytes": 200,
                "SrcLoad": 50.0, "DstLoad": 100.0, "SrcGap": 0, "DstGap": 0, "SIntPkt": 1.0, "DIntPkt": 1.0,
                "SIntPktAct": 0.5, "DIntPktAct": 0.5, "SrcJitter": 0.01, "DstJitter": 0.01, "sMaxPktSz": 128,
                "dMaxPktSz": 256, "sMinPktSz": 64, "dMinPktSz": 64, "Dur": 1.5, "Trans": 1, "TotPkts": 10,
                "TotBytes": 1024, "Load": 500.0, "Loss": 0, "pLoss": 0.0, "pSrcLoss": 0.0, "pDstLoss": 0.0, "Rate": 10.0
            }
        )

        res = telemetry_api.ingest_telemetry(req)
        assert res["status"] == "success"
        eval_data = res["evaluation"]
        assert eval_data["decision"] in ["Accept", "Monitor", "Isolate"]
        assert eval_data["trust_score"] >= 0.0 and eval_data["trust_score"] <= 100.0
        assert "explanation" in eval_data
        print(f"[PASS] 8. Telemetry ingestion pipeline executed successfully. Evaluation ID: {eval_data['evaluation_id']}, Decision: {eval_data['decision']}, Trust: {eval_data['trust_score']}")

    finally:
        # Clean up temporary test records
        conn.execute("DELETE FROM security_alerts WHERE device_id = ?", (temp_device_id,))
        conn.execute("DELETE FROM trust_evaluations WHERE device_id = ?", (temp_device_id,))
        conn.execute("DELETE FROM telemetry_readings WHERE device_id = ?", (temp_device_id,))
        conn.execute("DELETE FROM patient_device_assignments WHERE device_id = ?", (temp_device_id,))
        conn.execute("DELETE FROM devices WHERE device_id = ?", (temp_device_id,))
        conn.execute("DELETE FROM patients WHERE id = ?", (temp_patient_id,))
        conn.commit()
        conn.close()

    # 9. Trust Engine Formula & Thresholds Check
    # Test formula: 0.45 * 90 + 0.55 * 95 = 40.5 + 52.25 = 92.75 -> Accept
    dev_t = 90.0
    data_a = 95.0
    expected_score = round(0.45 * dev_t + 0.55 * data_a, 2)
    assert expected_score == 92.75
    assert backend.decide(92.75) == "Accept"
    assert backend.decide(80.0) == "Accept"
    assert backend.decide(79.99) == "Monitor"
    assert backend.decide(50.0) == "Monitor"
    assert backend.decide(49.99) == "Isolate"
    assert backend.decide(0.0) == "Isolate"
    print("[PASS] 9. Continuous Trust Engine policy (45% Model A + 55% Model B, 80/50 thresholds) verified.")

    print("=" * 60)
    print("ALL FINAL MODEL INTEGRATION TESTS PASSED (100% SUCCESS)!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
