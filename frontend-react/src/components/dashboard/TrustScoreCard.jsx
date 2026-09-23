import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { getTrustColor, getTrustDecision } from '../../utils/trust';

export function TrustScoreCard({ kpis }) {
  const avgScore = kpis?.average_trust_score ?? 88.5;
  const decision = getTrustDecision(avgScore);
  const color = getTrustColor(avgScore);

  const decisions = kpis?.decisions || { accept: 0, monitor: 0, isolate: 0 };
  const totalEvaluated = (decisions.accept || 0) + (decisions.monitor || 0) + (decisions.isolate || 0) || 1;

  const acceptPct = Math.round(((decisions.accept || 0) / totalEvaluated) * 100);
  const monitorPct = Math.round(((decisions.monitor || 0) / totalEvaluated) * 100);
  const isolatePct = Math.round(((decisions.isolate || 0) / totalEvaluated) * 100);

  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', color: '#fff' }}>
              Ecosystem Trust Index
            </h3>
            <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
              Continuous Trust Score = 0.45 DT + 0.55 DA
            </p>
          </div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              fontFamily: 'var(--font-mono)',
              background: color === '#2dd4a0' ? 'var(--green-bg)' : color === '#ffb020' ? 'var(--amber-bg)' : 'var(--red-bg)',
              color: color,
            }}
          >
            {decision}
          </span>
        </div>

        {/* Large Score Display */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '18px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '38px', fontWeight: '700', color: '#fff' }}>
            {avgScore}%
          </span>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Fleet-Wide Weighted Trust</span>
        </div>

        {/* Multi-segment Trust Bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ height: '8px', width: '100%', borderRadius: '4px', background: 'var(--panel-2)', display: 'flex', overflow: 'hidden', gap: '2px' }}>
            <div style={{ width: `${acceptPct}%`, background: 'var(--green)' }} title={`Accept: ${decisions.accept}`}></div>
            <div style={{ width: `${monitorPct}%`, background: 'var(--amber)' }} title={`Monitor: ${decisions.monitor}`}></div>
            <div style={{ width: `${isolatePct}%`, background: 'var(--red)' }} title={`Isolate: ${decisions.isolate}`}></div>
          </div>
        </div>
      </div>

      {/* Decision Thresholds Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '14px', borderTop: '1px solid var(--border-soft)' }}>
        <div style={{ background: 'var(--panel-2)', padding: '10px 12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--green)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
            <CheckCircle2 size={13} /> Accept (≥80)
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: '700', color: '#fff' }}>
            {decisions.accept}
          </div>
        </div>

        <div style={{ background: 'var(--panel-2)', padding: '10px 12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--amber)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
            <AlertCircle size={13} /> Monitor (50-79)
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: '700', color: '#fff' }}>
            {decisions.monitor}
          </div>
        </div>

        <div style={{ background: 'var(--panel-2)', padding: '10px 12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--red)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
            <XCircle size={13} /> Isolate (&lt;50)
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: '700', color: '#fff' }}>
            {decisions.isolate}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrustScoreCard;
