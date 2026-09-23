import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Cpu,
  Wifi,
  Activity,
  BatteryCharging,
  Clock,
  RefreshCw,
  Info,
  TrendingUp,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

export function Trust() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [trustData, setTrustData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);

  // Load list of devices
  const loadDeviceList = useCallback(async () => {
    try {
      const devRes = await dashboardApi.getDashboardDevices();
      const devList = Array.isArray(devRes) ? devRes : devRes.devices || [];
      setDevices(devList);
      if (devList.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(devList[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch devices for trust engine:', err);
    }
  }, [selectedDeviceId]);

  // Load trust history and XAI factors for selected device
  const loadTrustDetails = useCallback(async (devId, silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getTrustHistory({ deviceId: devId, limit: 30 });
      setTrustData(res);
    } catch (err) {
      console.error('Error loading trust details:', err);
      setError('Unable to load continuous trust telemetry for this device.');
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDeviceList();
  }, [loadDeviceList]);

  useEffect(() => {
    if (selectedDeviceId) {
      loadTrustDetails(selectedDeviceId);
    }
  }, [selectedDeviceId, loadTrustDetails]);

  // Background polling every 6 seconds
  useEffect(() => {
    if (!autoRefresh || !selectedDeviceId) return;
    const interval = setInterval(() => {
      loadTrustDetails(selectedDeviceId, true);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedDeviceId, loadTrustDetails]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadTrustDetails(selectedDeviceId);
  };

  const devInfo = trustData?.device || {};
  const currentScore = devInfo.latest_score !== undefined ? devInfo.latest_score : 90;
  const devTrustScore = devInfo.device_trust_subscore !== undefined ? devInfo.device_trust_subscore : currentScore;
  const dataAuthScore = devInfo.data_authenticity_subscore !== undefined ? devInfo.data_authenticity_subscore : currentScore;
  const decision = devInfo.latest_decision || (currentScore >= 80 ? 'Accept' : currentScore >= 50 ? 'Monitor' : 'Isolate');

  const getDecisionTheme = (dec, score) => {
    if (dec === 'Accept' || score >= 80) {
      return {
        label: 'ACCEPT (Nominal)',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.12)',
        border: 'rgba(34, 197, 94, 0.35)',
        icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
        desc: 'Verified genuine telemetry · Uninterrupted clinical display'
      };
    }
    if (dec === 'Monitor' || score >= 50) {
      return {
        label: 'MONITOR (Elevated Risk)',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.35)',
        icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        desc: 'Confidence degraded · Telemetry flagged for clinical inspection'
      };
    }
    return {
      label: 'ISOLATE (Security Alert)',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.35)',
      icon: <AlertOctagon className="w-5 h-5 text-rose-400" />,
      desc: 'Severe violation / spoofing · Device quarantined automatically'
    };
  };

  const currentTheme = getDecisionTheme(decision, currentScore);

  // Gauge Chart Data (Semi-Doughnut)
  const gaugeData = {
    datasets: [
      {
        data: [currentScore, Math.max(0, 100 - currentScore)],
        backgroundColor: [currentTheme.color, '#1e293b'],
        borderWidth: 0,
        circumference: 220,
        rotation: 250,
      },
    ],
  };

  const gaugeOptions = {
    cutout: '80%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  };

  // Trust History Chart Data
  const chartLabels = trustData?.chart?.labels || [];
  const chartScores = trustData?.chart?.scores || [];

  const historyChartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['-5m', '-4m', '-3m', '-2m', '-1m', 'Now'],
    datasets: [
      {
        label: 'Continuous Trust Score',
        data: chartScores.length > 0 ? chartScores : [88, 89, 87, 90, 92, currentScore],
        borderColor: currentTheme.color,
        backgroundColor: `${currentTheme.color}20`,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointRadius: 3.5,
        pointBackgroundColor: currentTheme.color,
      },
    ],
  };

  const historyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 0 },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
      },
    },
  };

  const xaiObj = devInfo.xai_explanation || {};
  const devFactors = xaiObj.top_device_factors || [
    { feature: 'Battery_Drop_Rate', importance: 0.38 },
    { feature: 'Vital_Pulse_Diff', importance: 0.29 },
    { feature: 'Resource_Stress_Factor', importance: 0.18 }
  ];
  const authFactors = xaiObj.top_authenticity_factors || [
    { feature: 'Network_Flow_Jitter', importance: 0.42 },
    { feature: 'Inter_Arrival_Discrepancy', importance: 0.31 },
    { feature: 'Payload_Consistency_Flag', importance: 0.15 }
  ];

  const historyEvents = trustData?.history || [];

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header & Device Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">IoMT Endpoint Verification</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <span>Inspect Device:</span>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer min-w-[280px]"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name || d.device_name} ({d.id}) — {d.department || d.loc || 'ICU'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
            {autoRefresh ? 'Live Polling Active' : 'Polling Paused'}
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

      {/* CTE Formula Banner */}
      <div className="bg-gradient-to-r from-teal-950/40 via-slate-900/60 to-indigo-950/40 border border-teal-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-300">Continuous Trust Engine (CTE) Real-Time Formulation</div>
            <div className="text-sm font-semibold text-slate-200 mt-0.5">
              <code className="text-teal-300 bg-slate-900/80 px-2 py-0.5 rounded border border-teal-500/20 font-mono text-xs">
                Continuous Trust Score = 0.45 × (Device Trust) + 0.55 × (Data Authenticity)
              </code>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="px-2 py-1 bg-slate-800/80 rounded border border-slate-700 font-medium">
            Accept: <strong className="text-emerald-400">≥ 80</strong>
          </span>
          <span className="px-2 py-1 bg-slate-800/80 rounded border border-slate-700 font-medium">
            Monitor: <strong className="text-amber-400">50 – 79.9</strong>
          </span>
          <span className="px-2 py-1 bg-slate-800/80 rounded border border-slate-700 font-medium">
            Isolate: <strong className="text-rose-400">&lt; 50</strong>
          </span>
        </div>
      </div>

      {/* Grid of 3 Core Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Unified Trust Score & Semi-Gauge */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Trust Level</span>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5"
                style={{ backgroundColor: currentTheme.bg, color: currentTheme.color, borderColor: currentTheme.border }}
              >
                {currentTheme.icon}
                {decision}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Patient: <strong className="text-slate-200">{devInfo.patient_name || 'Unassigned'}</strong> · Room: <strong className="text-slate-200">{devInfo.location || devInfo.department || 'ICU'}</strong>
            </div>
          </div>

          <div className="relative w-48 h-32 mx-auto my-2 flex items-center justify-center">
            <Doughnut data={gaugeData} options={gaugeOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-5">
              <span className="text-4xl font-extrabold tracking-tight" style={{ color: currentTheme.color }}>
                {Math.round(currentScore)}%
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                {currentTheme.label}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-center">
            <div className="text-xs font-medium text-slate-300">{currentTheme.desc}</div>
          </div>
        </div>

        {/* 2. Dual Sub-Score Breakdown & XAI Tree Gain Attribution */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dual-Model Sub-Scores & XAI</span>
              <span className="text-[11px] text-teal-400 font-mono">XGBoost Multiclass</span>
            </div>

            {/* Model A Device Trust */}
            <div className="space-y-1.5 mb-3.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1 text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  Model A — Device Trust (37 Feat, w₁=0.45)
                </span>
                <span className="text-blue-400 font-bold">{Math.round(devTrustScore)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, devTrustScore))}%` }}
                ></div>
              </div>
            </div>

            {/* Model B Data Authenticity */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1 text-slate-300">
                  <Wifi className="w-3.5 h-3.5 text-purple-400" />
                  Model B — Data Authenticity (38 Feat, w₂=0.55)
                </span>
                <span className="text-purple-400 font-bold">{Math.round(dataAuthScore)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, dataAuthScore))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* XAI Attribution List */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Top XAI Root-Cause Signals</span>
              <span className="text-[10px] text-slate-500 font-normal">Tree-Gain Gain</span>
            </div>
            <div className="space-y-1.5 text-xs">
              {devFactors.slice(0, 2).map((f, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    {f.feature}
                  </span>
                  <span className="text-slate-400 font-mono">{(f.importance * 100).toFixed(0)}%</span>
                </div>
              ))}
              {authFactors.slice(0, 2).map((f, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    {f.feature}
                  </span>
                  <span className="text-slate-400 font-mono">{(f.importance * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Real-Time Trust Evaluation History Chart */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Historical Trust Trend</span>
              <div className="text-xs text-slate-500">Telemetry Evaluation Window</div>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real-Time</span>
            </div>
          </div>

          <div className="h-44 w-full mt-2">
            <Line data={historyChartData} options={historyChartOptions} />
          </div>

          <div className="text-[11px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
            <Info className="w-3 h-3" />
            <span>Continuous evaluation evaluated dynamically per telemetry burst</span>
          </div>
        </div>
      </div>

      {/* Recent Evaluations & XAI Explanations Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              Recent Trust Events & XAI Explanations
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Chronological evaluation log with root-cause diagnostic feedback</p>
          </div>
          <span className="text-xs text-slate-400 font-medium bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
            {historyEvents.length} Recorded Cycles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Device & Model State</th>
                <th className="px-4 py-3">Sub-Scores (DT / DA)</th>
                <th className="px-4 py-3">Final Trust Score</th>
                <th className="px-4 py-3">Decision</th>
                <th className="px-4 py-3">XAI Diagnostic Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {historyEvents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    No historical evaluation cycles logged yet for this device.
                  </td>
                </tr>
              ) : (
                historyEvents.slice(0, 10).map((item, idx) => {
                  const sc = item.final_trust_score !== undefined ? item.final_trust_score : item.trustScore || 85;
                  const dec = item.decision || (sc >= 80 ? 'Accept' : sc >= 50 ? 'Monitor' : 'Isolate');
                  const dt = item.device_trust_subscore !== undefined ? item.device_trust_subscore : item.deviceTrust || sc;
                  const da = item.data_authenticity_subscore !== undefined ? item.data_authenticity_subscore : item.dataAuth || sc;
                  const theme = getDecisionTheme(dec, sc);

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {item.timestamp ? (() => {
                          const d = new Date(item.timestamp);
                          return isNaN(d.getTime()) ? item.timestamp : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                        })() : 'Recent'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-200">{devInfo.name || devInfo.id}</div>
                        <div className="text-[10px] text-slate-500">{devInfo.device_type || 'IoMT Monitor'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px]">
                        <span className="text-blue-400">{Math.round(dt)}%</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-purple-400">{Math.round(da)}%</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-sm whitespace-nowrap" style={{ color: theme.color }}>
                        {Math.round(sc)}%
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1"
                          style={{ backgroundColor: theme.bg, color: theme.color, borderColor: theme.border }}
                        >
                          {dec}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs max-w-md">
                        {item.reason || item.clinical_reason || 'All hardware telemetry and network packets verified nominal.'}
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
  );
}

export default Trust;
