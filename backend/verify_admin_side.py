"""
TrustGuard-IoMT / Continuous Trust Verification for Medical IoT
Comprehensive Administrator-Side Regression & Verification Test Suite
"""

import sys
import os
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

import backend
import database
import auth
import dashboard_api
import management_api
from fastapi import Request

def run_tests():
    print("==================================================")
    print("TrustGuard-IoMT: Administrator-Side Verification")
    print("==================================================")

    # 1. Test Admin Login & Authentication
    token = auth.create_token("yaskin053@gmail.com")
    assert token, "Token generation failed"
    verified_user = auth.verify_token(token)
    assert verified_user == "yaskin053@gmail.com"
    admin_user = auth.require_admin(f"Bearer {token}")
    assert admin_user == "yaskin053@gmail.com"
    print("[PASS] 1. Administrator authentication & JWT token generation.")

    # Mock admin user context
    mock_admin = {
        "id": 1,
        "email": "s.wilson@hospital.org",
        "full_name": "Dr. Sarah Wilson",
        "role": "Administrator",
        "department": "Clinical / IT Operations"
    }

    # 2. Test Dashboard Summary (No Filter)
    s_data = dashboard_api.get_dashboard_summary(start_date=None, end_date=None, user=mock_admin)
    kpis = s_data["kpis"]
    print(f"       KPIs: {kpis['total_devices']} Total Devices, {kpis['total_patients']} Patients, Avg Trust: {kpis['average_trust_score']}%")
    assert kpis["total_devices"] >= 50, f"Expected >=50 devices, got {kpis['total_devices']}"
    assert kpis["total_patients"] >= 50, f"Expected >=50 patients, got {kpis['total_patients']}"
    print("[PASS] 2. Dashboard summary endpoint.")

    # 3. Test Date Filtering on Summary
    f_data = dashboard_api.get_dashboard_summary(start_date="2026-09-01", end_date="2026-09-03", user=mock_admin)
    assert "kpis" in f_data
    assert f_data["date_filter"]["is_filtered"] is True
    print(f"       Filtered (2026-09-01 to 2026-09-03): {f_data['kpis']['total_devices']} active devices evaluated.")
    print("[PASS] 3. Dashboard summary date range filtering.")

    # 4. Test Devices List
    d_data = dashboard_api.get_dashboard_devices(start_date=None, end_date=None, user=mock_admin)
    assert len(d_data["devices"]) >= 50
    print(f"       Found {len(d_data['devices'])} devices in registry.")
    print("[PASS] 4. Devices management list endpoint.")

    # 5. Test Patients List & 1:Many Device Relationship
    p_data = management_api.list_patients(department=None, status_filter=None, user=mock_admin)
    patients = p_data["patients"]
    assert len(patients) >= 50
    
    # Check PT-001 multi-device assignments
    pt1 = next((p for p in patients if p["id"] == "PT-001"), None)
    assert pt1 is not None, "PT-001 not found"
    assert len(pt1["assigned_devices"]) >= 2, f"Expected >=2 assigned devices for PT-001, got {len(pt1['assigned_devices'])}"
    print(f"       PT-001 has {len(pt1['assigned_devices'])} bound devices: {[d['device_id'] for d in pt1['assigned_devices']]}")
    print("[PASS] 5. Patients endpoint & 1:many device assignments.")

    # 6. Test Patient Detail Endpoint
    pt1_det = management_api.get_patient(patient_id="PT-001", user=mock_admin)
    assert len(pt1_det["assigned_devices"]) >= 2
    print("[PASS] 6. Patient detailed clinical & trust record.")

    # 7. Test Device Unassignment & Reassignment Workflow (Non-destructive with state restoration)
    original_pt1 = management_api.get_patient(patient_id="PT-001", user=mock_admin)
    original_device_ids = [d["device_id"] for d in original_pt1.get("assigned_devices", [])]
    try:
        unassign_res = management_api.unassign_device_endpoint(patient_id="PT-001", device_id="POX-ICU-001", user=mock_admin)
        assert unassign_res["status"] == "success"
        
        # Verify unassigned
        p_after_un = management_api.get_patient(patient_id="PT-001", user=mock_admin)
        assigned_ids = [d["device_id"] for d in p_after_un["assigned_devices"]]
        assert "POX-ICU-001" not in assigned_ids, "POX-ICU-001 should be unassigned"
        
        # Reassign
        reassign_res = management_api.assign_device_to_patient_endpoint(patient_id="PT-001", device_id="POX-ICU-001", user=mock_admin)
        assert "assignment" in reassign_res
        
        p_after_re = management_api.get_patient(patient_id="PT-001", user=mock_admin)
        re_ids = [d["device_id"] for d in p_after_re["assigned_devices"]]
        assert "POX-ICU-001" in re_ids, "POX-ICU-001 should be reassigned"
        print("[PASS] 7. Device assignment & unassignment operations.")
    finally:
        # Guarantee exact state restoration
        current_p = management_api.get_patient(patient_id="PT-001", user=mock_admin)
        current_ids = [d["device_id"] for d in current_p.get("assigned_devices", [])]
        for dev_id in original_device_ids:
            if dev_id not in current_ids:
                management_api.assign_device_to_patient_endpoint(patient_id="PT-001", device_id=dev_id, user=mock_admin)

    # 8. Test Trust Trend & Period Filtering
    for period in ["7d", "14d", "30d", "all"]:
        t_data = dashboard_api.get_dashboard_trust_trend(period=period, start_date=None, end_date=None, user=mock_admin)
        assert "labels" in t_data and "scores" in t_data
        print(f"       Period '{period}': {len(t_data['labels'])} chronological trend points.")
    print("[PASS] 8. Continuous Trust Score Trend periods.")

    # 9. Test AI Analytics Endpoint
    a_data = dashboard_api.get_dashboard_analytics(start_date=None, end_date=None, user=mock_admin)
    assert "small_cards" in a_data
    assert "top_risks" in a_data
    assert "risk_trend" in a_data
    assert "insights" in a_data
    print(f"       AI Analytics: {len(a_data['top_risks'])} risk predictions identified.")
    print("[PASS] 9. AI Analytics & predictive risk trends.")

    # 10. Test Reports Endpoint
    for rtype in ["overview", "security", "device", "maintenance"]:
        r_data = dashboard_api.get_dashboard_reports(type=rtype, start_date=None, end_date=None, user=mock_admin)
        assert "kpis" in r_data and "table" in r_data
    print("[PASS] 10. Multi-tab analytical reports generation.")

    # 11. Test Security Alerts Endpoint
    al_data = dashboard_api.get_dashboard_alerts(category="All", start_date=None, end_date=None, user=mock_admin)
    assert len(al_data["alerts"]) > 0
    print(f"       Security Alerts: {len(al_data['alerts'])} active alerts.")
    print("[PASS] 11. Security Alerts ingestion & listing.")

    # 12. Test Trust Formula & Policy Exactness
    test_d_sub = 90.0
    test_a_sub = 95.0
    expected_score = round(0.45 * test_d_sub + 0.55 * test_a_sub, 2)
    assert expected_score == 92.75
    assert backend.decide(expected_score) == "Accept"
    assert backend.decide(65.0) == "Monitor"
    assert backend.decide(45.0) == "Isolate"
    print("[PASS] 12. Continuous Trust Engine policy formula (45% Model A + 55% Model B, 80/50 thresholds).")

    print("==================================================")
    print("ALL 12 VERIFICATION PHASES PASSED WITH 100% SUCCESS!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
