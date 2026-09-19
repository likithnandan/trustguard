"""
TrustGuard-IoMT / Continuous Trust Verification for Medical IoT
Dataset-Driven IoMT Telemetry Simulator

PURPOSE:
Because real hospital hardware telemetry is not directly accessible, this simulator
extracts genuine data rows from the project datasets to feed the continuous AI
trust verification pipeline:
1. 'Data Sets/project_Dataset_1_v2.xlsx': Provides operational metrics, device degradation,
   sensor drift, battery levels, and baseline clinical vitals (Model A inputs).
2. 'Data Sets/wustl-ehms-2020_with_attacks_categories.csv': Provides real network packet flows,
   biometric transmissions, and genuine cybersecurity attack categories (Normal, Spoofing,
   Data Alteration) captured during real IoMT security testbeds (Model B inputs).

This ensures the system is evaluated on real data patterns without hardcoding static values.
"""

import os
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
DATASET_1_PATH = PROJECT_ROOT / "Data Sets" / "project_Dataset_1_v2.xlsx"
DATASET_2_PATH = PROJECT_ROOT / "Data Sets" / "wustl-ehms-2020_with_attacks_categories.csv"


class DatasetIoMTSimulator:
    """
    Extracts and maps real dataset records into authenticated medical IoT telemetry packets.
    """

    def __init__(self):
        self.df_wustl = None
        self._load_wustl_dataset()

    def _load_wustl_dataset(self):
        """Loads WUSTL-EHMS-2020 dataset for network and authenticity metrics."""
        if DATASET_2_PATH.exists():
            # Load subset of columns to conserve memory
            self.df_wustl = pd.read_csv(DATASET_2_PATH)
        else:
            print(f"Warning: WUSTL dataset not found at {DATASET_2_PATH}")

    def get_dataset_1_sample_row(self, trust_label: Optional[str] = None, row_index: int = 1) -> Dict[str, Any]:
        """
        Reads a row from project_Dataset_1_v2.xlsx using streaming XML parsing.
        """
        if not DATASET_1_PATH.exists():
            return {}

        with zipfile.ZipFile(DATASET_1_PATH) as z:
            strings = []
            if 'xl/sharedStrings.xml' in z.namelist():
                with z.open('xl/sharedStrings.xml') as f:
                    for _, elem in ET.iterparse(f):
                        if elem.tag.endswith('}t'):
                            strings.append(elem.text if elem.text is not None else '')
                        elem.clear()

            headers = []
            with z.open('xl/worksheets/sheet1.xml') as f:
                curr_idx = 0
                for _, elem in ET.iterparse(f):
                    if elem.tag.endswith('}row'):
                        row_vals = []
                        for c in elem:
                            t = c.attrib.get('t')
                            v_el = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                            v = v_el.text if v_el is not None else ''
                            if t == 's' and v != '':
                                v = strings[int(v)]
                            row_vals.append(v)

                        if curr_idx == 0:
                            headers = row_vals
                        elif curr_idx >= row_index:
                            row_dict = dict(zip(headers, row_vals))
                            if trust_label is None or row_dict.get('Trust_Label') == trust_label:
                                return row_dict

                        curr_idx += 1
                        elem.clear()
                        if curr_idx > row_index + 100:
                            break
        return {}

    def get_dataset_2_sample_row(self, attack_category: str = "normal", sample_seed: Optional[int] = None) -> Dict[str, Any]:
        """
        Extracts a real network flow & biometric attack row from the WUSTL-EHMS-2020 dataset.
        attack_category can be: 'normal', 'Spoofing', or 'Data Alteration'.
        """
        if self.df_wustl is None:
            return {}

        sub = self.df_wustl[self.df_wustl["Attack Category"] == attack_category]
        if len(sub) == 0:
            sub = self.df_wustl

        if sample_seed is not None:
            row = sub.sample(n=1, random_state=sample_seed).iloc[0].to_dict()
        else:
            row = sub.iloc[0].to_dict()
        return row

    def build_telemetry_packet(
        self,
        device_id: str,
        api_key: Optional[str] = None,
        scenario: str = "normal",
        row_offset: int = 1
    ) -> Dict[str, Any]:
        """
        Constructs a complete telemetry packet combining Dataset 1 (device telemetry)
        and Dataset 2 (network flow + attack category).

        Scenarios:
        - 'normal': Trusted device + Normal authenticated network traffic -> Expects 'Accept' (Trust >= 70)
        - 'spoofing': Normal device + Spoofed packet flows from WUSTL dataset -> Expects 'Monitor' / 'Isolate'
        - 'data_alteration': Normal device + Tampered biometric biometrics from WUSTL -> Expects 'Isolate' (Trust < 40)
        - 'device_degradation': Degraded battery/sensors from Dataset 1 -> Expects 'Monitor' (Trust 40-69)
        """
        # 1. Extract Dataset 1 operational row
        d1_label = "Monitor" if scenario == "device_degradation" else "Trusted"
        d1_row = self.get_dataset_1_sample_row(trust_label=d1_label, row_index=row_offset)

        # 2. Extract Dataset 2 network flow row
        if scenario == "spoofing":
            d2_row = self.get_dataset_2_sample_row("Spoofing")
        elif scenario == "data_alteration":
            d2_row = self.get_dataset_2_sample_row("Data Alteration")
        else:
            d2_row = self.get_dataset_2_sample_row("normal")

        # 3. Extract and sanitize clinical vitals
        # Prefer numeric biometrics from dataset 1 and 2
        hr = float(d1_row.get("Heart_Rate", d2_row.get("Heart_rate", 75)) or 75)
        spo2 = float(d1_row.get("SpO2", d2_row.get("SpO2", 98)) or 98)
        sys_bp = float(d1_row.get("Systolic_BP", d2_row.get("SYS", 120)) or 120)
        dia_bp = float(d1_row.get("Diastolic_BP", d2_row.get("DIA", 80)) or 80)
        temp = float(d1_row.get("Body_Temperature", d2_row.get("Temp", 36.8)) or 36.8)
        glucose = float(d1_row.get("Blood_Glucose", 95) or 95)
        resp_rate = float(d2_row.get("Resp_Rate", 16) or 16)
        ecg_val = float(d1_row.get("ECG_Value", d2_row.get("ST", 0.0)) or 0.0)

        # 4. Extract device operational features (Model A)
        device_features = {}
        for f in [
            "Battery_Level", "Battery_Health", "Charging_Cycles", "CPU_Usage", "Memory_Usage",
            "Device_Uptime", "RSSI", "Signal_Strength", "Network_Latency", "Packet_Loss",
            "Jitter", "Sensor_Drift", "Sensor_Noise", "Calibration_Status", "Restart_Count",
            "Previous_Battery_Level", "Department", "Ward", "Room_No", "Device_Type"
        ]:
            if f in d1_row:
                try:
                    device_features[f] = float(d1_row[f])
                except:
                    device_features[f] = d1_row[f]

        # 5. Extract network flow features (Model B)
        network_features = {}
        drop_cols = ["SrcAddr", "DstAddr", "SrcMac", "DstMac", "Packet_num", "Label", "Attack Category"]
        for k, v in d2_row.items():
            if k not in drop_cols:
                try:
                    network_features[k] = float(v)
                except:
                    network_features[k] = v

        return {
            "device_id": device_id,
            "api_key": api_key,
            "vitals": {
                "heart_rate": hr,
                "spo2": spo2,
                "systolic_bp": sys_bp,
                "diastolic_bp": dia_bp,
                "body_temperature": temp,
                "blood_glucose": glucose,
                "respiratory_rate": resp_rate,
                "ecg_value": ecg_val
            },
            "device_features": device_features,
            "network_features": network_features,
            "simulation_meta": {
                "source_dataset_1": "project_Dataset_1_v2.xlsx",
                "source_dataset_2": "wustl-ehms-2020_with_attacks_categories.csv",
                "scenario": scenario,
                "d1_original_label": d1_row.get("Trust_Label"),
                "d2_original_category": d2_row.get("Attack Category")
            }
        }


# Global simulator instance
simulator = DatasetIoMTSimulator()
