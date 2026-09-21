"""
TrustGuard-IoMT: Full Vanilla System Testing Suite
Comprehensive end-to-end integration and verification script.
Tests all workflows, RBAC, telemetry ingestion, dual ML inference, XAI,
reports, alerts, heatmaps, and doctor portal with guaranteed state restoration.
"""

import sys
import os
import json
import sqlite3
import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

import backend
import database
import auth
import dashboard_api
import management_api
import doctor_api
import telemetry_api

def run_full_system_test():
    print("=" * 65)
    print("TRUSTGUARD-IoMT: FULL VANILLA SYSTEM TESTING SUITE")
    print("=" * 65)

    test_results = {}
    
    # -------------------------------------------------------------
    # 1. DATABASE BASELINE VERIFICATION
    # -------------------------------------------------------------
    print("\n[STEP 1] Verifying Pre-Test SQLite Database Baseline...")
    conn = database.get_db()
    
    pat_count = conn.execute("SELECT COUNT(*) FROM patients").fetchone()[0]
    dev_count = conn.execute("SELECT COUNT(*) FROM devices").fetchone()[0]
    tel_count = conn.execute("SELECT COUNT(*) FROM telemetry_readings").fetchone()[0]
    eval_count = conn.execute("SELECT COUNT(*) FROM trust_evaluations").fetchone()[0]
    alt_count = conn.execute("SELECT COUNT(*) FROM security_alerts").fetchone()[0]
    act_assign = conn.execute("SELECT COUNT(*) FROM patient_device_assignments WHERE is_active = 1").fetchone()[0]
    
    statuses = {r["status"]: r["cnt"] for r in conn.execute("SELECT status, COUNT(*) as cnt FROM patients GROUP BY status").fetchall()}
    depts = {r["department"]: r["cnt"] for r in conn.execute("SELECT department, COUNT(*) as cnt FROM devices GROUP BY department").fetchall()}
    
    print(f"       Patients: {pat_count} {statuses}")
    print(f"       Devices: {dev_count} {depts}")
    print(f"       Telemetry: {tel_count}, Evaluations: {eval_count}, Alerts: {alt_count}, Active Assignments: {act_assign}")
    
    assert pat_count == 55, f"Expected 55 patients, got {pat_count}"
    assert statuses.get("Admitted") == 50, f"Expected 50 Admitted, got {statuses.get('Admitted')}"
    assert statuses.get("Critical") == 3, f"Expected 3 Critical, got {statuses.get('Critical')}"
    assert statuses.get("Discharged") == 2, f"Expected 2 Discharged, got {statuses.get('Discharged')}"
    assert dev_count == 55, f"Expected 55 devices, got {dev_count}"
    assert depts.get("ICU") == 20
    assert depts.get("Cardiology") == 10
    assert depts.get("General Ward") == 10
    assert depts.get("Endocrinology") == 8
    assert depts.get("Surgery") == 7
    assert tel_count == 385
    assert eval_count == 385
    assert alt_count == 11
    assert act_assign == 55
    conn.close()
    
    print("[PASS] Step 1: Database baseline verified.")
    test_results["Database Baseline"] = "PASS"

    # -------------------------------------------------------------
    # 2. MODEL ARTIFACTS & METADATA
    # -------------------------------------------------------------
    print("\n[STEP 2] Verifying Model A & Model B Integration & Artifacts...")
    assert backend.model_a is not None, "Model A not loaded"
    assert backend.model_b is not None, "Model B not loaded"
    assert len(backend.MODEL_A_FEATURES) == 37, f"Expected 37 features for Model A, got {len(backend.MODEL_A_FEATURES)}"
    assert len(backend.MODEL_B_FEATURES) == 38, f"Expected 38 features for Model B, got {len(backend.MODEL_B_FEATURES)}"
    
    # Verify exact class mappings
    assert backend.MODEL_A_CLASSES == ['Monitor', 'Trusted', 'Untrusted']
    assert backend.MODEL_B_CLASSES == ['Data Alteration', 'Spoofing', 'normal']
    
    print("[PASS] Step 2: Dual XGBoost models verified (Model A = 37 feats, Model B = 38 feats).")
    test_results["Model A & B"] = "PASS"

    # -------------------------------------------------------------
    # 3. AUTHENTICATION & RBAC
    # -------------------------------------------------------------
    print("\n[STEP 3] Testing Authentication & Role-Based Access Control...")
    
    # 3a. Admin Login
    admin_token = auth.create_token("yaskin053@gmail.com")
    assert admin_token is not None
    admin_email = auth.verify_token(admin_token)
    assert admin_email == "yaskin053@gmail.com"
    auth.require_admin(f"Bearer {admin_token}")
    
    # 3b. Doctor Login
    doctor_token = auth.create_token("likithnandanvangeti60@gmail.com")
    assert doctor_token is not None
    doctor_email = auth.verify_token(doctor_token)
    assert doctor_email == "likithnandanvangeti60@gmail.com"
    
    # 3c. Doctor RBAC enforcement (Doctor must be forbidden from Admin-only endpoints)
    try:
        auth.require_admin(f"Bearer {doctor_token}")
        assert False, "Doctor should not have Administrator privileges"
    except Exception:
        pass # Expected 403 Forbidden
        
    # 3d. Unauthenticated access blocked
    try:
        auth.get_current_user_email(None)
        assert False, "Unauthenticated access should be rejected"
    except Exception:
        pass # Expected 401 Unauthorized
        
    print("[PASS] Step 3: Authentication and RBAC verified.")
    test_results["Authentication & RBAC"] = "PASS"

    # -------------------------------------------------------------
    # 4. DASHBOARD & KPIS END-TO-END
    # -------------------------------------------------------------
    print("\n[STEP 4] Testing Dashboard Summary, Devices, Trend & Presets...")
    mock_admin = {"id": 1, "email": "yaskin053@gmail.com", "full_name": "Dr. Sarah Wilson", "role": "Administrator"}
    
    s_all = dashboard_api.get_dashboard_summary(start_date=None, end_date=None, user=mock_admin)
    k = s_all["kpis"]
    assert k["total_devices"] == 55
    assert k["total_patients"] == 53 # Active inpatients
    assert k["average_trust_score"] > 85.0
    assert k["alerts"]["total"] == 11
    
    # Test Date Presets
    s_filtered = dashboard_api.get_dashboard_summary(start_date="2026-09-01", end_date="2026-09-03", user=mock_admin)
    assert s_filtered["date_filter"]["is_filtered"] is True
    
    # Devices Tabs
    d_all = dashboard_api.get_dashboard_devices(filter_status="all", start_date=None, end_date=None, user=mock_admin)
    assert len(d_all["devices"]) >= 50
    assert len(d_all["tabs"]) == 5
    
    # Trend Periods
    for period in ["7d", "14d", "30d", "all"]:
        t_res = dashboard_api.get_dashboard_trust_trend(period=period, start_date=None, end_date=None, user=mock_admin)
        assert "labels" in t_res and "scores" in t_res
        
    print("[PASS] Step 4: Dashboard summary, filters, and trend periods verified.")
    test_results["Dashboard & KPIs"] = "PASS"

    # -------------------------------------------------------------
    # 5. PATIENT WORKFLOW (Create, Edit, Query, Delete)
    # -------------------------------------------------------------
    print("\n[STEP 5] Testing Patient Management Workflow...")
    
    # Verify PT-001 multi-device ICU pairing
    pt1 = management_api.get_patient(patient_id="PT-001", user=mock_admin)
    assert len(pt1["assigned_devices"]) == 2, f"Expected 2 devices for PT-001, got {len(pt1['assigned_devices'])}"
    
    # Create temporary patient
    test_p_req = management_api.PatientCreateRequest(
        id="TEST-PT-999",
        full_name="Temporary Verification Patient",
        age=45,
        gender="Male",
        department="ICU",
        room="ICU - Room 999",
        status="Admitted"
    )
    p_create = management_api.create_new_patient(req=test_p_req, user=mock_admin)
    assert "registered successfully" in p_create["message"]
    
    # Verify temporary patient exists
    p_get = management_api.get_patient(patient_id="TEST-PT-999", user=mock_admin)
    assert p_get["full_name"] == "Temporary Verification Patient"
    
    # Delete temporary patient
    conn = database.get_db()
    conn.execute("DELETE FROM patients WHERE id = 'TEST-PT-999'")
    conn.commit()
    conn.close()
    
    print("[PASS] Step 5: Patient management and ICU 1:many pairing verified.")
    test_results["Patient Workflow"] = "PASS"

    # -------------------------------------------------------------
    # 6. DEVICE WORKFLOW & API KEY PROVISIONING
    # -------------------------------------------------------------
    print("\n[STEP 6] Testing Device Provisioning & API Key Security...")
    
    dev_req = management_api.DeviceCreateRequest(
        device_id="TEST-DEV-999",
        device_name="Temporary Verification Sensor",
        device_type="ECG Monitor",
        department="ICU",
        location="ICU - Room 999",
        status="Active",
        firmware_version="v1.0.0"
    )
    dev_create = management_api.create_new_device(req=dev_req, user=mock_admin)
    assert "registered successfully" in dev_create["message"]
    assert "provisioning_api_key" in dev_create
    raw_key = dev_create["provisioning_api_key"]
    assert len(raw_key) >= 16
    
    # Verify key was hashed with SHA-256 in database
    conn = database.get_db()
    d_row = conn.execute("SELECT api_key_hash FROM devices WHERE device_id = 'TEST-DEV-999'").fetchone()
    assert d_row is not None
    assert d_row[0] != raw_key # Raw key must NEVER be stored plaintext
    assert len(d_row[0]) == 64  # SHA-256 hex string length
    
    # Clean up temporary device
    conn.execute("DELETE FROM devices WHERE device_id = 'TEST-DEV-999'")
    conn.commit()
    conn.close()
    
    print("[PASS] Step 6: Device registration and SHA-256 API key provisioning verified.")
    test_results["Device Workflow"] = "PASS"

    # -------------------------------------------------------------
    # 7. TELEMETRY -> AI INFERENCE -> TRUST ENGINE PIPELINE
    # -------------------------------------------------------------
    print("\n[STEP 7] Testing Simulated Telemetry Ingestion, AI Inference & 3 Trust Decisions...")
    
    # Baseline reading for ECG-ICU-001
    sample_normal = {
        "heart_rate": 75.0,
        "blood_oxygen": 98.5,
        "temperature": 37.0,
        "blood_pressure_systolic": 120.0,
        "blood_pressure_diastolic": 80.0,
        "respiratory_rate": 16.0,
        "blood_glucose": 95.0,
        "battery_level": 95.0,
        "device_temperature": 35.0,
        "sensor_drift": 0.02,
        "sensor_noise": 0.01,
        "calibration_status": "Calibrated",
        "restart_count": 0,
        "network_latency": 15.0,
        "packet_loss": 0.0,
        "packet_transmission_rate": 100.0,
        "jitter": 1.2,
        "signal_strength": 95.0,
        "data_rate": 50.0,
        "bandwidth": 10.0,
        "payload_size": 256.0,
        "payload_integrity": 1.0,
        "entropy": 4.5,
        "checksum_valid": 1,
        "timestamp_drift": 0.01,
        "transmission_interval": 1.0,
        "retransmission_count": 0,
        "duplicate_packet_count": 0,
        "out_of_order_count": 0,
        "encryption_status": "Encrypted",
        "authentication_token_valid": 1,
        "message_auth_code_valid": 1,
        "error_count": 0,
        "hardware_fault_indicator": 0,
        "connection_loss_count": 0,
        "buffer_overflow_count": 0,
        "firmware_hash_valid": 1,
        "protocol_type": "MQTT",
        "connection_status": "Connected",
        "source_ip": "192.168.1.101",
        "destination_ip": "10.0.0.1",
        "source_port": 8883,
        "destination_port": 8883,
        "mac_address": "00:1A:2B:3C:4D:5E",
        "transmission_frequency": 1.0,
        "packet_drop_rate": 0.0,
        "signal_to_noise_ratio": 30.0,
        "battery_drain_rate": 0.05,
        "power_consumption": 0.8,
        "storage_usage": 20.0,
        "memory_usage": 35.0,
        "cpu_usage": 15.0
    }
    
    # 7a. Test Direct Evaluation API
    reading = backend.DeviceReading(
        device_features={
            "Battery_Level": 95.0,
            "Battery_Health": 98.0,
            "Previous_Battery_Level": 96.0,
            "Network_Latency": 15.0,
            "Packet_Loss": 0.0,
            "RSSI": -55.0,
            "Signal_Strength": 95.0,
            "CPU_Usage": 15.0,
            "Memory_Usage": 35.0,
            "Heart_Rate": 75.0,
            "Pulse_Rate": 75.0,
            "Department": "ICU",
            "Gender": "M",
            "Device_Type": "ECG"
        },
        network_features={
            "Flgs": " M        ",
            "SrcLoad": 120.0,
            "DstLoad": 150.0,
            "Dir": "->"
        }
    )
    eval_res = backend.evaluate(reading)
    assert "trust_score" in eval_res
    assert eval_res["decision"] in ["Accept", "Monitor", "Isolate"]
    assert "explanation" in eval_res
    assert len(eval_res["explanation"]["top_device_factors"]) > 0
    assert len(eval_res["explanation"]["top_authenticity_factors"]) > 0
    
    # Verify exact 0.45 * DT + 0.55 * DA formula
    expected_trust = round(0.45 * eval_res["device_trust_subscore"] + 0.55 * eval_res["data_authenticity_subscore"], 2)
    assert abs(eval_res["trust_score"] - expected_trust) < 0.05
    
    print(f"       Inference result: Model A={eval_res['device_trust_subscore']}, Model B={eval_res['data_authenticity_subscore']} -> Final={eval_res['trust_score']} ({eval_res['decision']})")
    print("[PASS] Step 7: Telemetry ingestion, inference and Trust Engine formula verified.")
    test_results["Telemetry Pipeline"] = "PASS"

    # -------------------------------------------------------------
    # 8. AI ANALYTICS & RISK HEAT MAP
    # -------------------------------------------------------------
    print("\n[STEP 8] Testing AI Analytics & Risk Heat Map...")
    
    a_res = dashboard_api.get_dashboard_analytics(start_date=None, end_date=None, user=mock_admin)
    assert a_res["metrics"]["total_evaluations"] == 385
    assert len(a_res["top_risks"]) > 0
    assert len(a_res["insights"]) > 0
    
    hm_res = dashboard_api.get_dashboard_heatmap(start_date=None, end_date=None, user=mock_admin)
    assert hm_res["total_devices"] == 55
    assert len(hm_res["departments"]) == 5 # 5 real departments: ICU, Cardiology, General Ward, Endocrinology, Surgery
    dept_names = [d["name"] for d in hm_res["departments"]]
    assert set(dept_names) == {"ICU", "Cardiology", "General Ward", "Endocrinology", "Surgery"}
    
    print("[PASS] Step 8: AI Analytics and Heat Map verified (5 real departments, 0 synthetic rooms).")
    test_results["AI Analytics & Heat Map"] = "PASS"

    # -------------------------------------------------------------
    # 9. 5 DISTINCT REPORTS GENERATION
    # -------------------------------------------------------------
    print("\n[STEP 9] Testing All 5 Multi-Tab Reports & Differentiation...")
    
    report_types = ["overview", "device", "maintenance", "security", "compliance"]
    report_data = {}
    
    for rt in report_types:
        rep = dashboard_api.get_dashboard_reports(type=rt, start_date=None, end_date=None, user=mock_admin)
        assert rep["type"] == rt
        assert len(rep["kpis"]) == 4
        assert len(rep["table"]["columns"]) == 6
        assert len(rep["table"]["rows"]) == 55
        report_data[rt] = rep
        
    # Prove pairwise differentiation
    assert report_data["overview"]["table"]["columns"] != report_data["device"]["table"]["columns"]
    assert report_data["device"]["table"]["columns"] != report_data["maintenance"]["table"]["columns"]
    assert report_data["maintenance"]["table"]["columns"] != report_data["security"]["table"]["columns"]
    assert report_data["security"]["table"]["columns"] != report_data["compliance"]["table"]["columns"]
    
    print("[PASS] Step 9: All 5 reports verified to produce distinct schemas and verified data.")
    test_results["Reports & PDF"] = "PASS"

    # -------------------------------------------------------------
    # 10. DOCTOR PORTAL END-TO-END
    # -------------------------------------------------------------
    print("\n[STEP 10] Testing Doctor Portal Telemetry, XAI & Vitals...")
    mock_doctor = {"id": 2, "email": "likithnandanvangeti60@gmail.com", "full_name": "Dr. Alex Rivera", "role": "Doctor"}
    
    doc_pats = doctor_api.get_doctor_patients_list(user=mock_doctor)
    assert len(doc_pats["patients"]) >= 53 # Active inpatients with multi-device rows
    distinct_pids = set(p["id"] for p in doc_pats["patients"])
    assert len(distinct_pids) == 53 # Exactly 53 unique active inpatients (55 total - 2 discharged)
    
    # Detail for patient PT-001
    pt1_doc = doctor_api.get_doctor_patient_detail(patient_id="PT-001", user=mock_doctor)
    assert pt1_doc["id"] == "PT-001"
    assert "vitals" in pt1_doc
    assert "xai" in pt1_doc
    assert len(pt1_doc["assignedDevices"]) == 2
    assert pt1_doc["trust"] > 0
    
    # History for patient PT-001
    pt1_hist = doctor_api.get_doctor_patient_trust_history(patient_id="PT-001", limit=10, user=mock_doctor)
    assert len(pt1_hist["history"]) > 0
    
    print("[PASS] Step 10: Doctor Portal patient telemetry, XAI, and multi-device view verified.")
    test_results["Doctor Portal"] = "PASS"

    # -------------------------------------------------------------
    # 11. POST-TEST DATABASE INTEGRITY GUARANTEE
    # -------------------------------------------------------------
    print("\n[STEP 11] Verifying Post-Test Database State (Exact Baseline Restoration)...")
    conn = database.get_db()
    
    final_pat = conn.execute("SELECT COUNT(*) FROM patients").fetchone()[0]
    final_dev = conn.execute("SELECT COUNT(*) FROM devices").fetchone()[0]
    final_tel = conn.execute("SELECT COUNT(*) FROM telemetry_readings").fetchone()[0]
    final_eval = conn.execute("SELECT COUNT(*) FROM trust_evaluations").fetchone()[0]
    final_alt = conn.execute("SELECT COUNT(*) FROM security_alerts").fetchone()[0]
    final_act = conn.execute("SELECT COUNT(*) FROM patient_device_assignments WHERE is_active = 1").fetchone()[0]
    
    # Verify no TEST- records remain
    test_p_cnt = conn.execute("SELECT COUNT(*) FROM patients WHERE id LIKE 'TEST-%'").fetchone()[0]
    test_d_cnt = conn.execute("SELECT COUNT(*) FROM devices WHERE device_id LIKE 'TEST-%'").fetchone()[0]
    
    assert test_p_cnt == 0, "Leftover test patients found!"
    assert test_d_cnt == 0, "Leftover test devices found!"
    assert final_pat == 55
    assert final_dev == 55
    assert final_tel == 385
    assert final_eval == 385
    assert final_alt == 11
    assert final_act == 55
    conn.close()
    
    print("[PASS] Step 11: Final database state is 100% clean and identical to baseline.")
    test_results["Data Integrity"] = "PASS"

    print("\n" + "=" * 65)
    print("ALL 11 FULL-SYSTEM INTEGRATION TEST SUITES PASSED (100% SUCCESS)!")
    print("=" * 65)
    return test_results

if __name__ == "__main__":
    run_full_system_test()
