import React, { useEffect, useState } from 'react';
import { X, Cpu, User, Link2, Unlink, AlertCircle, ShieldCheck } from 'lucide-react';
import { deviceApi } from '../../api/devices';
import { useAuth } from '../../hooks/useAuth';

export function DeviceDetailsModal({
  isOpen,
  deviceId,
  onClose,
  onAssignDevice,
  onDeviceUnassigned,
}) {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Administrator', 'Technician']);

  const [device, setDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnassigning, setIsUnassigning] = useState(false);

  const fetchDetails = async () => {
    if (!deviceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await deviceApi.getDevice(deviceId);
      setDevice(data);
    } catch (err) {
      console.error('Failed to load device details:', err);
      setError(err.message || 'Failed to retrieve device details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && deviceId) {
      fetchDetails();
    } else {
      setDevice(null);
      setError(null);
    }
  }, [isOpen, deviceId]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isUnassigning) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isUnassigning, onClose]);

  if (!isOpen) return null;

  const handleUnassign = async () => {
    if (!window.confirm(`Are you sure you want to unbind device '${device?.device_id}' from its current patient?`)) {
      return;
    }
    setIsUnassigning(true);
    try {
      await deviceApi.unassignDevice(device.device_id);
      await fetchDetails();
      if (onDeviceUnassigned) onDeviceUnassigned();
    } catch (err) {
      console.error('Failed to unassign device:', err);
      alert(err.message || 'Failed to unassign device.');
    } finally {
      setIsUnassigning(false);
    }
  };

  const assignedPatient = device?.assigned_patient;

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
        if (e.target === e.currentTarget && !isUnassigning) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '600px',
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
                background: 'var(--panel)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border)',
              }}
            >
              <Cpu size={18} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                {device ? `${device.device_name} (${device.device_id})` : 'Device Profile'}
              </h3>
              <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '1px' }}>
                Hardware Specifications & Patient Binding Record
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
              Loading device specifications...
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
          ) : device ? (
            <>
              {/* Device Metadata Grid */}
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
                    DEVICE ID
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {device.device_id}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    HARDWARE TYPE
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginTop: '2px' }}>
                    {device.device_type}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    LOCATION
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginTop: '2px' }}>
                    {device.department} · {device.location}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    FIRMWARE
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {device.firmware_version || 'v1.0.0'}
                  </div>
                </div>
              </div>

              {/* Patient Binding Section */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '13.5px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={15} color="var(--accent)" />
                    Active Patient Binding
                  </h4>

                  {canManage && (
                    <button
                      onClick={() => {
                        onClose();
                        onAssignDevice(device.device_id);
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
                      <span>{assignedPatient ? 'Reassign' : 'Assign Patient'}</span>
                    </button>
                  )}
                </div>

                {assignedPatient ? (
                  <div
                    style={{
                      background: 'var(--panel-2)',
                      border: '1px solid var(--border-soft)',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '13.5px' }}>
                        {assignedPatient.full_name}{' '}
                        <span style={{ color: 'var(--muted)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                          ({assignedPatient.patient_id})
                        </span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        Room: {assignedPatient.room} · Assigned: {assignedPatient.assigned_at || 'Active'}
                      </div>
                    </div>

                    {canManage && (
                      <button
                        onClick={handleUnassign}
                        disabled={isUnassigning}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          background: 'var(--red-bg)',
                          border: '1px solid var(--red)',
                          color: 'var(--red)',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          cursor: isUnassigning ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Unlink size={13} />
                        <span>{isUnassigning ? 'Unbinding...' : 'Unbind Patient'}</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      background: 'var(--panel-2)',
                      border: '1px dashed var(--border)',
                      borderRadius: '10px',
                      padding: '20px',
                      textAlign: 'center',
                      color: 'var(--muted)',
                      fontSize: '12.5px',
                    }}
                  >
                    This device is not bound to any active patient.
                  </div>
                )}
              </div>

              {/* Security & Ingestion Details */}
              <div
                style={{
                  background: 'var(--panel-2)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--green)', fontSize: '12.5px', fontWeight: '700' }}>
                  <ShieldCheck size={16} />
                  <span>Security & Ingestion Status</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                  Device telemetry transmissions are verified using SHA-256 token authorization headers. Telemetry streams feed continuous XGBoost Model A (Device Trust) and Model B (Data Authenticity) evaluation pipelines.
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '14px 22px',
            borderTop: '1px solid var(--border)',
            background: 'var(--panel-2)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
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

export default DeviceDetailsModal;
