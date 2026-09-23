import React, { useState, useEffect } from 'react';
import { X, Link2, AlertCircle, CheckCircle } from 'lucide-react';
import { patientApi } from '../../api/patients';
import { deviceApi } from '../../api/devices';

export function AssignDeviceModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedPatientId = null,
  preselectedDeviceId = null,
}) {
  const [patients, setPatients] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setIsLoading(true);

    const loadOptions = async () => {
      try {
        const [pRes, dRes] = await Promise.all([
          patientApi.listPatients(),
          deviceApi.listDevices(),
        ]);

        const activePatients = (pRes?.patients || []).filter((p) => p.status !== 'Discharged');
        const activeDevices = (dRes?.devices || []).filter(
          (d) => d.status !== 'Isolated' && d.status !== 'Decommissioned'
        );

        setPatients(activePatients);
        setDevices(activeDevices);

        if (preselectedPatientId) {
          setSelectedPatientId(preselectedPatientId);
        } else if (activePatients.length > 0) {
          setSelectedPatientId(activePatients[0].id);
        }

        if (preselectedDeviceId) {
          setSelectedDeviceId(preselectedDeviceId);
        } else if (activeDevices.length > 0) {
          setSelectedDeviceId(activeDevices[0].device_id);
        }
      } catch (err) {
        console.error('Failed to load assignment options:', err);
        setError('Failed to retrieve patient or device list for assignment.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOptions();
  }, [isOpen, preselectedPatientId, preselectedDeviceId]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDeviceId) {
      setError('Please select both a patient and a medical IoT device.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await deviceApi.assignDeviceToPatient(selectedPatientId, selectedDeviceId);
      onSuccess(selectedPatientId, selectedDeviceId);
      onClose();
    } catch (err) {
      console.error('Failed to assign device:', err);
      setError(err.message || 'Failed to bind device to patient.');
      setIsSubmitting(false);
    }
  };

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
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '520px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link2 size={18} color="var(--accent)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: '#fff' }}>
              Assign Medical IoT Device
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '22px' }}>
          {error && (
            <div
              style={{
                background: 'var(--red-bg)',
                border: '1px solid var(--red)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                color: 'var(--red)',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
              Loading patient & device registries...
            </div>
          ) : (
            <>
              {/* Select Patient */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
                  TARGET INPATIENT <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  {patients.length === 0 ? (
                    <option value="">No admitted patients available</option>
                  ) : (
                    patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} — {p.full_name} ({p.department}, {p.room}) [{p.status}]
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Select Device */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
                  MEDICAL IOT DEVICE <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  {devices.length === 0 ? (
                    <option value="">No available devices</option>
                  ) : (
                    devices.map((d) => (
                      <option key={d.device_id} value={d.device_id}>
                        {d.device_id} — {d.device_name} ({d.device_type}) [{d.status}]
                      </option>
                    ))
                  )}
                </select>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>
                  Note: A patient can be bound to multiple active devices for comprehensive multi-vital monitoring.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || patients.length === 0 || devices.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    background: 'var(--accent)',
                    border: 'none',
                    color: '#070d18',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: isSubmitting || patients.length === 0 || devices.length === 0 ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(62, 201, 255, 0.25)',
                  }}
                >
                  <Link2 size={15} />
                  <span>{isSubmitting ? 'Binding...' : 'Confirm Binding'}</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default AssignDeviceModal;
