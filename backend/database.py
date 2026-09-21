"""
TrustGuard-IoMT / Continuous Trust Verification for Medical IoT
Production Database Module & Data Access Layer (SQLite)

Provides normalized relational schemas and data access helpers for:
- users & otp_codes (Authentication, integrated with auth.py)
- patients (Patient profiles and admission records)
- devices (Registered IoMT devices and transmission authentication keys)
- patient_device_assignments (Device-to-patient assignment audit history)
- telemetry_readings (Time-series biometric vitals & operational telemetry)
- trust_evaluations (AI continuous trust verification results & XAI explanations)
- security_alerts (Security events, attack detections, and critical health alerts)
"""

import sqlite3
import json
import datetime
from datetime import timezone
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple

DB_PATH = Path(__file__).resolve().parent / "users.db"


def get_db() -> sqlite3.Connection:
    """Returns a connection to the SQLite database with Row factory and foreign keys enabled."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_database() -> None:
    """
    Initializes the complete normalized relational database schema.
    Performs backward-compatible self-healing migrations for existing tables.
    """
    conn = get_db()

    # 1. Existing Authentication Tables (Preserved 100%)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'Administrator',
            department TEXT,
            email_verified INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS otp_codes (
            email TEXT NOT NULL,
            purpose TEXT NOT NULL,
            code_hash TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            PRIMARY KEY (email, purpose)
        )
    """)

    # Self-healing migration for users table
    existing_user_cols = {row[1] for row in conn.execute("PRAGMA table_info(users)").fetchall()}
    if "department" not in existing_user_cols:
        conn.execute("ALTER TABLE users ADD COLUMN department TEXT")
    if "email_verified" not in existing_user_cols:
        conn.execute("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0")
    if "is_active" not in existing_user_cols:
        conn.execute("ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1")

    # 2. Patients Table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            department TEXT NOT NULL DEFAULT 'ICU',
            room TEXT NOT NULL,
            assigned_doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            admission_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Admitted',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    # 3. Devices Registry Table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS devices (
            device_id TEXT PRIMARY KEY,
            device_name TEXT NOT NULL,
            device_type TEXT NOT NULL,
            department TEXT NOT NULL DEFAULT 'ICU',
            location TEXT NOT NULL,
            api_key_hash TEXT NOT NULL,
            firmware_version TEXT DEFAULT 'v1.0.0',
            status TEXT NOT NULL DEFAULT 'Active',
            last_seen TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    # 4. Patient-to-Device Assignments Table (Audit History)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS patient_device_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
            device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
            assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
            assigned_at TEXT NOT NULL,
            unassigned_at TEXT,
            is_active INTEGER NOT NULL DEFAULT 1
        )
    """)

    # 5. Telemetry Readings Table (Time-Series Vitals, Device Telemetry & Network Metrics)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS telemetry_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
            patient_id TEXT REFERENCES patients(id) ON DELETE SET NULL,
            timestamp TEXT NOT NULL,
            heart_rate REAL,
            spo2 REAL,
            systolic_bp REAL,
            diastolic_bp REAL,
            body_temperature REAL,
            blood_glucose REAL,
            respiratory_rate REAL,
            ecg_value REAL,
            battery_level REAL,
            battery_health REAL,
            charging_cycles INTEGER,
            cpu_usage REAL,
            memory_usage REAL,
            device_uptime INTEGER,
            rssi REAL,
            signal_strength REAL,
            network_latency REAL,
            packet_loss REAL,
            jitter REAL,
            sensor_drift REAL,
            sensor_noise REAL,
            calibration_status INTEGER,
            restart_count INTEGER,
            network_features_json TEXT,
            payload_hash TEXT,
            created_at TEXT NOT NULL
        )
    """)

    # 6. Trust Evaluations Table (Continuous AI Evaluation Outputs)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS trust_evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telemetry_id INTEGER REFERENCES telemetry_readings(id) ON DELETE CASCADE,
            device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
            patient_id TEXT REFERENCES patients(id) ON DELETE SET NULL,
            timestamp TEXT NOT NULL,
            device_trust_subscore REAL NOT NULL,
            device_probabilities_json TEXT NOT NULL,
            data_authenticity_subscore REAL NOT NULL,
            authenticity_probabilities_json TEXT NOT NULL,
            final_trust_score REAL NOT NULL,
            decision TEXT NOT NULL,
            flagged_vital TEXT,
            clinical_reason TEXT,
            recommended_action TEXT,
            xai_explanation_json TEXT,
            created_at TEXT NOT NULL
        )
    """)

    # 7. Security & Health Alerts Table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS security_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trust_evaluation_id INTEGER REFERENCES trust_evaluations(id) ON DELETE SET NULL,
            device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
            patient_id TEXT REFERENCES patients(id) ON DELETE SET NULL,
            severity TEXT NOT NULL,
            alert_type TEXT NOT NULL,
            message TEXT NOT NULL,
            is_acknowledged INTEGER NOT NULL DEFAULT 0,
            acknowledged_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
            acknowledged_at TEXT,
            created_at TEXT NOT NULL
        )
    """)

    # Performance Indexes
    conn.execute("CREATE INDEX IF NOT EXISTS idx_patients_doctor ON patients(assigned_doctor_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_assignments_active ON patient_device_assignments(patient_id, device_id, is_active)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_device_time ON telemetry_readings(device_id, timestamp)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_patient_time ON telemetry_readings(patient_id, timestamp)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_trust_eval_patient ON trust_evaluations(patient_id, timestamp)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_trust_eval_device ON trust_evaluations(device_id, timestamp)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_alerts_ack ON security_alerts(is_acknowledged, severity)")

    conn.commit()
    conn.close()


