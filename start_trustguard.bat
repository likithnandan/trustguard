@echo off
TITLE TrustGuard-IoMT Orchestrator
echo ============================================================
echo   TrustGuard-IoMT: Medical IoT Continuous Trust Platform
echo ============================================================
echo.
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "TrustGuard Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn backend:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting React Frontend on http://localhost:5173 ...
start "TrustGuard Frontend (React + Vite)" cmd /k "cd /d %~dp0frontend-react && npm run dev"

echo.
echo ============================================================
echo   TrustGuard-IoMT is launching!
echo   - Backend API Docs:   http://127.0.0.1:8000/docs
echo   - React Clinical UI:  http://localhost:5173
echo ============================================================
pause
