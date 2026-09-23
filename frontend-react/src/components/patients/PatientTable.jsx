import React from 'react';
import { Eye, Edit3, Link2, User, Cpu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function PatientTable({
  patients,
  isLoading,
  onViewDetails,
  onEditPatient,
  onAssignDevice,
}) {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Administrator', 'Technician']);

  if (isLoading && (!patients || patients.length === 0)) {
    return (
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: '48px', background: 'var(--panel-2)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          color: 'var(--muted)',
        }}
      >
        <User size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>No patients found</div>
        <div style={{ fontSize: '13px' }}>Try adjusting your search criteria or register a new patient.</div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '11.5px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 18px' }}>Patient</th>
              <th style={{ padding: '12px 16px' }}>Demographics</th>
              <th style={{ padding: '12px 16px' }}>Location</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Assigned IoMT Devices</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => {
              const initials = (p.full_name || 'PT')
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              const statusColor =
                p.status === 'Critical'
                  ? 'var(--red)'
                  : p.status === 'Discharged'
                  ? 'var(--muted)'
                  : 'var(--green)';

              const statusBg =
                p.status === 'Critical'
                  ? 'var(--red-bg)'
                  : p.status === 'Discharged'
                  ? 'rgba(100, 116, 139, 0.12)'
                  : 'var(--green-bg)';

              const devices =
                p.assigned_devices && p.assigned_devices.length > 0
                  ? p.assigned_devices
                  : p.assigned_device
                  ? [p.assigned_device]
                  : [];

              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: '1px solid var(--border-soft)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--panel-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Patient Name & ID */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: 'var(--accent-soft)',
                          color: 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '12px',
                          fontFamily: 'var(--font-mono)',
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#fff', fontSize: '13.5px' }}>{p.full_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{p.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Demographics */}
                  <td style={{ padding: '14px 16px', color: 'var(--text-dim)' }}>
                    {p.age} yrs · {p.gender}
                  </td>

                  {/* Location */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#fff', fontWeight: '500' }}>{p.department}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{p.room}</div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 9px',
                        borderRadius: '12px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        fontFamily: 'var(--font-mono)',
                        background: statusBg,
                        color: statusColor,
                      }}
                    >
                      ● {p.status}
                    </span>
                  </td>

                  {/* Assigned Devices (Support 1:many) */}
                  <td style={{ padding: '14px 16px' }}>
                    {devices.length === 0 ? (
                      <span style={{ color: 'var(--muted)', fontSize: '12px', fontStyle: 'italic' }}>
                        Unassigned
                      </span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {devices.map((dev, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'var(--panel-2)',
                              border: '1px solid var(--border-soft)',
                              fontSize: '11.5px',
                              width: 'fit-content',
                            }}
                          >
                            <Cpu size={12} color="var(--accent)" />
                            <span style={{ color: '#fff', fontWeight: '600' }}>{dev.device_name || dev.device_id}</span>
                            <span style={{ color: 'var(--muted)', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>
                              ({dev.device_type})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => onViewDetails(p.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          background: 'var(--panel-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                        title="View Patient Details"
                      >
                        <Eye size={13} />
                        <span>Details</span>
                      </button>

                      {canManage && (
                        <>
                          <button
                            onClick={() => onEditPatient(p)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: 'var(--panel-2)',
                              border: '1px solid var(--border)',
                              color: 'var(--text)',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                            title="Edit Demographics"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => onAssignDevice(p.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: 'var(--accent-soft)',
                              border: '1px solid var(--accent)',
                              color: 'var(--accent)',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                            title="Assign Medical IoT Device"
                          >
                            <Link2 size={13} />
                            <span>Assign</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PatientTable;
