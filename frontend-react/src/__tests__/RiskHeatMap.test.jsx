import { describe, it, expect } from 'vitest';

describe('Risk Heat Map Aggregation Logic', () => {
  const aggregateDepartmentRisk = (devices) => {
    const counts = { ICU: 0, Ward: 0, Cardiology: 0, Emergency: 0 };
    const atRisk = { ICU: 0, Ward: 0, Cardiology: 0, Emergency: 0 };

    devices.forEach((d) => {
      const dept = d.dept || d.department || 'Ward';
      if (counts[dept] !== undefined) {
        counts[dept]++;
        if (d.trustScore < 70) {
          atRisk[dept]++;
        }
      }
    });

    return { counts, atRisk };
  };

  it('aggregates device distribution and risk factors across departments', () => {
    const mockDevices = [
      { id: 'D1', dept: 'ICU', trustScore: 95 },
      { id: 'D2', dept: 'ICU', trustScore: 45 },
      { id: 'D3', dept: 'Ward', trustScore: 88 },
      { id: 'D4', dept: 'Cardiology', trustScore: 30 }
    ];

    const { counts, atRisk } = aggregateDepartmentRisk(mockDevices);
    expect(counts.ICU).toBe(2);
    expect(atRisk.ICU).toBe(1);
    expect(counts.Ward).toBe(1);
    expect(atRisk.Ward).toBe(0);
    expect(counts.Cardiology).toBe(1);
    expect(atRisk.Cardiology).toBe(1);
  });
});
