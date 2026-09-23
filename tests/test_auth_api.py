import pytest
from fastapi.testclient import TestClient

def test_login_demo_admin(client: TestClient):
    """Verify administrator login with valid credentials."""
    res = client.post("/auth/login", json={
        "email": "admin@gmail.com",
        "password": "Admin@12345"
    })
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["role"] == "Administrator"
    assert data["email"] == "admin@gmail.com"

def test_login_invalid_password(client: TestClient):
    """Verify login rejection with incorrect credentials."""
    res = client.post("/auth/login", json={
        "email": "admin@gmail.com",
        "password": "WrongPassword123!"
    })
    assert res.status_code in [400, 401]

def test_login_non_gmail_rejection(client: TestClient):
    """Verify rejection of non-Gmail email formats."""
    res = client.post("/auth/login", json={
        "email": "user@yahoo.com",
        "password": "Password@123"
    })
    assert res.status_code in [400, 401]

def test_doctor_login_requires_otp(client: TestClient):
    """Verify 2FA OTP requirement for Doctor role."""
    res = client.post("/auth/login", json={
        "email": "doctor.smith@gmail.com",
        "password": "Doctor@12345"
    })
    assert res.status_code == 200
    data = res.json()
    assert data.get("requires_otp") is True
