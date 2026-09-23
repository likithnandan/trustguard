import React, { useEffect, useState } from 'react';
import { X, User, Cpu, Edit3, Link2, Unlink, AlertCircle } from 'lucide-react';
import { patientApi } from '../../api/patients';
import { useAuth } from '../../hooks/useAuth';

export function PatientDetailsModal({
  isOpen,
  patientId,
  onClose,
  onEditPatient,
  onAssignDevice,
  onDeviceUnassigned,
}) {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Administrator', 'Technician']);

  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unassigningDevId, setUnassigningDevId] = useState(null);

  const fetchDetails = async () => {
    if (!patientId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await patientApi.getPatient(patientId);
      setPatient(data);
    } catch (err) {
      console.error('Failed to load patient details:', err);
      setError(err.message || 'Failed to retrieve patient details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && patientId) {
      fetchDetails();
    } else {
      setPatient(null);
      setError(null);
    }
  }, [isOpen, patientId]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !unassigningDevId) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, unassigningDevId, onClose]);

  if (!isOpen) return null;

  const handleUnassign = async (deviceId) => {
    if (!window.confirm(`Are you sure you want to unbind device '${deviceId}' from patient '${patient?.id}'?`)) {
      return;
    }
    setUnassigningDevId(deviceId);
    try {
      await patientApi.unassignDevice(patient.id, deviceId);
      await fetchDetails();
      if (onDeviceUnassigned) onDeviceUnassigned();
    } catch (err) {
      console.error('Failed to unbind device:', err);
      alert(err.message || 'Failed to unbind device.');
    } finally {
      setUnassigningDevId(null);
    }
  };

  const assignedList =
    patient?.assigned_devices && patient.assigned_devices.length > 0
      ? patient.assigned_devices
      : patient?.assigned_device
      ? [patient.assigned_device]
      : [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 20, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 22px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--panel-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={18} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                {patient ? `${patient.full_name} (${patient.id})` : 'Patient Profile'}
              </h3>
              <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '1px' }}>
                Inpatient Demographics & Multi-Device IoMT Registry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '22px', overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)' }}>
              Loading patient data...
            </div>
          ) : error ? (
            <div
              style={{
                background: 'var(--red-bg)',
                border: '1px solid var(--red)',
                borderRadius: '8px',
                padding: '14px',
                color: 'var(--red)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ) : patient ? (
            <>
              {/* Demographics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '12px',
                  background: 'var(--panel-2)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '20px',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    PATIENT ID
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#fff', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {patient.id}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    AGE & GENDER
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#fff', marginTop: '2px' }}>
                    {patient.age} yrs · {patient.gender}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    DEPARTMENT & ROOM
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#fff', marginTop: '2px' }}>
                    {patient.department} · {patient.room}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    STATUS
                  </div>
                  <div style={{ marginTop: '2px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        fontFamily: 'var(--font-mono)',
                        background:
                          patient.status === 'Critical'
                            ? 'var(--red-bg)'
                            : patient.status === 'Discharged'
                            ? 'rgba(100, 116, 139, 0.12)'
                            : 'var(--green-bg)',
                        color:
                          patient.status === 'Critical'
                            ? 'var(--red)'
                            : patient.status === 'Discharged'
                            ? 'var(--muted)'
                            : 'var(--green)',
                      }}
                    >
                      ● {patient.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bound Devices Section */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '13.5px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={15} color="var(--accent)" />
                    Assigned Medical IoT Devices ({assignedList.length})
                  </h4>

                  {canManage && (
                    <button
                      onClick={() => {
                        onClose();
                        onAssignDevice(patient.id);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'var(--accent-soft)',
                        border: '1px solid var(--accent)',
                        color: 'var(--accent)',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      <Link2 size={13} />
                      <span>+ Assign Device</span>
                    </button>
                  )}
                </div>

                {assignedList.length === 0 ? (
                  <div
                    style={{
                      background: 'var(--panel-2)',
                      border: '1px dashed var(--border)',
                      borderRadius: '10px',
                      padding: '24px',
                      textAlign: 'center',
                      color: 'var(--muted)',
                      fontSize: '12.5px',
                    }}
                  >
                    No Medical IoT devices are currently bound to this patient record.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {assignedList.map((dev) => (
                      <div
                        key={dev.device_id}
                        style={{
                          background: 'var(--panel-2)',
                          border: '1px solid var(--border-soft)',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '600', color: '#fff', fontSize: '13px' }}>
                            {dev.device_name || dev.device_id}{' '}
                            <span style={{ color: 'var(--muted)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                              ({dev.device_id})
                            </span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '2px' }}>
                            Type: {dev.device_type} · Location: {dev.location || patient.room}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600',
                              fontFamily: 'var(--font-mono)',
                              background: 'var(--green-bg)',
                              color: 'var(--green)',
                            }}
                          >
                            Active
                          </span>

                          {canManage && (
                            <button
                              onClick={() => handleUnassign(dev.device_id)}
                              disabled={unassigningDevId === dev.device_id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: 'var(--red-bg)',
                                border: '1px solid var(--red)',
                                color: 'var(--red)',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: unassigningDevId === dev.device_id ? 'not-allowed' : 'pointer',
                              }}
                              title="Unassign this device"
                            >
                              <Unlink size={12} />
                              <span>{unassigningDevId === dev.device_id ? 'Unbinding...' : 'Unbind'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 22px',
            borderTop: '1px solid var(--border)',
            background: 'var(--panel-2)',
          }}
        >
          {canManage && patient ? (
            <button
              onClick={() => {
                onClose();
                onEditPatient(patient);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <Edit3 size={14} />
              <span>Edit Demographics</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: '12.5px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientDetailsModal;
