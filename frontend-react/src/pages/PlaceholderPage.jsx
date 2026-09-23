import React from 'react';
import { Layers } from 'lucide-react';

export function PlaceholderPage({ title = 'Module', description = 'Module migration pending.' }) {
  return (
    <div style={{ padding: '32px' }}>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '14px', padding: '48px 32px', textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <Layers size={28} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
          {title}
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '24px', maxWidth: '460px', margin: '0 auto 24px' }}>
          {description}
        </p>
        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: '20px', color: 'var(--muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
          Status: Migration Scheduled for Upcoming Phase
        </div>
      </div>
    </div>
  );
}

export default PlaceholderPage;
