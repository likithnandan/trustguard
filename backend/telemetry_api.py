"""
TrustGuard-IoMT / Continuous Trust Verification for Medical IoT
Stateful Telemetry Ingestion & Continuous AI Evaluation Router (/api/v1/telemetry)

Endpoints:
- POST /api/v1/telemetry/ingest: Ingests, authenticates, evaluates (Model A + B),
  and persists medical IoT device telemetry, updating patient vitals and trust status.
"""

import hashlib
import json
import datetime
from datetime import timezone
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Header, HTTPException, status, Depends
from pydantic import BaseModel, Field
import numpy as np

import backend
import database

router = APIRouter(prefix="/api/v1/telemetry", tags=["telemetry"])


# ============================================================
# Request Schemas
# ============================================================
class VitalsPayload(BaseModel):
    heart_rate: Optional[float] = Field(default=None, description="Heart Rate in bpm (e.g. 75)")
    spo2: Optional[float] = Field(default=None, description="Blood Oxygen Saturation % (e.g. 98)")
    systolic_bp: Optional[float] = Field(default=None, description="Systolic Blood Pressure in mmHg (e.g. 120)")
    diastolic_bp: Optional[float] = Field(default=None, description="Diastolic Blood Pressure in mmHg (e.g. 80)")
    body_temperature: Optional[float] = Field(default=None, description="Body Temperature (e.g. 36.8 C or 98.4 F)")
    blood_glucose: Optional[float] = Field(default=None, description="Blood Glucose in mg/dL (e.g. 95)")
    respiratory_rate: Optional[float] = Field(default=None, description="Respiratory Rate in breaths/min (e.g. 16)")
    ecg_value: Optional[float] = Field(default=None, description="ECG Voltage / ST Segment (e.g. 0.15)")


class TelemetryIngestRequest(BaseModel):
    device_id: str = Field(..., description="Registered Device Identifier (e.g. ECG-ICU-001)")
    api_key: Optional[str] = Field(default=None, description="Device Provisioning API Key")
    timestamp: Optional[str] = Field(default=None, description="ISO-8601 Telemetry Timestamp")
    vitals: VitalsPayload = Field(default_factory=VitalsPayload, description="Patient Clinical Vitals")
    device_features: Dict[str, Any] = Field(default_factory=dict, description="Operational & Device Telemetry (Model A Features)")
    network_features: Dict[str, Any] = Field(default_factory=dict, description="Network Flow & Security Metrics (Model B Features)")
    payload_hash: Optional[str] = Field(default=None, description="SHA-256 Digest for payload integrity")


# Categorical Label Encoding maps for Model A (matches Dataset 1 training distribution)
MODEL_A_CAT_MAPS = {
    "Department": {"ICU": 0, "Ward": 1, "Emergency": 2, "Cardiology": 3},
    "Gender": {"M": 0, "F": 1, "Male": 0, "Female": 1},
    "Calibration_Status": {"RECALIBRATED": 0, "OK": 1, "CALIBRATED": 1},
    "Device_Type": {"ECG": 0, "PulseOx": 1, "BP": 2, "Thermo": 3, "Glucose": 4}
}

# Categorical Label Encoding maps for Model B (matches Dataset 2 training distribution)
MODEL_B_CAT_MAPS = {
    "Dir": {"   ->": 0, "->": 0, "0": 0},
    "Flgs": {
        " M        ": 0, "M": 0,
        " M *      ": 1, "M*": 1,
        " M d      ": 2, "Md": 2,
        " MR       ": 3, "MR": 3,
        " e        ": 4, "e": 4,
        " e s      ": 5, "es": 5,
        " eR       ": 6, "eR": 6
    }
}


def map_features_for_model_a(device_features: Dict[str, Any], vitals: VitalsPayload, patient: Dict[str, Any]) -> List[float]:
    """Extracts and encodes the exact 30 features required by Model A in order."""
    row = []
    for f in backend.MODEL_A_FEATURES:
        val = None
        # 1. Check in explicit device_features
        if f in device_features:
            val = device_features[f]
        # 2. Check in vitals
        elif f == "Heart_Rate" or f == "Pulse_Rate":
            val = vitals.heart_rate
        elif f == "SpO2":
            val = vitals.spo2
        elif f == "Systolic_BP":
            val = vitals.systolic_bp
        elif f == "Diastolic_BP":
            val = vitals.diastolic_bp
        elif f == "Body_Temperature":
            val = vitals.body_temperature
        elif f == "Blood_Glucose":
            val = vitals.blood_glucose
        elif f == "ECG_Value":
            val = vitals.ecg_value
        # 3. Check in patient record
        elif f == "Age" and patient:
            val = patient.get("age")
        elif f == "Gender" and patient:
            val = patient.get("gender")
        elif f == "Department" and patient:
            val = patient.get("department")

        # Encode categorical strings if applicable
        if f in MODEL_A_CAT_MAPS and isinstance(val, str):
            val = MODEL_A_CAT_MAPS[f].get(val, 0)
        elif isinstance(val, str):
            # Try numeric parse or hash fallback
            try:
                val = float(val.replace("W", "").replace("R", "").replace("v", ""))
            except:
                val = float(abs(hash(val)) % 100)

        # Default fallback
        if val is None:
            val = 0.0
        row.append(float(val))
    return row


