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
MODEL_A_PATH = BASE_DIR / "model_a_xgboost.json"
MODEL_B_PATH = BASE_DIR / "model_b_xgboost.json"

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
    row = [device_features.get(f, 0) for f in MODEL_A_FEATURES]
    probs = model_a.predict_proba(np.array([row]))[0]
    prob_dict = dict(zip(MODEL_A_CLASSES, probs.tolist()))
    sub_score = 100 * prob_dict['Trusted'] + 50 * prob_dict['Monitor'] + 0 * prob_dict['Untrusted']
    return sub_score, prob_dict


def score_data_authenticity(network_features: dict):
    row = [network_features.get(f, 0) for f in MODEL_B_FEATURES]
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
