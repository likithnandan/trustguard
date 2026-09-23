import { describe, it, expect } from 'vitest';

describe('Predictive Maintenance Advisor Logic', () => {
  const calculateMaintenanceStatus = (batteryLevel, trustScore, calibrationDaysAgo) => {
    if (batteryLevel < 20 || trustScore < 40 || calibrationDaysAgo > 180) {
      return { status: 'Urgent', action: 'Immediate Calibration/Battery Replacement' };
    }
    if (batteryLevel < 40 || trustScore < 70 || calibrationDaysAgo > 90) {
      return { status: 'Recommended', action: 'Schedule Inspection within 7 Days' };
    }
    return { status: 'Optimal', action: 'Routine Operations' };
  };

  it('determines device maintenance priority correctly', () => {
    expect(calculateMaintenanceStatus(95, 98, 30).status).toBe('Optimal');
    expect(calculateMaintenanceStatus(35, 85, 45).status).toBe('Recommended');
    expect(calculateMaintenanceStatus(15, 95, 20).status).toBe('Urgent');
    expect(calculateMaintenanceStatus(90, 35, 20).status).toBe('Urgent');
    expect(calculateMaintenanceStatus(90, 95, 200).status).toBe('Urgent');
  });
});
