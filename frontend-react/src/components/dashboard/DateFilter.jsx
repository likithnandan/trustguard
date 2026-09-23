import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, RefreshCw } from 'lucide-react';

export function DateFilter({ startDate, endDate, onDateChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(startDate || '');
  const [customEnd, setCustomEnd] = useState(endDate || '');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePreset = (days) => {
    if (days === 'all') {
      onReset();
      setCustomStart('');
      setCustomEnd('');
      setIsOpen(false);
      return;
    }

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - parseInt(days, 10));

    const sStr = start.toISOString().split('T')[0];
    const eStr = end.toISOString().split('T')[0];

    setCustomStart(sStr);
    setCustomEnd(eStr);
    onDateChange(sStr, eStr);
    setIsOpen(false);
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (customStart || customEnd) {
      onDateChange(customStart, customEnd);
      setIsOpen(false);
    }
  };

  const isFiltered = Boolean(startDate || endDate);
  const filterLabel = isFiltered
    ? `${startDate || 'Start'} → ${endDate || 'Now'}`
    : 'All Telemetry Data';

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: isFiltered ? 'var(--accent-soft)' : 'var(--panel)',
          border: `1px solid ${isFiltered ? 'var(--accent)' : 'var(--border)'}`,
          color: isFiltered ? 'var(--accent)' : 'var(--text)',
          borderRadius: '20px',
          padding: '6px 14px',
          fontSize: '12.5px',
          fontFamily: 'var(--font-mono)',
          cursor: 'pointer',
        }}
      >
        <Calendar size={14} />
        <span>{filterLabel}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '280px',
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 12px 28px rgba(0,0,0,0.5)',
            zIndex: 50,
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '10px' }}>
            Quick Presets
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '16px' }}>
            <button
              onClick={() => handlePreset('7')}
              style={{ padding: '6px 8px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: '6px', color: 'var(--text)', fontSize: '12px', cursor: 'pointer' }}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handlePreset('10')}
              style={{ padding: '6px 8px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: '6px', color: 'var(--text)', fontSize: '12px', cursor: 'pointer' }}
            >
              Last 10 Days
            </button>
            <button
              onClick={() => handlePreset('30')}
              style={{ padding: '6px 8px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: '6px', color: 'var(--text)', fontSize: '12px', cursor: 'pointer' }}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => handlePreset('all')}
              style={{ padding: '6px 8px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: '6px', color: 'var(--text)', fontSize: '12px', cursor: 'pointer' }}
            >
              All Time
            </button>
          </div>

          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>
            Custom Date Range
          </div>

          <form onSubmit={handleApplyCustom}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '10.5px', color: 'var(--muted)', marginBottom: '4px' }}>Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                style={{ width: '100%', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: '6px', padding: '6px 10px', color: 'var(--text)', fontSize: '12px' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '10.5px', color: 'var(--muted)', marginBottom: '4px' }}>End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                style={{ width: '100%', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: '6px', padding: '6px 10px', color: 'var(--text)', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => { onReset(); setIsOpen(false); }}
                style={{ flex: 1, padding: '7px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--muted)', fontSize: '12px', cursor: 'pointer' }}
              >
                Reset
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '7px 10px', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: '#04131c', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default DateFilter;
