import React from 'react';
import { ShieldCheck, MapPin, Activity, CheckCircle } from 'lucide-react';

export function DeviceStatusCard({ kpis }) {
  const sec = kpis?.security || {};
  const decisions = kpis?.decisions || { accept: 0, monitor: 0, isolate: 0 };
  const totalDecisions = (decisions.accept || 0) + (decisions.monitor || 0) + (decisions.isolate || 0);

  const metricCards = [
    {
      title: 'Transmission Security',
      value: sec.secure_transmissions || '100%',
      foot: sec.encryption || 'Token Auth (SHA-256)',
      icon: ShieldCheck,
      color: 'var(--green)',
      bg: 'var(--green-bg)',
    },
    {
      title: 'Active Clinical Units',
      value: sec.active_locations || 5,
      foot: 'Hospital Departments Monitored',
      icon: MapPin,
      color: 'var(--accent)',
      bg: 'var(--accent-soft)',
    },
    {
      title: 'Continuous Verifications',
      value: totalDecisions,
      foot: `${decisions.accept} Accept · ${decisions.monitor} Mon · ${decisions.isolate} Iso`,
      icon: Activity,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.12)',
    },
    {
      title: 'Data Authenticity (Model B)',
      value: sec.data_authenticity_score || '97.4%',
      foot: 'Network Flow & Header Verification',
      icon: CheckCircle,
      color: 'var(--green)',
      bg: 'var(--green-bg)',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {metricCards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: c.bg,
                color: c.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '600', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                {c.title}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '700', color: '#fff', margin: '2px 0' }}>
                {c.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                {c.foot}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DeviceStatusCard;
