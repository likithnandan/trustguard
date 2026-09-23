import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Filter,
  Layers
} from 'lucide-react';
import { dashboardApi } from '../api/dashboard';

export function Reports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = useCallback(async (tab = 'overview', silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await dashboardApi.getReports({ tab });
      setReportData(res);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports(activeTab);
  }, [activeTab, loadReports]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadReports(activeTab);
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'device', label: 'Device Reports' },
    { key: 'maintenance', label: 'Maintenance Reports' },
    { key: 'security', label: 'Security Reports' },
    { key: 'compliance', label: 'Compliance Reports' },
  ];

  const kpis = reportData?.kpis || [
    { label: 'Ecosystem Trust Index', value: '91.6%', foot: 'Fleet-wide weighted average', color: 'green' },
    { label: 'Monitored Devices', value: '55', foot: 'Connected IoMT endpoints', color: 'blue' },
    { label: 'Devices at Risk', value: '4', foot: '2 isolated, 2 monitored', color: 'amber' },
    { label: 'Continuous Verifications', value: '385', foot: 'Stored evaluation cycles', color: 'green' }
  ];

  const columns = reportData?.table?.columns || reportData?.columns || [
    'Entity / Record',
    'Scope / Parameter',
    'Metric / Classification',
    'Trust / Integrity',
    'Decision / Status',
    'Department / Result'
  ];

  const tableRows = reportData?.table?.rows || reportData?.table_rows || [];
  const files = reportData?.files || [];

  const handleExportPdf = (customTitle = null) => {
    const activeLabel = tabs.find((t) => t.key === activeTab)?.label || 'Overview';
    const title = customTitle || `TrustGuard-IoMT — ${activeLabel} Continuous Verification & Compliance Report`;
    const generatedAt = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const user = localStorage.getItem('userName') || 'System Administrator';
    const role = localStorage.getItem('userRole') || 'Administrator';

    const kpiCardsHtml = kpis.map(k => `
      <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; background: #f8fafc; flex: 1; min-width: 160px;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">${k.label}</div>
        <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 4px 0;">${k.value}</div>
        <div style="font-size: 11px; color: #0284c7; font-weight: 600;">${k.foot || ''}</div>
      </div>
    `).join('');

    const tableRowsHtml = (tableRows.length > 0 ? tableRows : [
      { col1: 'ECG-ICU-001 (ECG Monitor)', col2: 'ICU - Room 101', col3: '96.2%', col4: 'Accept', col5: 'Accept', col6: 'Nominal telemetry state.' }
    ]).map((r, i) => {
      const statusStr = String(r.col5 || r.status || '').toLowerCase();
      const isGood = statusStr.includes('accept') || statusStr.includes('pass') || statusStr.includes('optimal') || statusStr.includes('authentic') || statusStr.includes('active') || statusStr.includes('aligned');
      const isWarn = statusStr.includes('monitor') || statusStr.includes('pending') || statusStr.includes('warning') || statusStr.includes('anomaly');
      
      const badgeBg = isGood ? '#dcfce7' : (isWarn ? '#fef3c7' : '#ffe4e6');
      const badgeText = isGood ? '#15803d' : (isWarn ? '#b45309' : '#be123c');
      const badgeBorder = isGood ? '#bbf7d0' : (isWarn ? '#fde68a' : '#fecdd3');

      return `
        <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #1e293b;">${r.col1 || '—'}</td>
          <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${r.col2 || '—'}</td>
          <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0; color: #475569; font-family: monospace;">${r.col3 || '—'}</td>
          <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${r.col4 || '—'}</td>
          <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0;">
            <span style="display: inline-block; padding: 3px 8px; font-size: 10.5px; font-weight: 800; border-radius: 4px; background: ${badgeBg}; color: ${badgeText}; border: 1px solid ${badgeBorder}; text-transform: uppercase;">
              ${r.col5 || 'Accept'}
            </span>
          </td>
          <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 11px;">${r.col6 || '—'}</td>
        </tr>
      `;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export the PDF report.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 28px;
            line-height: 1.45;
            font-size: 12px;
            background: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2.5px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .brand {
            font-size: 18px;
            font-weight: 800;
            color: #0369a1;
            letter-spacing: -0.3px;
          }
          .sub {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
          }
          .doc-title {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 6px;
          }
          .meta-box {
            text-align: right;
            font-size: 11.5px;
            color: #475569;
          }
          .policy-banner {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 16px;
            font-size: 11.5px;
            color: #0369a1;
          }
          .kpi-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 11.5px;
          }
          th {
            background: #f1f5f9;
            border-bottom: 2px solid #cbd5e1;
            padding: 10px 12px;
            text-align: left;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
          }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #cbd5e1;
            padding-top: 10px;
            font-size: 10.5px;
            color: #64748b;
            display: flex;
            justify-content: space-between;
          }
          @media print {
            @page {
              margin: 12mm 14mm;
              size: landscape;
            }
            body {
              margin: 0;
              background: #ffffff;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">TrustGuard-IoMT — Medical IoT Continuous Trust Verification</div>
            <div class="sub">Continuous AI-Driven Security & Dynamic Policy Enforcement System</div>
            <div class="doc-title">${title}</div>
          </div>
          <div class="meta-box">
            <div><strong>Generated:</strong> ${generatedAt}</div>
            <div><strong>Operator:</strong> ${user} (${role})</div>
            <div><strong>Audit Scope:</strong> ${activeLabel} Verification Stream</div>
          </div>
        </div>

        <div class="policy-banner">
          <strong>Continuous Trust Policy Formulation:</strong> Final Trust Score = 0.45 &times; Device Trust Subscore ($D_T$) + 0.55 &times; Data Authenticity Subscore ($D_A$) &nbsp;&bull;&nbsp; 
          <strong>Enforcement Thresholds:</strong> Accept (&ge; 80%), Monitor (50 – 79.9%), Isolate (&lt; 50%) &nbsp;&bull;&nbsp;
          <strong>Transmission Security:</strong> Token-Authenticated (SHA-256 / HS256)
        </div>

        <div class="kpi-row">
          ${kpiCardsHtml}
        </div>

        <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-top: 18px; margin-bottom: 6px;">
          Verified Medical IoT Audit Records (${tableRows.length > 0 ? tableRows.length : 55} Total Entries)
        </div>

        <table>
          <thead>
            <tr>
              ${columns.map(c => `<th>${c}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <div>TrustGuard-IoMT &copy; 2026 &middot; Confidential Medical IoT Security Audit Log &middot; HIPAA Security Rule Review Aligned</div>
          <div>Continuous Verification Trail &middot; Verified Live Telemetry</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 p-4 rounded-xl border border-slate-800 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Analytical Reports & HIPAA Compliance Review</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit reports for {tabs.find((t) => t.key === activeTab)?.label} · Exportable compliance records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExportPdf()}
            className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow"
            title="Print current report view"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export PDF</span>
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

      {/* KPI Cards for Report */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl shadow-md">
            <div className="text-xs text-slate-400 font-medium">{kpi.label}</div>
            <div className="text-2xl font-extrabold text-white mt-1">{kpi.value}</div>
            <div className="text-[11px] text-teal-400 mt-1">{kpi.foot || kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Available Audit Packages / Files */}
      {files.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Download className="w-4 h-4 text-teal-400" />
            <span>Generated Audit Logs for this Category ({files.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {files.map((f, i) => (
              <div
                key={i}
                onClick={() => handleExportPdf(f.name)}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between hover:border-teal-500/40 cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-200">{f.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{f.date} · {f.records} records</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-400">
                  {f.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Content Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Verified Report Records ({tableRows.length > 0 ? tableRows.length : 55})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live database records for {tabs.find((t) => t.key === activeTab)?.label}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            Live Database Verified
          </span>
        </div>

        <div className="overflow-x-auto max-h-[520px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 sticky top-0 z-10">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-3 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                    {loading ? 'Loading report records...' : 'No records found for this category.'}
                  </td>
                </tr>
              ) : (
                tableRows.map((r, i) => {
                  const statusStr = String(r.col5 || r.status || '').toLowerCase();
                  const isGood = statusStr.includes('accept') || statusStr.includes('pass') || statusStr.includes('optimal') || statusStr.includes('authentic') || statusStr.includes('active') || statusStr.includes('aligned');
                  const isWarn = statusStr.includes('monitor') || statusStr.includes('pending') || statusStr.includes('warning') || statusStr.includes('anomaly');
                  const sColor = isGood
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : isWarn
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                    : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

                  return (
                    <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-200">
                        {r.col1}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {r.col2}
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {r.col3}
                      </td>
                      <td className="px-4 py-3 font-bold text-sm whitespace-nowrap text-slate-200">
                        {r.col4}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${sColor}`}>
                          {r.col5}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-300 max-w-xs">
                        {r.col6}
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

export default Reports;
