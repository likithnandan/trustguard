import React from 'react';
import { AlertTriangle, ShieldAlert, Check, CheckCheck } from 'lucide-react';

export function AlertSummary({ alerts = [], tabs = [], activeCategory, onCategoryChange, onAcknowledge, onAcknowledgeAll, isAckLoading }) {
  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '22px',
        marginBottom: '24px',
      }}
    >
      {/* Header & Batch Acknowledge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="var(--amber)" />
            Active Security Incidents & Anomaly Alerts
          </h3>
          <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
            Stateful security alerts triggered by Model A & Model B trust engine evaluations
          </p>
        </div>

        {alerts.length > 0 && (
          <button
            onClick={onAcknowledgeAll}
            disabled={isAckLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'var(--panel-2)',
              border: '1px solid var(--border-soft)',
              borderRadius: '8px',
              color: 'var(--accent)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
          >
            <CheckCheck size={15} />
            <span>Acknowledge All</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '14px', borderBottom: '1px solid var(--border-soft)' }}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeCategory;
          return (
            <button
              key={tab.key}
              onClick={() => onCategoryChange(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: isActive ? '600' : '500',
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-mono)',
                  background: isActive ? 'var(--accent)' : 'var(--panel-2)',
                  color: isActive ? '#04131c' : 'var(--text-dim)',
                }}
              >
                {tab.n}
              </span>
            </button>
          );
        })}
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)', fontSize: '13px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--green-bg)', color: 'var(--green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <Check size={20} />
            </div>
            <div>No active security alerts in this queue. All systems operating nominally.</div>
          </div>
        ) : (
          alerts.map((a) => {
            const isCritical = a.severity === 'Critical';
            const badgeBg = isCritical ? 'var(--red-bg)' : 'var(--amber-bg)';
            const badgeColor = isCritical ? 'var(--red)' : 'var(--amber)';

            return (
              <div
                key={a.id}
                style={{
                  background: 'var(--panel-2)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: badgeBg,
                      color: badgeColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ShieldAlert size={18} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontWeight: '600', color: '#fff', fontSize: '13px' }}>
                        {a.title}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: '700',
                          fontFamily: 'var(--font-mono)',
                          background: badgeBg,
                          color: badgeColor,
                        }}
                      >
                        {a.severity}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.4' }}>
                      {a.sub || a.message}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      Patient: <span style={{ color: 'var(--accent)' }}>{a.patient_name}</span> · Unit: {a.location} · {a.time}
                    </div>
                  </div>
                </div>

                {/* Single Acknowledge Button */}
                <button
                  onClick={() => onAcknowledge(a.id)}
                  disabled={isAckLoading}
                  title="Acknowledge Alert"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-dim)',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--green)';
                    e.currentTarget.style.color = 'var(--green)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-dim)';
                  }}
                >
                  <Check size={14} />
                  <span>Acknowledge</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AlertSummary;
