import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';

export function PatientFormModal({
  isOpen,
  onClose,
  onSubmit,
  patient = null, // null for Add, patient object for Edit
  isSubmitting = false,
  apiError = null,
}) {
  const isEdit = Boolean(patient);

  const [formData, setFormData] = useState({
    id: '',
    full_name: '',
    age: '',
    gender: 'Male',
    department: 'ICU',
    room: '',
    status: 'Admitted',
  });

  const [clientError, setClientError] = useState('');

  useEffect(() => {
    if (patient) {
      setFormData({
        id: patient.id || '',
        full_name: patient.full_name || '',
        age: patient.age !== undefined ? String(patient.age) : '',
        gender: patient.gender || 'Male',
        department: patient.department || 'ICU',
        room: patient.room || '',
        status: patient.status || 'Admitted',
      });
    } else {
      setFormData({
        id: '',
        full_name: '',
        age: '',
        gender: 'Male',
        department: 'ICU',
        room: '',
        status: 'Admitted',
      });
    }
    setClientError('');
  }, [patient, isOpen]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientError('');

    const cleanId = formData.id.trim().toUpperCase();
    const cleanName = formData.full_name.trim();
    const cleanRoom = formData.room.trim();
    const ageNum = parseInt(formData.age, 10);

    if (!cleanId && !isEdit) {
      setClientError('Patient ID is required (e.g. PT-1042).');
      return;
    }
    if (!cleanName) {
      setClientError('Patient full name is required.');
      return;
    }
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 130) {
      setClientError('Please enter a valid age between 0 and 130.');
      return;
    }
    if (!cleanRoom) {
      setClientError('Room / Bed allocation is required.');
      return;
    }

    const payload = {
      ...(isEdit ? {} : { id: cleanId }),
      full_name: cleanName,
      age: ageNum,
      gender: formData.gender,
      department: formData.department,
      room: cleanRoom,
      status: formData.status,
    };

    onSubmit(payload, isEdit ? patient.id : null);
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
        {/* Modal Header */}
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
            <UserPlus size={18} color="var(--accent)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: '#fff' }}>
              {isEdit ? `Edit Patient (${patient.id})` : 'Register New Patient'}
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

        {/* Modal Body */}
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
            {/* Patient ID */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
                PATIENT ID {!isEdit && <span style={{ color: 'var(--red)' }}>*</span>}
              </label>
              <input
                type="text"
                placeholder="e.g. PT-1042"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                disabled={isEdit || isSubmitting}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: isEdit ? 'rgba(255,255,255,0.03)' : 'var(--panel-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: isEdit ? 'var(--muted)' : '#fff',
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
                <option value="Admitted">Admitted</option>
                <option value="Critical">Critical</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>
          </div>

          {/* Full Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
              FULL NAME <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Eleanor Vance"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
            {/* Age */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
                AGE (YEARS) <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                max="130"
                placeholder="e.g. 58"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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

            {/* Gender */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
                GENDER
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
            {/* Department */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
                CLINICAL DEPARTMENT
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

            {/* Room / Location */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px' }}>
                ROOM / BED <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Room 302 / Bed B"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
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
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Patient' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientFormModal;
