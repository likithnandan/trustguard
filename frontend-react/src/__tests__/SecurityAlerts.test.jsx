import { describe, it, expect } from 'vitest';

describe('Security Alerts Filtering and Severity Prioritization', () => {
  const filterAndSortAlerts = (alerts, filterSeverity = null) => {
    let filtered = filterSeverity ? alerts.filter((a) => a.severity === filterSeverity) : [...alerts];
    const weight = { Critical: 3, Warning: 2, Info: 1 };
    return filtered.sort((a, b) => (weight[b.severity] || 0) - (weight[a.severity] || 0));
  };

  it('sorts alerts by critical severity first', () => {
    const mockAlerts = [
      { id: 1, severity: 'Warning', title: 'Battery Low' },
      { id: 2, severity: 'Critical', title: 'Spoofing Attack' },
      { id: 3, severity: 'Info', title: 'Routine Ping' }
    ];

    const sorted = filterAndSortAlerts(mockAlerts);
    expect(sorted[0].severity).toBe('Critical');
    expect(sorted[1].severity).toBe('Warning');
    expect(sorted[2].severity).toBe('Info');
  });

  it('filters alerts by specific severity level', () => {
    const mockAlerts = [
      { id: 1, severity: 'Warning' },
      { id: 2, severity: 'Critical' },
      { id: 3, severity: 'Critical' }
    ];

    const criticalOnly = filterAndSortAlerts(mockAlerts, 'Critical');
    expect(criticalOnly.length).toBe(2);
    expect(criticalOnly.every((a) => a.severity === 'Critical')).toBe(true);
  });
});
