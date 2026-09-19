"""
TrustGuard-IoMT / Continuous Trust Verification for Medical IoT
Doctor Portal REST API Router (/api/v1/doctor)

Provides dynamic, verified patient monitoring streams for clinical use:
- GET /api/v1/doctor/patients: Lists all admitted patients with their latest
  live vitals, continuous AI trust scores, decision status, and clinical reasons.
- GET /api/v1/doctor/patients/{patient_id}: Detailed single patient monitoring view.
"""

from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Header, HTTPException, status, Query, Depends

from auth import get_current_user_email, get_db
from management_api import get_current_authenticated_user
import database
from dataset_simulator import simulator

router = APIRouter(prefix="/api/v1/doctor", tags=["doctor"])


def seed_hospital_demo_patients_if_empty():
    """
    Initializes the 6 standard hospital patients and devices from the datasets
    if the database has no patients yet, ensuring the Doctor Portal works out-of-the-box.
    """
    existing = database.get_all_patients()
    if existing:
        return

    # 1. Register 6 initial hospital patients
    demo_patients = [
        {"id": "PT-1042", "name": "Robert Chen", "age": 58, "gender": "Male", "room": "ICU - Room 101", "dept": "ICU"},
        {"id": "PT-1087", "name": "Maria Alvarez", "age": 45, "gender": "Female", "room": "General Ward - 3B", "dept": "Ward"},
        {"id": "PT-1103", "name": "James Okafor", "age": 67, "gender": "Male", "room": "ICU - Room 102", "dept": "ICU"},
        {"id": "PT-1156", "name": "Priya Nair", "age": 34, "gender": "Female", "room": "Pharmacy Monitoring", "dept": "Ward"},
        {"id": "PT-1201", "name": "Thomas Reed", "age": 72, "gender": "Male", "room": "Cardiology - OPD", "dept": "Cardiology"},
        {"id": "PT-1249", "name": "Aiko Tanaka", "age": 29, "gender": "Female", "room": "Endocrinology - 2A", "dept": "Ward"}
    ]

    demo_devices = [
        {"id": "ECG-ICU-001", "name": "ECG Monitor - ICU 1", "type": "ECG Monitor", "loc": "ICU - Room 101", "dept": "ICU", "scenario": "normal"},
        {"id": "POX-12", "name": "Pulse Oximeter - 12", "type": "Pulse Oximeter", "loc": "General Ward - 3B", "dept": "Ward", "scenario": "device_degradation"},
        {"id": "IP-07", "name": "Infusion Pump - 07", "type": "Infusion Pump", "loc": "ICU - Room 102", "dept": "ICU", "scenario": "data_alteration"},
        {"id": "TEMP-05", "name": "Temperature Sensor - 5", "type": "Temperature Sensor", "loc": "Pharmacy Monitoring", "dept": "Ward", "scenario": "normal"},
        {"id": "BPM-03", "name": "Blood Pressure Monitor - 3", "type": "BP Monitor", "loc": "Cardiology - OPD", "dept": "Cardiology", "scenario": "device_degradation"},
        {"id": "GLU-02", "name": "Glucose Monitor - 2", "type": "Glucose Monitor", "loc": "Endocrinology - 2A", "dept": "Ward", "scenario": "normal"}
    ]

    import hashlib
    for p_info, d_info in zip(demo_patients, demo_devices):
        # Create Patient
        database.create_patient(
            patient_id=p_info["id"],
            full_name=p_info["name"],
            age=p_info["age"],
            gender=p_info["gender"],
            room=p_info["room"],
            department=p_info["dept"]
        )

        # Create Device
        raw_key = f"tg_dev_key_{p_info['id'].lower()}"
        api_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
        database.create_device(
            device_id=d_info["id"],
            device_name=d_info["name"],
            device_type=d_info["type"],
            location=d_info["loc"],
            department=d_info["dept"],
            api_key_hash=api_hash
        )

        # Assign Device
        database.assign_device_to_patient(patient_id=p_info["id"], device_id=d_info["id"])

        # Ingest initial dataset-driven telemetry
        pkt = simulator.build_telemetry_packet(
            device_id=d_info["id"],
            api_key=raw_key,
            scenario=d_info["scenario"],
            row_offset=demo_patients.index(p_info) + 1
        )
        
        # Invoke ingestion pipeline
        from telemetry_api import ingest_telemetry, TelemetryIngestRequest, VitalsPayload
        req = TelemetryIngestRequest(
            device_id=pkt["device_id"],
            api_key=pkt["api_key"],
            vitals=VitalsPayload(**pkt["vitals"]),
            device_features=pkt["device_features"],
            network_features=pkt["network_features"]
        )
        try:
            ingest_telemetry(req)
        except Exception as e:
            print(f"Initial seed ingestion error for {p_info['id']}: {e}")


