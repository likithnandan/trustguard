"""
Quick test for the TrustGuard-IoMT backend.
Run this AFTER backend.py is already running in another terminal window.

Usage: python test_backend.py
"""

import requests

# Example device reading (values similar to a real row from your dataset)
example_trusted_device = {
    "device_features": {
        "Age": 45, "Battery_Level": 92, "Battery_Health": 88, "Charging_Cycles": 120,
        "CPU_Usage": 48, "Memory_Usage": 40, "Device_Uptime": 80000,
        "RSSI": -50, "Signal_Strength": -50, "Network_Latency": 25, "Packet_Loss": 0.2,
        "Jitter": 0.5, "Sensor_Drift": 0.05, "Sensor_Noise": 0.02, "Restart_Count": 1,
        "Department": 0, "Ward": 0, "Room_No": 0, "Device_Type": 0, "Gender": 0,
        "Calibration_Status": 0
    },
    "network_features": {
        "Dir": 0, "Flgs": 0, "Sport": 443, "Dport": 8080, "SrcBytes": 500, "DstBytes": 600,
        "SrcLoad": 100.0, "DstLoad": 90.0, "SrcGap": 0, "DstGap": 0,
        "SIntPkt": 10.0, "DIntPkt": 10.0, "SIntPktAct": 10.0, "DIntPktAct": 10.0,
        "SrcJitter": 0.5, "DstJitter": 0.5, "sMaxPktSz": 1500, "dMaxPktSz": 1500,
        "sMinPktSz": 60, "dMinPktSz": 60, "Dur": 1.0, "Trans": 2, "TotPkts": 20,
        "TotBytes": 1100, "Load": 95.0, "Loss": 0, "pLoss": 0.0, "pSrcLoss": 0.0,
        "pDstLoss": 0.0, "Rate": 20.0, "Temp": 27.0, "SpO2": 98, "Pulse_Rate": 75,
        "SYS": 120, "DIA": 80, "Heart_rate": 75, "Resp_Rate": 18, "ST": 0.2
    }
}

response = requests.post("http://127.0.0.1:8000/evaluate", json=example_trusted_device)
print("Status code:", response.status_code)
print(response.json())
