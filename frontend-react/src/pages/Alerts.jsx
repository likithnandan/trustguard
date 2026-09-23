import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  CheckCheck,
  ShieldAlert,
  Clock,
  ExternalLink
} from 'lucide-react';
import { dashboardApi } from '../api/dashboard';

export function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ackLoading, setAckLoading] = useState(null);

  const loadAlerts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await dashboardApi.getDashboardAlerts({ category: activeCategory });
      const list = Array.isArray(res) ? res : res.alerts || [];
      setAlerts(list);
    } catch (err) {
      console.error('Failed to load security alerts:', err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  const handleAcknowledge = async (alertId) => {
    setAckLoading(alertId);
    try {
      await dashboardApi.acknowledgeAlert(alertId);
      // Remove from list or mark acknowledged
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    } finally {
      setAckLoading(null);
    }
  };

  const handleAcknowledgeAll = async () => {
    setRefreshing(true);
    try {
      await dashboardApi.acknowledgeAllAlerts();
      setAlerts([]);
    } catch (err) {
      console.error('Failed to acknowledge all alerts:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Critical') return a.severity === 'Critical' || a.severity === 'High';
    if (activeCategory === 'Warning') return a.severity === 'Medium' || a.severity === 'Warning';
    if (activeCategory === 'Info') return a.severity === 'Low' || a.severity === 'Info';
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'Critical' || a.severity === 'High').length;
  const warningCount = alerts.filter((a) => a.severity === 'Medium' || a.severity === 'Warning').length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 p-4 rounded-xl border border-slate-800 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Security Incidents & Telemetry Alerts</h1>
            <p className="text-xs text-slate-400 mt-0.5">Real-time queue for Data Alteration, Spoofing, and Hardware Degradation events</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {alerts.length > 0 && (
            <button
              onClick={handleAcknowledgeAll}
              disabled={refreshing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Acknowledged</span>
            </button>
          )}

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

      {/* Filter Tabs Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          {['All', 'Critical', 'Warning', 'Info'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat} {cat === 'All' ? `(${alerts.length})` : cat === 'Critical' ? `(${criticalCount})` : cat === 'Warning' ? `(${warningCount})` : ''}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Critical: {criticalCount}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Warning: {warningCount}</span>
          </span>
        </div>
      </div>

      {/* Alerts List Queue */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
            Loading active security incidents...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-12 text-center shadow-lg">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">No Active Security Alerts</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All monitored medical IoT devices and telemetry packet streams are verified within nominal trust boundaries.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCrit = alert.severity === 'Critical' || alert.severity === 'High';
            const isWarn = alert.severity === 'Medium' || alert.severity === 'Warning';
            const theme = isCrit
              ? { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.3)', text: 'text-rose-400', badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" /> }
              : isWarn
              ? { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.3)', text: 'text-amber-400', badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" /> }
              : { bg: 'rgba(14, 165, 233, 0.08)', border: 'rgba(14, 165, 233, 0.3)', text: 'text-blue-400', badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: <Info className="w-5 h-5 text-blue-400 shrink-0" /> };

            return (
              <div
                key={alert.id}
                className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md transition-all hover:bg-slate-900/90"
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5">{theme.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${theme.badgeBg}`}>
                        {alert.severity}
                      </span>
                      <span className="text-sm font-bold text-white">{alert.title || alert.type || 'Security Violation'}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-semibold text-slate-300">{alert.deviceName || alert.device_id}</span>
                      <span className="text-xs text-slate-400">({alert.department || 'ICU'})</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      {alert.message || alert.description || 'Abnormal telemetry behavior detected by Model B XGBoost classifier.'}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Recent'}
                      </span>
                      {alert.patientName && (
                        <span>
                          Patient: <strong className="text-slate-300">{alert.patientName}</strong>
                        </span>
                      )}
                      {alert.impact && (
                        <span className="text-rose-300 font-mono">
                          Impact: {alert.impact}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={ackLoading === alert.id}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                    <span>{ackLoading === alert.id ? 'Saving...' : 'Acknowledge'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Alerts;
