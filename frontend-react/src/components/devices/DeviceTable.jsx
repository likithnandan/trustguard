import React from 'react';
import { Cpu, Eye, Link2, Unlink, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function DeviceTable({
  devices,
  isLoading,
  onViewDetails,
  onAssignDevice,
  onUnassignDevice,
}) {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Administrator', 'Technician']);

  if (isLoading && (!devices || devices.length === 0)) {
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

  if (!devices || devices.length === 0) {
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
        <Cpu size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>No devices found</div>
        <div style={{ fontSize: '13px' }}>Try adjusting your filters or register a new Medical IoT device.</div>
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
              <th style={{ padding: '12px 18px' }}>Device</th>
              <th style={{ padding: '12px 16px' }}>Type</th>
              <th style={{ padding: '12px 16px' }}>Location</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Assigned Patient</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => {
              const statusColor =
                d.status === 'Active'
                  ? 'var(--green)'
                  : d.status === 'At Risk'
                  ? 'var(--amber)'
                  : d.status === 'Isolated'
                  ? 'var(--red)'
                  : 'var(--muted)';

              const statusBg =
                d.status === 'Active'
                  ? 'var(--green-bg)'
                  : d.status === 'At Risk'
                  ? 'var(--amber-bg)'
                  : d.status === 'Isolated'
                  ? 'var(--red-bg)'
                  : 'rgba(100, 116, 139, 0.12)';

              const assignedPatient = d.assigned_patient;

              return (
                <tr
                  key={d.device_id}
                  style={{
                    borderBottom: '1px solid var(--border-soft)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--panel-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Device Name & Serial ID */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: 'var(--panel-2)',
                          color: 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border)',
                          flexShrink: 0,
                        }}
                      >
                        <Cpu size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#fff', fontSize: '13.5px' }}>{d.device_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{d.device_id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Device Type */}
                  <td style={{ padding: '14px 16px', color: 'var(--text)' }}>
                    {d.device_type}
                  </td>

                  {/* Location & Department */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#fff', fontWeight: '500' }}>{d.department}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{d.location}</div>
                  </td>

                  {/* Status Badge */}
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
                      ● {d.status}
                    </span>
                  </td>

                  {/* Assigned Patient */}
                  <td style={{ padding: '14px 16px' }}>
                    {assignedPatient ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} color="var(--accent)" />
                        <div>
                          <div style={{ fontWeight: '600', color: '#fff', fontSize: '12.5px' }}>
                            {assignedPatient.full_name}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                            {assignedPatient.patient_id} · {assignedPatient.room}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: '12px', fontStyle: 'italic' }}>
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => onViewDetails(d.device_id)}
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
                        title="View Device Details"
                      >
                        <Eye size={13} />
                        <span>Details</span>
                      </button>

                      {canManage && (
                        <>
                          <button
                            onClick={() => onAssignDevice(d.device_id)}
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
                            title={assignedPatient ? 'Reassign Patient' : 'Assign to Patient'}
                          >
                            <Link2 size={13} />
                            <span>{assignedPatient ? 'Reassign' : 'Assign'}</span>
                          </button>

                          {assignedPatient && (
                            <button
                              onClick={() => onUnassignDevice(d.device_id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                background: 'var(--red-bg)',
                                border: '1px solid var(--red)',
                                color: 'var(--red)',
                                fontSize: '11.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                              title="Unbind from Patient"
                            >
                              <Unlink size={13} />
                            </button>
                          )}
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

export default DeviceTable;
