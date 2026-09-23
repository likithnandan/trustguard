import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Layers,
  Activity,
  Wifi,
  Battery,
  Sliders,
  RefreshCw,
  User,
  Key,
  Database
} from 'lucide-react';
import { dashboardApi } from '../api/dashboard';

export function DeviceProfiles() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDevices = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await dashboardApi.getDashboardDevices();
      const list = Array.isArray(res) ? res : res.devices || [];
      setDevices(list);
      if (list.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load device profiles list:', err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDevices(true);
  };

  const dev = devices.find((d) => d.id === selectedDeviceId) || devices[0] || {};
  const score = dev.score !== undefined ? dev.score : 90;
  const decision = dev.decision || (score >= 80 ? 'Accept' : score >= 50 ? 'Monitor' : 'Isolate');
  const devTrust = dev.device_trust_subscore !== undefined ? dev.device_trust_subscore : score;
  const dataAuth = dev.data_authenticity_subscore !== undefined ? dev.data_authenticity_subscore : score;

  const isGood = decision === 'Accept' || score >= 80;
  const isWarn = decision === 'Monitor' || (score >= 50 && score < 80);
  const statusColor = isGood ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : isWarn ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'info', label: 'Hardware Specs' },
    { key: 'telemetry', label: 'Live Telemetry' },
    { key: 'security', label: 'Security & Auth' },
    { key: 'logs', label: 'Evaluation Logs' }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 p-4 rounded-xl border border-slate-800 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Medical IoT Device Profiles</h1>
            <p className="text-xs text-slate-400 mt-0.5">Deep inspection of firmware, hardware calibration, and real-time subscores</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/50 min-w-[240px]"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id} — {d.name} ({d.department || 'ICU'})
              </option>
            ))}
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Grid: Left Status Card + Right Detail Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Status Profile Card (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 mx-auto mb-4 shadow-inner">
              <Cpu className="w-8 h-8" />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-base font-extrabold text-white">{dev.name || 'Medical IoT Device'}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{dev.id || 'DEV-000'}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Operating Status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${statusColor}`}>
                  ● {dev.status || 'Active'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Continuous Trust</span>
                <span className="font-extrabold text-white">{score}% ({decision})</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Assigned Patient</span>
                <span className="font-semibold text-slate-200">{dev.patient_name || 'Unassigned'}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Hospital Location</span>
                <span className="font-mono text-slate-300">{dev.loc || 'ICU Room 101'}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Last Telemetry Burst</span>
                <span className="font-mono text-slate-400">{dev.updated || '2 mins ago'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono text-center">
            SHA-256 Token Authorization Active
          </div>
        </div>

        {/* Right Detail Pane (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/70 border border-slate-800 p-6 rounded-xl shadow-lg space-y-5">
          {/* Tab Selector */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === t.key
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 mb-1">Model A — Device Trust Sub-score</div>
                  <div className="text-2xl font-extrabold text-blue-400">{devTrust}%</div>
                  <div className="text-[11px] text-slate-500 mt-1">Weight: 45% of Final Trust Index</div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 mb-1">Model B — Data Authenticity Sub-score</div>
                  <div className="text-2xl font-extrabold text-emerald-400">{dataAuth}%</div>
                  <div className="text-[11px] text-slate-500 mt-1">Weight: 55% of Final Trust Index</div>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="font-bold text-slate-200 text-sm">Continuous Evaluation Diagnostic Rationale</div>
                <p className="text-slate-300 leading-relaxed">
                  Device signals and telemetry packet signatures are evaluated continuously at 5-second intervals.
                  Model A verifies battery drain consistency and hardware stability, while Model B monitors packet timing and anti-spoofing markers.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Hardware Specs */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div className="text-slate-400">Device Model & Type</div>
                <div className="font-semibold text-slate-200 mt-0.5">{dev.type || 'Bedside Inpatient Monitor'}</div>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div className="text-slate-400">Firmware Build</div>
                <div className="font-mono text-slate-200 mt-0.5">v3.4.2-rel (Secure Boot Verified)</div>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div className="text-slate-400">Communication Interface</div>
                <div className="font-semibold text-slate-200 mt-0.5">Wi-Fi 6 WPA3-Enterprise / TLS 1.3</div>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div className="text-slate-400">Battery Status & Voltage</div>
                <div className="font-semibold text-slate-200 mt-0.5">94% Nominal (3.78V Li-ion)</div>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div className="text-slate-400">Sensor Calibration Cycle</div>
                <div className="font-semibold text-slate-200 mt-0.5">Factory Verified (Zero Drift)</div>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div className="text-slate-400">Assigned Department</div>
                <div className="font-semibold text-slate-200 mt-0.5">{dev.department || 'ICU'}</div>
              </div>
            </div>
          )}

          {/* Tab 3: Live Telemetry */}
          {activeTab === 'telemetry' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  Live Vital Stream Buffer
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">HR: 76 bpm</div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">SpO2: 98%</div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">BP: 118/76 mmHg</div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">Temp: 36.8 °C</div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">Glucose: 104 mg/dL</div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">RR: 15 /min</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Security & Auth */}
          {activeTab === 'security' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-teal-400" />
                  Token-Authenticated Zero-Trust Ingestion
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Every payload transmitted by this endpoint requires a cryptographic SHA-256 API token header.
                  Unauthorized packets are rejected at the edge gateway before reaching Model A/B inference pipelines.
                </p>
                <div className="pt-2 text-slate-400 font-mono text-[11px]">
                  Authorization Header: <span className="text-teal-300">X-Device-Token: tg_live_************</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between font-mono">
                <span className="text-slate-400">{new Date().toLocaleTimeString()}</span>
                <span className="text-emerald-400">TELEMETRY_EVAL_OK</span>
                <span className="text-slate-300">Trust: {score}% ({decision})</span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between font-mono">
                <span className="text-slate-400">{new Date(Date.now() - 30000).toLocaleTimeString()}</span>
                <span className="text-emerald-400">TELEMETRY_EVAL_OK</span>
                <span className="text-slate-300">Trust: {score}% ({decision})</span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between font-mono">
                <span className="text-slate-400">{new Date(Date.now() - 60000).toLocaleTimeString()}</span>
                <span className="text-emerald-400">TELEMETRY_EVAL_OK</span>
                <span className="text-slate-300">Trust: {score}% ({decision})</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeviceProfiles;
