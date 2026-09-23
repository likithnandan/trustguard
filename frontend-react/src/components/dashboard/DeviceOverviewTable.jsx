import React, { useState, useMemo } from 'react';
import { Cpu, Search, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { getTrustColor } from '../../utils/trust';

export function DeviceOverviewTable({ devices = [], tabs = [], activeFilter, onFilterChange, isLoading }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDevices = useMemo(() => {
    let result = devices;

    // Category filter
    if (activeFilter && activeFilter !== 'all') {
      result = result.filter((d) => d.color === activeFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.id?.toLowerCase().includes(q) ||
          d.type?.toLowerCase().includes(q) ||
          d.department?.toLowerCase().includes(q) ||
          d.patient_name?.toLowerCase().includes(q) ||
          d.loc?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [devices, activeFilter, searchQuery]);

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
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} color="var(--accent)" />
            Real-Time IoMT Device Fleet
          </h3>
          <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
            Live status, continuous trust scores, and patient pairing
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: '8px', padding: '6px 12px', width: 'min(300px, 100%)' }}>
          <Search size={14} color="var(--muted)" />
          <input
            type="text"
            placeholder="Search devices, patients, units..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text)',
              fontSize: '12.5px',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '14px', borderBottom: '1px solid var(--border-soft)' }}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeFilter;
          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
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
                whiteSpace: 'nowrap',
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

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              <th style={{ padding: '10px 12px' }}>Device & Patient</th>
              <th style={{ padding: '10px 12px' }}>Device Type</th>
              <th style={{ padding: '10px 12px' }}>Clinical Location</th>
              <th style={{ padding: '10px 12px' }}>Trust Score</th>
              <th style={{ padding: '10px 12px' }}>Decision Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Last Evaluation</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                  {isLoading ? 'Loading device registry...' : 'No matching devices found.'}
                </td>
              </tr>
            ) : (
              filteredDevices.map((d) => {
                const scoreColor = getTrustColor(d.score);
                return (
                  <tr
                    key={d.id}
                    style={{
                      borderBottom: '1px solid var(--border-soft)',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#fff' }}>{d.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                        {d.id} · <span style={{ color: 'var(--text-dim)' }}>{d.patient_name || 'Unassigned'}</span>
                      </div>
                    </td>

                    <td style={{ padding: '12px', color: 'var(--text-dim)' }}>
                      {d.type}
                    </td>

                    <td style={{ padding: '12px', color: 'var(--text-dim)' }}>
                      {d.loc || d.department}
                    </td>

                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '140px' }}>
                        <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--panel-2)', overflow: 'hidden' }}>
                          <div style={{ width: `${d.score}%`, height: '100%', background: scoreColor }}></div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '12px', color: scoreColor }}>
                          {d.score}%
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          fontFamily: 'var(--font-mono)',
                          background: scoreColor === '#2dd4a0' ? 'var(--green-bg)' : scoreColor === '#ffb020' ? 'var(--amber-bg)' : 'var(--red-bg)',
                          color: scoreColor,
                        }}
                      >
                        ● {d.status} ({d.decision})
                      </span>
                    </td>

                    <td style={{ padding: '12px', textAlign: 'right', color: 'var(--muted)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                      {d.updated}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DeviceOverviewTable;
