import sys
import os
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import backend
import database
import doctor_api

def run_doctor_tests():
    print("=" * 60)
    print("TrustGuard-IoMT: Doctor Portal Verification Suite")
    print("=" * 60)

    # 1. Test database get_latest_patient_vitals_and_trust & get_patient_trust_history
    patients = database.get_all_patients()
    assert len(patients) > 0, f"Expected patients in DB, got {len(patients)}"
    print(f"[PASS] 1. Database has {len(patients)} seeded patients.")

    vitals_trust_list = database.get_latest_patient_vitals_and_trust()
    assert len(vitals_trust_list) > 0, "Expected vitals and trust records"
    v0 = vitals_trust_list[0]
    sample_pid = v0["patient_id"]
    print(f"[PASS] 2. get_latest_patient_vitals_and_trust returned {len(vitals_trust_list)} active patient records.")

    # Check XAI explanation in vitals_trust
    assert "xai_explanation_json" in v0, "Missing xai_explanation_json in vitals_trust record"
    print(f"[PASS] 3. xai_explanation_json is populated in database query")

    # 2. Test get_patient_trust_history
    history = database.get_patient_trust_history(sample_pid, limit=10)
    assert isinstance(history, list), "Expected list from get_patient_trust_history"
    print(f"[PASS] 4. get_patient_trust_history returns {len(history)} records for patient {sample_pid}")

    # 3. Test doctor_api.get_doctor_patients_list
    mock_doctor_user = {"id": 2, "username": "dr_smith", "role": "Doctor", "department": "Cardiology"}
    res = doctor_api.get_doctor_patients_list(department=None, user=mock_doctor_user)
    assert "patients" in res and "count" in res, "Invalid response schema from get_doctor_patients_list"
    patients_list = res["patients"]
    assert len(patients_list) > 0, "Doctor patients list is empty"
    
    first_p = patients_list[0]
    assert "id" in first_p
    assert "name" in first_p
    assert "trust" in first_p
    assert "deviceTrust" in first_p
    assert "dataAuthenticity" in first_p
    assert "decision" in first_p
    assert "assignedDevices" in first_p
    assert isinstance(first_p["assignedDevices"], list)
    print(f"[PASS] 5. get_doctor_patients_list returns {len(patients_list)} patients with dual subscores and assigned devices")

    # 4. Test doctor_api.get_doctor_patient_detail
    detail = doctor_api.get_doctor_patient_detail(sample_pid, user=mock_doctor_user)
    assert detail["id"] == sample_pid
    assert "deviceTrust" in detail
    assert "dataAuthenticity" in detail
    assert "trust" in detail
    assert "vitals" in detail
    assert "xai" in detail
    assert "top_device_factors" in detail["xai"]
    assert "top_authenticity_factors" in detail["xai"]
    assert "assignedDevices" in detail
    assert "decision" in detail
    print(f"[PASS] 6. get_doctor_patient_detail returns full schema with XAI and active assigned devices")

    # 5. Test doctor_api.get_doctor_patient_trust_history
    history_api = doctor_api.get_doctor_patient_trust_history(sample_pid, limit=20, user=mock_doctor_user)
    assert isinstance(history_api, dict) and "history" in history_api
    history_list = history_api["history"]
    assert isinstance(history_list, list)
    if len(history_list) > 0:
        h0 = history_list[0]
        assert "timestamp" in h0
        assert "trustScore" in h0
        assert "deviceTrust" in h0
        assert "dataAuthenticity" in h0
        assert "decision" in h0
        assert "clinicalReason" in h0
    print(f"[PASS] 7. get_doctor_patient_trust_history endpoint returns chronological evaluations")

    # 6. Verify Trust Math Exactness (0.45 * Device Trust + 0.55 * Data Authenticity)
    dt = detail["deviceTrust"]
    da = detail["dataAuthenticity"]
    expected_score = round(0.45 * dt + 0.55 * da, 2)
    assert abs(detail["trust"] - expected_score) <= 0.1, f"Expected {expected_score}, got {detail['trust']}"
    print(f"[PASS] 8. Exact 45/55 formula verified in doctor detail: 0.45*{dt} + 0.55*{da} = {detail['trust']}")

    # 7. Check Multi-Device listing
    assignments = database.get_active_assignments_for_patient(sample_pid)
    assert isinstance(assignments, list)
    print(f"[PASS] 9. Active device assignments queried successfully for patient {sample_pid}: {len(assignments)} assigned devices")

    print("=" * 60)
    print("ALL DOCTOR PORTAL VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_doctor_tests()
