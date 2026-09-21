"""
TrustGuard-IoMT / Continuous Trust Verification for Medical IoT
Backend API - combines Model A (Device Trust) + Model B (Data Authenticity)
into one unified Trust Score, with explanation and Accept/Monitor/Isolate decision.

BEFORE RUNNING:
1. Make sure model_a_xgboost.json and model_b_xgboost.json are in this same folder
   (produced by train_model_a.py and train_model_b.py)
2. pip install fastapi uvicorn xgboost pandas numpy
3. Run: python backend.py
4. Open http://127.0.0.1:8000/docs in your browser to test it interactively
"""

import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import xgboost as xgb
import numpy as np
import json

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from auth import router as auth_router
from management_api import router as management_router
from telemetry_api import router as telemetry_router
from doctor_api import router as doctor_router
from dashboard_api import router as dashboard_router
from database import init_database

# Initialize relational database schemas on startup
init_database()

app = FastAPI(title="An Intelligent AI-Driven Continuous Trust Verification for Medical IoT")

# Allow the dashboard (opened as a local HTML file or via a dev server) to
# call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(management_router)
app.include_router(telemetry_router)
app.include_router(doctor_router)
app.include_router(dashboard_router)

# ============================================================
# Load both trained models at startup
# ============================================================
MODEL_A_PATH = BASE_DIR.parent / "models" / "Model_A" / "model_a_xgboost_final.json"
MODEL_B_PATH = BASE_DIR.parent / "models" / "Model_B" / "model_b_xgboost_final.json"

model_a = xgb.XGBClassifier()
model_a.load_model(str(MODEL_A_PATH))

model_b = xgb.XGBClassifier()
model_b.load_model(str(MODEL_B_PATH))

# Class orders (must match the order LabelEncoder produced during training -
# alphabetical by default: Monitor, Trusted, Untrusted / Data Alteration, Spoofing, normal)
MODEL_A_CLASSES = ['Monitor', 'Trusted', 'Untrusted']
MODEL_B_CLASSES = ['Data Alteration', 'Spoofing', 'normal']

MODEL_A_FEATURES = list(model_a.get_booster().feature_names)
MODEL_B_FEATURES = list(model_b.get_booster().feature_names)


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


def build_model_a_feature_vector(device_features: dict, vitals_dict: dict = None, patient_dict: dict = None) -> list:
    """
    Constructs the exact 37-feature vector for Model A:
    30 original features + 7 engineered features in authoritative order.
    """
    vitals = vitals_dict or {}
    patient = patient_dict or {}
    
    # 1. Map 30 original features
    feat_30 = [
        "Department", "Ward", "Room_No", "Age", "Gender", "Device_Type",
        "ECG_Value", "Heart_Rate", "SpO2", "Pulse_Rate", "Systolic_BP", "Diastolic_BP",
        "Body_Temperature", "Blood_Glucose", "Battery_Level", "Battery_Health",
        "Charging_Cycles", "CPU_Usage", "Memory_Usage", "Device_Uptime",
        "RSSI", "Signal_Strength", "Network_Latency", "Packet_Loss", "Jitter",
        "Sensor_Drift", "Sensor_Noise", "Calibration_Status", "Restart_Count",
        "Previous_Battery_Level"
    ]
    
    val_map = {}
    for f in feat_30:
        val = None
        if f in device_features:
            val = device_features[f]
        elif f == "Heart_Rate" or f == "Pulse_Rate":
            val = vitals.get("heart_rate") or vitals.get("Heart_Rate") or vitals.get("Pulse_Rate")
        elif f == "SpO2":
            val = vitals.get("spo2") or vitals.get("SpO2")
        elif f == "Systolic_BP":
            val = vitals.get("systolic_bp") or vitals.get("Systolic_BP")
        elif f == "Diastolic_BP":
            val = vitals.get("diastolic_bp") or vitals.get("Diastolic_BP")
        elif f == "Body_Temperature":
            val = vitals.get("body_temperature") or vitals.get("Body_Temperature")
        elif f == "Blood_Glucose":
            val = vitals.get("blood_glucose") or vitals.get("Blood_Glucose")
        elif f == "ECG_Value":
            val = vitals.get("ecg_value") or vitals.get("ECG_Value")
        elif f == "Age":
            val = patient.get("age") or device_features.get("Age")
        elif f == "Gender":
            val = patient.get("gender") or device_features.get("Gender")
        elif f == "Department":
            val = patient.get("department") or device_features.get("Department")

        if f in MODEL_A_CAT_MAPS and isinstance(val, str):
            val = MODEL_A_CAT_MAPS[f].get(val, 0)
        elif isinstance(val, str):
            try:
                val = float(val.replace("W", "").replace("R", "").replace("v", ""))
            except Exception:
                val = float(abs(hash(val)) % 100)

        if val is None:
            val = 0.0
        val_map[f] = float(val)

    # 2. Extract values needed for engineered features
    prev_bat = val_map.get("Previous_Battery_Level", 0.0)
    curr_bat = val_map.get("Battery_Level", 0.0)
    bat_health = val_map.get("Battery_Health", 0.0)
    net_lat = val_map.get("Network_Latency", 0.0)
    pkt_loss = val_map.get("Packet_Loss", 0.0)
    rssi = val_map.get("RSSI", 0.0)
    sig_str = val_map.get("Signal_Strength", 0.0)
    cpu = val_map.get("CPU_Usage", 0.0)
    mem = val_map.get("Memory_Usage", 0.0)
    hr = val_map.get("Heart_Rate", 0.0)
    pulse = val_map.get("Pulse_Rate", 0.0)

    # 3. Calculate 7 engineered features
    bat_drop = prev_bat - curr_bat
    bat_ratio = curr_bat / (prev_bat + 1e-6)
    bat_health_gap = curr_bat - bat_health
    net_stress = net_lat * (pkt_loss + 1e-6)
    sig_gap = rssi - sig_str
    res_stress = cpu + mem
    vital_pulse_diff = hr - pulse

    engineered = {
        "Battery_Drop": float(bat_drop),
        "Battery_Ratio": float(bat_ratio),
        "Battery_Health_Gap": float(bat_health_gap),
        "Network_Stress": float(net_stress),
        "Signal_Gap": float(sig_gap),
        "Resource_Stress": float(res_stress),
        "Vital_Pulse_Difference": float(vital_pulse_diff)
    }
    val_map.update(engineered)

    # Return vector matching MODEL_A_FEATURES order (all 37)
    return [val_map.get(f, 0.0) for f in MODEL_A_FEATURES]


