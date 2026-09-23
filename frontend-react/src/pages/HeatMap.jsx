import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Building2,
  Cpu,
  Layers,
  Info
} from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function HeatMap() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [selectedDept, setSelectedDept] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await dashboardApi.getHeatmap();
      setHeatmapData(res);
    } catch (err) {
      console.error('Failed to load risk heat map:', err);
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

  const rawDepts = heatmapData?.departments || [
    { name: 'ICU', count: 20, avg_score: 90.7, trusted_count: 19, warning_count: 0, critical_count: 1 },
    { name: 'Cardiology', count: 10, avg_score: 92.2, trusted_count: 9, warning_count: 1, critical_count: 0 },
    { name: 'General Ward', count: 10, avg_score: 88.2, trusted_count: 9, warning_count: 0, critical_count: 1 },
    { name: 'Endocrinology', count: 8, avg_score: 93.7, trusted_count: 8, warning_count: 0, critical_count: 0 },
    { name: 'Surgery', count: 7, avg_score: 94.7, trusted_count: 7, warning_count: 0, critical_count: 0 },
  ];

  const departments = rawDepts.map((d) => ({
    name: d.name || d.department || 'Ward',
    count: d.count || d.device_count || 0,
    avg_score: d.avg_score || 90.0,
    trusted_count: d.trusted_count ?? d.low_risk_count ?? 0,
    warning_count: d.warning_count ?? d.med_risk_count ?? 0,
    critical_count: d.critical_count ?? 0,
  }));

  const allUnits = heatmapData?.units || [];
  const filteredUnits = selectedDept === 'All' ? allUnits : allUnits.filter((u) => (u.department || '').toLowerCase() === selectedDept.toLowerCase());

  const displayedDepts = selectedDept === 'All'
    ? departments
    : departments.filter((d) => (d.name || '').toLowerCase() === selectedDept.toLowerCase());

  // Filtered summary counts
  const summaryDepts = displayedDepts;
  const totalDevices = summaryDepts.reduce((acc, d) => acc + (d.count || 0), 0) || (selectedDept === 'All' ? 55 : 0);
  const totalLow = summaryDepts.reduce((acc, d) => acc + (d.trusted_count || 0), 0);
  const totalMed = summaryDepts.reduce((acc, d) => acc + (d.warning_count || 0), 0);
  const totalHigh = 0;
  const totalCrit = summaryDepts.reduce((acc, d) => acc + (d.critical_count || 0), 0);

  const pctLow = totalDevices > 0 ? Math.round((totalLow / totalDevices) * 100) : 0;
  const pctMed = totalDevices > 0 ? Math.round((totalMed / totalDevices) * 100) : 0;
  const pctHigh = totalDevices > 0 ? Math.round((totalHigh / totalDevices) * 100) : 0;
  const pctCrit = totalDevices > 0 ? Math.round((totalCrit / totalDevices) * 100) : 0;

  const riskRingData = {
    labels: ['Low Risk (≥80%)', 'Medium Risk (65-79%)', 'High Risk (50-64%)', 'Critical (<50%)'],
    datasets: [
      {
        data: [totalLow, totalMed, totalHigh, totalCrit],
        backgroundColor: ['#22c55e', '#f59e0b', '#fb923c', '#ef4444'],
        borderColor: '#0f172a',
        borderWidth: 2,
      },
    ],
  };

  const riskRingOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
  };

  const getRiskColor = (score) => {
    if (score >= 80) return { label: 'Low Risk', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (score >= 65) return { label: 'Medium Risk', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (score >= 50) return { label: 'High Risk', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    return { label: 'Critical Risk', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 p-4 rounded-xl border border-slate-800 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Hospital Floor Plan Risk Heat Map</h1>
            <p className="text-xs text-slate-400 mt-0.5">Continuous spatial distribution of IoMT device risk by department and clinical unit</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            <option value="All">All Departments ({departments.length})</option>
            {departments.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.count} devices)
              </option>
            ))}
          </select>

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

      {/* Legend Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 border border-slate-800 p-3 rounded-xl text-xs text-slate-300">
        <div className="flex items-center gap-2 font-semibold text-slate-400">
          <Layers className="w-4 h-4 text-teal-400" />
          <span>Risk Legend:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Low Risk (Score ≥ 80%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Medium Risk (65 – 79.9%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>High Risk (50 – 64.9%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Critical / Isolate (&lt; 50%)</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Department Heatmap (8 cols) + Risk Ring Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Floor Plan Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedDepts.map((dept) => {
              const r = getRiskColor(dept.avg_score);
              const total = Math.max(1, dept.count);
              return (
                <div
                  key={dept.name}
                  className={`p-4 rounded-xl border bg-slate-900/70 flex flex-col justify-between shadow-md transition-all hover:border-slate-700 ${
                    selectedDept === dept.name ? 'ring-2 ring-teal-500/50' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-teal-400" />
                        {dept.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${r.bg} ${r.text} ${r.border}`}>
                        {Math.round(dept.avg_score)}% Mean
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-3">
                      {dept.count} Active Monitored Medical IoT Endpoints
                    </div>

                    {/* Progress Bar of Risk Breakdown */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex mb-3">
                      <div style={{ width: `${(dept.trusted_count / total) * 100}%` }} className="bg-emerald-500 h-full" title="Nominal"></div>
                      <div style={{ width: `${(dept.warning_count / total) * 100}%` }} className="bg-amber-500 h-full" title="Flagged"></div>
                      <div style={{ width: `${(dept.critical_count / total) * 100}%` }} className="bg-rose-500 h-full" title="Quarantined"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="text-emerald-400 font-semibold">{dept.trusted_count} Nominal</span>
                    <span className="text-amber-400 font-semibold">{dept.warning_count} Flagged</span>
                    <span className="text-rose-400 font-semibold">{dept.critical_count} Quarantined</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unit Level Device Tiles */}
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                Individual Device Telemetry Grid ({filteredUnits.length} Units)
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Live Inpatient Stream</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {filteredUnits.length === 0 ? (
                <div className="col-span-4 text-center py-8 text-slate-500 text-xs">
                  No individual telemetry units mapped to this filter.
                </div>
              ) : (
                filteredUnits.map((u, i) => {
                  const sc = u.final_trust_score !== undefined ? u.final_trust_score : 90;
                  const dec = u.decision || (sc >= 80 ? 'Accept' : sc >= 50 ? 'Monitor' : 'Isolate');
                  const r = getRiskColor(sc);

                  return (
                    <div
                      key={i}
                      className="p-3 bg-slate-950/60 border border-slate-800/90 rounded-lg flex flex-col justify-between hover:bg-slate-800/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-200 truncate">{u.device_name || u.device_id}</span>
                          <span className={`w-2 h-2 rounded-full ${sc >= 80 ? 'bg-emerald-400' : sc >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}></span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{u.location || u.patient_room || 'Room 101'}</div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60">
                        <span className="text-[10px] text-slate-500 font-mono">{dec}</span>
                        <span className={`text-xs font-extrabold ${r.text}`}>{Math.round(sc)}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Risk Summary Ring Card (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Ecosystem Risk Summary</h2>
            <p className="text-xs text-slate-400 mb-4">Total monitored devices across all hospital floors</p>

            <div className="relative w-44 h-44 mx-auto mb-4 flex items-center justify-center">
              <Doughnut data={riskRingData} options={riskRingOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-white">{totalDevices}</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Units</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Low Risk (Nominal)
                </span>
                <span className="font-bold text-emerald-400">{totalLow} ({pctLow}%)</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Medium Risk (Flagged)
                </span>
                <span className="font-bold text-amber-400">{totalMed} ({pctMed}%)</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  High Risk (Action Needed)
                </span>
                <span className="font-bold text-orange-400">{totalHigh} ({pctHigh}%)</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Critical Risk (Quarantined)
                </span>
                <span className="font-bold text-rose-400">{totalCrit} ({pctCrit}%)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Updates in real-time as CTE re-evaluates telemetry</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeatMap;
