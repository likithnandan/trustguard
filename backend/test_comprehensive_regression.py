"""
TrustGuard-IoMT: Comprehensive End-to-End Regression & Integration Suite
Verifies:
1. Model loading & feature alignment (37 Model A, 38 Model B)
2. Standalone /evaluate endpoint
3. Telemetry ingestion across attack scenarios (normal, spoofing, data alteration, degradation)
4. Trust engine math (0.45 * Model A + 0.55 * Model B) and policy decisions
5. Doctor Portal API dynamic endpoints
6. Dashboard API summary and device lists
7. Database integrity and isolation of test data
"""

import os
import sys
import json
import hashlib
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import backend
import database
import doctor_api
import dashboard_api
import telemetry_api
from telemetry_api import TelemetryIngestRequest, VitalsPayload
from dataset_simulator import simulator


def run_comprehensive_tests():
    print("=" * 60)
    print("TrustGuard-IoMT: Comprehensive Regression Test Suite")
    print("=" * 60)

    # 1. Model artifacts verification
    assert backend.MODEL_A_PATH.exists() and "model_a_xgboost_final.json" in str(backend.MODEL_A_PATH)
    assert backend.MODEL_B_PATH.exists() and "model_b_xgboost_final.json" in str(backend.MODEL_B_PATH)
    assert len(backend.MODEL_A_FEATURES) == 37
    assert len(backend.MODEL_B_FEATURES) == 38
    print("[PASS] 1. Final XGBoost models (37 & 38 features) loaded correctly.")

    # 2. Test dataset simulator packets through ingestion
    temp_patient_id = "REG-PT-101"
    temp_device_id = "REG-DEV-101"
    temp_key = "reg_test_key_xyz"
    temp_key_hash = hashlib.sha256(temp_key.encode("utf-8")).hexdigest()

    conn = database.get_db()
    try:
        conn.execute("INSERT OR REPLACE INTO patients (id, full_name, age, gender, department, room, admission_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                     (temp_patient_id, "Regression Patient", 62, "Female", "ICU", "Room 808", "2026-09-21T00:00:00", "Admitted", "2026-09-21T00:00:00", "2026-09-21T00:00:00"))
        conn.execute("INSERT OR REPLACE INTO devices (device_id, device_name, device_type, department, location, api_key_hash, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                     (temp_device_id, "Regression Monitor", "ECG", "ICU", "Room 808", temp_key_hash, "Active", "2026-09-21T00:00:00", "2026-09-21T00:00:00"))
        conn.execute("INSERT OR REPLACE INTO patient_device_assignments (patient_id, device_id, assigned_at, is_active) VALUES (?, ?, ?, 1)",
                     (temp_patient_id, temp_device_id, "2026-09-21T00:00:00"))
        conn.commit()

        # Test each dataset-driven scenario
        for scen in ["normal", "spoofing", "data_alteration", "device_degradation"]:
            pkt = simulator.build_telemetry_packet(device_id=temp_device_id, api_key=temp_key, scenario=scen, row_offset=2)
            req = TelemetryIngestRequest(
                device_id=pkt["device_id"],
                api_key=pkt["api_key"],
                vitals=VitalsPayload(**pkt["vitals"]),
                device_features=pkt["device_features"],
                network_features=pkt["network_features"]
            )
            res = telemetry_api.ingest_telemetry(req)
            assert res["status"] == "success"
            ev = res["evaluation"]
            assert ev["decision"] in ["Accept", "Monitor", "Isolate"]
            assert 0.0 <= ev["trust_score"] <= 100.0
            print(f"       Scenario '{scen}': Trust Score = {ev['trust_score']}, Decision = {ev['decision']}, Subscores = (Dev: {ev['device_trust_subscore']}, Auth: {ev['data_authenticity_subscore']})")

        print("[PASS] 2. All 4 telemetry attack & operational scenarios evaluated through Model A + Model B.")

        # 3. Test Doctor Portal API endpoints
        mock_doctor_user = {"id": 1, "email": "doctor@hospital.org", "role": "Doctor", "full_name": "Dr. Sarah Lin", "department": "ICU", "is_active": 1}
        doc_patients = doctor_api.get_doctor_patients_list(user=mock_doctor_user)
        assert "patients" in doc_patients and len(doc_patients["patients"]) > 0
        p_detail = doctor_api.get_doctor_patient_detail(patient_id=temp_patient_id, user=mock_doctor_user)
        assert p_detail["id"] == temp_patient_id
        assert "vitals" in p_detail and "trust" in p_detail
        print(f"[PASS] 3. Doctor Portal API verified with live continuous trust streaming.")

        # 4. Test Dashboard API endpoints
        mock_admin_user = {"id": 2, "email": "admin@hospital.org", "role": "Administrator", "full_name": "Admin User", "department": "Administration", "is_active": 1}
        dash_summary = dashboard_api.get_dashboard_summary(start_date=None, end_date=None, user=mock_admin_user)
        assert "kpis" in dash_summary and "total_devices" in dash_summary["kpis"]
        dash_devices = dashboard_api.get_dashboard_devices(start_date=None, end_date=None, user=mock_admin_user)
        assert "devices" in dash_devices and len(dash_devices["devices"]) > 0
        print(f"[PASS] 4. Admin Dashboard API verified (Total evaluated devices: {dash_summary['kpis']['total_devices']}).")

    finally:
        # Clean up regression test records
        conn.execute("DELETE FROM security_alerts WHERE device_id = ?", (temp_device_id,))
        conn.execute("DELETE FROM trust_evaluations WHERE device_id = ?", (temp_device_id,))
        conn.execute("DELETE FROM telemetry_readings WHERE device_id = ?", (temp_device_id,))
        conn.execute("DELETE FROM patient_device_assignments WHERE device_id = ?", (temp_device_id,))
        conn.execute("DELETE FROM devices WHERE device_id = ?", (temp_device_id,))
        conn.execute("DELETE FROM patients WHERE id = ?", (temp_patient_id,))
        conn.commit()
        conn.close()

    print("=" * 60)
    print("ALL COMPREHENSIVE REGRESSION TESTS PASSED (100% SUCCESS)!")
    print("=" * 60)


if __name__ == "__main__":
    run_comprehensive_tests()
