"""
TrustGuard-IoMT / Cross-Platform Orchestrator Launcher
Starts both FastAPI backend and React frontend concurrently.
"""

import subprocess
import sys
import time
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend-react"

def main():
    print("=" * 65)
    print("  TrustGuard-IoMT: Medical IoT Continuous Trust Platform")
    print("=" * 65)
    print(" [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...")
    
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=str(BACKEND_DIR)
    )
    
    time.sleep(2)
    
    print(" [2/2] Launching React Frontend on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=str(FRONTEND_DIR)
    )
    
    print("\n" + "=" * 65)
    print("  TrustGuard-IoMT Live Services Online:")
    print("  * Backend API Docs:   http://127.0.0.1:8000/docs")
    print("  * React Clinical UI:  http://localhost:5173")
    print("=" * 65)
    print("  Press Ctrl+C to terminate both servers.\n")
    
    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping TrustGuard-IoMT services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Services stopped.")

if __name__ == "__main__":
    main()
