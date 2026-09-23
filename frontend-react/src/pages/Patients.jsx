import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { patientApi } from '../api/patients';
import {
  PatientToolbar,
  PatientTable,
  PatientFormModal,
  PatientDetailsModal,
} from '../components/patients';
import { AssignDeviceModal } from '../components/devices';

export function Patients() {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formApiError, setFormApiError] = useState(null);

  const [detailsPatientId, setDetailsPatientId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [assignPatientId, setAssignPatientId] = useState(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadPatients = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const data = await patientApi.listPatients({
        department: departmentFilter !== 'all' ? departmentFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setPatients(data?.patients || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch patients census:', err);
      setError('Unable to load patient records from backend.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [departmentFilter, statusFilter]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Client-side search and status/department filtering
  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return patients.filter((p) => {
      // Status filter
      if (statusFilter && statusFilter !== 'all') {
        if ((p.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
      }
      // Department filter
      if (departmentFilter && departmentFilter !== 'all') {
        if ((p.department || '').toLowerCase() !== departmentFilter.toLowerCase()) return false;
      }
      if (!q) return true;
      const matchName = (p.full_name || '').toLowerCase().includes(q);
      const matchId = (p.id || '').toLowerCase().includes(q);
      const matchRoom = (p.room || '').toLowerCase().includes(q);
      const matchDept = (p.department || '').toLowerCase().includes(q);
      return matchName || matchId || matchRoom || matchDept;
    });
  }, [patients, searchQuery, departmentFilter, statusFilter]);

  // Form submission for Add & Edit
  const handleFormSubmit = async (payload, editId) => {
    setIsSubmitting(true);
    setFormApiError(null);

    try {
      if (editId) {
        await patientApi.updatePatient(editId, payload);
        showToast(`Patient ${editId} updated successfully.`);
      } else {
        await patientApi.createPatient(payload);
        showToast(`Patient ${payload.id} registered successfully.`);
      }
      setIsFormOpen(false);
      setEditingPatient(null);
      loadPatients();
    } catch (err) {
      console.error('Error saving patient:', err);
      setFormApiError(err.message || 'Failed to save patient record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open modals
  const handleOpenAdd = () => {
    setEditingPatient(null);
    setFormApiError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (patient) => {
    setEditingPatient(patient);
    setFormApiError(null);
    setIsFormOpen(true);
  };

  const handleOpenDetails = (patientId) => {
    setDetailsPatientId(patientId);
    setIsDetailsOpen(true);
  };

  const handleOpenAssign = (patientId) => {
    setAssignPatientId(patientId);
    setIsAssignOpen(true);
  };

  const handleAssignSuccess = (patientId, deviceId) => {
    showToast(`Device ${deviceId} successfully assigned to ${patientId}!`);
    loadPatients();
  };

  return (
    <main style={{ padding: '24px 28px', flex: 1, minWidth: 0, overflowY: 'auto' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: toast.type === 'error' ? 'var(--red-bg)' : 'var(--green-bg)',
            border: `1px solid ${toast.type === 'error' ? 'var(--red)' : 'var(--green)'}`,
            borderRadius: '10px',
            padding: '12px 18px',
            color: toast.type === 'error' ? 'var(--red)' : 'var(--green)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 10000,
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={22} color="var(--accent)" />
          Inpatient Census & Demographics
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '3px' }}>
          Hospital patient management, active room allocations, and multi-device IoMT telemetry pairing
        </p>
      </div>

      {/* Error Notice */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            background: 'var(--red-bg)',
            border: '1px solid var(--red)',
            borderRadius: '8px',
            color: 'var(--red)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Toolbar */}
      <PatientToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onAddPatient={handleOpenAdd}
        onRefresh={() => loadPatients(true)}
        isRefreshing={isRefreshing}
      />

      {/* Patient Table */}
      <PatientTable
        patients={filteredPatients}
        isLoading={isLoading}
        onViewDetails={handleOpenDetails}
        onEditPatient={handleOpenEdit}
        onAssignDevice={handleOpenAssign}
      />

      {/* Form Modal (Add/Edit) */}
      <PatientFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        patient={editingPatient}
        isSubmitting={isSubmitting}
        apiError={formApiError}
      />

      {/* Details Modal */}
      <PatientDetailsModal
        isOpen={isDetailsOpen}
        patientId={detailsPatientId}
        onClose={() => setIsDetailsOpen(false)}
        onEditPatient={(p) => {
          setIsDetailsOpen(false);
          handleOpenEdit(p);
        }}
        onAssignDevice={(pId) => {
          setIsDetailsOpen(false);
          handleOpenAssign(pId);
        }}
        onDeviceUnassigned={() => {
          showToast('Device unassigned from patient.');
          loadPatients();
        }}
      />

      {/* Assign Device Modal */}
      <AssignDeviceModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onSuccess={handleAssignSuccess}
        preselectedPatientId={assignPatientId}
      />
    </main>
  );
}

export default Patients;
