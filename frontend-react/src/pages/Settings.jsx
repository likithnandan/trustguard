import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Lock,
  Bell,
  Sliders,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Key,
  Layers
} from 'lucide-react';

export function Settings() {
  const [activeTab, setActiveTab] = useState('security');
  const [savedToast, setSavedToast] = useState(false);

  // Settings form states
  const [weightA, setWeightA] = useState(0.45);
  const [weightB, setWeightB] = useState(0.55);
  const [acceptThreshold, setAcceptThreshold] = useState(80);
  const [isolateThreshold, setIsolateThreshold] = useState(50);
  const [pollInterval, setPollInterval] = useState(5);
  const [jwtExpiryHours, setJwtExpiryHours] = useState(12);
  const [tlsEnforced, setTlsEnforced] = useState(true);
  const [autoAcknowledgeAlerts, setAutoAcknowledgeAlerts] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const tabs = [
    { key: 'security', label: 'Continuous Trust & AI Policy' },
    { key: 'auth', label: 'Authentication & RBAC' },
    { key: 'network', label: 'Telemetry Gateway & TLS' },
    { key: 'notifications', label: 'Alerting & SMTP' }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Toast */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 shadow-2xl z-50 text-xs font-semibold backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4" />
          <span>System configuration parameters saved successfully.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 p-4 rounded-xl border border-slate-800 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">System Security & Engine Configuration</h1>
            <p className="text-xs text-slate-400 mt-0.5">Global parameters for Continuous Trust Engine (CTE), weights, thresholds, and RBAC</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Configuration</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === t.key
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-900/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Settings Form Container */}
      <form onSubmit={handleSave} className="bg-slate-900/70 border border-slate-800 p-6 rounded-xl shadow-lg space-y-6">
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-400" />
                Continuous Trust Evaluation Formula & Weights
              </h2>
              <p className="text-xs text-slate-400">
                Configure continuous fusion subscore coefficients: Final Trust = (w1 × Model A) + (w2 × Model B).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Model A Weight (w1) — Hardware Trust
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={weightA}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setWeightA(val);
                      setWeightB(parseFloat((1 - val).toFixed(2)));
                    }}
                    className="w-full accent-teal-500"
                  />
                  <span className="font-mono text-sm font-bold text-teal-400 min-w-[40px] text-right">
                    {weightA}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Controls influence of battery drift, voltage, temperature, and vital consistency features.
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Model B Weight (w2) — Data Authenticity
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={weightB}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setWeightB(val);
                      setWeightA(parseFloat((1 - val).toFixed(2)));
                    }}
                    className="w-full accent-teal-500"
                  />
                  <span className="font-mono text-sm font-bold text-teal-400 min-w-[40px] text-right">
                    {weightB}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Controls influence of packet inter-arrival, packet jitter, and anti-spoofing markers.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  ACCEPT Cutoff Threshold (Green)
                </label>
                <input
                  type="number"
                  min="60"
                  max="95"
                  value={acceptThreshold}
                  onChange={(e) => setAcceptThreshold(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/50 mt-1"
                />
                <div className="text-[11px] text-slate-500 mt-2">
                  Scores ≥ {acceptThreshold}% verify nominal operation and grant uninhibited clinical workflow.
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  ISOLATE Cutoff Threshold (Red)
                </label>
                <input
                  type="number"
                  min="20"
                  max="60"
                  value={isolateThreshold}
                  onChange={(e) => setIsolateThreshold(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/50 mt-1"
                />
                <div className="text-[11px] text-slate-500 mt-2">
                  Scores &lt; {isolateThreshold}% trigger automated device quarantine and clinical warnings.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'auth' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-400" />
                Session Tokens & Role Policies
              </h2>
              <p className="text-xs text-slate-400">
                JWT expiration, bcrypt work factors, and Doctor OTP verification rules.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  JWT Session Lifespan (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={jwtExpiryHours}
                  onChange={(e) => setJwtExpiryHours(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/50 mt-1"
                />
                <div className="text-[11px] text-slate-500 mt-2">
                  Signed using HS256 algorithm with cryptographic rotation.
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Two-Factor Authentication (OTP)
                </label>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-300">Enforced for Doctor Logins</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    ALWAYS ACTIVE
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Sends 6-digit OTP codes expiring in 10 minutes via SMTP.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                Telemetry Gateway & Edge Ingestion
              </h2>
              <p className="text-xs text-slate-400">
                Streaming poll frequency and encrypted transmission protocols.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Telemetry Stream Polling Rate (Seconds)
                </label>
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={pollInterval}
                  onChange={(e) => setPollInterval(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/50 mt-1"
                />
                <div className="text-[11px] text-slate-500 mt-2">
                  Default interval for continuous background evaluation stream.
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Enforce TLS 1.3 Transport Encryption
                </label>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-300">Require Mutual TLS</span>
                  <input
                    type="checkbox"
                    checked={tlsEnforced}
                    onChange={(e) => setTlsEnforced(e.target.checked)}
                    className="w-4 h-4 accent-teal-500 cursor-pointer"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Enforces encrypted packet exchange for all connected hospital devices.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-400" />
                Alert Dispatch & Incident Escalation
              </h2>
              <p className="text-xs text-slate-400">
                Configuring email dispatching for Critical and Quarantined security events.
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">Critical Alert Immediate Push</div>
                  <div className="text-[11px] text-slate-400">Dispatch alerts immediately to hospital security admins</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-teal-500 cursor-pointer" />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-200">Weekly HIPAA Compliance Summary Digest</div>
                  <div className="text-[11px] text-slate-400">Generate automated multi-tab PDF audit reports</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-teal-500 cursor-pointer" />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
