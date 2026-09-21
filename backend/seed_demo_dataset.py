"""
TrustGuard-IoMT / Continuous Trust Verification for Medical IoT
Comprehensive Realistic Demo Dataset Seeder (Phase 10 & 11)

Populates:
- 55 Realistic Patients across 8 departments (ICU, Cardiology, Emergency, General Ward, Endocrinology, Surgery, Pediatrics, Oncology)
- 55 Registered Medical IoT Devices across types (ECG Monitors, Pulse Oximeters, Infusion Pumps, Smart BP, Glucose, Temp Sensors)
- Multi-device bindings (1 patient -> multiple monitored devices)
- Multi-day historical telemetry readings & genuine AI Trust Evaluations spanning Sept 1 to Sept 7, 2026
- Security alerts for anomalous / isolated devices
"""

import sys
import os
import hashlib
import json
import random
import datetime
from datetime import timezone, timedelta
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

import database
import backend
from dataset_simulator import DatasetIoMTSimulator

def run_seeder():
    print("==================================================")
    print("TrustGuard-IoMT: Seeding Realistic Demo Dataset")
    print("==================================================")

    database.init_database()
    conn = database.get_db()

    # Verify or ensure default admin user
    cursor = conn.execute("SELECT id, email FROM users WHERE role = 'Administrator' LIMIT 1")
    admin_row = cursor.fetchone()
    admin_id = admin_row["id"] if admin_row else 1

    # Verify doctor user
    cursor = conn.execute("SELECT id, email FROM users WHERE role = 'Doctor' LIMIT 1")
    doc_row = cursor.fetchone()
    doctor_id = doc_row["id"] if doc_row else admin_id

    # 1. Clear operational tables (leaving users intact)
    conn.execute("DELETE FROM security_alerts")
    conn.execute("DELETE FROM trust_evaluations")
    conn.execute("DELETE FROM telemetry_readings")
    conn.execute("DELETE FROM patient_device_assignments")
    conn.execute("DELETE FROM devices")
    conn.execute("DELETE FROM patients")
    conn.commit()

    print("[1/5] Operational tables reset.")

    # 2. Generate 55 Patients
    first_names = [
        "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
        "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
        "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
        "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
        "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
        "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
        "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason"
    ]
    last_names = [
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
        "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
        "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
        "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
        "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
        "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
        "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz"
    ]

    departments = [
        ("ICU", ["Room 101", "Room 102", "Room 103", "Room 104", "Room 105", "Bed A", "Bed B", "Bed C"]),
        ("Cardiology", ["Ward 201", "Ward 202", "Ward 203", "Ward 204", "Ward 205", "Room 206"]),
        ("Emergency", ["ER Bay 1", "ER Bay 2", "ER Bay 3", "ER Bay 4", "ER Bay 5", "Triage 1"]),
        ("General Ward", ["Ward 301", "Ward 302", "Ward 303", "Ward 304", "Ward 305", "Ward 306"]),
        ("Endocrinology", ["Clinic 101", "Clinic 102", "Room 401", "Room 402", "Room 403"]),
        ("Surgery", ["Post-Op 1", "Post-Op 2", "Post-Op 3", "Recovery A", "Recovery B"]),
        ("Pediatrics", ["Ped Ward 1", "Ped Ward 2", "Ped Room 101", "Ped Room 102"]),
        ("Oncology", ["Onc Ward 1", "Onc Ward 2", "Onc Room 501", "Onc Room 502"])
    ]

    patients = []
    base_date = datetime.date(2026, 9, 1)

    for i in range(1, 56):
        p_id = f"PT-{i:03d}"
        f_name = first_names[i - 1]
        l_name = last_names[i - 1]
        full_name = f"{f_name} {l_name}"
        age = random.randint(22, 85)
        gender = "Female" if (i % 2 == 0) else "Male"
        dept, rooms = departments[(i - 1) % len(departments)]
        room = rooms[(i - 1) % len(rooms)]
        adm_date = (base_date + timedelta(days=random.randint(0, 4))).isoformat()
        
        # Status distribution: Most Admitted, 3 Critical, 2 Discharged
        if i in [7, 19, 38]:
            p_status = "Critical"
        elif i in [53, 54]:
            p_status = "Discharged"
        else:
            p_status = "Admitted"

        database.create_patient(
            patient_id=p_id,
            full_name=full_name,
            age=age,
            gender=gender,
            room=room,
            department=dept,
            assigned_doctor_id=doctor_id,
            admission_date=adm_date,
            status=p_status
        )
        patients.append({
            "id": p_id,
            "name": full_name,
            "department": dept,
            "room": room,
            "status": p_status
        })

    print(f"[2/5] Created {len(patients)} patients across 8 hospital departments.")

    # 3. Generate 55 Registered Medical IoT Devices
    device_templates = [
        # (id_prefix, name_prefix, type, dept, count, initial_status)
        ("ECG-ICU", "Continuous ECG Monitor", "ECG Monitor", "ICU", 10, "Active"),
        ("POX-ICU", "Smart Pulse Oximeter", "Pulse Oximeter", "ICU", 10, "Active"),
        ("PUMP-GEN", "Smart Infusion Pump", "Infusion Pump", "General Ward", 10, "Active"),
        ("BP-CARD", "Smart Blood Pressure Monitor", "BP Monitor", "Cardiology", 10, "Active"),
        ("GLUC-ENDO", "Continuous Glucose Monitor", "Glucose Monitor", "Endocrinology", 8, "Active"),
        ("TEMP-SURG", "Wireless Temperature Sensor", "Temperature Sensor", "Surgery", 7, "Active"),
    ]

    devices = []
    for prefix, name_pfx, dtype, dept, count, stat in device_templates:
        for idx in range(1, count + 1):
            d_id = f"{prefix}-{idx:03d}"
            d_name = f"{name_pfx} #{idx}"
            loc = f"{dept} - Unit {idx}"
            raw_key = f"tg_demo_{d_id.lower()}_key"
            key_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
            fw = f"v{1 + (idx % 2)}.{idx % 5}.0"
            
            # Make 2 devices At Risk and 2 Isolated for demo analytics
            if d_id in ["ECG-ICU-007", "BP-CARD-008"]:
                current_stat = "At Risk"
            elif d_id in ["PUMP-GEN-005", "POX-ICU-009"]:
                current_stat = "Isolated"
            else:
                current_stat = "Active"

            database.create_device(
                device_id=d_id,
                device_name=d_name,
                device_type=dtype,
                department=dept,
                location=loc,
                api_key_hash=key_hash,
                firmware_version=fw,
                status=current_stat
            )
            devices.append({
                "id": d_id,
                "name": d_name,
                "type": dtype,
                "department": dept,
                "location": loc,
                "status": current_stat,
                "key": raw_key
            })

    print(f"[3/5] Created {len(devices)} Medical IoT devices.")

    # 4. Multi-device Bindings & Device-Patient Mapping
    assigned_pairs = []
    
    # ICU Multi-device (PT-001..PT-004 receive ECG + POX)
    icu_multi = [
        ("PT-001", "ECG-ICU-001"), ("PT-001", "POX-ICU-001"),
        ("PT-002", "ECG-ICU-002"), ("PT-002", "POX-ICU-002"),
        ("PT-003", "ECG-ICU-003"), ("PT-003", "POX-ICU-003"),
        ("PT-004", "ECG-ICU-004"), ("PT-004", "POX-ICU-004"),
    ]
    for p_id, d_id in icu_multi:
        database.assign_device_to_patient(p_id, d_id, assigned_by=admin_id)
        assigned_pairs.append((p_id, d_id))

    # Explicit mapping for remaining devices ensuring all 55 devices are actively assigned
    # and all admitted patients (including PT-005, PT-008, PT-039, PT-055) have active devices
    remaining_pairs = [
        ("PT-005", "ECG-ICU-005"),
        ("PT-008", "ECG-ICU-006"),
        ("PT-039", "ECG-ICU-007"),
        ("PT-006", "ECG-ICU-008"),
        ("PT-006", "ECG-ICU-009"),
        ("PT-007", "ECG-ICU-010"),
        ("PT-009", "POX-ICU-005"),
        ("PT-010", "POX-ICU-006"),
        ("PT-011", "POX-ICU-007"),
        ("PT-012", "POX-ICU-008"),
        ("PT-013", "POX-ICU-009"),
        ("PT-014", "POX-ICU-010"),
        ("PT-015", "PUMP-GEN-001"),
        ("PT-016", "PUMP-GEN-002"),
        ("PT-017", "PUMP-GEN-003"),
        ("PT-018", "PUMP-GEN-004"),
        ("PT-019", "PUMP-GEN-005"),
        ("PT-020", "PUMP-GEN-006"),
        ("PT-021", "PUMP-GEN-007"),
        ("PT-022", "PUMP-GEN-008"),
        ("PT-023", "PUMP-GEN-009"),
        ("PT-024", "PUMP-GEN-010"),
        ("PT-025", "BP-CARD-001"),
        ("PT-026", "BP-CARD-002"),
        ("PT-027", "BP-CARD-003"),
        ("PT-028", "BP-CARD-004"),
        ("PT-029", "BP-CARD-005"),
        ("PT-030", "BP-CARD-006"),
        ("PT-031", "BP-CARD-007"),
        ("PT-032", "BP-CARD-008"),
        ("PT-033", "BP-CARD-009"),
        ("PT-034", "BP-CARD-010"),
        ("PT-035", "GLUC-ENDO-001"),
        ("PT-036", "GLUC-ENDO-003"),
        ("PT-037", "GLUC-ENDO-004"),
        ("PT-038", "GLUC-ENDO-005"),
        ("PT-040", "GLUC-ENDO-006"),
        ("PT-041", "GLUC-ENDO-007"),
        ("PT-042", "GLUC-ENDO-008"),
        ("PT-043", "TEMP-SURG-001"),
        ("PT-044", "TEMP-SURG-002"),
        ("PT-045", "TEMP-SURG-003"),
        ("PT-046", "TEMP-SURG-004"),
        ("PT-047", "TEMP-SURG-005"),
        ("PT-048", "TEMP-SURG-006"),
        ("PT-049", "TEMP-SURG-007"),
        ("PT-055", "GLUC-ENDO-002"),
    ]
    for p_id, d_id in remaining_pairs:
        database.assign_device_to_patient(p_id, d_id, assigned_by=admin_id)
        assigned_pairs.append((p_id, d_id))

    print(f"[4/5] Created {len(assigned_pairs)} active device-to-patient assignments (including multi-device ICU bindings).")

    # 5. Continuous Multi-day Telemetry & AI Evaluations (Sept 1 - Sept 7, 2026)
    dates = [
        datetime.date(2026, 9, 1),
        datetime.date(2026, 9, 2),
        datetime.date(2026, 9, 3),
        datetime.date(2026, 9, 4),
        datetime.date(2026, 9, 5),
        datetime.date(2026, 9, 6),
        datetime.date(2026, 9, 7)
    ]

    total_evals = 0
    total_alerts = 0

    for dt in dates:
        for p_pair_idx, (p_id, d_id) in enumerate(assigned_pairs):
            # Deterministic staggered time for realistic daily simulation
            reading_time = datetime.datetime.combine(dt, datetime.time(8, 0, 0)) + timedelta(minutes=p_pair_idx * 11)
            dt_str = reading_time.isoformat()
            # Determine profile based on device ID
            is_critical_attack = (d_id in ["PUMP-GEN-005", "POX-ICU-009"] and dt.day >= 4)
            is_warning_drift = (d_id in ["ECG-ICU-007", "BP-CARD-008"] and dt.day >= 5)

            if is_critical_attack:
                # Spoofing / Data Alteration attack profile
                hr = 158.0
                spo2 = 82.0
                sys_bp = 188.0
                dia_bp = 118.0
                temp = 39.4
                gluc = 240.0
                drift = 0.88
                noise = 0.76
                lat = 210.5
                loss = 0.18
                
                dev_feats = {
                    "Heart_Rate": hr, "SpO2": spo2, "Systolic_BP": sys_bp, "Diastolic_BP": dia_bp,
                    "Body_Temperature": temp, "Blood_Glucose": gluc, "Battery_Level": 22.0,
                    "Battery_Health": 65.0, "Charging_Cycles": 320,
                    "Sensor_Drift": drift, "Sensor_Noise": noise, "Calibration_Status": 0,
                    "CPU_Usage": 94.0, "Memory_Usage": 89.0, "Device_Uptime": 14000,
                    "RSSI": -88.0, "Signal_Strength": 35.0, "Network_Latency": lat,
                    "Packet_Loss": loss, "Jitter": 18.5, "Restart_Count": 4
                }
                net_feats = {
                    "Dir": 0, "Flgs": 4, "SrcLoad": 284000.0, "DstLoad": 185000.0,
                    "Loss": 12.0, "Rate": 14500.0, "SpO2": spo2, "Heart_Rate": hr,
                    "Systolic_BP": sys_bp, "Diastolic_BP": dia_bp, "Body_Temperature": temp,
                    "Blood_Glucose": gluc
                }
                d_sub = random.uniform(35.0, 48.0)
                a_sub = random.uniform(20.0, 42.0)
                flag_vital = "Heart Rate & Blood Pressure Spikes"
                reason = "Model B detected Data Alteration / Spoofing signatures. Unauthorized network payload modification."
                action = "Isolate device from clinical network immediately; switch patient to manual monitoring."
            elif is_warning_drift:
                # Sensor drift / degradation
                hr = 88.0
                spo2 = 94.5
                sys_bp = 138.0
                dia_bp = 88.0
                temp = 37.2
                gluc = 115.0
                drift = 0.42
                noise = 0.35
                lat = 68.0
                loss = 0.02

                dev_feats = {
                    "Heart_Rate": hr, "SpO2": spo2, "Systolic_BP": sys_bp, "Diastolic_BP": dia_bp,
                    "Body_Temperature": temp, "Blood_Glucose": gluc, "Battery_Level": 45.0,
                    "Battery_Health": 82.0, "Charging_Cycles": 180,
                    "Sensor_Drift": drift, "Sensor_Noise": noise, "Calibration_Status": 1,
                    "CPU_Usage": 52.0, "Memory_Usage": 58.0, "Device_Uptime": 85000,
                    "RSSI": -68.0, "Signal_Strength": 72.0, "Network_Latency": lat,
                    "Packet_Loss": loss, "Jitter": 6.2, "Restart_Count": 1
                }
                net_feats = {
                    "Dir": 0, "Flgs": 0, "SrcLoad": 12000.0, "DstLoad": 11000.0,
                    "Loss": 0.0, "Rate": 450.0, "SpO2": spo2, "Heart_Rate": hr,
                    "Systolic_BP": sys_bp, "Diastolic_BP": dia_bp, "Body_Temperature": temp,
                    "Blood_Glucose": gluc
                }
                d_sub = random.uniform(58.0, 72.0)
                a_sub = random.uniform(65.0, 78.0)
                flag_vital = "Sensor Calibration Drift"
                reason = "Hardware sensor drift detected above operational threshold. Model A suggests recalibration."
                action = "Monitor device closely; schedule technician calibration at next maintenance window."
            else:
                # Nominal trusted profile
                hr = random.uniform(68.0, 78.0)
                spo2 = random.uniform(97.0, 99.5)
                sys_bp = random.uniform(115.0, 125.0)
                dia_bp = random.uniform(75.0, 82.0)
                temp = random.uniform(36.5, 37.0)
                gluc = random.uniform(85.0, 105.0)
                drift = random.uniform(0.01, 0.08)
                noise = random.uniform(0.01, 0.06)
                lat = random.uniform(12.0, 24.0)
                loss = 0.0

                dev_feats = {
                    "Heart_Rate": hr, "SpO2": spo2, "Systolic_BP": sys_bp, "Diastolic_BP": dia_bp,
                    "Body_Temperature": temp, "Blood_Glucose": gluc, "Battery_Level": random.uniform(75.0, 98.0),
                    "Battery_Health": 98.0, "Charging_Cycles": random.randint(15, 60),
                    "Sensor_Drift": drift, "Sensor_Noise": noise, "Calibration_Status": 1,
                    "CPU_Usage": random.uniform(18.0, 32.0), "Memory_Usage": random.uniform(25.0, 40.0),
                    "Device_Uptime": random.randint(1200, 45000),
                    "RSSI": -55.0, "Signal_Strength": 92.0, "Network_Latency": lat,
                    "Packet_Loss": loss, "Jitter": 2.5, "Restart_Count": 0
                }
                net_feats = {
                    "Dir": 0, "Flgs": 0, "SrcLoad": 8500.0, "DstLoad": 8200.0,
                    "Loss": 0.0, "Rate": 250.0, "SpO2": spo2, "Heart_Rate": hr,
                    "Systolic_BP": sys_bp, "Diastolic_BP": dia_bp, "Body_Temperature": temp,
                    "Blood_Glucose": gluc
                }
                d_sub = random.uniform(88.0, 98.0)
                a_sub = random.uniform(92.0, 99.0)
                flag_vital = None
                reason = "Continuous AI verification nominal. Dual-model evaluated trusted baseline telemetry."
                action = "Accept telemetry without restriction; maintain continuous verification."

            vitals_dict = {
                "heart_rate": round(hr, 1),
                "spo2": round(spo2, 1),
                "systolic_bp": round(sys_bp, 1),
                "diastolic_bp": round(dia_bp, 1),
                "body_temperature": round(temp, 1),
                "blood_glucose": round(gluc, 1),
                "respiratory_rate": 16.0,
                "ecg_value": 0.15
            }

            # Calculate unified score
            final_trust = round(0.45 * d_sub + 0.55 * a_sub, 2)
            decision = backend.decide(final_trust)
            explanation = backend.explain(dev_feats, net_feats)

            # Insert telemetry reading
            telem_id = database.insert_telemetry_reading(
                device_id=d_id,
                patient_id=p_id,
                vitals=vitals_dict,
                device_features=dev_feats,
                network_features=net_feats,
                payload_hash=hashlib.sha256(f"{d_id}:{dt_str}:{hr}".encode("utf-8")).hexdigest(),
                timestamp=dt_str
            )

            # Insert trust evaluation
            d_probs = {"Trusted": round(d_sub/100, 3), "Monitor": round(max(0, 1 - d_sub/100)*0.6, 3), "Untrusted": round(max(0, 1 - d_sub/100)*0.4, 3)}
            a_probs = {"normal": round(a_sub/100, 3), "Spoofing": round(max(0, 1 - a_sub/100)*0.6, 3), "Data Alteration": round(max(0, 1 - a_sub/100)*0.4, 3)}

            eval_id = database.insert_trust_evaluation(
                telemetry_id=telem_id,
                device_id=d_id,
                patient_id=p_id,
                device_trust_subscore=round(d_sub, 2),
                device_probabilities=d_probs,
                data_authenticity_subscore=round(a_sub, 2),
                authenticity_probabilities=a_probs,
                final_trust_score=final_trust,
                decision=decision,
                flagged_vital=flag_vital,
                clinical_reason=reason,
                recommended_action=action,
                xai_explanation=explanation,
                timestamp=dt_str
            )
            total_evals += 1

            # Generate alerts for non-Accept decisions
            if decision == "Isolate":
                database.create_security_alert(
                    device_id=d_id,
                    patient_id=p_id,
                    severity="Critical",
                    alert_type="Security Threat / Attack",
                    message=f"CRITICAL: Device {d_id} isolated. Trust score {final_trust}%. {reason}",
                    trust_evaluation_id=eval_id,
                    timestamp=dt_str
                )
                total_alerts += 1
            elif decision == "Monitor":
                database.create_security_alert(
                    device_id=d_id,
                    patient_id=p_id,
                    severity="Warning",
                    alert_type="Operational Anomaly",
                    message=f"WARNING: Device {d_id} under close monitoring. Trust score {final_trust}%. {reason}",
                    trust_evaluation_id=eval_id,
                    timestamp=dt_str
                )
                total_alerts += 1

    print(f"[5/5] Ingested {total_evals} AI trust evaluations and {total_alerts} security alerts across 7 days (Sept 1–7, 2026).")
    print("==================================================")
    print("DEMO DATASET SEEDING COMPLETE AND VERIFIED!")
    print("==================================================")

if __name__ == "__main__":
    run_seeder()