# ============================================================
# Patient Data Access Functions
# ============================================================
def create_patient(
    patient_id: str,
    full_name: str,
    age: int,
    gender: str,
    room: str,
    department: str = "ICU",
    assigned_doctor_id: Optional[int] = None,
    admission_date: Optional[str] = None,
    status: str = "Admitted"
) -> Dict[str, Any]:
    now = datetime.datetime.now(timezone.utc).isoformat()
    adm_date = admission_date or now
    conn = get_db()
    conn.execute(
        """
        INSERT INTO patients (id, full_name, age, gender, department, room, assigned_doctor_id, admission_date, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (patient_id, full_name, age, gender, department, room, assigned_doctor_id, adm_date, status, now, now)
    )
    conn.commit()
    conn.close()
    return get_patient_by_id(patient_id)


def get_patient_by_id(patient_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    row = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_patients(department: Optional[str] = None, doctor_id: Optional[int] = None) -> List[Dict[str, Any]]:
    conn = get_db()
    query = "SELECT * FROM patients WHERE 1=1"
    params = []
    if department:
        query += " AND department = ?"
        params.append(department)
    if doctor_id is not None:
        query += " AND assigned_doctor_id = ?"
        params.append(doctor_id)
    query += " ORDER BY created_at DESC"
    rows = conn.execute(query, tuple(params)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_patient(patient_id: str, **kwargs) -> Optional[Dict[str, Any]]:
    if not kwargs:
        return get_patient_by_id(patient_id)
    kwargs["updated_at"] = datetime.datetime.now(timezone.utc).isoformat()
    set_clauses = ", ".join(f"{k} = ?" for k in kwargs.keys())
    values = list(kwargs.values()) + [patient_id]
    conn = get_db()
    conn.execute(f"UPDATE patients SET {set_clauses} WHERE id = ?", tuple(values))
    conn.commit()
    conn.close()
    return get_patient_by_id(patient_id)


# ============================================================
# Device Registry Data Access Functions
# ============================================================
def create_device(
    device_id: str,
    device_name: str,
    device_type: str,
    location: str,
    api_key_hash: str,
    department: str = "ICU",
    firmware_version: str = "v1.0.0",
    status: str = "Active"
) -> Dict[str, Any]:
    now = datetime.datetime.now(timezone.utc).isoformat()
    conn = get_db()
    conn.execute(
        """
        INSERT INTO devices (device_id, device_name, device_type, department, location, api_key_hash, firmware_version, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (device_id, device_name, device_type, department, location, api_key_hash, firmware_version, status, now, now)
    )
    conn.commit()
    conn.close()
    return get_device_by_id(device_id)


def get_device_by_id(device_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    row = conn.execute("SELECT * FROM devices WHERE device_id = ?", (device_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_devices(department: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db()
    query = "SELECT * FROM devices WHERE 1=1"
    params = []
    if department:
        query += " AND department = ?"
        params.append(department)
    if status:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY created_at DESC"
    rows = conn.execute(query, tuple(params)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_device_status(device_id: str, status: str, last_seen: Optional[str] = None) -> Optional[Dict[str, Any]]:
    now = datetime.datetime.now(timezone.utc).isoformat()
    last_seen_val = last_seen or now
    conn = get_db()
    conn.execute(
        "UPDATE devices SET status = ?, last_seen = ?, updated_at = ? WHERE device_id = ?",
        (status, last_seen_val, now, device_id)
    )
    conn.commit()
    conn.close()
    return get_device_by_id(device_id)


def update_device(device_id: str, **kwargs) -> Optional[Dict[str, Any]]:
    if not kwargs:
        return get_device_by_id(device_id)
    kwargs["updated_at"] = datetime.datetime.now(timezone.utc).isoformat()
    set_clauses = ", ".join(f"{k} = ?" for k in kwargs.keys())
    values = list(kwargs.values()) + [device_id]
    conn = get_db()
    conn.execute(f"UPDATE devices SET {set_clauses} WHERE device_id = ?", tuple(values))
    conn.commit()
    conn.close()
    return get_device_by_id(device_id)


def delete_patient(patient_id: str) -> bool:
    conn = get_db()
    cursor = conn.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted


# ============================================================
# Device Assignment Data Access Functions
# ============================================================
def assign_device_to_patient(patient_id: str, device_id: str, assigned_by: Optional[int] = None) -> Dict[str, Any]:
    now = datetime.datetime.now(timezone.utc).isoformat()
    conn = get_db()
    # Deactivate any previous active assignment for this device
    conn.execute(
        "UPDATE patient_device_assignments SET is_active = 0, unassigned_at = ? WHERE device_id = ? AND is_active = 1",
        (now, device_id)
    )
    # Create new active assignment
    cursor = conn.execute(
        """
        INSERT INTO patient_device_assignments (patient_id, device_id, assigned_by, assigned_at, is_active)
        VALUES (?, ?, ?, ?, 1)
        """,
        (patient_id, device_id, assigned_by, now)
    )
    assignment_id = cursor.lastrowid
    conn.commit()
    row = conn.execute("SELECT * FROM patient_device_assignments WHERE id = ?", (assignment_id,)).fetchone()
    conn.close()
    return dict(row)


def unassign_device(device_id: str) -> None:
    now = datetime.datetime.now(timezone.utc).isoformat()
    conn = get_db()
    conn.execute(
        "UPDATE patient_device_assignments SET is_active = 0, unassigned_at = ? WHERE device_id = ? AND is_active = 1",
        (now, device_id)
    )
    conn.commit()
    conn.close()


def unassign_device_from_patient(patient_id: str, device_id: str) -> bool:
    now = datetime.datetime.now(timezone.utc).isoformat()
    conn = get_db()
    cursor = conn.execute(
        "UPDATE patient_device_assignments SET is_active = 0, unassigned_at = ? WHERE patient_id = ? AND device_id = ? AND is_active = 1",
        (now, patient_id, device_id)
    )
    conn.commit()
    affected = cursor.rowcount > 0
    conn.close()
    return affected


def get_active_assignment_for_device(device_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    row = conn.execute(
        """
        SELECT a.*, p.full_name as patient_name, p.room as patient_room, p.department as patient_department
        FROM patient_device_assignments a
        JOIN patients p ON a.patient_id = p.id
        WHERE a.device_id = ? AND a.is_active = 1
        """,
        (device_id,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_active_assignment_for_patient(patient_id: str) -> Optional[Dict[str, Any]]:
    """Returns the primary (first active) device assigned to the patient for backward compatibility."""
    conn = get_db()
    row = conn.execute(
        """
        SELECT a.*, d.device_name, d.device_type, d.status as device_status, d.location
        FROM patient_device_assignments a
        JOIN devices d ON a.device_id = d.device_id
        WHERE a.patient_id = ? AND a.is_active = 1
        ORDER BY a.assigned_at DESC
        """,
        (patient_id,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_active_assignments_for_patient(patient_id: str) -> List[Dict[str, Any]]:
    """Returns all active IoMT devices currently assigned to this patient (1:many relationship)."""
    conn = get_db()
    rows = conn.execute(
        """
        SELECT a.*, d.device_name, d.device_type, d.status as device_status, d.location, d.department as device_department
        FROM patient_device_assignments a
        JOIN devices d ON a.device_id = d.device_id
        WHERE a.patient_id = ? AND a.is_active = 1
        ORDER BY a.assigned_at ASC
        """,
        (patient_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_all_assignments_for_patient(patient_id: str) -> List[Dict[str, Any]]:
    """Returns all IoMT device assignments for a patient, both active and inactive."""
    conn = get_db()
    rows = conn.execute(
        """
        SELECT a.*, d.device_name, d.device_type, d.status as device_status, d.location, d.department as device_department
        FROM patient_device_assignments a
        JOIN devices d ON a.device_id = d.device_id
        WHERE a.patient_id = ?
        ORDER BY a.assigned_at ASC
        """,
        (patient_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ============================================================
# Telemetry & Trust Evaluation Data Access Functions
# ============================================================
def insert_telemetry_reading(
    device_id: str,
    patient_id: Optional[str],
    vitals: Dict[str, Any],
    device_features: Dict[str, Any],
    network_features: Dict[str, Any],
    payload_hash: Optional[str] = None,
    timestamp: Optional[str] = None
) -> int:
    now = timestamp or datetime.datetime.now(timezone.utc).isoformat()
    conn = get_db()
    cursor = conn.execute(
        """
        INSERT INTO telemetry_readings (
            device_id, patient_id, timestamp,
            heart_rate, spo2, systolic_bp, diastolic_bp, body_temperature, blood_glucose, respiratory_rate, ecg_value,
            battery_level, battery_health, charging_cycles, cpu_usage, memory_usage, device_uptime,
            rssi, signal_strength, network_latency, packet_loss, jitter, sensor_drift, sensor_noise,
            calibration_status, restart_count, network_features_json, payload_hash, created_at
        ) VALUES (
            ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?
        )
        """,
        (
            device_id,
            patient_id,
            now,
            vitals.get("heart_rate") or vitals.get("Heart_Rate") or vitals.get("Heart_rate"),
            vitals.get("spo2") or vitals.get("SpO2"),
            vitals.get("systolic_bp") or vitals.get("Systolic_BP") or vitals.get("SYS"),
            vitals.get("diastolic_bp") or vitals.get("Diastolic_BP") or vitals.get("DIA"),
            vitals.get("body_temperature") or vitals.get("Body_Temperature") or vitals.get("Temp"),
            vitals.get("blood_glucose") or vitals.get("Blood_Glucose"),
            vitals.get("respiratory_rate") or vitals.get("Resp_Rate"),
            vitals.get("ecg_value") or vitals.get("ECG_Value") or vitals.get("ST"),
            device_features.get("Battery_Level"),
            device_features.get("Battery_Health"),
            device_features.get("Charging_Cycles"),
            device_features.get("CPU_Usage"),
            device_features.get("Memory_Usage"),
            device_features.get("Device_Uptime"),
            device_features.get("RSSI"),
            device_features.get("Signal_Strength"),
            device_features.get("Network_Latency"),
            device_features.get("Packet_Loss"),
            device_features.get("Jitter"),
            device_features.get("Sensor_Drift"),
            device_features.get("Sensor_Noise"),
            device_features.get("Calibration_Status"),
            device_features.get("Restart_Count"),
            json.dumps(network_features) if network_features else None,
            payload_hash,
            now
        )
    )
    telemetry_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return telemetry_id


def insert_trust_evaluation(
    telemetry_id: Optional[int],
    device_id: str,
    patient_id: Optional[str],
    device_trust_subscore: float,
    device_probabilities: Dict[str, float],
    data_authenticity_subscore: float,
    authenticity_probabilities: Dict[str, float],
    final_trust_score: float,
    decision: str,
    flagged_vital: Optional[str],
    clinical_reason: str,
    recommended_action: str,
    xai_explanation: Dict[str, Any],
    timestamp: Optional[str] = None
) -> int:
    now = timestamp or datetime.datetime.now(timezone.utc).isoformat()
    conn = get_db()
    cursor = conn.execute(
        """
        INSERT INTO trust_evaluations (
            telemetry_id, device_id, patient_id, timestamp,
            device_trust_subscore, device_probabilities_json,
            data_authenticity_subscore, authenticity_probabilities_json,
            final_trust_score, decision, flagged_vital,
            clinical_reason, recommended_action, xai_explanation_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            telemetry_id,
            device_id,
            patient_id,
            now,
            round(float(device_trust_subscore), 2),
            json.dumps(device_probabilities),
            round(float(data_authenticity_subscore), 2),
            json.dumps(authenticity_probabilities),
            round(float(final_trust_score), 2),
            decision,
            flagged_vital,
            clinical_reason,
            recommended_action,
            json.dumps(xai_explanation),
            now
        )
    )
    eval_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return eval_id


def get_latest_patient_vitals_and_trust(doctor_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Returns a unified view of all active patients with their assigned device,
    latest telemetry vitals, latest AI trust evaluation, and clinical flags.
    """
    conn = get_db()
    query = """
        SELECT 
            p.id as patient_id,
            p.full_name as patient_name,
            p.age,
            p.gender,
            p.department,
            p.room,
            p.status as patient_status,
            d.device_id,
            d.device_name,
            d.device_type,
            d.status as device_status,
            t.heart_rate,
            t.spo2,
            t.systolic_bp,
            t.diastolic_bp,
            t.body_temperature,
            t.blood_glucose,
            t.respiratory_rate,
            t.battery_level,
            e.final_trust_score,
            e.decision,
            e.device_trust_subscore,
            e.data_authenticity_subscore,
            e.flagged_vital,
            e.clinical_reason,
            e.recommended_action,
            e.xai_explanation_json,
            e.timestamp as evaluated_at
        FROM patients p
        LEFT JOIN patient_device_assignments a ON p.id = a.patient_id AND a.is_active = 1
        LEFT JOIN devices d ON a.device_id = d.device_id
        LEFT JOIN (
            SELECT t1.*
            FROM telemetry_readings t1
            INNER JOIN (
                SELECT patient_id, MAX(id) as max_id
                FROM telemetry_readings
                GROUP BY patient_id
            ) t2 ON t1.id = t2.max_id
        ) t ON p.id = t.patient_id
        LEFT JOIN (
            SELECT e1.*
            FROM trust_evaluations e1
            INNER JOIN (
                SELECT patient_id, MAX(id) as max_id
                FROM trust_evaluations
                GROUP BY patient_id
            ) e2 ON e1.id = e2.max_id
        ) e ON p.id = e.patient_id
        WHERE p.status != 'Discharged'
    """
    params = []
    if doctor_id is not None:
        query += " AND p.assigned_doctor_id = ?"
        params.append(doctor_id)
    query += " ORDER BY p.room ASC"
    rows = conn.execute(query, tuple(params)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_patient_trust_history(patient_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Retrieves chronological trust evaluation history for a specific patient.
    """
    conn = get_db()
    rows = conn.execute(
        """
        SELECT 
            e.id as evaluation_id,
            e.timestamp,
            e.final_trust_score,
            e.decision,
            e.device_trust_subscore,
            e.data_authenticity_subscore,
            e.flagged_vital,
            e.clinical_reason,
            e.recommended_action,
            e.device_id,
            d.device_name,
            d.device_type
        FROM trust_evaluations e
        LEFT JOIN devices d ON e.device_id = d.device_id
        WHERE e.patient_id = ?
        ORDER BY e.timestamp DESC
        LIMIT ?
        """,
        (patient_id, limit)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]



# ============================================================
# Security Alerts Data Access Functions
# ============================================================
def create_security_alert(
    device_id: str,
    severity: str,
    alert_type: str,
    message: str,
    patient_id: Optional[str] = None,
    trust_evaluation_id: Optional[int] = None,
    timestamp: Optional[str] = None
) -> Dict[str, Any]:
    now = timestamp or datetime.datetime.now(timezone.utc).isoformat()
    conn = get_db()
    cursor = conn.execute(
        """
        INSERT INTO security_alerts (
            trust_evaluation_id, device_id, patient_id, severity, alert_type, message, is_acknowledged, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, ?)
        """,
        (trust_evaluation_id, device_id, patient_id, severity, alert_type, message, now)
    )
    alert_id = cursor.lastrowid
    conn.commit()
    row = conn.execute("SELECT * FROM security_alerts WHERE id = ?", (alert_id,)).fetchone()
    conn.close()
    return dict(row)


def get_active_alerts(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db()
    rows = conn.execute(
        """
        SELECT a.*, d.device_name, d.location, p.full_name as patient_name, p.room
        FROM security_alerts a
        JOIN devices d ON a.device_id = d.device_id
        LEFT JOIN patients p ON a.patient_id = p.id
        WHERE a.is_acknowledged = 0
        ORDER BY 
            CASE a.severity WHEN 'Critical' THEN 1 WHEN 'Warning' THEN 2 ELSE 3 END,
            a.created_at DESC
        LIMIT ?
        """,
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def acknowledge_alert(alert_id: int, user_id: int) -> bool:
    now = datetime.datetime.now(timezone.utc).isoformat()
    conn = get_db()
    cursor = conn.execute(
        "UPDATE security_alerts SET is_acknowledged = 1, acknowledged_by = ?, acknowledged_at = ? WHERE id = ?",
        (user_id, now, alert_id)
    )
    conn.commit()
    updated = cursor.rowcount > 0
    conn.close()
    return updated


def acknowledge_all_alerts(user_id: int) -> int:
    now = datetime.datetime.now(timezone.utc).isoformat()
    conn = get_db()
    cursor = conn.execute(
        "UPDATE security_alerts SET is_acknowledged = 1, acknowledged_by = ?, acknowledged_at = ? WHERE is_acknowledged = 0",
        (user_id, now)
    )
    conn.commit()
    count = cursor.rowcount
    conn.close()
    return count


# Automatically initialize tables upon module import
init_database()
