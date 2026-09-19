"""
TrustGuard-IoMT / Continuous Trust Verification for Medical IoT
Management REST API Router (/api/v1)

Provides secure REST endpoints for:
- Patient Lifecycle Management (GET, POST, PUT /api/v1/patients)
- Device Registry Management (GET, POST, PUT /api/v1/devices)
- Dynamic Device-to-Patient Assignment (POST /api/v1/patients/{id}/assign-device/{id})
"""

import hashlib
import secrets
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Header, HTTPException, status, Query, Depends
from pydantic import BaseModel, Field, field_validator

from auth import get_current_user_email, require_admin, get_db
import database

router = APIRouter(prefix="/api/v1", tags=["management"])


# ============================================================
# Security & Authorization Dependencies
# ============================================================
def get_current_authenticated_user(authorization: str = Header(None)) -> Dict[str, Any]:
    """Validates the JWT token and returns the current user record."""
    verified_email = get_current_user_email(authorization)
    conn = get_db()
    user = conn.execute(
        "SELECT id, email, full_name, role, department, is_active FROM users WHERE email = ?",
        (verified_email,)
    ).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="User account no longer exists.")
    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="User account is deactivated.")
    return dict(user)


def require_admin_or_technician(authorization: str = Header(None)) -> Dict[str, Any]:
    """Ensures caller has Administrator or Technician privileges for device management."""
    user = get_current_authenticated_user(authorization)
    if user["role"] not in ["Administrator", "Technician"]:
        raise HTTPException(
            status_code=403,
            detail="Administrative privileges required to perform this operation."
        )
    return user


def require_admin_role(authorization: str = Header(None)) -> Dict[str, Any]:
    """Ensures caller has Administrator role."""
    user = get_current_authenticated_user(authorization)
    if user["role"] != "Administrator":
        raise HTTPException(
            status_code=403,
            detail="Administrator role required."
        )
    return user


# ============================================================
# Request & Response Schemas
# ============================================================
class PatientCreateRequest(BaseModel):
    id: str = Field(..., description="Unique Patient Identifier (e.g. PT-1042)", min_length=2, max_length=32)
    full_name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=0, le=130)
    gender: str = Field(..., description="Male, Female, or Other")
    department: str = Field(default="ICU", max_length=50)
    room: str = Field(..., min_length=1, max_length=50)
    assigned_doctor_id: Optional[int] = None
    admission_date: Optional[str] = None
    status: str = Field(default="Admitted", description="Admitted, Critical, Discharged")

    @field_validator("id")
    def validate_id_format(cls, v):
        clean = v.strip().upper()
        if not clean:
            raise ValueError("Patient ID cannot be empty.")
        return clean


class PatientUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    age: Optional[int] = Field(default=None, ge=0, le=130)
    gender: Optional[str] = None
    department: Optional[str] = None
    room: Optional[str] = None
    assigned_doctor_id: Optional[int] = None
    status: Optional[str] = Field(default=None, description="Admitted, Critical, Discharged")


class DeviceCreateRequest(BaseModel):
    device_id: str = Field(..., description="Unique Device Serial/MAC identifier (e.g. ECG-ICU-001)", min_length=2, max_length=32)
    device_name: str = Field(..., min_length=2, max_length=100)
    device_type: str = Field(..., description="e.g. ECG Monitor, Pulse Oximeter, Infusion Pump, BP Monitor")
    department: str = Field(default="ICU", max_length=50)
    location: str = Field(..., min_length=1, max_length=50)
    api_key: Optional[str] = Field(default=None, description="Custom device API key; auto-generated if omitted.")
    firmware_version: str = Field(default="v1.0.0", max_length=20)
    status: str = Field(default="Active", description="Active, At Risk, Isolated, Offline")

    @field_validator("device_id")
    def validate_device_id_format(cls, v):
        clean = v.strip().upper()
        if not clean:
            raise ValueError("Device ID cannot be empty.")
        return clean


class DeviceUpdateRequest(BaseModel):
    device_name: Optional[str] = None
    device_type: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = Field(default=None, description="Active, At Risk, Isolated, Offline")
    firmware_version: Optional[str] = None


