@echo off
TITLE TrustGuard-IoMT Orchestrator
COLOR 0B
echo ============================================================
echo   TrustGuard-IoMT: Medical IoT Continuous Trust Platform
echo   Automated Launcher and Dependency Manager
echo ============================================================
echo.

:: 1. Check Python installation
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found on PATH. Please install Python 3.9+ from https://python.org
    pause
    exit /b 1
)

:: 2. Check Node.js installation
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / npm is not found on PATH. Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: 3. Setup backend environment if needed
if not exist "%~dp0backend\.env" (
    echo [Setup] Initializing backend/.env from template...
    copy "%~dp0backend\.env.example" "%~dp0backend\.env" >nul
)

:: 4. Install Python requirements if missing
echo [Setup] Checking Python dependencies...
python -c "import fastapi, uvicorn, xgboost, pandas, numpy, bcrypt, jwt" >nul 2>nul
if %errorlevel% neq 0 (
    echo [Setup] Installing required Python packages...
    pip install -r "%~dp0requirements.txt"
)

:: 5. Install Frontend dependencies if missing
if not exist "%~dp0frontend-react\node_modules" (
    echo.
    echo [Setup] First-time setup detected: Installing React dependencies (this takes ~30s)...
    cd /d "%~dp0frontend-react"
    call npm install
    cd /d "%~dp0"
)

echo.
echo ============================================================
echo   [1/2] Starting FastAPI Backend on http://127.0.0.1:8000
echo   [2/2] Starting React Clinical UI on http://localhost:5173
echo ============================================================
echo.

start "TrustGuard Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn backend:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

start "TrustGuard Frontend (React + Vite)" cmd /k "cd /d %~dp0frontend-react && npm run dev"

timeout /t 3 /nobreak >nul

:: Automatically open browser
start http://localhost:5173

echo TrustGuard-IoMT is running in background windows.
echo To stop the application, simply close the backend and frontend command windows.
echo.
pause