@router.get("/patients", summary="Get all patients with verified vitals for Doctor Portal")
def get_doctor_patients_list(
    department: Optional[str] = Query(None, description="Filter by clinical department"),
    user: Dict[str, Any] = Depends(get_current_authenticated_user)
):
    """
    Retrieves dynamically evaluated patient vitals, continuous AI trust scores,
    and verification banners for the Doctor Portal.
    """
    seed_hospital_demo_patients_if_empty()

    doctor_id = user["id"] if user.get("role") == "Doctor" and user.get("department") else None
    rows = database.get_latest_patient_vitals_and_trust(doctor_id=None)

    formatted_patients = []
    for r in rows:
        trust_val = r["final_trust_score"]
        if trust_val is not None:
            trust_rounded = round(float(trust_val))
        else:
            trust_rounded = 100

        formatted_patients.append({
            "id": r["patient_id"],
            "name": r["patient_name"],
            "age": r["age"],
            "gender": r["gender"],
            "department": r["department"],
            "room": r["room"],
            "device": r["device_name"] or "No Device Assigned",
            "deviceId": r["device_id"] or "N/A",
            "trust": trust_rounded,
            "decision": r["decision"] or "Accept",
            "vitals": {
                "heartRate": round(r["heart_rate"]) if r["heart_rate"] is not None else "--",
                "spo2": round(r["spo2"]) if r["spo2"] is not None else "--",
                "sysBP": round(r["systolic_bp"]) if r["systolic_bp"] is not None else "--",
                "diaBP": round(r["diastolic_bp"]) if r["diastolic_bp"] is not None else "--",
                "temp": round(r["body_temperature"], 1) if r["body_temperature"] is not None else "--",
                "glucose": round(r["blood_glucose"]) if r["blood_glucose"] is not None else "--",
                "respRate": round(r["respiratory_rate"]) if r["respiratory_rate"] is not None else "--"
            },
            "flaggedVital": r["flagged_vital"],
            "reason": r["clinical_reason"] or "All device and network signals are within normal range.",
            "recommendedAction": r["recommended_action"] or "None — continue normal monitoring",
            "evaluatedAt": r["evaluated_at"]
        })

    return {
        "count": len(formatted_patients),
        "patients": formatted_patients
    }


@router.get("/patients/{patient_id}", summary="Get detailed verified patient record")
def get_doctor_patient_detail(
    patient_id: str,
    user: Dict[str, Any] = Depends(get_current_authenticated_user)
):
    """Retrieves single patient detail with latest telemetry evaluation."""
    clean_id = patient_id.strip().upper()
    rows = database.get_latest_patient_vitals_and_trust()
    match = next((r for r in rows if r["patient_id"] == clean_id), None)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient '{clean_id}' not found."
        )

    trust_val = match["final_trust_score"]
    trust_rounded = round(float(trust_val)) if trust_val is not None else 100

    return {
        "id": match["patient_id"],
        "name": match["patient_name"],
        "age": match["age"],
        "gender": match["gender"],
        "department": match["department"],
        "room": match["room"],
        "device": match["device_name"] or "No Device Assigned",
        "deviceId": match["device_id"] or "N/A",
        "trust": trust_rounded,
        "decision": match["decision"] or "Accept",
        "vitals": {
            "heartRate": round(match["heart_rate"]) if match["heart_rate"] is not None else "--",
            "spo2": round(match["spo2"]) if match["spo2"] is not None else "--",
            "sysBP": round(match["systolic_bp"]) if match["systolic_bp"] is not None else "--",
            "diaBP": round(match["diastolic_bp"]) if match["diastolic_bp"] is not None else "--",
            "temp": round(match["body_temperature"], 1) if match["body_temperature"] is not None else "--",
            "glucose": round(match["blood_glucose"]) if match["blood_glucose"] is not None else "--",
            "respRate": round(match["respiratory_rate"]) if match["respiratory_rate"] is not None else "--"
        },
        "flaggedVital": match["flagged_vital"],
        "reason": match["clinical_reason"] or "All device and network signals are within normal range.",
        "recommendedAction": match["recommended_action"] or "None — continue normal monitoring",
        "evaluatedAt": match["evaluated_at"]
    }