def map_features_for_model_b(network_features: Dict[str, Any], vitals: VitalsPayload) -> List[float]:
    """Extracts and encodes the exact 38 features required by Model B in order."""
    row = []
    for f in backend.MODEL_B_FEATURES:
        val = None
        # 1. Check in explicit network_features
        if f in network_features:
            val = network_features[f]
        # 2. Check in vitals for overlapping biometrics
        elif f == "Temp":
            val = vitals.body_temperature
        elif f == "SpO2":
            val = vitals.spo2
        elif f == "Pulse_Rate" or f == "Heart_rate":
            val = vitals.heart_rate
        elif f == "SYS":
            val = vitals.systolic_bp
        elif f == "DIA":
            val = vitals.diastolic_bp
        elif f == "Resp_Rate":
            val = vitals.respiratory_rate
        elif f == "ST":
            val = vitals.ecg_value

        # Encode categorical strings if applicable
        if f in MODEL_B_CAT_MAPS and isinstance(val, str):
            val = MODEL_B_CAT_MAPS[f].get(val, 0)
        elif isinstance(val, str):
            try:
                val = float(val)
            except:
                val = 0.0

        if val is None:
            val = 0.0
        row.append(float(val))
    return row


# ============================================================
# Telemetry Ingestion Endpoint
# ============================================================
@router.post("/ingest", summary="Ingest and evaluate medical IoT device telemetry")
def ingest_telemetry(
    payload: TelemetryIngestRequest,
    x_device_api_key: Optional[str] = Header(None, alias="X-Device-API-Key"),
    x_device_id: Optional[str] = Header(None, alias="X-Device-ID")
):
    """
    Continuous AI Trust Verification Pipeline for Medical IoT:
    1. Authenticates device via SHA-256 hashed API key.
    2. Validates active assignment to a patient.
    3. Maps biometrics, operational metrics, and network flow into Model A and Model B.
    4. Evaluates Device Trust & Data Authenticity.
    5. Computes Unified Trust Score, Decision (Accept/Monitor/Isolate), and Clinical Rationale.
    6. Persists reading into telemetry_readings and evaluation into trust_evaluations.
    7. Creates security_alerts if trust degrades or attacks are detected.
    """
    clean_device_id = (payload.device_id or x_device_id or "").strip().upper()
    if not clean_device_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing device identifier in payload or X-Device-ID header."
        )

    # 1. Verify Device Existence
    device = database.get_device_by_id(clean_device_id)
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device '{clean_device_id}' is not registered in the system."
        )

    if device["status"] == "Decommissioned":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Device '{clean_device_id}' is decommissioned and cannot transmit telemetry."
        )

    # 2. Authenticate Device Credentials
    provided_key = payload.api_key or x_device_api_key
    if not provided_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing device API key. Provide X-Device-API-Key header or api_key in payload."
        )

    provided_hash = hashlib.sha256(provided_key.encode("utf-8")).hexdigest()
    if provided_hash != device["api_key_hash"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid device API key. Device authentication failed."
        )

    # 3. Verify Active Patient Assignment
    assignment = database.get_active_assignment_for_device(clean_device_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Device '{clean_device_id}' is not currently assigned to any patient."
        )

    patient_id = assignment["patient_id"]
    patient = database.get_patient_by_id(patient_id)

    # 4. Map Features for ML Inference
    now_iso = payload.timestamp or datetime.datetime.now(timezone.utc).isoformat()
    vector_a = map_features_for_model_a(payload.device_features, payload.vitals, patient)
    vector_b = map_features_for_model_b(payload.network_features, payload.vitals)

    # 5. Execute Model A (Device Trust)
    probs_a = backend.model_a.predict_proba(np.array([vector_a]))[0]
    prob_dict_a = dict(zip(backend.MODEL_A_CLASSES, [float(p) for p in probs_a.tolist()]))
    device_score = 100.0 * prob_dict_a.get("Trusted", 0.0) + 50.0 * prob_dict_a.get("Monitor", 0.0) + 0.0 * prob_dict_a.get("Untrusted", 0.0)

    # 6. Execute Model B (Data Authenticity)
    probs_b = backend.model_b.predict_proba(np.array([vector_b]))[0]
    prob_dict_b = dict(zip(backend.MODEL_B_CLASSES, [float(p) for p in probs_b.tolist()]))
    auth_score = 100.0 * prob_dict_b.get("normal", 0.0) + 20.0 * prob_dict_b.get("Spoofing", 0.0) + 0.0 * prob_dict_b.get("Data Alteration", 0.0)

    # 7. Compute Unified Trust Score & Decision
    final_score = 0.45 * device_score + 0.55 * auth_score
    decision = backend.decide(final_score)
    explanation = backend.explain(dict(zip(backend.MODEL_A_FEATURES, vector_a)), dict(zip(backend.MODEL_B_FEATURES, vector_b)))

    # 8. Anomaly & Tampering Classification
    flagged_vital = None
    clinical_reason = "All device telemetry and network transmission signals are verified within normal parameters."
    recommended_action = "None — proceed with standard patient monitoring."
    alert_severity = None
    alert_type = None

    if prob_dict_b.get("Data Alteration", 0.0) > 0.5:
        flagged_vital = "all"
        clinical_reason = "Signature/payload mismatch detected on transmitted telemetry — potential Data Alteration attack."
        recommended_action = "Isolate device data stream. Perform manual clinical vitals verification before acting."
        alert_severity = "Critical"
        alert_type = "Data Tampering"
    elif prob_dict_b.get("Spoofing", 0.0) > 0.5:
        flagged_vital = "all"
        clinical_reason = "Abnormal network packet timing and flow patterns detected — potential Device Spoofing attack."
        recommended_action = "Verify physical device identity and inspect network gateway connection."
        alert_severity = "Critical"
        alert_type = "Spoofing Attack"
    elif prob_dict_a.get("Untrusted", 0.0) > 0.4 or device_score < 50:
        flagged_vital = "all"
        clinical_reason = "Critical device degradation or severe operational anomaly detected."
        recommended_action = "Replace device hardware immediately and inspect calibration."
        alert_severity = "Critical"
        alert_type = "Device Operational Failure"
    elif decision == "Monitor" or final_score < 80:
        flagged_vital = "spo2" if (payload.vitals.spo2 and payload.vitals.spo2 < 90) else "all"
        clinical_reason = "Minor operational jitter or telemetry delay detected — trust score degraded."
        recommended_action = "Monitor telemetry trend closely. Verify reading consistency with patient baseline."
        alert_severity = "Warning"
        alert_type = "Telemetry Quality Degradation"

    # 9. Store Telemetry Reading in Database
    vitals_dict = payload.vitals.model_dump()
    telemetry_id = database.insert_telemetry_reading(
        device_id=clean_device_id,
        patient_id=patient_id,
        vitals=vitals_dict,
        device_features=payload.device_features,
        network_features=payload.network_features,
        payload_hash=payload.payload_hash,
        timestamp=now_iso
    )

    # 10. Store AI Trust Evaluation
    eval_id = database.insert_trust_evaluation(
        telemetry_id=telemetry_id,
        device_id=clean_device_id,
        patient_id=patient_id,
        device_trust_subscore=device_score,
        device_probabilities=prob_dict_a,
        data_authenticity_subscore=auth_score,
        authenticity_probabilities=prob_dict_b,
        final_trust_score=final_score,
        decision=decision,
        flagged_vital=flagged_vital,
        clinical_reason=clinical_reason,
        recommended_action=recommended_action,
        xai_explanation=explanation,
        timestamp=now_iso
    )

    # 11. Create Security Alert if necessary
    created_alert = None
    if alert_severity and alert_type:
        created_alert = database.create_security_alert(
            device_id=clean_device_id,
            patient_id=patient_id,
            severity=alert_severity,
            alert_type=alert_type,
            message=f"{alert_type} on {clean_device_id} (Patient {patient_id}): {clinical_reason}",
            trust_evaluation_id=eval_id
        )

    # 12. Update Device Operational Status
    new_device_status = "Isolated" if decision == "Isolate" else ("At Risk" if decision == "Monitor" else "Active")
    database.update_device_status(clean_device_id, status=new_device_status, last_seen=now_iso)

    return {
        "status": "success",
        "message": "Telemetry ingested and evaluated successfully.",
        "evaluation": {
            "telemetry_id": telemetry_id,
            "evaluation_id": eval_id,
            "patient_id": patient_id,
            "device_id": clean_device_id,
            "timestamp": now_iso,
            "trust_score": round(final_score, 2),
            "decision": decision,
            "device_trust_subscore": round(device_score, 2),
            "device_trust_probabilities": prob_dict_a,
            "data_authenticity_subscore": round(auth_score, 2),
            "data_authenticity_probabilities": prob_dict_b,
            "flagged_vital": flagged_vital,
            "clinical_reason": clinical_reason,
            "recommended_action": recommended_action,
            "explanation": explanation
        },
        "alert_created": bool(created_alert),
        "alert_id": created_alert["id"] if created_alert else None
    }
