import React, { useState, useEffect } from 'react';
import { X, Cpu, Copy, Check, AlertCircle, Key, ShieldCheck } from 'lucide-react';

export function DeviceFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  apiError = null,
  provisionedKey = null,
  onDone = null,
}) {
  const [formData, setFormData] = useState({
    device_id: '',
    device_name: '',
    device_type: 'ECG Monitor',
    department: 'ICU',
    location: '',
    firmware_version: 'v1.0.0',
    status: 'Active',
    api_key: '',
  });

  const [copied, setCopied] = useState(false);
  const [clientError, setClientError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        device_id: '',
        device_name: '',
        device_type: 'ECG Monitor',
        department: 'ICU',
        location: '',
        firmware_version: 'v1.0.0',
        status: 'Active',
        api_key: '',
      });
      setClientError('');
      setCopied(false);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        if (provisionedKey && onDone) {
          onDone();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, provisionedKey, onDone, onClose]);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    if (provisionedKey) {
      navigator.clipboard.writeText(provisionedKey).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientError('');

    const cleanId = formData.device_id.trim().toUpperCase();
    const cleanName = formData.device_name.trim();
    const cleanLoc = formData.location.trim();

    if (!cleanId) {
      setClientError('Device ID / Serial is required (e.g. ECG-ICU-001).');
      return;
    }
    if (!cleanName) {
      setClientError('Device Name is required.');
      return;
    }
    if (!cleanLoc) {
      setClientError('Location / Station is required.');
      return;
    }

    const payload = {
      device_id: cleanId,
      device_name: cleanName,
      device_type: formData.device_type,
      department: formData.department,
      location: cleanLoc,
      firmware_version: formData.firmware_version.trim() || 'v1.0.0',
      status: formData.status,
      ...(formData.api_key.trim() ? { api_key: formData.api_key.trim() } : {}),
    };

    onSubmit(payload);
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
        if (e.target === e.currentTarget && !isSubmitting) {
          if (provisionedKey && onDone) onDone();
          else onClose();
        }
      }}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '540px',
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
            <Cpu size={18} color="var(--accent)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: '#fff' }}>
              {provisionedKey ? 'Device Registered & Provisioned' : 'Register Medical IoT Device'}
            </h3>
          </div>
          <button
            onClick={provisionedKey && onDone ? onDone : onClose}
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

        {/* Provisioning Key View (shown after successful registration) */}
        {provisionedKey ? (
          <div style={{ padding: '24px' }}>
            <div
              style={{
                background: 'var(--green-bg)',
                border: '1px solid var(--green)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <ShieldCheck size={24} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: '700', color: '#fff', fontSize: '14px' }}>
                  Hardware Successfully Enrolled
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  The device has been registered in the IoMT registry and is ready for telemetry stream ingestion.
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '8px' }}>
                DEVICE PROVISIONING API KEY (SAVE THIS KEY)
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--panel-2)',
                  border: '1px solid var(--accent)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  gap: '10px',
                }}
              >
                <Key size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
                <code
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: '#fff',
                    wordBreak: 'break-all',
                    flex: 1,
                  }}
                >
                  {provisionedKey}
                </code>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: copied ? 'var(--green)' : 'var(--accent)',
                    border: 'none',
                    color: '#070d18',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '8px' }}>
                Notice: The server stores only the SHA-256 cryptographic hash of this key. This raw key is shown only once and cannot be retrieved later.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onDone || onClose}
                style={{
                  padding: '9px 24px',
                  borderRadius: '8px',
                  background: 'var(--accent)',
                  border: 'none',
                  color: '#070d18',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} style={{ padding: '22px' }}>
            {(clientError || apiError) && (
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
                <span>{clientError || apiError}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              {/* Device ID */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
                  DEVICE SERIAL / MAC <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ECG-ICU-012"
                  value={formData.device_id}
                  onChange={(e) => setFormData({ ...formData, device_id: e.target.value.toUpperCase() })}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Device Type */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
                  DEVICE TYPE
                </label>
                <select
                  value={formData.device_type}
                  onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="ECG Monitor">ECG Monitor</option>
                  <option value="Pulse Oximeter">Pulse Oximeter</option>
                  <option value="Infusion Pump">Infusion Pump</option>
                  <option value="BP Monitor">BP Monitor</option>
                  <option value="Ventilator">Ventilator</option>
                </select>
              </div>
            </div>

            {/* Device Name */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
                DEVICE MODEL / NAME <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Philips IntelliVue MX800"
                value={formData.device_name}
                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--panel-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              {/* Department */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
                  DEPARTMENT
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="ICU">ICU</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="General Ward">General Ward</option>
                  <option value="Endocrinology">Endocrinology</option>
                  <option value="Surgery">Surgery</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
                  LOCATION / ROOM <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ICU Bed 08"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
              {/* Firmware Version */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
                  FIRMWARE VERSION
                </label>
                <input
                  type="text"
                  placeholder="v1.0.0"
                  value={formData.firmware_version}
                  onChange={(e) => setFormData({ ...formData, firmware_version: e.target.value })}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
                  STATUS
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Isolated">Isolated</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </div>

            {/* Form Actions */}
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
                disabled={isSubmitting}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: 'var(--accent)',
                  border: 'none',
                  color: '#070d18',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(62, 201, 255, 0.25)',
                }}
              >
                {isSubmitting ? 'Registering...' : 'Register Device'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default DeviceFormModal;
