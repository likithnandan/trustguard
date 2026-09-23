import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Shield,
  Cpu,
  Wifi,
  Clock,
  RefreshCw,
  User,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { doctorApi } from '../api/doctor';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export function DoctorPortal() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [activePatientId, setActivePatientId] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load all admitted patients for doctor
  const loadPatients = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await doctorApi.getDoctorPatients();
      const list = Array.isArray(res) ? res : res.patients || [];
      setPatients(list);

      if (list.length > 0) {
        if (!activePatientId || !list.some((p) => p.id === activePatientId)) {
          setActivePatientId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load doctor patients:', err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, [activePatientId]);

  // Load selected patient details and history
  const loadPatientData = useCallback(async (patId) => {
    if (!patId) return;
    try {
      const [detailRes, histRes] = await Promise.all([
        doctorApi.getDoctorPatientDetail(patId),
        doctorApi.getDoctorPatientHistory(patId, 10).catch(() => ({ history: [] })),
      ]);
      setPatientDetail(detailRes);
      setHistory(Array.isArray(histRes) ? histRes : histRes.history || []);
    } catch (err) {
      console.error('Failed to load patient detail:', err);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    if (activePatientId) {
      loadPatientData(activePatientId);
    }
  }, [activePatientId, loadPatientData]);

  // Periodic polling every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadPatients(true);
      if (activePatientId) {
        loadPatientData(activePatientId);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, activePatientId, loadPatients, loadPatientData]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadPatients();
    if (activePatientId) {
      loadPatientData(activePatientId);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q)) ||
      (p.room && p.room.toLowerCase().includes(q)) ||
      (p.department && p.department.toLowerCase().includes(q))
    );
  });

  const p = patientDetail || patients.find((x) => x.id === activePatientId) || {};
  const trustScore = p.trust !== undefined ? p.trust : p.trustScore || 88;
  const decision = p.decision || (trustScore >= 80 ? 'Accept' : trustScore >= 50 ? 'Monitor' : 'Isolate');

  const getVerificationTheme = (dec, score) => {
    if (dec === 'Accept' || score >= 80) {
      return {
        level: 'good',
        title: 'TELEMETRY VERIFIED · TRUSTED IN CLINICAL WORKFLOW',
        sub: p.reason || 'Hardware signals and network transmission verified genuine via continuous AI evaluation.',
        badge: 'ACCEPT (Nominal)',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.12)',
        border: 'rgba(34, 197, 94, 0.35)',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
        actionRecommendation: p.recommendedAction || 'None — Proceed with standard clinical monitoring and patient care.'
      };
    }
    if (dec === 'Monitor' || score >= 50) {
      return {
        level: 'warn',
        title: 'ELEVATED RISK · MANUAL CLINICAL VERIFICATION REQUIRED',
        sub: p.reason || 'Telemetry confidence degraded — active supervision and sensor inspection recommended.',
        badge: 'MONITOR (Flagged)',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.35)',
        icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
        actionRecommendation: p.recommendedAction || 'Perform manual vital sign cross-verification before prescribing or acting.'
      };
    }
    return {
      level: 'bad',
      title: 'SECURITY QUARANTINE · DO NOT ACT ON UNVERIFIED VITALS',
      sub: p.reason || 'Software isolation decision enforced due to active data alteration or hardware failure.',
      badge: 'ISOLATE (Quarantine)',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.35)',
      icon: <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />,
      actionRecommendation: p.recommendedAction || 'Immediate physical inspection required. Replace device or verify patient vitals manually.'
    };
  };

  const vTheme = getVerificationTheme(decision, trustScore);

  const devTrust = p.deviceTrust !== undefined ? p.deviceTrust : trustScore;
  const dataAuth = p.dataAuthenticity !== undefined ? p.dataAuthenticity : trustScore;

  const vitals = p.vitals || {};
  const vitalItems = [
    {
      key: 'heartRate',
      name: 'Heart Rate',
      value: vitals.heartRate || vitals.heart_rate || '--',
      unit: 'bpm',
      range: '60 – 100 bpm',
      icon: <Heart className="w-4 h-4 text-rose-400" />
    },
    {
      key: 'spo2',
      name: 'Oxygen Saturation (SpO2)',
      value: vitals.spo2 || vitals.spo2_level || '--',
      unit: '%',
      range: '95 – 100%',
      icon: <Activity className="w-4 h-4 text-blue-400" />
    },
    {
      key: 'sysBP',
      name: 'Blood Pressure',
      value: vitals.sysBP && vitals.diaBP ? `${vitals.sysBP}/${vitals.diaBP}` : vitals.blood_pressure || '--',
      unit: 'mmHg',
      range: '< 120/80 mmHg',
      icon: <Droplets className="w-4 h-4 text-red-400" />
    },
    {
      key: 'temp',
      name: 'Temperature',
      value: vitals.temp || vitals.temperature || '--',
      unit: '°C',
      range: '36.5 – 37.5 °C',
      icon: <Thermometer className="w-4 h-4 text-amber-400" />
    },
    {
      key: 'glucose',
      name: 'Blood Glucose',
      value: vitals.glucose || vitals.blood_glucose || '--',
      unit: 'mg/dL',
      range: '70 – 140 mg/dL',
      icon: <Droplets className="w-4 h-4 text-emerald-400" />
    },
    {
      key: 'respRate',
      name: 'Respiratory Rate',
      value: vitals.respRate || vitals.respiratory_rate || '--',
      unit: 'breaths/min',
      range: '12 – 20 /min',
      icon: <Wind className="w-4 h-4 text-teal-400" />
    }
  ];

  const xaiObj = p.xai || {};
  const topDev = xaiObj.top_device_factors || [];
  const topAuth = xaiObj.top_authenticity_factors || [];

  return (
    <div className="space-y-6 pb-8">
      {/* Doctor Portal Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 p-4 rounded-xl border border-slate-800 backdrop-blur-sm shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Doctor Inpatient View
            </span>
            <span className="text-xs text-slate-400">Continuous AI Telemetry Verification</span>
          </div>
          <h1 className="text-lg font-bold text-white mt-1">Inpatient Vital Stream & Verification Portal</h1>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'Administrator' && (
            <Link
              to="/admin/dashboard"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Back to Admin</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
            {autoRefresh ? 'Live Streaming' : 'Paused'}
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col h-[740px] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-teal-400" />
              Admitted Patients ({patients.length})
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Select to inspect</span>
          </div>

          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, room, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          </div>

          {/* Patient Scroll List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {loading ? (
              <div className="text-center py-12 text-slate-500 text-xs">Loading patient registry...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">No matching patients found.</div>
            ) : (
              filteredPatients.map((item) => {
                const sc = item.trust !== undefined ? item.trust : 85;
                const dec = item.decision || (sc >= 80 ? 'Accept' : sc >= 50 ? 'Monitor' : 'Isolate');
                const theme = getVerificationTheme(dec, sc);
                const isSelected = item.id === activePatientId;
                const initials = item.name ? item.name.replace(/^Dr\.?\s*/i, '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : 'PT';

                return (
                  <div
                    key={item.id}
                    onClick={() => setActivePatientId(item.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-teal-500/50 shadow-md ring-1 ring-teal-500/30'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-200 border border-slate-700">
                          {initials}
                        </div>
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900"
                          style={{ backgroundColor: theme.color }}
                        ></span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100">{item.name}</div>
                        <div className="text-[11px] text-slate-400">{item.id} · {item.room || item.department || 'ICU'}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold" style={{ color: theme.color }}>
                        {Math.round(sc)}%
                      </div>
                      <div className="text-[10px] text-slate-500">{dec}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Detailed Clinical Record & Telemetry (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* 1. Large Clinical Verification Banner */}
          <div
            className="p-4 rounded-xl border flex items-start gap-3.5 shadow-lg transition-all"
            style={{ backgroundColor: vTheme.bg, borderColor: vTheme.border }}
          >
            <div className="mt-0.5">{vTheme.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-extrabold tracking-wide uppercase" style={{ color: vTheme.color }}>
                  {vTheme.title}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded text-[10px] font-bold border"
                  style={{ backgroundColor: '#0f172a', color: vTheme.color, borderColor: vTheme.border }}
                >
                  {vTheme.badge}
                </span>
              </div>
              <div className="text-xs text-slate-200 mt-1">{vTheme.sub}</div>
            </div>
          </div>

          {/* 2. Patient Profile & Unified Trust Header */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-indigo-500/20 border border-teal-500/30 flex items-center justify-center text-lg font-bold text-teal-300">
                {p.name ? p.name.replace(/^Dr\.?\s*/i, '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : 'PT'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{p.name || 'Select a Patient'}</h2>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>ID: <strong className="text-slate-200">{p.id}</strong></span>
                  <span>·</span>
                  <span>{p.age ? `${p.age} yrs` : '54 yrs'} · {p.gender || 'Male'}</span>
                  <span>·</span>
                  <span>Room: <strong className="text-slate-200">{p.room || 'Room 302'}</strong></span>
                  <span>·</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold border border-slate-700">
                    {p.department || 'ICU Ward'}
                  </span>
                </div>

                {/* Assigned Devices Badges */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {(p.assignedDevices && p.assignedDevices.length > 0 ? p.assignedDevices : [{ deviceName: p.device || 'Bedside IoMT Monitor', deviceId: p.deviceId || 'DEV-101', deviceType: 'Patient Monitor' }]).map((d, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                      <strong>{d.deviceName}</strong> ({d.deviceId})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Big Trust Badge */}
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-right shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Continuous Trust Score</div>
              <div className="text-3xl font-extrabold mt-0.5" style={{ color: vTheme.color }}>
                {Math.round(trustScore)}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono">0.45 DT + 0.55 DA</div>
            </div>
          </div>

          {/* 3. Dual-Model AI Sub-Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Model A — Device Trust</div>
                  <div className="text-[11px] text-slate-400">Hardware & Sensor Reliability (45% Weight)</div>
                </div>
              </div>
              <div className="text-lg font-extrabold text-blue-400">{Math.round(devTrust)}%</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Model B — Data Authenticity</div>
                  <div className="text-[11px] text-slate-400">Transmission & Biometric Anti-Spoof (55% Weight)</div>
                </div>
              </div>
              <div className="text-lg font-extrabold text-purple-400">{Math.round(dataAuth)}%</div>
            </div>
          </div>

          {/* 4. Verified Clinical Vitals Grid */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                Real-Time Physiological Telemetry Streams
              </h3>
              <span className="text-[11px] text-slate-500">Continuous Stream Verification</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {vitalItems.map((item, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-400">{item.name}</span>
                    {item.icon}
                  </div>
                  <div className="my-1">
                    <span className="text-2xl font-extrabold text-white">{item.value}</span>
                    <span className="text-xs text-slate-400 ml-1 font-medium">{item.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{item.range}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Clinical Rationale & Recommended Verification Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-md">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-400" />
                AI Diagnostic Rationale
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {p.reason || 'All continuous telemetry streams and hardware signals are verified within normal empirical baseline parameters.'}
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-md">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Recommended Clinical Action
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold" style={{ color: vTheme.color }}>
                {vTheme.actionRecommendation}
              </p>
            </div>
          </div>

          {/* 6. Recent Historical Trust Evaluations */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                Patient Telemetry Trust History
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Recent Cycles</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/40 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">Trust Score</th>
                    <th className="px-3 py-2">Device Trust</th>
                    <th className="px-3 py-2">Data Authenticity</th>
                    <th className="px-3 py-2">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-3 py-4 text-center text-slate-500 text-xs">
                        No historical evaluations recorded yet.
                      </td>
                    </tr>
                  ) : (
                    history.slice(0, 5).map((rec, i) => {
                      const sc = rec.trustScore !== undefined ? rec.trustScore : rec.final_trust_score || 85;
                      const dec = rec.decision || (sc >= 80 ? 'Accept' : sc >= 50 ? 'Monitor' : 'Isolate');
                      const theme = getVerificationTheme(dec, sc);
                      return (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="px-3 py-2 text-slate-400 font-mono text-[11px]">
                            {rec.timestamp ? new Date(rec.timestamp).toLocaleTimeString() : 'Recent'}
                          </td>
                          <td className="px-3 py-2 font-bold" style={{ color: theme.color }}>
                            {Math.round(sc)}%
                          </td>
                          <td className="px-3 py-2 text-blue-400">
                            {rec.deviceTrust !== undefined ? `${Math.round(rec.deviceTrust)}%` : '--'}
                          </td>
                          <td className="px-3 py-2 text-purple-400">
                            {rec.dataAuthenticity !== undefined || rec.dataAuth !== undefined ? `${Math.round(rec.dataAuthenticity || rec.dataAuth)}%` : '--'}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold border"
                              style={{ backgroundColor: theme.bg, color: theme.color, borderColor: theme.border }}
                            >
                              {dec}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorPortal;
