"""
TrustGuard-IoMT: Controlled Demo Dataset Repair Script
Performs exact, deterministic, non-destructive data repairs on backend/users.db:
1. Fix PT-055: department = 'Pediatrics', status = 'Admitted'
2. Restore multi-device ICU bindings (PT-001..004 -> ECG + POX)
3. Assign unassigned devices (ECG-ICU-005 -> PT-005, ECG-ICU-006 -> PT-008, ECG-ICU-007 -> PT-039, ECG-ICU-008 -> PT-006)
4. Update telemetry and trust_evaluation timestamps with deterministic staggered times across Sept 1-7, 2026
5. Synchronize security_alerts created_at with linked trust_evaluations timestamps
"""

import sqlite3
import datetime
from datetime import timedelta
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "users.db"

def run_controlled_repair():
    print("==================================================")
    print("TrustGuard-IoMT: Executing Controlled Database Repair")
    print("==================================================")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        # ----------------------------------------------------
        # 1. Repair Patient PT-055
        # ----------------------------------------------------
        cursor.execute("""
            UPDATE patients
            SET department = 'Pediatrics', status = 'Admitted'
            WHERE id = 'PT-055'
        """)
        print(f"[REPAIR 1] Updated PT-055 to department='Pediatrics', status='Admitted' (rows: {cursor.rowcount})")

        # ----------------------------------------------------
        # 2. Restore Multi-Device ICU Demo Assignments
        #    POX-ICU-001 -> PT-001
        #    POX-ICU-002 -> PT-002
        #    POX-ICU-003 -> PT-003
        #    POX-ICU-004 -> PT-004
        # ----------------------------------------------------
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        admin_id = 1

        # First deactivate existing active assignments for POX-ICU-001..004
        pox_devices = ["POX-ICU-001", "POX-ICU-002", "POX-ICU-003", "POX-ICU-004"]
        for d_id in pox_devices:
            cursor.execute("""
                UPDATE patient_device_assignments
                SET is_active = 0, unassigned_at = ?
                WHERE device_id = ? AND is_active = 1
            """, (now_iso, d_id))

        # Assign POX-ICU-001..004 to PT-001..004
        icu_pairs = [
            ("PT-001", "POX-ICU-001"),
            ("PT-002", "POX-ICU-002"),
            ("PT-003", "POX-ICU-003"),
            ("PT-004", "POX-ICU-004"),
        ]
        for p_id, d_id in icu_pairs:
            cursor.execute("""
                INSERT INTO patient_device_assignments (
                    patient_id, device_id, assigned_by, assigned_at, is_active
                ) VALUES (?, ?, ?, ?, 1)
            """, (p_id, d_id, admin_id, now_iso))

        print(f"[REPAIR 2] Restored ICU multi-device bindings: PT-001..004 -> POX-ICU-001..004")

        # ----------------------------------------------------
        # 3. Assign Unassigned ECG Devices to Admitted Patients
        #    ECG-ICU-005 -> PT-005
        #    ECG-ICU-006 -> PT-008
        #    ECG-ICU-007 -> PT-039
        #    ECG-ICU-008 -> PT-006 (compatible ICU monitor in Surgery)
        # ----------------------------------------------------
        new_assignments = [
            ("PT-005", "ECG-ICU-005"),
            ("PT-008", "ECG-ICU-006"),
            ("PT-039", "ECG-ICU-007"),
            ("PT-006", "ECG-ICU-008"),
        ]
        for p_id, d_id in new_assignments:
            # Deactivate any previous active assignment for device just in case
            cursor.execute("""
                UPDATE patient_device_assignments
                SET is_active = 0, unassigned_at = ?
                WHERE device_id = ? AND is_active = 1
            """, (now_iso, d_id))
            cursor.execute("""
                INSERT INTO patient_device_assignments (
                    patient_id, device_id, assigned_by, assigned_at, is_active
                ) VALUES (?, ?, ?, ?, 1)
            """, (p_id, d_id, admin_id, now_iso))

        print(f"[REPAIR 3] Assigned unassigned ECG devices: PT-005->ECG-ICU-005, PT-008->ECG-ICU-006, PT-039->ECG-ICU-007, PT-006->ECG-ICU-008")

        # ----------------------------------------------------
        # 4. Stagger Telemetry & Trust Evaluation Timestamps
        #    55 records per day across 7 dates (Sept 1 - Sept 7, 2026)
        #    Stagger deterministically: 08:00:00 + idx*11 minutes
        # ----------------------------------------------------
        days = ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-06", "2026-09-07"]
        total_telem_updated = 0
        total_eval_updated = 0

        for day_str in days:
            # Fetch all telemetry records for this date ordered by id
            cursor.execute("""
                SELECT id, device_id, patient_id FROM telemetry_readings
                WHERE created_at LIKE ?
                ORDER BY id ASC
            """, (f"{day_str}%",))
            t_rows = cursor.fetchall()

            for idx, trow in enumerate(t_rows):
                tid = trow["id"]
                # Stagger by 11 minutes: idx 0 -> 08:00:00, idx 54 -> 17:54:00
                staggered_time = datetime.datetime.strptime(day_str, "%Y-%m-%d") + timedelta(hours=8, minutes=idx * 11)
                staggered_iso = staggered_time.isoformat()

                # Update telemetry reading timestamp & created_at
                cursor.execute("""
                    UPDATE telemetry_readings
                    SET timestamp = ?, created_at = ?
                    WHERE id = ?
                """, (staggered_iso, staggered_iso, tid))
                total_telem_updated += cursor.rowcount

                # Update linked trust evaluation (by telemetry_id)
                cursor.execute("""
                    UPDATE trust_evaluations
                    SET timestamp = ?, created_at = ?
                    WHERE telemetry_id = ?
                """, (staggered_iso, staggered_iso, tid))
                total_eval_updated += cursor.rowcount

        print(f"[REPAIR 4] Updated {total_telem_updated} telemetry timestamps & {total_eval_updated} trust evaluation timestamps with staggered hours across Sept 1-7, 2026.")

        # ----------------------------------------------------
        # 5. Repair Security Alert Timestamps
        #    Set alert created_at to match linked trust_evaluations timestamp
        # ----------------------------------------------------
        cursor.execute("""
            UPDATE security_alerts
            SET created_at = (
                SELECT timestamp FROM trust_evaluations
                WHERE trust_evaluations.id = security_alerts.trust_evaluation_id
            )
            WHERE trust_evaluation_id IS NOT NULL
        """)
        alerts_updated = cursor.rowcount
        print(f"[REPAIR 5] Synchronized {alerts_updated} security alert created_at timestamps with linked trust evaluation timestamps.")

        # Commit all changes
        conn.commit()
        print("==================================================")
        print("CONTROLLED DATABASE REPAIR COMMITTED SUCCESSFULLY!")
        print("==================================================")

    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Transaction rolled back due to error: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    run_controlled_repair()
