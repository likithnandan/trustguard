# TrustGuard-IoMT: An Intelligent AI-Driven Continuous Trust Verification for Medical IoT

[![Python 3.12+](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://react.dev/)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.1+-eb4224.svg)](https://xgboost.readthedocs.io/)
[![Zero-Trust](https://img.shields.io/badge/Security-Zero--Trust%20IoMT-green.svg)]()

---

## 📌 Executive Summary

**TrustGuard-IoMT** is a medical IoT (IoMT) continuous trust verification architecture designed to protect connected hospital networks against cyberattacks, data tampering, MAC spoofing, and hardware degradation. 

By combining dual sequential gradient-boosted decision tree ensembles (XGBoost) with a mathematical Continuous Trust Engine (CTE), TrustGuard continuously scores device integrity ($D_T$) and packet data authenticity ($D_A$) in real time, projecting dynamic XAI tree-gain attributions to clinical staff and security administrators.

---

## 🔬 AI Architecture & Machine Learning Models

TrustGuard uses a **Dual-Model Fusion Framework**:

```
                 ┌──────────────────────────────────────────────────────────┐
                 │       Live Medical IoT Endpoint Telemetry Stream         │
                 └────────────────────────────┬─────────────────────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
     ┌───────────────────────────────┐                 ┌───────────────────────────────┐
     │      Model A (Device Trust)   │                 │ Model B (Data Authenticity)   │
     │ 37 Features (30 Base + 7 Eng) │                 │ 38 Network Flow Features      │
     │ Multi-class: Trusted/Mon/Untr │                 │ Multi-class: Normal/Alt/Spoof │
     └───────────────┬───────────────┘                 └───────────────┬───────────────┘
                     │                                                 │
                     │  Device Trust Sub-score (DT ∈ [0, 100])         │  Data Authenticity Sub-score (DA ∈ [0, 100])
                     └────────────────────────┬────────────────────────┘
                                              │
                                              ▼
                             ┌───────────────────────────────────┐
                             │     Continuous Trust Engine (CTE) │
                             │   Trust Score = 0.45 DT + 0.55 DA │
                             └────────────────┬──────────────────┘
                                              │
                  ┌───────────────────────────┼───────────────────────────┐
                  ▼                           ▼                           ▼
        ┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
        │  ACCEPT (≥ 80.0)  │       │ MONITOR (50-79.9) │       │   ISOLATE (< 50)  │
        │ Nominal Clinical  │       │ Manual Cross-Ver. │       │ Automatic Device  │
        │ Data Stream Flow  │       │ Warning Banner    │       │ Quarantine & SOC  │
        └───────────────────┘       └───────────────────┘       └───────────────────┘
```

### 1. Model A — Device Trust Classifier
* **Task**: Evaluates hardware integrity, battery drift, sensor stability, and physiological consistency.
* **Input**: 37 total features (30 raw IoMT sensor metrics + 7 domain-engineered features).
* **7 Engineered Features**:
  1. `Discrepancy_Metric` = $| \text{Heart Rate} - \text{Pulse Rate} |$
  2. `Battery_Drop_Rate` = $\text{Previous Battery Level} - \text{Battery Level}$
  3. `Battery_Health_Gap` = $100 - \text{Battery Health}$
  4. `Network_Stress` = $\text{Network Latency} \times \text{Packet Loss}$
  5. `Signal_Gap` = $| \text{RSSI} - \text{Signal Strength} |$
  6. `Resource_Stress` = $\frac{\text{CPU Usage} + \text{Memory Usage}}{2}$
  7. `Vital_Pulse_Difference` = $\text{Heart Rate} - \text{Pulse Rate}$
* **Sub-Score Formula**:
  $$D_T = 100 \times P(\text{Trusted}) + 50 \times P(\text{Monitor}) + 0 \times P(\text{Untrusted})$$

### 2. Model B — Data Authenticity Classifier
* **Task**: Detects packet injection, MAC address spoofing, protocol anomalies, and data alteration.
* **Input**: 38 network flow and header metrics.
* **Sub-Score Formula**:
  $$D_A = 100 \times P(\text{Normal}) + 20 \times P(\text{Spoofing}) + 0 \times P(\text{Data Alteration})$$

### 3. Continuous Trust Engine (CTE) Policy
$$\text{Final Trust Score} = 0.45 \times D_T + 0.55 \times D_A$$

---

## 🚀 Quick Start Guide

### Prerequisites
* Python 3.10+ (Recommended: Python 3.12)
* Node.js 18+ & npm

### 1. Install Backend Dependencies
```bash
cd backend
pip install fastapi uvicorn xgboost pandas numpy bcrypt pyjwt pydantic email-validator pytest
```

### 2. Install React Frontend Dependencies
```bash
cd frontend-react
npm install
```

### 3. 1-Click Launch (Windows)
Double-click `start_trustguard.bat` in the root directory, or run:
```bash
python start_trustguard.py
```

### 4. Direct Service URLs
* **React Clinical & Ops Portal**: [http://localhost:5173](http://localhost:5173)
* **FastAPI Swagger API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🔑 Demo Access Accounts

TrustGuard includes pre-seeded accounts for Role-Based Access Control (RBAC):

| Role | Email Address | Password | Permissions & View |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@gmail.com` | `Admin@12345` | Full Fleet Ops, XAI Engine, HeatMap, Reports, User RBAC |
| **Doctor** | `doctor.smith@gmail.com` | `Doctor@12345` | Clinical Inpatient Vitals Stream, Verification Banner, 2FA OTP |
| **Technician** | `tech@gmail.com` | `Tech@12345` | Device Registry, Predictive Maintenance Advisor |

---

## 📁 Repository Structure

```
project/
├── backend/                             # FastAPI Backend & ML Engine
│   ├── backend.py                       # Unified API & Dual-Model Evaluation Endpoint
│   ├── auth.py                          # RBAC, JWT, bcrypt hashing & OTP engine
│   ├── database.py                      # SQLite Relational Data Access Layer
│   ├── dashboard_api.py                 # Analytics, Heat Map, Maintenance, Reports APIs
│   ├── doctor_api.py                    # Doctor Inpatient Clinical Telemetry APIs
│   ├── management_api.py                # Patient & Device CRUD + Token Provisioning
│   ├── telemetry_api.py                 # Real-time Telemetry Ingestion Pipeline
│   ├── dataset_simulator.py             # Realistic Telemetry Packet Simulator
│   ├── users.db                         # Seeded Database (55 patients, 55 devices, 385 evals)
│   └── test_*.py                        # Comprehensive automated test suites
├── frontend-react/                      # Modern React 18 + Vite Frontend
│   ├── src/
│   │   ├── api/                         # Centralized API Service Clients
│   │   ├── components/                  # Reusable UI widgets, Modals & Layouts
│   │   ├── context/                     # AuthContext (JWT session management)
│   │   ├── pages/                       # All 14 Page Modules
│   │   └── App.jsx                      # Role-Protected Router
│   ├── dist/                            # Production build bundle
│   └── package.json
├── models/                              # Authoritative XGBoost JSON Models
│   ├── Model_A/model_a_xgboost_final.json
│   └── Model_B/model_b_xgboost_final.json
├── start_trustguard.bat                 # 1-Click Windows Launcher
├── start_trustguard.py                  # Cross-Platform Launcher
├── verify_complete_project_e2e.py       # Master End-to-End Test Suite
└── README.md
```

---

## 🧪 Automated Verification Suite

Run the master verification test across the entire project:
```bash
python verify_complete_project_e2e.py
```

Expected output:
```
====================================================================
  ALL 5 MASTER VERIFICATION PHASES PASSED (100% SUCCESS)!
  TrustGuard-IoMT is production-ready and fully operational.
====================================================================
```

---

## 📄 License
MIT License. Developed for intelligent healthcare IoT security and clinical decision support.