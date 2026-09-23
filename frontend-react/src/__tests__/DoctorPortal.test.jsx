import { describe, it, expect } from 'vitest';

describe('Doctor Portal Vitals and Trust Inspection Logic', () => {
  const evaluateClinicalAlert = (vital, patient) => {
    if (vital.heartRate > 120 || vital.heartRate < 50) return 'HR Anomaly';
    if (vital.spo2 < 90) return 'Hypoxia Warning';
    if (patient.trust < 70) return 'Trust Degraded';
    return 'Normal';
  };

  it('detects abnormal vitals and low trust scores', () => {
    const normalPatient = { trust: 92 };
    const normalVitals = { heartRate: 75, spo2: 98 };
    expect(evaluateClinicalAlert(normalVitals, normalPatient)).toBe('Normal');

    const lowSpO2Vitals = { heartRate: 80, spo2: 88 };
    expect(evaluateClinicalAlert(lowSpO2Vitals, normalPatient)).toBe('Hypoxia Warning');

    const lowTrustPatient = { trust: 55 };
    expect(evaluateClinicalAlert(normalVitals, lowTrustPatient)).toBe('Trust Degraded');
  });
});
