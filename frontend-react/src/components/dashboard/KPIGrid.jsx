import React from 'react';
import { Cpu, Users, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getTrustColor } from '../../utils/trust';

export function KPIGrid({ kpis, isLoading }) {
  if (isLoading && !kpis) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', height: '110px' }}>
            <div style={{ background: 'var(--panel-2)', height: '14px', width: '50%', borderRadius: '4px', marginBottom: '12px' }}></div>
            <div style={{ background: 'var(--panel-2)', height: '28px', width: '35%', borderRadius: '4px' }}></div>
          </div>
        ))}
      </div>
    );
  }

  const totalDevices = kpis?.total_devices ?? '--';
  const totalPatients = kpis?.total_patients ?? '--';
  const avgScore = kpis?.average_trust_score ?? '--';
  const alertsTotal = kpis?.alerts?.total ?? 0;
  const alertsCritical = kpis?.alerts?.critical ?? 0;
  const alertsWarning = kpis?.alerts?.warning ?? 0;

  const avgColor = typeof avgScore === 'number' ? getTrustColor(avgScore) : 'var(--accent)';

  const kpiItems = [
    {
      label: 'Total Monitored Devices',
      value: totalDevices,
      foot: `${kpis?.trusted_devices ?? 0} Trusted · ${kpis?.at_risk_devices ?? 0} At Risk`,
      icon: Cpu,
      color: 'var(--accent)',
    },
    {
      label: 'Active Inpatients',
      value: totalPatients,
      foot: 'Hospital Units Connected',
      icon: Users,
      color: '#38bdf8',
    },
    {
      label: 'Average Hospital Trust Score',
      value: typeof avgScore === 'number' ? `${avgScore}%` : '--',
      foot: '0.45 DT + 0.55 DA Policy',
      icon: ShieldCheck,
      color: avgColor,
    },
    {
      label: 'Active Security Alerts',
      value: alertsTotal,
      foot: `${alertsCritical} Critical · ${alertsWarning} Warnings`,
      icon: AlertTriangle,
      color: alertsCritical > 0 ? 'var(--red)' : alertsWarning > 0 ? 'var(--amber)' : 'var(--green)',
      pill: alertsCritical > 0 ? 'Critical' : alertsWarning > 0 ? 'Warning' : 'Optimal',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
      {kpiItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px', fontFamily: 'var(--font-mono)' }}>
                {item.label}
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--panel-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                <Icon size={16} />
              </div>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
              {item.value}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {item.pill && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '10.5px',
                    fontWeight: '700',
                    background: item.color === 'var(--red)' ? 'var(--red-bg)' : item.color === 'var(--amber)' ? 'var(--amber-bg)' : 'var(--green-bg)',
                    color: item.color,
                  }}
                >
                  {item.pill}
                </span>
              )}
              <span>{item.foot}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KPIGrid;
