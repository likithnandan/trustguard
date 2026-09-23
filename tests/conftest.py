import pytest
import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Add project root and backend directory to python path
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend import app
import database

@pytest.fixture(scope="session")
def client():
    """Provides a reusable FastAPI test client."""
    with TestClient(app) as c:
        yield c

@pytest.fixture(autouse=True)
def ensure_db_initialized():
    """Ensures test database tables and demo data are initialized."""
    database.init_database()
    from doctor_api import seed_hospital_demo_patients_if_empty
    seed_hospital_demo_patients_if_empty()
