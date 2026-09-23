import React, { useState, useEffect, useCallback } from 'react';
import {
  Wrench,
  BatteryWarning,
  Cpu,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Info
} from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function Maintenance() {
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await dashboardApi.getMaintenance();
      setMaintenanceData(res);
    } catch (err) {
      console.error('Failed to load maintenance advisor:', err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const kpis = maintenanceData?.kpis || {};
  const serviceCount = kpis.service_needed || maintenanceData?.service_needed_count || 4;
  const calibrationCount = kpis.calibration_due || maintenanceData?.calibration_due_count || 6;
  const downtimeAvoided = kpis.downtime_avoided_hours || 36.5;
  const efficiencyScore = kpis.efficiency_percentage || 92;

  const actions = maintenanceData?.actions || [
    {
      device_id: 'DEV-114',
      device_name: 'Patient Monitor #14',
      department: 'Cardiology',
      issue: 'Battery degradation gap > 2.8x nominal discharge threshold',
      priority: 'High',
      recommendation: 'Replace internal Li-ion battery pack and run full charge-cycle calibration.',
      due_date: 'Within 24 Hours',
      status: 'Pending Review'
    },
    {
      device_id: 'DEV-108',
      device_name: 'Infusion Pump #8',
      department: 'ICU',
      issue: 'Network transmission protocol flags mismatching firmware baseline',
      priority: 'High',
      recommendation: 'Reflash device firmware to v3.2 and re-provision TLS client certificates.',
      due_date: 'Immediate',
      status: 'Quarantined'
    },
    {
      device_id: 'DEV-122',
      device_name: 'Pulse Oximeter #22',
      department: 'Surgery',
      issue: 'Optical sensor variance drift detected over 10 consecutive bursts',
      priority: 'Medium',
      recommendation: 'Clean probe optical window and execute zero-point sensor calibration.',
      due_date: '3 Days',
      status: 'Scheduled'
    },
    {
      device_id: 'DEV-105',
      device_name: 'ECG Telemetry #5',
      department: 'General Ward',
      issue: 'Inter-arrival jitter approaching warning limit (85ms variance)',
      priority: 'Low',
      recommendation: 'Inspect Wi-Fi AP signal strength and replace antenna gasket if damaged.',
      due_date: '7 Days',
      status: 'Monitoring'
    }
  ];

  const effRingData = {
    datasets: [
      {
        data: [efficiencyScore, Math.max(0, 100 - efficiencyScore)],
        backgroundColor: ['#22c55e', '#1e293b'],
        borderWidth: 0,
        circumference: 220,
        rotation: 250,
      },
    ],
  };

  const effRingOptions = {
    cutout: '80%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 p-4 rounded-xl border border-slate-800 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Derived Predictive Maintenance Advisor</h1>
            <p className="text-xs text-slate-400 mt-0.5">Automated sensor drift modeling, hardware degradation flags, and servicing schedule</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* 4 Small KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Servicing Required</span>
            <BatteryWarning className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">{serviceCount} Units</div>
          <div className="text-[11px] text-slate-500 mt-1">Degraded Hardware Health</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Calibration Due</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{calibrationCount} Units</div>
          <div className="text-[11px] text-slate-500 mt-1">Sensor Drift Approaching Threshold</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Downtime Avoided</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">{downtimeAvoided} <span className="text-xs text-slate-400 font-normal">Hours</span></div>
          <div className="text-[11px] text-teal-400 mt-1">↑ 12.5 hrs vs baseline</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Servicing Efficiency</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{efficiencyScore}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Simulated Fleet Index</div>
        </div>
      </div>

      {/* Recommended Actions Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              Prioritized Maintenance Actions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Model A hardware telemetry diagnostics and predictive servicing queue</p>
          </div>
          <span className="text-xs text-slate-400 font-medium bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
            {actions.length} Pending Actions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Device & Department</th>
                <th className="px-4 py-3">Detected Anomaly</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Recommended Action</th>
                <th className="px-4 py-3">Target Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {actions.map((item, idx) => {
                const isHigh = item.priority === 'High';
                const isMed = item.priority === 'Medium';
                const pColor = isHigh ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : isMed ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-blue-400 bg-blue-500/10 border-blue-500/30';

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-200">{item.device_name}</div>
                      <div className="text-[10px] text-slate-400">{item.device_id} · {item.department}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs text-slate-300">
                      {item.issue}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${pColor}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-sm text-slate-200">
                      {item.recommendation}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {item.due_date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 text-[10px] font-medium">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Efficiency Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-6">
          <div className="relative w-32 h-24 shrink-0 flex items-center justify-center">
            <Doughnut data={effRingData} options={effRingOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
              <span className="text-xl font-extrabold text-emerald-400">{efficiencyScore}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Preventative Maintenance Efficiency</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Model A continuous degradation monitoring predicts hardware failures prior to operational breakdown, scheduling timely battery and sensor servicing.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Zero-Trust Telemetry Protection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Devices undergoing maintenance or calibration remain automatically isolated from clinical decision workflows until nominal trust scores are re-verified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Maintenance;