# ============================================================
# Patient Management Endpoints
# ============================================================
@router.get("/patients", summary="List all patients")
def list_patients(
    department: Optional[str] = Query(None, description="Filter by clinical department"),
    doctor_id: Optional[int] = Query(None, description="Filter by assigned doctor ID"),
    user: Dict[str, Any] = Depends(get_current_authenticated_user)
):
    """
    Retrieves all registered patients.
    If caller is a Doctor, doctor_id filtering can be applied automatically or explicitly.
    Includes active device assignments.
    """
    patients = database.get_all_patients(department=department, doctor_id=doctor_id)
    
    # Enrich with active device assignments
    enriched = []
    for p in patients:
        assignment = database.get_active_assignment_for_patient(p["id"])
        enriched.append({
            **p,
            "assigned_device": {
                "device_id": assignment["device_id"],
                "device_name": assignment["device_name"],
                "device_type": assignment["device_type"],
                "device_status": assignment["device_status"],
                "location": assignment["location"],
                "assigned_at": assignment["assigned_at"]
            } if assignment else None
        })

    return {
        "count": len(enriched),
        "patients": enriched
    }


@router.get("/patients/{patient_id}", summary="Get patient details by ID")
def get_patient(
    patient_id: str,
    user: Dict[str, Any] = Depends(get_current_authenticated_user)
):
    """Retrieves detailed record for a specific patient by ID."""
    clean_id = patient_id.strip().upper()
    patient = database.get_patient_by_id(clean_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{clean_id}' was not found."
        )
    
    assignment = database.get_active_assignment_for_patient(clean_id)
    return {
        **patient,
        "assigned_device": {
            "device_id": assignment["device_id"],
            "device_name": assignment["device_name"],
            "device_type": assignment["device_type"],
            "device_status": assignment["device_status"],
            "location": assignment["location"],
            "assigned_at": assignment["assigned_at"]
        } if assignment else None
    }


@router.post("/patients", status_code=status.HTTP_201_CREATED, summary="Register a new patient")
def create_new_patient(
    req: PatientCreateRequest,
    user: Dict[str, Any] = Depends(require_admin_or_technician)
):
    """
    Registers a new patient in the hospital system.
    Requires Administrator or Technician privileges.
    """
    clean_id = req.id.strip().upper()
    
    # Check duplicate patient ID
    existing = database.get_patient_by_id(clean_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Patient with ID '{clean_id}' already exists."
        )

    patient = database.create_patient(
        patient_id=clean_id,
        full_name=req.full_name.strip(),
        age=req.age,
        gender=req.gender.strip(),
        room=req.room.strip(),
        department=req.department.strip(),
        assigned_doctor_id=req.assigned_doctor_id,
        admission_date=req.admission_date,
        status=req.status.strip()
    )

    return {
        "message": f"Patient '{clean_id}' registered successfully.",
        "patient": patient
    }


@router.put("/patients/{patient_id}", summary="Update patient details")
def update_patient_details(
    patient_id: str,
    req: PatientUpdateRequest,
    user: Dict[str, Any] = Depends(require_admin_or_technician)
):
    """
    Updates patient demographics, room, department, or admission status.
    Requires Administrator or Technician privileges.
    """
    clean_id = patient_id.strip().upper()
    existing = database.get_patient_by_id(clean_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{clean_id}' was not found."
        )

    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    if not update_data:
        return {"message": "No changes specified.", "patient": existing}

    updated = database.update_patient(clean_id, **update_data)
    return {
        "message": f"Patient '{clean_id}' updated successfully.",
        "patient": updated
    }


