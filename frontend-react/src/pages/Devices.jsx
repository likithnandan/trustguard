import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Cpu, AlertTriangle, CheckCircle } from 'lucide-react';
import { deviceApi } from '../api/devices';
import {
  DeviceToolbar,
  DeviceTable,
  DeviceFormModal,
  DeviceDetailsModal,
  AssignDeviceModal,
} from '../components/devices';

export function Devices() {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerApiError, setRegisterApiError] = useState(null);
  const [provisionedKey, setProvisionedKey] = useState(null);

  const [detailsDeviceId, setDetailsDeviceId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [assignDeviceId, setAssignDeviceId] = useState(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadDevices = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const data = await deviceApi.listDevices({
        department: departmentFilter !== 'all' ? departmentFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setDevices(data?.devices || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch devices registry:', err);
      setError('Unable to load device registry from backend.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [departmentFilter, statusFilter]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  // Client-side search and status/department filtering
  const filteredDevices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return devices.filter((d) => {
      // Status filter
      if (statusFilter && statusFilter !== 'all') {
        if ((d.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
      }
      // Department filter
      if (departmentFilter && departmentFilter !== 'all') {
        if ((d.department || '').toLowerCase() !== departmentFilter.toLowerCase()) return false;
      }
      if (!q) return true;
      const matchName = (d.device_name || '').toLowerCase().includes(q);
      const matchId = (d.device_id || '').toLowerCase().includes(q);
      const matchType = (d.device_type || '').toLowerCase().includes(q);
      const matchLoc = (d.location || '').toLowerCase().includes(q);
      const matchDept = (d.department || '').toLowerCase().includes(q);
      const matchPatient = (d.assigned_patient?.full_name || '').toLowerCase().includes(q);
      return matchName || matchId || matchType || matchLoc || matchDept || matchPatient;
    });
  }, [devices, searchQuery, departmentFilter, statusFilter]);

  // Handle device registration
  const handleRegisterSubmit = async (payload) => {
    setIsSubmitting(true);
    setRegisterApiError(null);

    try {
      const res = await deviceApi.createDevice(payload);
      if (res?.provisioning_api_key) {
        setProvisionedKey(res.provisioning_api_key);
      } else {
        setIsRegisterOpen(false);
        showToast(`Device ${payload.device_id} registered successfully.`);
      }
      loadDevices();
    } catch (err) {
      console.error('Error registering device:', err);
      setRegisterApiError(err.message || 'Failed to register device.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoneProvisioning = () => {
    setIsRegisterOpen(false);
    setProvisionedKey(null);
    showToast('Device registered and provisioned.');
    loadDevices();
  };

  const handleOpenRegister = () => {
    setProvisionedKey(null);
    setRegisterApiError(null);
    setIsRegisterOpen(true);
  };

  const handleOpenDetails = (deviceId) => {
    setDetailsDeviceId(deviceId);
    setIsDetailsOpen(true);
  };

  const handleOpenAssign = (deviceId) => {
    setAssignDeviceId(deviceId);
    setIsAssignOpen(true);
  };

  const handleAssignSuccess = (patientId, deviceId) => {
    showToast(`Device ${deviceId} successfully assigned to ${patientId}!`);
    loadDevices();
  };

  const handleUnassignDevice = async (deviceId) => {
    if (!window.confirm(`Are you sure you want to unbind device '${deviceId}' from its current patient?`)) {
      return;
    }
    try {
      await deviceApi.unassignDevice(deviceId);
      showToast(`Device '${deviceId}' unassigned.`);
      loadDevices();
    } catch (err) {
      console.error('Failed to unassign device:', err);
      showToast(err.message || 'Failed to unassign device.', 'error');
    }
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
          <Cpu size={22} color="var(--accent)" />
          Medical IoT Device Registry
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '3px' }}>
          Hardware inventory, SHA-256 token authorization, and active patient-binding management
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
      <DeviceToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onRegisterDevice={handleOpenRegister}
        onOpenAssign={() => handleOpenAssign(null)}
        onRefresh={() => loadDevices(true)}
        isRefreshing={isRefreshing}
      />

      {/* Device Table */}
      <DeviceTable
        devices={filteredDevices}
        isLoading={isLoading}
        onViewDetails={handleOpenDetails}
        onAssignDevice={handleOpenAssign}
        onUnassignDevice={handleUnassignDevice}
      />

      {/* Register Device Modal */}
      <DeviceFormModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSubmit={handleRegisterSubmit}
        isSubmitting={isSubmitting}
        apiError={registerApiError}
        provisionedKey={provisionedKey}
        onDone={handleDoneProvisioning}
      />

      {/* Details Modal */}
      <DeviceDetailsModal
        isOpen={isDetailsOpen}
        deviceId={detailsDeviceId}
        onClose={() => setIsDetailsOpen(false)}
        onAssignDevice={(dId) => {
          setIsDetailsOpen(false);
          handleOpenAssign(dId);
        }}
        onDeviceUnassigned={() => {
          showToast('Device unassigned.');
          loadDevices();
        }}
      />

      {/* Assign Device Modal */}
      <AssignDeviceModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onSuccess={handleAssignSuccess}
        preselectedDeviceId={assignDeviceId}
      />
    </main>
  );
}

export default Devices;