# ============================================================
# Request schema - what the frontend sends per device reading
# ============================================================
class DeviceReading(BaseModel):
    device_features: dict   # e.g. {"Battery_Level": 45, "Network_Latency": 80, ...}
    network_features: dict  # e.g. {"Flgs": "...", "SrcLoad": 123.4, ...}


# ============================================================
# Core scoring logic
# ============================================================
def score_device_trust(device_features: dict):
    row = build_model_a_feature_vector(device_features)
    probs = model_a.predict_proba(np.array([row]))[0]
    prob_dict = dict(zip(MODEL_A_CLASSES, probs.tolist()))
    sub_score = 100 * prob_dict['Trusted'] + 50 * prob_dict['Monitor'] + 0 * prob_dict['Untrusted']
    return sub_score, prob_dict


def score_data_authenticity(network_features: dict):
    row = []
    for f in MODEL_B_FEATURES:
        val = network_features.get(f, 0.0)
        if f in MODEL_B_CAT_MAPS and isinstance(val, str):
            val = MODEL_B_CAT_MAPS[f].get(val, 0)
        elif isinstance(val, str):
            try:
                val = float(val)
            except Exception:
                val = 0.0
        row.append(float(val if val is not None else 0.0))
    probs = model_b.predict_proba(np.array([row]))[0]
    prob_dict = dict(zip(MODEL_B_CLASSES, probs.tolist()))
    sub_score = 100 * prob_dict['normal'] + 20 * prob_dict['Spoofing'] + 0 * prob_dict['Data Alteration']
    return sub_score, prob_dict


def explain(device_features: dict, network_features: dict, top_n=3):
    """Simple XAI: rank features by (importance x how far from a 'good' baseline)."""
    a_imp = dict(zip(MODEL_A_FEATURES, model_a.feature_importances_))
    b_imp = dict(zip(MODEL_B_FEATURES, model_b.feature_importances_))
    top_a = sorted(a_imp.items(), key=lambda x: -x[1])[:top_n]
    top_b = sorted(b_imp.items(), key=lambda x: -x[1])[:top_n]
    return {
        "top_device_factors": [{"feature": f, "importance": float(round(float(v), 4))} for f, v in top_a],
        "top_authenticity_factors": [{"feature": f, "importance": float(round(float(v), 4))} for f, v in top_b],
    }


def decide(final_score: float):
    if final_score >= 80:
        return "Accept"
    elif final_score >= 50:
        return "Monitor"
    else:
        return "Isolate"


# ============================================================
# API endpoint
# ============================================================
@app.post("/evaluate")
def evaluate(reading: DeviceReading):
    device_score, device_probs = score_device_trust(reading.device_features)
    auth_score, auth_probs = score_data_authenticity(reading.network_features)

    final_score = 0.45 * device_score + 0.55 * auth_score
    decision = decide(final_score)
    explanation = explain(reading.device_features, reading.network_features)

    return {
        "trust_score": round(final_score, 2),
        "decision": decision,
        "device_trust_subscore": round(device_score, 2),
        "device_trust_probabilities": device_probs,
        "data_authenticity_subscore": round(auth_score, 2),
        "data_authenticity_probabilities": auth_probs,
        "explanation": explanation,
    }


@app.get("/")
def health_check():
    return {"status": "TrustGuard-IoMT backend is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