# ============================================================
# Device Management Endpoints
# ============================================================
@router.get("/devices", summary="List all registered devices")
def list_devices(
    department: Optional[str] = Query(None, description="Filter by hospital department"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by device status"),
    user: Dict[str, Any] = Depends(get_current_authenticated_user)
):
    """
    Lists all registered Medical IoT devices in the registry.
    Includes active patient assignment info for each device.
    """
    devices = database.get_all_devices(department=department, status=status_filter)
    
    enriched = []
    for d in devices:
        assignment = database.get_active_assignment_for_device(d["device_id"])
        patient = database.get_patient_by_id(assignment["patient_id"]) if assignment else None
        
        # Omit internal api_key_hash from general response list
        sanitized = {k: v for k, v in d.items() if k != "api_key_hash"}
        sanitized["assigned_patient"] = {
            "patient_id": patient["id"],
            "full_name": patient["full_name"],
            "room": patient["room"],
            "assigned_at": assignment["assigned_at"]
        } if patient and assignment else None
        
        enriched.append(sanitized)

    return {
        "count": len(enriched),
        "devices": enriched
    }


@router.get("/devices/{device_id}", summary="Get device details by ID")
def get_device(
    device_id: str,
    user: Dict[str, Any] = Depends(get_current_authenticated_user)
):
    """Retrieves metadata and status for a specific Medical IoT device."""
    clean_id = device_id.strip().upper()
    device = database.get_device_by_id(clean_id)
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device with ID '{clean_id}' was not found."
        )
    
    assignment = database.get_active_assignment_for_device(clean_id)
    patient = database.get_patient_by_id(assignment["patient_id"]) if assignment else None
    
    sanitized = {k: v for k, v in device.items() if k != "api_key_hash"}
    sanitized["assigned_patient"] = {
        "patient_id": patient["id"],
        "full_name": patient["full_name"],
        "room": patient["room"],
        "assigned_at": assignment["assigned_at"]
    } if patient and assignment else None

    return sanitized


@router.post("/devices", status_code=status.HTTP_201_CREATED, summary="Register a new Medical IoT device")
def create_new_device(
    req: DeviceCreateRequest,
    user: Dict[str, Any] = Depends(require_admin_or_technician)
):
    """
    Registers a new Medical IoT device in the registry.
    Generates a secure API key for device authentication during telemetry transmission.
    Requires Administrator or Technician privileges.
    """
    clean_id = req.device_id.strip().upper()
    
    # Check duplicate device ID
    existing = database.get_device_by_id(clean_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Device with ID '{clean_id}' is already registered."
        )

    # API key generation & hashing
    raw_api_key = req.api_key or f"tg_dev_{secrets.token_urlsafe(24)}"
    api_key_hash = hashlib.sha256(raw_api_key.encode("utf-8")).hexdigest()

    device = database.create_device(
        device_id=clean_id,
        device_name=req.device_name.strip(),
        device_type=req.device_type.strip(),
        department=req.department.strip(),
        location=req.location.strip(),
        api_key_hash=api_key_hash,
        firmware_version=req.firmware_version.strip(),
        status=req.status.strip()
    )

    sanitized = {k: v for k, v in device.items() if k != "api_key_hash"}
    return {
        "message": f"Device '{clean_id}' registered successfully.",
        "device": sanitized,
        "provisioning_api_key": raw_api_key,
        "note": "Save the provisioning_api_key now. It is used to authenticate device telemetry transmissions."
    }


# ============================================================
# Device Assignment Endpoints
# ============================================================
@router.post(
    "/patients/{patient_id}/assign-device/{device_id}",
    summary="Assign a medical IoT device to a patient"
)
def assign_device_to_patient_endpoint(
    patient_id: str,
    device_id: str,
    user: Dict[str, Any] = Depends(require_admin_or_technician)
):
    """
    Binds a Medical IoT device to a specific patient for continuous telemetry & trust monitoring.
    Automatically deactivates any previous assignment for this device.
    Requires Administrator or Technician privileges.
    """
    clean_patient_id = patient_id.strip().upper()
    clean_device_id = device_id.strip().upper()

    # Verify patient exists
    patient = database.get_patient_by_id(clean_patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{clean_patient_id}' does not exist."
        )
    if patient["status"] == "Discharged":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot assign device to a discharged patient ({clean_patient_id})."
        )

    # Verify device exists
    device = database.get_device_by_id(clean_device_id)
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device with ID '{clean_device_id}' does not exist."
        )
    if device["status"] in ["Isolated", "Decommissioned"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Device '{clean_device_id}' is currently {device['status']} and cannot be assigned."
        )

    assignment = database.assign_device_to_patient(
        patient_id=clean_patient_id,
        device_id=clean_device_id,
        assigned_by=user["id"]
    )

    return {
        "message": f"Device '{clean_device_id}' successfully assigned to patient '{clean_patient_id}'.",
        "assignment": {
            "id": assignment["id"],
            "patient_id": clean_patient_id,
            "patient_name": patient["full_name"],
            "patient_room": patient["room"],
            "device_id": clean_device_id,
            "device_name": device["device_name"],
            "assigned_by": user["full_name"],
            "assigned_at": assignment["assigned_at"],
            "is_active": assignment["is_active"]
        }
    }
