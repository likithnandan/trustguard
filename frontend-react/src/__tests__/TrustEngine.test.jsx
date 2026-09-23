import { describe, it, expect } from 'vitest';

describe('Continuous Trust Engine Logic', () => {
  const computeTrust = (deviceScore, dataAuthScore) => {
    return Number((0.45 * deviceScore + 0.55 * dataAuthScore).toFixed(1));
  };

  const getDecision = (score) => {
    if (score >= 70) return 'Accept';
    if (score >= 40) return 'Monitor';
    return 'Isolate';
  };

  it('computes weighted trust fusion accurately (45% Device, 55% Data)', () => {
    expect(computeTrust(100, 100)).toBe(100.0);
    expect(computeTrust(50, 50)).toBe(50.0);
    expect(computeTrust(80, 60)).toBe(69.0);
  });

  it('classifies trust decisions into Accept, Monitor, and Isolate', () => {
    expect(getDecision(95)).toBe('Accept');
    expect(getDecision(70)).toBe('Accept');
    expect(getDecision(69.9)).toBe('Monitor');
    expect(getDecision(40)).toBe('Monitor');
    expect(getDecision(39.9)).toBe('Isolate');
    expect(getDecision(0)).toBe('Isolate');
  });
});
