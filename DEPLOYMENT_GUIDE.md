# TrustGuard-IoMT: Deployment & Operations Guide

This guide provides operational and deployment procedures for running **TrustGuard-IoMT** across development, staging, and production hospital environments.

---

## 🏗 System Architecture Overview

```
                      +-----------------------------+
                      | Medical IoT Devices/Sensors |
                      +--------------+--------------+
                                     |
                       Token-Authenticated REST (TLS)
                                     |
                                     v
                      +-----------------------------+
                      |   FastAPI Ingestion Gateway  | (Port 8000)
                      +--------------+--------------+
                                     |
                 +-------------------+-------------------+
                 |                                       |
                 v                                       v
      +---------------------+                 +---------------------+
      | Model A (37 Feats)  |                 | Model B (38 Feats)  |
      | Hardware / Sensor   |                 | Network & Spoofing  |
      +----------+----------+                 +----------+----------+
                 |                                       |
                 +-------------------+-------------------+
                                     |
                                     v
                      +-----------------------------+
                      | Continuous Trust Engine     |
                      | Score = 0.45 DT + 0.55 DA   |
                      +--------------+--------------+
                                     |
                       State Persistence & Alerts
                                     |
                                     v
                      +-----------------------------+
                      |     SQLite (users.db)       |
                      +--------------+--------------+
                                     |
                         Real-Time REST Streaming
                                     |
                                     v
                      +-----------------------------+
                      |  React Clinical & Ops UI    | (Port 5173 / Nginx)
                      +-----------------------------+
```

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `8000` | Port for FastAPI backend service. |
| `HOST` | `127.0.0.1` | Network interface binding. |
| `JWT_SECRET` | `trustguard_iomt_jwt_super_secret_signing_key_2026` | Cryptographic secret for signing tokens. |
| `JWT_EXPIRY_HOURS` | `12` | User session lifespan in hours. |
| `OTP_EXPIRY_MINUTES`| `10` | Two-Factor OTP code lifespan. |
| `SMTP_EMAIL` | *(Optional)* | Gmail account for sending live OTP codes. |
| `SMTP_APP_PASSWORD` | *(Optional)* | 16-character Gmail App Password. |

### Frontend (`frontend-react/.env`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Base URL for FastAPI backend endpoints. |

---

## 🛠 Manual Execution Commands

### Starting the Backend Manually
```powershell
cd backend
python -m uvicorn backend:app --host 127.0.0.1 --port 8000 --reload
```

### Starting the React Frontend in Development Mode
```powershell
cd frontend-react
npm run dev
```

### Building and Serving the Production React Bundle
```powershell
cd frontend-react
npm run build
npm run preview
```

---

## 🔍 Validation & Verification Commands

To verify full system integrity at any time, execute the test runners:

```powershell
# Master End-to-End Test Suite
python verify_complete_project_e2e.py

# React Parity Verification
python backend/test_full_react_parity.py

# Doctor Portal Verification
python backend/test_doctor_portal_verification.py

# Full Vanilla System Regression
python backend/test_full_vanilla_system.py
```

All suites should exit with code `0` (100% test pass).
