import React, { useState, useEffect, useCallback } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Shield,
  Search,
  CheckCircle2,
  Ban,
  Trash2,
  RefreshCw,
  Mail,
  Lock,
  X,
  UserCheck
} from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New user form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('Doctor');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const loadUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await authApi.listUsers();
      const list = Array.isArray(res) ? res : res.users || [];
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users list:', err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formName || !formEmail || !formPassword) {
      setFormError('All fields are required.');
      return;
    }
    setFormLoading(true);
    try {
      await authApi.signup(formEmail, formPassword, formName, formRole);
      setIsModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      loadUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to create user.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleBlock = async (userEmail, isCurrentlyBlocked) => {
    try {
      if (isCurrentlyBlocked) {
        await authApi.unblockUser(userEmail);
      } else {
        await authApi.blockUser(userEmail);
      }
      loadUsers(true);
    } catch (err) {
      console.error('Error toggling block state:', err);
    }
  };

  const handleDeleteUser = async (userEmail) => {
    if (userEmail === currentUser?.email) {
      alert('You cannot delete your own active administrator account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}?`)) {
      return;
    }
    try {
      await authApi.deleteUser(userEmail);
      loadUsers(true);
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesQuery =
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q));
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  const getRoleBadge = (role) => {
    if (role === 'Administrator') {
      return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
    }
    if (role === 'Doctor') {
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 p-4 rounded-xl border border-slate-800 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <UsersIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">User & Account Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">Role-Based Access Control (RBAC) across Administrators, Doctors, and Technicians</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add User</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Administrator', 'Doctor', 'Technician'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === r
                  ? 'bg-teal-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400" />
            Registered System Accounts ({filteredUsers.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">RBAC Enforced</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Full Name & Account</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Role Scope</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    Loading users registry...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    No matching user accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => {
                  const isBlocked = u.is_blocked || u.status === 'Blocked' || u.status === 'Suspended';
                  const initials = u.full_name ? u.full_name.replace(/^Dr\.?\s*/i, '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : 'US';

                  return (
                    <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-teal-300 border border-slate-700">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{u.full_name}</div>
                          {u.email === currentUser?.email && (
                            <span className="text-[10px] text-teal-400 font-bold">(You)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isBlocked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1">
                            <Ban className="w-3 h-3" /> Blocked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleToggleBlock(u.email, isBlocked)}
                          title={isBlocked ? 'Unblock User' : 'Block User'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isBlocked
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                        >
                          {isBlocked ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.email)}
                          title="Delete User"
                          className="p-1.5 rounded-lg border bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-400" />
                Add New Staff Member
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Emily Watson"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. emily.watson@hospital.org"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Temporary Password</label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                >
                  <option value="Doctor">Doctor (Inpatient Verification)</option>
                  <option value="Technician">Technician (Maintenance & Telemetry)</option>
                  <option value="Administrator">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Creating...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
