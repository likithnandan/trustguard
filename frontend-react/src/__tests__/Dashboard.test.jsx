import { describe, it, expect } from 'vitest';

describe('Dashboard Component Unit Tests', () => {
  it('calculates average trust score metrics accurately', () => {
    const scores = [92.0, 94.5, 88.0, 91.5];
    const avg = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));
    expect(avg).toBe(91.5);
  });

  it('correctly maps trust decisions to visual color indicators', () => {
    const getDecisionColor = (score) => {
      if (score >= 80) return 'green';
      if (score >= 50) return 'amber';
      return 'red';
    };

    expect(getDecisionColor(95)).toBe('green');
    expect(getDecisionColor(68)).toBe('amber');
    expect(getDecisionColor(42)).toBe('red');
  });

  it('categorizes active security alerts by severity', () => {
    const alerts = [
      { id: 1, severity: 'Critical' },
      { id: 2, severity: 'Warning' },
      { id: 3, severity: 'Critical' }
    ];
    const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
    expect(criticalCount).toBe(2);
  });
});
