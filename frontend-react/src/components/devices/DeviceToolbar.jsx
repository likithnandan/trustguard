import React from 'react';
import { Search, Plus, RefreshCw, Link2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function DeviceToolbar({
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  statusFilter,
  onStatusChange,
  onRegisterDevice,
  onOpenAssign,
  onRefresh,
  isRefreshing,
}) {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Administrator', 'Technician']);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '20px',
      }}
    >
      {/* Search and Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '320px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search by ID, name, location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              background: 'var(--panel-2)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {/* Department Filter */}
        <select
          value={departmentFilter}
          onChange={(e) => onDepartmentChange(e.target.value)}
          style={{
            padding: '8px 12px',
            background: 'var(--panel-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text)',
            fontSize: '12.5px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="all">All Departments</option>
          <option value="ICU">ICU</option>
          <option value="Cardiology">Cardiology</option>
          <option value="General Ward">General Ward</option>
          <option value="Endocrinology">Endocrinology</option>
          <option value="Surgery">Surgery</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          style={{
            padding: '8px 12px',
            background: 'var(--panel-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text)',
            fontSize: '12.5px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="At Risk">At Risk</option>
          <option value="Isolated">Isolated</option>
          <option value="Offline">Offline</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            background: 'var(--panel-2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontSize: '12.5px',
            fontWeight: '500',
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
          }}
          title="Refresh devices"
        >
          <RefreshCw
            size={14}
            style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
          />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>

        {canManage && (
          <>
            <button
              onClick={onOpenAssign}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'var(--panel-2)',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <Link2 size={15} />
              <span>Assign Device</span>
            </button>

            <button
              onClick={onRegisterDevice}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'var(--accent)',
                border: 'none',
                color: '#070d18',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(62, 201, 255, 0.25)',
              }}
            >
              <Plus size={16} />
              <span>Register Device</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default DeviceToolbar;
