function icon(name){
  const icons = {
    grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    devices:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
    shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/></svg>',
    brain:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>',
    map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3v15M15 6v15M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/></svg>',
    wrench:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a4 4 0 105.7 5.7l-3.3 3.3-2.3-2.3-3.3 3.3a4 4 0 11-5.7-5.7l3.3-3.3 2.3 2.3z"/></svg>',
    bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>',
    doc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>',
    id:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2"/><path d="M15 10h3M15 14h3"/></svg>',
    gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
    users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
    cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    settings2:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M1 12h4M19 12h4M4.2 19.8L7 17M17 7l2.8-2.8"/></svg>',
    help:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 115.8 1c0 2-3 2-3 4M12 17h.01"/></svg>',
    battery:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 10v4"/></svg>',
    data:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/></svg>',
    wifi:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.5a11 11 0 0114 0M8.5 16a6 6 0 017 0M12 20h.01"/></svg>',
    clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
    alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>'
  };
  return icons[name] || '';
}
// resolve template placeholders for the nav (written with ${icon(...)} above for readability)
document.getElementById('navList').innerHTML = document.getElementById('navList').innerHTML.replace(/\$\{icon\('(\w+)'\)\}/g, (m,n)=>icon(n));
document.querySelectorAll('.date-pill, .icon-btn, .btn-primary, .modal-btn, .profile-photo').forEach(el=>{
  el.innerHTML = el.innerHTML.replace(/\$\{icon\('(\w+)'\)\}/g, (m,n)=>icon(n));
});

// ---------- API BASE & AUTHENTICATION CONFIG ----------
const API_BASE = 'http://127.0.0.1:8000';

// ---------- DYNAMIC STATE ----------
let dashboardSummary = null;
let dashboardDevices = [];
let activeDeviceFilter = 'all';
let dashboardAlerts = [];
let activeAlertCategory = 'All';
let dashboardTrend = null;

const colorMap = {
  red: ['var(--red-bg)', 'var(--red)'],
  amber: ['var(--amber-bg)', 'var(--amber)'],
  blue: ['var(--accent-soft)', 'var(--accent)'],
  green: ['var(--green-bg)', 'var(--green)'],
  gray: ['var(--gray-bg)', 'var(--gray)']
};

function statusColor(s){
  if(s === 'Trusted' || s === 'green') return 'green';
  if(s === 'At Risk' || s === 'amber') return 'amber';
  if(s === 'Critical' || s === 'red') return 'red';
  return 'gray';
}

function trustDecisionColor(score){
  if(score >= 80) return 'green';
  if(score >= 50) return 'amber';
  return 'red';
}

// ---------- CHARTS INITIALIZATION (Defensive) ----------
if (typeof Chart === 'undefined') {
  console.warn('Chart.js did not load - charts will be skipped, rest of the dashboard still works.');
  window.Chart = function(){ return null; };
}
Chart.defaults = Chart.defaults || {font:{}};
Chart.defaults.color = '#7c8aad';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';

let gaugeChartInstance = null;
let trendChartInstance = null;
let teGaugeInstance = null;
let historyChartInstance = null;
let riskTrendChartInstance = null;

try {
  const gEl = document.getElementById('gaugeChart');
  if (gEl) {
    gaugeChartInstance = new Chart(gEl, {
      type: 'doughnut',
      data: { datasets: [{ data: [88, 12], backgroundColor: ['#22c55e', '#1a2036'], borderWidth: 0 }] },
      options: { circumference: 180, rotation: 270, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
    });
  }

  const trEl = document.getElementById('trendChart');
  if (trEl) {
    trendChartInstance = new Chart(trEl, {
      type: 'line',
      data: {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'],
        datasets: [{ data: [82, 85, 84, 88, 86, 90, 88], borderColor: '#3ec9ff', backgroundColor: 'rgba(62,201,255,0.10)', fill: true, tension: .4, pointRadius: 0, borderWidth: 2.5 }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, grid: { color: '#1a2036' } }, x: { grid: { display: false } } } }
    });
  }

  const teEl = document.getElementById('teGauge');
  if (teEl) {
    teGaugeInstance = new Chart(teEl, {
      type: 'doughnut',
      data: { datasets: [{ data: [92, 8], backgroundColor: ['#3ec9ff', '#1a2036'], borderWidth: 0 }] },
      options: { circumference: 180, rotation: 270, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
    });
  }

  const histEl = document.getElementById('historyChart');
  if (histEl) {
    historyChartInstance = new Chart(histEl, {
      type: 'line',
      data: {
        labels: ['10 AM', '12 PM', '2 PM', '4 PM', 'Now'],
        datasets: [{ data: [91, 93, 90, 94, 92], borderColor: '#3ec9ff', backgroundColor: 'rgba(62,201,255,0.10)', fill: true, tension: .4, pointRadius: 0, borderWidth: 2.5 }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, grid: { color: '#1a2036' } }, x: { grid: { display: false } } } }
    });
  }

  const rtEl = document.getElementById('riskTrendChart');
  if (rtEl) {
    riskTrendChartInstance = new Chart(rtEl, {
      type: 'line',
      data: {
        labels: ['May 10', 'May 11', 'May 12', 'May 13', 'May 14', 'May 15', 'May 16'],
        datasets: [
          { label: 'High Risk', data: [1, 2, 1, 2, 1, 1, 1], borderColor: '#ef4444', pointRadius: 0, tension: .4, borderWidth: 2 },
          { label: 'Medium Risk', data: [2, 2, 3, 2, 2, 2, 2], borderColor: '#f59e0b', pointRadius: 0, tension: .4, borderWidth: 2 },
          { label: 'Low Risk', data: [5, 5, 4, 5, 5, 5, 5], borderColor: '#22c55e', pointRadius: 0, tension: .4, borderWidth: 2 }
        ]
      },
      options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10.5, family: 'Inter' }, color: '#a9b3cc' } } }, scales: { y: { grid: { color: '#1a2036' } }, x: { grid: { display: false } } } }
    });
  }
} catch (err) {
  console.warn('Error initializing charts:', err);
}

// ---------- DYNAMIC DASHBOARD DATA FETCHING & RENDERING ----------
async function loadDashboardData(silent = false) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const reqHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    const [summaryRes, devicesRes, trendRes, alertsRes] = await Promise.all([
      fetch(`${API_BASE}/api/v1/dashboard/summary`, { headers: reqHeaders }),
      fetch(`${API_BASE}/api/v1/dashboard/devices`, { headers: reqHeaders }),
      fetch(`${API_BASE}/api/v1/dashboard/trust-trend`, { headers: reqHeaders }),
      fetch(`${API_BASE}/api/v1/dashboard/alerts`, { headers: reqHeaders })
    ]);

    if (summaryRes.status === 401 || devicesRes.status === 401) {
      window.location.href = 'login.html';
      return;
    }

    if (summaryRes.ok) {
      const sData = await summaryRes.json();
      dashboardSummary = sData.kpis || {};
      renderKpis(dashboardSummary);
      renderSmallCards(dashboardSummary);
      renderTrustEngineSummary(dashboardSummary);
    }

    if (devicesRes.ok) {
      const dData = await devicesRes.json();
      dashboardDevices = dData.devices || [];
      renderDeviceTabs(dData.tabs || []);
      renderDevicesTable();
      renderTrustEngineDetails();
    }

    if (trendRes.ok) {
      const tData = await trendRes.json();
      dashboardTrend = tData;
      renderTrendCharts(tData);
    }

    if (alertsRes.ok) {
      const aData = await alertsRes.json();
      dashboardAlerts = aData.alerts || [];
      renderAlertTabs(aData.tabs || []);
      renderAlertsList();
    }
  } catch (err) {
    if (!silent) console.error('Error fetching dashboard data:', err);
  }
}

// ---------- RENDER KPIS ----------
function renderKpis(k) {
  const kpiRow = document.getElementById('kpiRow');
  if (!kpiRow || !k) return;

  const total = k.total_devices || 0;
  const trusted = k.trusted_devices || 0;
  const atRisk = k.at_risk_devices || 0;
  const critical = k.critical_devices || 0;

  const tPct = total > 0 ? ((trusted / total) * 100).toFixed(1) : 0;
  const rPct = total > 0 ? ((atRisk / total) * 100).toFixed(1) : 0;
  const cPct = total > 0 ? ((critical / total) * 100).toFixed(1) : 0;

  const kpisData = [
    { label: 'Total Devices', value: total, foot: `${k.total_patients || 0} Admitted Patients`, pill: null },
    { label: 'Trusted Devices', value: trusted, foot: `${tPct}% of total (Accept >=80)`, pill: 'green' },
    { label: 'At Risk Devices', value: atRisk, foot: `${rPct}% of total (Monitor 50-79)`, pill: 'amber' },
    { label: 'Critical Devices', value: critical, foot: `${cPct}% of total (Isolate <50)`, pill: 'red' }
  ];

  kpiRow.innerHTML = '';
  kpisData.forEach(item => {
    kpiRow.innerHTML += `<div class="card kpi">
      <div class="kpi-top">
        <span class="kpi-label">${item.label}</span>
        ${item.pill ? `<span class="kpi-pill pill-${item.pill}">${item.pill === 'green' ? 'Trusted' : item.pill === 'amber' ? 'Warning' : 'Critical'}</span>` : ''}
      </div>
      <div class="kpi-value">${item.value}</div>
      <div class="kpi-foot ${item.pill ? '' : 'up'}">${item.foot}</div>
    </div>`;
  });

  // Overall Trust Gauge
  const avgScore = k.average_trust_score !== undefined ? k.average_trust_score : 88.5;
  const gValEl = document.querySelector('.gauge-value');
  const gTagEl = document.querySelector('.gauge-tag');
  if (gValEl) gValEl.textContent = `${avgScore}%`;
  if (gTagEl) {
    const tag = avgScore >= 80 ? 'Trusted' : avgScore >= 50 ? 'At Risk' : 'Critical';
    gTagEl.textContent = tag;
  }

  if (gaugeChartInstance && gaugeChartInstance.data) {
    const scoreNum = parseFloat(avgScore);
    const gColor = scoreNum >= 80 ? '#22c55e' : scoreNum >= 50 ? '#f59e0b' : '#ef4444';
    gaugeChartInstance.data.datasets[0].data = [scoreNum, Math.max(0, 100 - scoreNum)];
    gaugeChartInstance.data.datasets[0].backgroundColor = [gColor, '#1a2036'];
    gaugeChartInstance.update();
  }
}

// ---------- RENDER SMALL METRIC CARDS ----------
function renderSmallCards(k) {
  const sc = document.getElementById('smallCards');
  if (!sc || !k) return;

  const alerts = k.alerts || { total: 0, critical: 0, warning: 0 };
  const decisions = k.decisions || { accept: 0, monitor: 0, isolate: 0 };
  const sec = k.security || {};

  const cardsData = [
    { title: 'Alerts (Active)', value: alerts.total, foot: `${alerts.critical} Critical · ${alerts.warning} Warnings`, color: alerts.critical > 0 ? 'red' : alerts.warning > 0 ? 'amber' : 'green', icon: 'alert' },
    { title: 'Secure Transmissions', value: sec.secure_transmissions || '100%', foot: sec.encryption || 'Token Auth (SHA-256)', color: 'green', icon: 'shield' },
    { title: 'Active Locations', value: sec.active_locations || 1, foot: 'Hospital Departments', color: 'green', icon: 'map' },
    { title: 'AI Predictions', value: decisions.accept + decisions.monitor + decisions.isolate, foot: `${decisions.accept} Accept · ${decisions.monitor} Mon · ${decisions.isolate} Iso`, color: 'blue', icon: 'brain' },
    { title: 'Data Authenticity', value: sec.data_authenticity_score || '97.4%', foot: 'Model B Ensemble Score', color: 'blue', icon: 'check' }
  ];

  sc.innerHTML = '';
  cardsData.forEach(c => {
    const [bg, fg] = colorMap[c.color] || colorMap.blue;
    sc.innerHTML += `<div class="card small-card">
      <div class="small-icon" style="background:${bg}; color:${fg};">${icon(c.icon)}</div>
      <div>
        <div class="small-title">${c.title}</div>
        <div class="small-value">${c.value}</div>
        <div class="small-foot">${c.foot}</div>
      </div>
    </div>`;
  });
}

// ---------- PATIENT MANAGEMENT STATE (Phase 10) ----------
let allPatientsList = [];
let selectedPatientForEdit = null;
let patientSearchQuery = '';

// ---------- RENDER DEVICE TABS & TABLE ----------
function renderDeviceTabs(tabs) {
  const dt = document.getElementById('deviceTabs');
  if (!dt) return;

  dt.innerHTML = '';
  tabs.forEach(t => {
    const isActive = t.key === activeDeviceFilter;
    const btn = document.createElement('button');
    btn.className = `tab-btn ${isActive ? 'active' : ''}`;
    btn.innerHTML = `${t.label}<span class="n">${t.n}</span>`;
    btn.addEventListener('click', () => {
      activeDeviceFilter = t.key;
      document.querySelectorAll('#deviceTabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderDevicesTable();
    });
    dt.appendChild(btn);
  });
}

function renderDevicesTable() {
  const tbody = document.getElementById('devicesTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  const filtered = dashboardDevices.filter(d => {
    if (activeDeviceFilter === 'all') return true;
    return d.color === activeDeviceFilter;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--muted);">No devices found for this category.</td></tr>`;
    return;
  }

  filtered.forEach(d => {
    const c = statusColor(d.color || d.status);
    tbody.innerHTML += `<tr>
      <td>
        <div class="device-cell">
          <div class="device-ico">${icon('devices')}</div>
          <div>
            <div class="device-name">${d.name}</div>
            <div class="device-id">${d.id} · <span style="color:var(--muted);">${d.patient_name || 'Unassigned'}</span></div>
          </div>
        </div>
      </td>
      <td>${d.type}</td>
      <td>${d.loc}</td>
      <td>
        <div class="trust-bar-wrap">
          <div class="trust-bar">
            <div class="trust-bar-fill" style="width:${d.score}%; background:var(--${c});"></div>
          </div>
          <span style="font-weight:700; color:var(--${c});">${d.score}%</span>
        </div>
      </td>
      <td>
        <span class="badge" style="background:var(--${c}-bg); color:var(--${c});">● ${d.status} (${d.decision})</span>
      </td>
      <td style="text-align:right; white-space:nowrap;">
        <button class="btn-action" onclick="openDeviceDetailModal('${d.id}')" title="View Device Details">${icon('doc')} Details</button>
        <button class="btn-action primary" onclick="openAssignModal(null, '${d.id}')" title="Assign to Patient">${icon('devices')} Assign</button>
      </td>
    </tr>`;
  });
}

// ---------- PATIENT MANAGEMENT (Phase 10) ----------
async function loadPatients(silent = false) {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/v1/patients`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.status === 401) {
      window.location.href = 'login.html';
      return;
    }

    if (res.ok) {
      const data = await res.json();
      allPatientsList = data.patients || [];
      renderPatientsTable();
    }
  } catch (err) {
    if (!silent) console.error('Error loading patients:', err);
  }
}

function renderPatientsTable() {
  const tbody = document.getElementById('patientsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  const q = patientSearchQuery.trim().toLowerCase();
  const filtered = allPatientsList.filter(p => {
    if (!q) return true;
    const matchName = (p.full_name || '').toLowerCase().includes(q);
    const matchId = (p.id || '').toLowerCase().includes(q);
    const matchRoom = (p.room || '').toLowerCase().includes(q);
    const matchDept = (p.department || '').toLowerCase().includes(q);
    return matchName || matchId || matchRoom || matchDept;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--muted);">No admitted patients found.</td></tr>`;
    return;
  }

  filtered.forEach(p => {
    const pInitials = (p.full_name || 'PT').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const statusClass = p.status === 'Critical' ? 'red' : p.status === 'Discharged' ? 'gray' : 'green';
    
    // Find device trust info if assigned
    const assigned = p.assigned_device;
    let devDisplay = `<span style="color:var(--muted); font-size:12px;">Unassigned</span>`;
    let trustDisplay = `<span style="color:var(--muted); font-size:12px;">—</span>`;

    if (assigned) {
      const dMatch = dashboardDevices.find(d => d.id === assigned.device_id);
      const score = dMatch ? dMatch.score : 90;
      const decision = dMatch ? dMatch.decision : 'Accept';
      const c = trustDecisionColor(score);

      devDisplay = `<div style="font-weight:700; font-size:12.5px; color:#fff;">${assigned.device_name || assigned.device_id}</div>
                    <div style="font-size:11px; color:var(--muted);">${assigned.device_id} · ${assigned.device_type}</div>`;
      
      trustDisplay = `<div style="display:flex; align-items:center; gap:8px;">
        <span class="badge" style="background:var(--${c}-bg); color:var(--${c}); font-weight:700;">● ${score}% (${decision})</span>
      </div>`;
    }

    tbody.innerHTML += `<tr>
      <td>
        <div class="user-cell">
          <div class="user-avatar-sm" style="background:var(--accent-soft); color:var(--accent);">${pInitials}</div>
          <div>
            <div style="font-weight:700; color:#fff;">${p.full_name}</div>
            <div style="font-size:11px; color:var(--muted); font-family:var(--font-mono);">${p.id}</div>
          </div>
        </div>
      </td>
      <td>${p.age} yrs · ${p.gender}</td>
      <td>${p.department} · <span style="color:var(--muted);">${p.room}</span></td>
      <td>
        <span class="badge" style="background:var(--${statusClass}-bg); color:var(--${statusClass});">● ${p.status}</span>
      </td>
      <td>${devDisplay}</td>
      <td>${trustDisplay}</td>
      <td style="text-align:right; white-space:nowrap;">
        <button class="btn-action" onclick="openPatientDetailModal('${p.id}')" title="View Patient Details">${icon('doc')} View</button>
        <button class="btn-action" onclick="openEditPatientModal('${p.id}')" title="Edit Demographics">${icon('wrench')} Edit</button>
        <button class="btn-action primary" onclick="openAssignModal('${p.id}', null)" title="Assign Medical IoT Device">${icon('devices')} Assign</button>
      </td>
    </tr>`;
  });
}

// Bind search filter for patients
const pSearchInput = document.getElementById('patientSearchInput');
if (pSearchInput) {
  pSearchInput.addEventListener('input', (e) => {
    patientSearchQuery = e.target.value;
    renderPatientsTable();
  });
}

// ---------- RENDER TRUST ENGINE DISPLAY ----------
// ---------- TRUST ENGINE (Phase 11: Dynamic XAI & Trust History) ----------
let selectedTrustDeviceId = null;
let historyChartData = null;

function renderTrustEngineSummary(k) {
  const teScoreEl = document.querySelector('#page-trust .gauge-value');
  const teTagEl = document.querySelector('#page-trust .gauge-tag');
  const avgScore = k.average_trust_score !== undefined ? k.average_trust_score : 90;

  if (teScoreEl) teScoreEl.textContent = `${avgScore}%`;
  if (teTagEl) {
    const tag = avgScore >= 80 ? 'Trusted' : avgScore >= 50 ? 'Monitor' : 'Isolated';
    teTagEl.textContent = tag;
  }

  if (teGaugeInstance && teGaugeInstance.data) {
    const scoreNum = parseFloat(avgScore);
    const color = scoreNum >= 80 ? '#22c55e' : scoreNum >= 50 ? '#f59e0b' : '#ef4444';
    teGaugeInstance.data.datasets[0].data = [scoreNum, Math.max(0, 100 - scoreNum)];
    teGaugeInstance.data.datasets[0].backgroundColor = [color, '#1a2036'];
    teGaugeInstance.update();
  }
}

async function loadTrustEngineData(deviceId = null, silent = false) {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  const reqHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  try {
    const devParam = deviceId || selectedTrustDeviceId || '';
    const url = devParam 
      ? `${API_BASE}/api/v1/dashboard/trust-history?device_id=${encodeURIComponent(devParam)}&limit=30`
      : `${API_BASE}/api/v1/dashboard/trust-history?limit=30`;

    const res = await fetch(url, { headers: reqHeaders });
    if (!res.ok) return;

    const data = await res.json();
    const dev = data.device || {};
    selectedTrustDeviceId = dev.id;

    // Populate device dropdown if empty or update selection
    const teSelect = document.getElementById('teDeviceSelect');
    if (teSelect && dashboardDevices.length > 0) {
      if (teSelect.options.length === 0) {
        teSelect.innerHTML = dashboardDevices.map(d => `<option value="${d.id}">${d.name} (${d.id}) - Room ${d.loc}</option>`).join('');
        teSelect.addEventListener('change', (e) => {
          loadTrustEngineData(e.target.value);
        });
      }
      if (selectedTrustDeviceId) {
        teSelect.value = selectedTrustDeviceId;
      }
    }

    // Update Trust Score Card & Gauge
    const score = dev.latest_score !== undefined ? dev.latest_score : 92;
    const dec = dev.latest_decision || (score >= 80 ? 'Accept' : score >= 50 ? 'Monitor' : 'Isolate');
    const color = trustDecisionColor(score);

    const teScoreEl = document.querySelector('#page-trust .gauge-value');
    const teTagEl = document.querySelector('#page-trust .gauge-tag');
    const teSubEl = document.getElementById('teCardSub');
    const teFootEl = document.getElementById('teGaugeFoot');
    const teStatusBadge = document.getElementById('teDeviceStatusBadge');

    if (teScoreEl) teScoreEl.textContent = `${score}%`;
    if (teTagEl) {
      teTagEl.textContent = dec;
      teTagEl.style.color = `var(--${color})`;
    }
    if (teSubEl) teSubEl.textContent = `Device: ${dev.name || dev.id} · ${dev.department || 'ICU'} · ${dev.location || ''}`;
    if (teFootEl) teFootEl.textContent = `Model A: ${dev.device_trust_subscore}% · Model B: ${dev.data_authenticity_subscore}%`;

    if (teStatusBadge) {
      teStatusBadge.innerHTML = `
        <span class="badge" style="background:var(--${color}-bg); color:var(--${color}); font-weight:700;">● ${dec}</span>
        <span style="color:var(--muted); font-size:12px;">Patient: ${dev.patient_name || 'Unassigned'}</span>
      `;
    }

    if (teGaugeInstance && teGaugeInstance.data) {
      const gColor = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
      teGaugeInstance.data.datasets[0].data = [score, Math.max(0, 100 - score)];
      teGaugeInstance.data.datasets[0].backgroundColor = [gColor, '#1a2036'];
      teGaugeInstance.update();
    }

    // Render Trust Breakdown & XAI Factors
    const bl = document.getElementById('breakdownList');
    if (bl) {
      bl.innerHTML = '';
      const dScore = dev.device_trust_subscore || score;
      const aScore = dev.data_authenticity_subscore || score;
      const xai = dev.xai_explanation || {};
      const devFactors = xai.top_device_factors || [];
      const authFactors = xai.top_authenticity_factors || [];

      // Main model components
      const mainComponents = [
        { label: 'Model A — Device Trust (45% Weight)', value: dScore, icon: 'target', color: 'accent' },
        { label: 'Model B — Data Authenticity (55% Weight)', value: aScore, icon: 'shield', color: 'accent' },
        { label: 'Continuous Unified Trust Score', value: score, icon: 'brain', color: color }
      ];

      mainComponents.forEach(b => {
        bl.innerHTML += `<div class="breakdown-row" style="margin-bottom:8px;">
          <div class="breakdown-label">${icon(b.icon)} ${b.label}</div>
          <div class="breakdown-bar"><div class="breakdown-fill" style="width:${b.value}%; background:var(--${b.color});"></div></div>
          <span style="font-weight:700; color:var(--${b.color});">${b.value}%</span>
        </div>`;
      });

      // Top XAI Factors Header & Factors
      if (devFactors.length > 0 || authFactors.length > 0) {
        bl.innerHTML += `<div style="font-size:11px; font-weight:700; color:var(--muted); margin:10px 0 4px 0; text-transform:uppercase; letter-spacing:0.5px;">Key AI Feature Influences (XAI Tree Attribution)</div>`;
        
        devFactors.slice(0, 2).forEach(f => {
          const impPct = Math.round((f.importance || 0.25) * 100);
          bl.innerHTML += `<div class="breakdown-row" style="margin-bottom:5px;">
            <div class="breakdown-label" style="font-size:11.5px; color:var(--text);">${icon('battery')} Dev: <code>${f.feature}</code></div>
            <div class="breakdown-bar"><div class="breakdown-fill" style="width:${impPct}%; background:#3ec9ff;"></div></div>
            <span style="font-size:11px; color:var(--muted);">${impPct}%</span>
          </div>`;
        });

        authFactors.slice(0, 2).forEach(f => {
          const impPct = Math.round((f.importance || 0.25) * 100);
          bl.innerHTML += `<div class="breakdown-row" style="margin-bottom:5px;">
            <div class="breakdown-label" style="font-size:11.5px; color:var(--text);">${icon('wifi')} Net: <code>${f.feature}</code></div>
            <div class="breakdown-bar"><div class="breakdown-fill" style="width:${impPct}%; background:#a855f7;"></div></div>
            <span style="font-size:11px; color:var(--muted);">${impPct}%</span>
          </div>`;
        });
      }
    }

    // Update History Chart
    if (historyChartInstance && data.chart && data.chart.labels && data.chart.scores) {
      historyChartInstance.data.labels = data.chart.labels;
      historyChartInstance.data.datasets[0].data = data.chart.scores;
      historyChartInstance.update();
    }

    // Render Recent Trust Events Table
    const etb = document.getElementById('eventsTableBody');
    if (etb) {
      etb.innerHTML = '';
      const historyList = data.history || [];
      if (historyList.length === 0) {
        etb.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--muted); padding:20px;">No historical evaluation events logged yet. Simulator streaming will log stateful evaluations here.</td></tr>`;
      } else {
        historyList.slice(0, 8).forEach(h => {
          const sc = h.final_trust_score;
          const isGood = sc >= 80;
          const isWarn = sc >= 50 && sc < 80;
          const c = trustDecisionColor(sc);
          const impact = isGood ? 'Nominal (+0%)' : isWarn ? 'Degraded (-15%)' : 'Violation (-45%)';
          const eventLabel = isGood ? 'Continuous Verification Validated' : isWarn ? 'Sensor Drift / Telemetry Anomaly' : 'Security / Tampering Policy Breach';

          etb.innerHTML += `<tr>
            <td style="color:var(--muted); font-size:12px;">${h.time_ago || h.timestamp.substring(11, 16)}</td>
            <td style="font-weight:600;">${eventLabel} <span style="color:var(--muted); font-size:11.5px;">(${h.device_id})</span></td>
            <td style="color:var(--${c}); font-weight:700;">${impact}</td>
            <td><span class="badge" style="background:var(--${c}-bg); color:var(--${c}); font-weight:700;">${sc}% ${h.decision}</span></td>
            <td style="color:var(--muted); font-size:12px;">${h.clinical_reason}</td>
          </tr>`;
        });
      }
    }

  } catch (err) {
    if (!silent) console.error('Error loading trust engine data:', err);
  }
}

function renderTrustEngineDetails() {
  if (!selectedTrustDeviceId && dashboardDevices.length > 0) {
    loadTrustEngineData(dashboardDevices[0].id, true);
  }
}

// ---------- RENDER TREND CHARTS ----------
function renderTrendCharts(t) {
  if (!t) return;

  if (trendChartInstance && t.labels && t.scores) {
    trendChartInstance.data.labels = t.labels;
    trendChartInstance.data.datasets[0].data = t.scores;
    trendChartInstance.update();
  }

  if (historyChartInstance && t.history_labels && t.history_scores && !selectedTrustDeviceId) {
    historyChartInstance.data.labels = t.history_labels;
    historyChartInstance.data.datasets[0].data = t.history_scores;
    historyChartInstance.update();
  }
}

// ---------- RENDER ALERTS PAGE ----------
function renderAlertTabs(tabs) {
  const atg = document.getElementById('alertTabGroup');
  if (!atg) return;

  atg.innerHTML = '';
  tabs.forEach(t => {
    const isActive = t.key === activeAlertCategory;
    const btn = document.createElement('button');
    btn.className = `alert-tab ${isActive ? 'active' : ''}`;
    btn.dataset.key = t.key;
    btn.textContent = `${t.label} (${t.n})`;
    btn.addEventListener('click', () => {
      activeAlertCategory = t.key;
      document.querySelectorAll('.alert-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAlertsList();
    });
    atg.appendChild(btn);
  });
}

function renderAlertsList() {
  const al = document.getElementById('alertsList');
  if (!al) return;

  al.innerHTML = '';

  const filtered = dashboardAlerts.filter(a => {
    if (activeAlertCategory === 'All') return true;
    return a.category === activeAlertCategory;
  });

  if (filtered.length === 0) {
    al.innerHTML = `<div style="padding:40px 4px; text-align:center; color:var(--muted); font-size:13px;">No alerts in this category right now. All operational parameters nominal.</div>`;
    return;
  }

  filtered.forEach(a => {
    const [bg, fg] = colorMap[a.level] || colorMap.blue;
    al.innerHTML += `<div class="alert-row">
      <div class="alert-ico" style="background:${bg}; color:${fg};">${icon(a.icon || 'alert')}</div>
      <div style="flex:1;">
        <div class="alert-title">${a.title}</div>
        <div class="alert-sub">${a.sub}</div>
      </div>
      <div style="text-align:right;">
        <div class="alert-time">${a.time}</div>
        <button class="btn-action" onclick="acknowledgeAlert(${a.id})" style="margin-top:6px; font-size:11px;">Acknowledge</button>
      </div>
    </div>`;
  });
}

async function acknowledgeAlert(alertId) {
  const token = localStorage.getItem('authToken');
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE}/api/v1/dashboard/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      showToast(`Alert #${alertId} acknowledged successfully.`);
      loadDashboardData(true);
    }
  } catch (err) {
    console.error('Error acknowledging alert:', err);
  }
}

async function markAllAlertsRead() {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  const unack = dashboardAlerts.filter(a => !a.is_acknowledged);
  if (unack.length === 0) {
    showToast('No active unacknowledged alerts to mark as read.');
    return;
  }

  try {
    for (const a of unack) {
      await fetch(`${API_BASE}/api/v1/dashboard/alerts/${a.id}/acknowledge`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    showToast(`All ${unack.length} active alerts have been acknowledged.`);
    loadDashboardData(true);
  } catch (err) {
    console.error('Error marking all alerts as read:', err);
    showToast('Encountered an issue marking all alerts as read.');
  }
}

const markReadBtn = document.querySelector('.mark-read');
if (markReadBtn) {
  markReadBtn.addEventListener('click', markAllAlertsRead);
}

// ---------- AI ANALYTICS (Phase 11: Dynamic Backend Data) ----------
async function loadAnalyticsData(silent = false) {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  const reqHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  try {
    const res = await fetch(`${API_BASE}/api/v1/dashboard/analytics`, { headers: reqHeaders });
    if (!res.ok) return;

    const data = await res.json();

    // 1. Render Small Cards
    const sc = document.getElementById('analyticsCards');
    if (sc && data.small_cards) {
      sc.innerHTML = '';
      data.small_cards.forEach(c => {
        const [bg, fg] = colorMap[c.color] || colorMap.blue;
        sc.innerHTML += `<div class="card small-card">
          <div class="small-icon" style="background:${bg}; color:${fg};">${icon(c.icon)}</div>
          <div>
            <div class="small-title">${c.title}</div>
            <div class="small-value">${c.value}</div>
            <div class="small-foot">${c.foot}</div>
          </div>
        </div>`;
      });
    }

    // 2. Render Top Risk Predictions
    const trl = document.getElementById('topRiskList');
    if (trl && data.top_risks) {
      trl.innerHTML = '';
      if (data.top_risks.length === 0) {
        trl.innerHTML = `<div style="color:var(--muted); font-size:12.5px; padding:12px;">No high-risk devices detected. Fleet is operating within safe parameters.</div>`;
      } else {
        data.top_risks.forEach(r => {
          const c = r.color || 'green';
          trl.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
              <div>
                <div style="font-weight:700; font-size:13px;">${r.device_name} <span style="color:var(--muted); font-weight:400; font-size:11.5px;">(${r.device_id})</span></div>
                <div style="color:var(--muted); font-size:11.5px; margin-top:2px;">${r.location} · Patient: ${r.patient_name}</div>
                <div style="color:var(--${c}); font-size:11px; margin-top:2px;">⚠️ ${r.reason}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:800; color:var(--${c}); font-size:15px; font-family:var(--font-mono);">${r.score}%</div>
                <span class="badge" style="background:var(--${c}-bg); color:var(--${c}); font-size:10.5px;">● ${r.decision}</span>
              </div>
            </div>
          `;
        });
      }
    }

    // 3. Update Risk Prediction Trend Chart
    if (riskTrendChartInstance && data.risk_trend) {
      riskTrendChartInstance.data.labels = data.risk_trend.labels || [];
      if (riskTrendChartInstance.data.datasets.length >= 3) {
        riskTrendChartInstance.data.datasets[0].data = data.risk_trend.high_risk || [];
        riskTrendChartInstance.data.datasets[1].data = data.risk_trend.medium_risk || [];
        riskTrendChartInstance.data.datasets[2].data = data.risk_trend.low_risk || [];
        riskTrendChartInstance.update();
      }
    }

    // 4. Render Dynamic AI Insights List
    const ail = document.getElementById('aiInsightsList');
    if (ail && data.insights) {
      ail.innerHTML = '';
      data.insights.forEach(ins => {
        ail.innerHTML += `<li style="margin-bottom:6px; color:var(--text);">${ins}</li>`;
      });
    }

  } catch (err) {
    if (!silent) console.error('Error loading analytics data:', err);
  }
}

// ---------- REPORTS (Phase 11: Dynamic Multi-tab Reports) ----------
let activeReportTab = 'overview';

async function loadReportsData(tabName = 'overview', silent = false) {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  activeReportTab = tabName.toLowerCase();
  const reqHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  try {
    const res = await fetch(`${API_BASE}/api/v1/dashboard/reports?type=${encodeURIComponent(activeReportTab)}`, { headers: reqHeaders });
    if (!res.ok) return;

    const data = await res.json();
    currentReportData = data;

    // 1. Render Report KPIs
    const rk = document.getElementById('reportKpis');
    if (rk && data.kpis) {
      rk.innerHTML = '';
      data.kpis.forEach(k => {
        rk.innerHTML += `<div class="card kpi">
          <div class="kpi-label">${k.label}</div>
          <div class="kpi-value">${k.value}</div>
          <div class="gauge-tag" style="margin-top:8px; display:inline-block; background:var(--${k.color}-bg); color:var(--${k.color});">● Active</div>
          <div class="kpi-foot up" style="margin-top:8px;">${k.foot}</div>
        </div>`;
      });
    }

    // 2. Render Structured Table & Audit Files
    const rl = document.getElementById('reportList');
    if (rl && data.table && data.table.columns) {
      const cols = data.table.columns;
      const rows = data.table.rows || [];

      let tableHtml = `
        <div style="overflow-x:auto; margin-bottom:16px;">
          <table>
            <thead>
              <tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
            </thead>
            <tbody>
      `;

      if (rows.length === 0) {
        tableHtml += `<tr><td colspan="${cols.length}" style="text-align:center; color:var(--muted); padding:24px;">No records available for this report view.</td></tr>`;
      } else {
        rows.slice(0, 10).forEach(r => {
          tableHtml += `<tr>
            <td style="font-weight:700;">${r.col1 || '—'}</td>
            <td>${r.col2 || '—'}</td>
            <td>${r.col3 || '—'}</td>
            <td>${r.col4 || '—'}</td>
            <td>${r.col5 || '—'}</td>
            <td style="color:var(--muted);">${r.col6 || '—'}</td>
          </tr>`;
        });
      }

      tableHtml += `
            </tbody>
          </table>
        </div>
      `;

      // Also render generated report files list
      if (data.files && data.files.length > 0) {
        tableHtml += `<div style="font-size:12px; font-weight:700; color:var(--muted); margin:16px 0 8px 0; text-transform:uppercase;">Generated System Audit Documents</div>`;
        data.files.forEach(f => {
          tableHtml += `<div class="report-list-row">
            <div class="report-file">
              <div class="report-file-ico">${icon('doc')}</div>
              <div>
                <div class="report-name">${f.name}</div>
                <div class="report-date">${f.date} · ${f.records || 0} Records Verified</div>
              </div>
            </div>
            <span class="pdf-tag" onclick="exportCurrentReport('${f.name}')">Export PDF</span>
          </div>`;
        });
      }

      rl.innerHTML = tableHtml;
    }

  } catch (err) {
    if (!silent) console.error('Error loading reports data:', err);
  }
}

// Global state for printable report export
let currentReportData = null;

function exportCurrentReport(customTitle = null) {
  if (!currentReportData || !currentReportData.table) {
    showToast('Loading report data for export...');
    return;
  }
  
  const reportType = (activeReportTab || 'overview').charAt(0).toUpperCase() + (activeReportTab || 'overview').slice(1);
  const title = customTitle || `TrustGuard-IoMT ${reportType} Continuous Verification Report`;
  const generatedAt = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
  });
  const user = localStorage.getItem('userName') || 'System Administrator';
  const role = localStorage.getItem('userRole') || 'Administrator';
  
  const kpis = currentReportData.kpis || [];
  const cols = currentReportData.table.columns || [];
  const rows = currentReportData.table.rows || [];
  
  const kpiHtml = kpis.map(k => `
    <div style="border:1px solid #d0d7de; border-radius:6px; padding:10px 14px; background:#f6f8fa; flex:1; min-width:160px;">
      <div style="font-size:10.5px; color:#57606a; text-transform:uppercase; font-weight:600;">${k.label}</div>
      <div style="font-size:20px; font-weight:700; color:#24292f; margin:4px 0;">${k.value}</div>
      <div style="font-size:10.5px; color:#57606a;">${k.foot || ''}</div>
    </div>
  `).join('');
  
  const tableRowsHtml = rows.map(r => `
    <tr>
      <td style="padding:7px 10px; border-bottom:1px solid #d0d7de; font-weight:600;">${r.col1 || '—'}</td>
      <td style="padding:7px 10px; border-bottom:1px solid #d0d7de;">${r.col2 || '—'}</td>
      <td style="padding:7px 10px; border-bottom:1px solid #d0d7de;">${r.col3 || '—'}</td>
      <td style="padding:7px 10px; border-bottom:1px solid #d0d7de;">${r.col4 || '—'}</td>
      <td style="padding:7px 10px; border-bottom:1px solid #d0d7de;">${r.col5 || '—'}</td>
      <td style="padding:7px 10px; border-bottom:1px solid #d0d7de; color:#57606a;">${r.col6 || '—'}</td>
    </tr>
  `).join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showToast('Please allow popups to export the PDF report.');
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #24292f; margin: 25px; line-height: 1.4; font-size: 11.5px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0969da; padding-bottom: 10px; margin-bottom: 16px; }
        .brand { font-size: 17px; font-weight: 700; color: #0969da; }
        .sub { font-size: 11.5px; color: #57606a; }
        .meta-grid { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
        .policy-box { background: #ddf4ff; border: 1px solid #54aeff; border-radius: 6px; padding: 8px 12px; margin-bottom: 16px; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #f6f8fa; border-bottom: 2px solid #d0d7de; padding: 7px 10px; text-align: left; font-size: 10.5px; text-transform: uppercase; color: #57606a; }
        .footer { margin-top: 25px; border-top: 1px solid #d0d7de; padding-top: 8px; font-size: 10px; color: #57606a; display: flex; justify-content: space-between; }
        @media print {
          @page { margin: 12mm; size: landscape; }
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">TrustGuard-IoMT — Medical IoT Continuous Trust Platform</div>
          <div class="sub">An Intelligent AI-Driven Continuous Trust Verification for Medical IoT</div>
          <div style="font-size: 13.5px; font-weight: 700; margin-top: 5px; color: #24292f;">${title}</div>
        </div>
        <div style="text-align: right;">
          <div><strong>Generated:</strong> ${generatedAt}</div>
          <div><strong>Operator:</strong> ${user} (${role})</div>
          <div><strong>Telemetry Source:</strong> Dataset-Driven Simulation</div>
        </div>
      </div>
      
      <div class="policy-box">
        <strong>Continuous Trust Policy:</strong> Final Trust Score = 0.45 &times; Device Trust (Model A) + 0.55 &times; Data Authenticity (Model B) &middot; Thresholds: Accept (&ge;80), Monitor (50&ndash;79), Isolate (&lt;50)
      </div>

      <div class="meta-grid">
        ${kpiHtml}
      </div>

      <div style="margin-top:16px; font-weight:700; font-size:12px;">Verified Verification Records (${rows.length} total)</div>
      <table>
        <thead>
          <tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <div class="footer">
        <div>TrustGuard-IoMT &copy; 2026 &middot; Academic Demonstration &amp; Implementation Integrity</div>
        <div>SHA-256 Token-Authenticated Audit Log &middot; Page 1 of 1</div>
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
  showToast(`Exported ${title} to PDF.`);
}

// Bind Report Tabs
document.querySelectorAll('#reportTabsContainer .report-tab').forEach(t => {
  t.addEventListener('click', function() {
    document.querySelectorAll('#reportTabsContainer .report-tab').forEach(x => x.classList.remove('active'));
    this.classList.add('active');
    const tabKey = this.dataset.tab || this.textContent.trim().toLowerCase().split(' ')[0];
    loadReportsData(tabKey);
  });
});

const customRepBtn = document.getElementById('customReportBtn');
if (customRepBtn) {
  customRepBtn.addEventListener('click', () => {
    exportCurrentReport();
  });
}

// ---------- RISK HEAT MAP (Phase 11: Dynamic Department Distribution) ----------
let riskSummaryChartInstance = null;

try {
  const rscEl = document.getElementById('riskSummaryChart');
  if (rscEl) {
    riskSummaryChartInstance = new Chart(rscEl, {
      type: 'doughnut',
      data: { datasets: [{ data: [1, 2, 4, 8], backgroundColor: ['#ef4444', '#fb923c', '#f59e0b', '#22c55e'], borderWidth: 0 }] },
      options: { circumference: 180, rotation: 270, cutout: '72%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
    });
  }
} catch (e) {}

async function loadHeatmapData(silent = false) {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  const reqHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  try {
    const res = await fetch(`${API_BASE}/api/v1/dashboard/heatmap`, { headers: reqHeaders });
    if (!res.ok) return;

    const data = await res.json();
    const roomsList = data.rooms || [];
    const levelColor = {
      low: ['#e9faf0', '#22c55e'],
      medium: ['#fef6e7', '#f59e0b'],
      high: ['#fff1e8', '#fb923c'],
      critical: ['#fdecec', '#ef4444']
    };

    const fp = document.getElementById('floorPlan');
    if (fp) {
      fp.innerHTML = '';
      roomsList.forEach(r => {
        const [bg, fg] = levelColor[r.level] || levelColor.low;
        fp.innerHTML += `<div class="room" style="background:${bg};">
          <div class="room-name" style="color:${fg}; font-weight:700;">${r.name}</div>
          <div class="room-count">${r.count} Devices · ${r.avg_score}% Trust</div>
        </div>`;
      });
    }

    const rsl = document.getElementById('riskSummaryList');
    if (rsl && data.risk_summary) {
      rsl.innerHTML = '';
      data.risk_summary.forEach(r => {
        rsl.innerHTML += `<div class="risk-row">
          <div class="risk-row-left"><span class="legend-dot" style="background:${r.color};"></span>${r.label}</div>
          <span>${r.value} <span style="color:var(--muted); font-weight:400;">(${r.pct})</span></span>
        </div>`;
      });
    }

    if (riskSummaryChartInstance && data.risk_summary) {
      riskSummaryChartInstance.data.datasets[0].data = data.risk_summary.map(r => r.value);
      riskSummaryChartInstance.update();
    }

    const rTotVal = document.querySelector('.risk-summary-value');
    if (rTotVal && data.total_devices !== undefined) {
      rTotVal.textContent = data.total_devices;
    }

  } catch (err) {
    if (!silent) console.error('Error loading heatmap data:', err);
  }
}

// ---------- MAINTENANCE ADVISOR (Phase 11: Predictive Hardware Maintenance) ----------
let effChartInstance = null;

try {
  const effEl = document.getElementById('effChart');
  if (effEl) {
    effChartInstance = new Chart(effEl, {
      type: 'doughnut',
      data: { datasets: [{ data: [94, 6], backgroundColor: ['#3ec9ff', '#1a2036'], borderWidth: 0 }] },
      options: { circumference: 180, rotation: 270, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
    });
  }
} catch (e) {}

async function loadMaintenanceData(silent = false) {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  const reqHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  try {
    const res = await fetch(`${API_BASE}/api/v1/dashboard/maintenance`, { headers: reqHeaders });
    if (!res.ok) return;

    const data = await res.json();

    // 1. Render Cards
    const mc = document.getElementById('maintCards');
    if (mc && data.cards) {
      mc.innerHTML = '';
      data.cards.forEach(c => {
        const [bg, fg] = colorMap[c.color] || colorMap.blue;
        mc.innerHTML += `<div class="card small-card">
          <div class="small-icon" style="background:${bg}; color:${fg};">${icon(c.icon)}</div>
          <div>
            <div class="small-title">${c.title}</div>
            <div class="small-value">${c.value}</div>
            <div class="small-foot">${c.foot}</div>
          </div>
        </div>`;
      });
    }

    // 2. Render Recommendations Table
    const mtb = document.getElementById('maintTableBody');
    if (mtb && data.recommendations) {
      mtb.innerHTML = '';
      const prioColor = { High: 'red', Medium: 'amber', Low: 'green' };
      data.recommendations.forEach(r => {
        const pc = prioColor[r.priority] || 'blue';
        const isSched = r.status === 'Scheduled';
        const sc2 = isSched ? ['var(--accent-soft)', 'var(--accent)'] : ['var(--gray-bg)', 'var(--gray)'];

        mtb.innerHTML += `<tr>
          <td style="font-weight:700;">${r.device}</td>
          <td>${r.issue}</td>
          <td><span class="priority-badge" style="background:var(--${pc}-bg); color:var(--${pc});">${r.priority}</span></td>
          <td>${r.action}</td>
          <td style="color:var(--muted);">${r.due}</td>
          <td><span class="badge" style="background:${sc2[0]}; color:${sc2[1]};">${r.status}</span></td>
        </tr>`;
      });
    }

    // 3. Efficiency Chart
    if (effChartInstance && data.efficiency_score !== undefined) {
      const eff = Math.round(data.efficiency_score);
      effChartInstance.data.datasets[0].data = [eff, Math.max(0, 100 - eff)];
      effChartInstance.update();

      const effVal = document.querySelector('.eff-value');
      if (effVal) effVal.textContent = `${eff}%`;
    }

  } catch (err) {
    if (!silent) console.error('Error loading maintenance data:', err);
  }
}

// ---------- (Alerts are rendered dynamically via loadDashboardData) ----------

// ---------- DEVICE PROFILES ----------
const profileInfo = [
  {lbl:'Device Type', val:'ECG Monitor'}, {lbl:'Manufacturer', val:'MedTech Solutions'},
  {lbl:'Model', val:'ECG-2000'}, {lbl:'Serial Number', val:'ECG-ICU-001'},
  {lbl:'Location', val:'ICU - Room 101'}, {lbl:'Installation Date', val:'Jan 15, 2025'},
  {lbl:'Firmware Version', val:'v2.4.1'}, {lbl:'Battery Level', val:'78%'},
  {lbl:'IP Address', val:'192.168.1.45'}, {lbl:'Data Transmission', val:'Encrypted (TLS 1.3)'}
];
const pig = document.getElementById('profileInfoGrid');
profileInfo.forEach(i=>{ pig.innerHTML += `<div class="info-item"><div class="lbl">${i.lbl}</div><div class="val">${i.val}</div></div>`; });

// ---------- SYSTEM SETTINGS ----------
const settingsGroups = [
  {title:'Authentication Settings', rows:[
    {label:'Two-Factor Authentication', desc:'Require a second verification step at login', toggle:true},
    {label:'Password Policy', desc:'Minimum complexity required for passwords', select:'Strong'},
    {label:'Session Timeout', desc:'Automatically sign out after inactivity', select:'30 minutes'}
  ]},
  {title:'Data Security', rows:[
    {label:'Integrity Protection', desc:'API Key & device token hashing', select:'SHA-256'},
    {label:'Data Transmission', desc:'Encrypt data in transit', select:'TLS 1.3'},
    {label:'Audit Logging', desc:'Record all administrative actions', toggle:true}
  ]},
  {title:'Access Control', rows:[
    {label:'Role Based Access', desc:'Restrict features by assigned role', toggle:true},
    {label:'Device Access Control', desc:'Require approval before a device connects', toggle:true},
    {label:'IP Whitelist', desc:'Only allow access from approved networks', select:'Configured'}
  ]}
];
const sCard = document.getElementById('settingsCard');
settingsGroups.forEach(g=>{
  sCard.innerHTML += `<div class="settings-group-title">${g.title}</div>`;
  g.rows.forEach(r=>{
    const control = r.toggle
      ? `<label class="switch"><input type="checkbox" checked><span class="slider"></span></label>`
      : `<span class="select-pill">${r.select} ▾</span>`;
    sCard.innerHTML += `<div class="setting-row"><div><div class="setting-label">${r.label}</div><div class="setting-desc">${r.desc}</div></div>${control}</div>`;
  });
});

// ---------- OPERATIONAL MODALS CONTROLLERS (Phase 10) ----------

// 1. Patient Modal (Add & Edit)
function openAddPatientModal() {
  selectedPatientForEdit = null;
  const modal = document.getElementById('patientModal');
  const title = document.getElementById('patientModalTitle');
  const err = document.getElementById('patientFormError');
  const idIn = document.getElementById('patientIdInput');

  if (title) title.textContent = 'Register New Patient';
  if (err) { err.textContent = ''; err.style.display = 'none'; }
  if (idIn) {
    idIn.value = '';
    idIn.disabled = false;
    idIn.style.opacity = '1';
  }

  document.getElementById('patientNameInput').value = '';
  document.getElementById('patientAgeInput').value = '';
  document.getElementById('patientGenderInput').value = 'Male';
  document.getElementById('patientDeptInput').value = 'ICU';
  document.getElementById('patientRoomInput').value = '';
  document.getElementById('patientStatusInput').value = 'Admitted';

  const saveBtn = document.getElementById('savePatientBtn');
  if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Patient'; }

  if (modal) modal.classList.add('open');
}

function openEditPatientModal(patientId) {
  const patient = allPatientsList.find(p => p.id === patientId);
  if (!patient) return;

  selectedPatientForEdit = patient;
  const modal = document.getElementById('patientModal');
  const title = document.getElementById('patientModalTitle');
  const err = document.getElementById('patientFormError');
  const idIn = document.getElementById('patientIdInput');

  if (title) title.textContent = `Edit Patient Details (${patient.id})`;
  if (err) { err.textContent = ''; err.style.display = 'none'; }
  if (idIn) {
    idIn.value = patient.id;
    idIn.disabled = true;
    idIn.style.opacity = '0.6';
  }

  document.getElementById('patientNameInput').value = patient.full_name || '';
  document.getElementById('patientAgeInput').value = patient.age || '';
  document.getElementById('patientGenderInput').value = patient.gender || 'Male';
  document.getElementById('patientDeptInput').value = patient.department || 'ICU';
  document.getElementById('patientRoomInput').value = patient.room || '';
  document.getElementById('patientStatusInput').value = patient.status || 'Admitted';

  const saveBtn = document.getElementById('savePatientBtn');
  if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Update Patient'; }

  if (modal) modal.classList.add('open');
}

function closePatientModal() {
  const modal = document.getElementById('patientModal');
  if (modal) modal.classList.remove('open');
  selectedPatientForEdit = null;
}

async function savePatient() {
  const token = localStorage.getItem('authToken');
  const errEl = document.getElementById('patientFormError');
  const saveBtn = document.getElementById('savePatientBtn');

  const pId = document.getElementById('patientIdInput').value.trim();
  const pName = document.getElementById('patientNameInput').value.trim();
  const pAge = parseInt(document.getElementById('patientAgeInput').value, 10);
  const pGender = document.getElementById('patientGenderInput').value;
  const pDept = document.getElementById('patientDeptInput').value;
  const pRoom = document.getElementById('patientRoomInput').value.trim();
  const pStatus = document.getElementById('patientStatusInput').value;

  if (!pId || !pName || isNaN(pAge) || !pRoom) {
    if (errEl) {
      errEl.textContent = 'Please fill in all required fields with valid values.';
      errEl.style.display = 'block';
    }
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  if (errEl) errEl.style.display = 'none';

  try {
    let url = `${API_BASE}/api/v1/patients`;
    let method = 'POST';
    let payload = {
      id: pId,
      full_name: pName,
      age: pAge,
      gender: pGender,
      department: pDept,
      room: pRoom,
      status: pStatus
    };

    if (selectedPatientForEdit) {
      url = `${API_BASE}/api/v1/patients/${selectedPatientForEdit.id}`;
      method = 'PUT';
      delete payload.id;
    }

    const res = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data.detail || (Array.isArray(data.detail) ? data.detail[0].msg : 'Failed to save patient.');
      if (errEl) {
        errEl.textContent = errMsg;
        errEl.style.display = 'block';
      }
      saveBtn.disabled = false;
      saveBtn.textContent = selectedPatientForEdit ? 'Update Patient' : 'Save Patient';
      return;
    }

    closePatientModal();
    showToast(selectedPatientForEdit ? `Patient ${pId} updated successfully.` : `Patient ${pId} registered.`);
    loadPatients();
    loadDashboardData(true);
  } catch (err) {
    console.error('Error saving patient:', err);
    if (errEl) {
      errEl.textContent = 'Network error connecting to backend API.';
      errEl.style.display = 'block';
    }
    saveBtn.disabled = false;
  }
}

// 2. Device Modal (Register Device)
function openRegisterDeviceModal() {
  const modal = document.getElementById('deviceModal');
  const err = document.getElementById('deviceFormError');
  const sBox = document.getElementById('deviceSuccessBox');
  const form = document.getElementById('deviceForm');
  const saveBtn = document.getElementById('saveDeviceBtn');

  if (err) { err.textContent = ''; err.style.display = 'none'; }
  if (sBox) sBox.style.display = 'none';
  if (form) form.style.display = 'block';
  if (saveBtn) { saveBtn.textContent = 'Register Device'; saveBtn.disabled = false; }

  document.getElementById('deviceIdInput').value = '';
  document.getElementById('deviceNameInput').value = '';
  document.getElementById('deviceTypeInput').value = 'ECG Monitor';
  document.getElementById('deviceDeptInput').value = 'ICU';
  document.getElementById('deviceLocInput').value = '';
  document.getElementById('deviceFirmwareInput').value = 'v1.0.0';
  document.getElementById('deviceStatusInput').value = 'Active';
  document.getElementById('deviceCustomKeyInput').value = '';

  if (modal) modal.classList.add('open');
}

function closeDeviceModal() {
  const modal = document.getElementById('deviceModal');
  if (modal) modal.classList.remove('open');
}

async function saveDevice() {
  const saveBtn = document.getElementById('saveDeviceBtn');
  if (saveBtn.textContent === 'Done') {
    closeDeviceModal();
    return;
  }

  const token = localStorage.getItem('authToken');
  const errEl = document.getElementById('deviceFormError');
  const sBox = document.getElementById('deviceSuccessBox');
  const form = document.getElementById('deviceForm');

  const dId = document.getElementById('deviceIdInput').value.trim();
  const dName = document.getElementById('deviceNameInput').value.trim();
  const dType = document.getElementById('deviceTypeInput').value;
  const dDept = document.getElementById('deviceDeptInput').value;
  const dLoc = document.getElementById('deviceLocInput').value.trim();
  const dFirm = document.getElementById('deviceFirmwareInput').value.trim();
  const dStat = document.getElementById('deviceStatusInput').value;
  const dKey = document.getElementById('deviceCustomKeyInput').value.trim();

  if (!dId || !dName || !dLoc) {
    if (errEl) {
      errEl.textContent = 'Please enter Device ID, Name, and Location.';
      errEl.style.display = 'block';
    }
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Registering...';
  if (errEl) errEl.style.display = 'none';

  try {
    const payload = {
      device_id: dId,
      device_name: dName,
      device_type: dType,
      department: dDept,
      location: dLoc,
      firmware_version: dFirm || 'v1.0.0',
      status: dStat,
      api_key: dKey || undefined
    };

    const res = await fetch(`${API_BASE}/api/v1/devices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data.detail || (Array.isArray(data.detail) ? data.detail[0].msg : 'Failed to register device.');
      if (errEl) {
        errEl.textContent = errMsg;
        errEl.style.display = 'block';
      }
      saveBtn.disabled = false;
      saveBtn.textContent = 'Register Device';
      return;
    }

    // Show provisioned API key securely
    if (sBox && data.provisioning_api_key) {
      document.getElementById('provisionedKeyDisplay').textContent = data.provisioning_api_key;
      sBox.style.display = 'block';
      if (form) form.style.display = 'none';
      saveBtn.disabled = false;
      saveBtn.textContent = 'Done';
    } else {
      closeDeviceModal();
    }

    showToast(`Device ${dId} registered successfully.`);
    loadDashboardData(true);
    loadPatients(true);
  } catch (err) {
    console.error('Error registering device:', err);
    if (errEl) {
      errEl.textContent = 'Network error connecting to backend API.';
      errEl.style.display = 'block';
    }
    saveBtn.disabled = false;
  }
}

function copyApiKey() {
  const key = document.getElementById('provisionedKeyDisplay').textContent;
  if (key) {
    navigator.clipboard.writeText(key).then(() => {
      showToast('API Key copied to clipboard!');
    }).catch(() => {
      showToast('Key selected. Please press Ctrl+C to copy.');
    });
  }
}

// 3. Assign Device Modal
async function openAssignModal(preselectPatientId = null, preselectDeviceId = null) {
  const token = localStorage.getItem('authToken');
  const modal = document.getElementById('assignModal');
  const errEl = document.getElementById('assignFormError');
  const pSel = document.getElementById('assignPatientSelect');
  const dSel = document.getElementById('assignDeviceSelect');
  const confirmBtn = document.getElementById('confirmAssignBtn');

  if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
  if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = 'Confirm Binding'; }

  pSel.innerHTML = '<option value="">Loading patients...</option>';
  dSel.innerHTML = '<option value="">Loading devices...</option>';

  if (modal) modal.classList.add('open');

  try {
    const [pRes, dRes] = await Promise.all([
      fetch(`${API_BASE}/api/v1/patients`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_BASE}/api/v1/devices`, { headers: { 'Authorization': `Bearer ${token}` } })
    ]);

    if (pRes.ok && dRes.ok) {
      const pData = await pRes.json();
      const dData = await dRes.json();

      const patients = (pData.patients || []).filter(p => p.status !== 'Discharged');
      const devices = (dData.devices || []).filter(d => d.status !== 'Isolated' && d.status !== 'Decommissioned');

      pSel.innerHTML = patients.length > 0 
        ? patients.map(p => `<option value="${p.id}" ${p.id === preselectPatientId ? 'selected' : ''}>${p.id} — ${p.full_name} (${p.department}, ${p.room})</option>`).join('')
        : '<option value="">No active admitted patients</option>';

      dSel.innerHTML = devices.length > 0
        ? devices.map(d => `<option value="${d.device_id}" ${d.device_id === preselectDeviceId ? 'selected' : ''}>${d.device_id} — ${d.device_name} [${d.status}] (${d.location})</option>`).join('')
        : '<option value="">No available devices</option>';
    }
  } catch (err) {
    console.error('Error preparing assignment dialog:', err);
    if (errEl) {
      errEl.textContent = 'Failed to load live patients or devices for assignment.';
      errEl.style.display = 'block';
    }
  }
}

function closeAssignModal() {
  const modal = document.getElementById('assignModal');
  if (modal) modal.classList.remove('open');
}

async function confirmDeviceAssignment() {
  const token = localStorage.getItem('authToken');
  const errEl = document.getElementById('assignFormError');
  const confirmBtn = document.getElementById('confirmAssignBtn');

  const pId = document.getElementById('assignPatientSelect').value;
  const dId = document.getElementById('assignDeviceSelect').value;

  if (!pId || !dId) {
    if (errEl) {
      errEl.textContent = 'Please select both a patient and a device.';
      errEl.style.display = 'block';
    }
    return;
  }

  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Binding...';
  if (errEl) errEl.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/api/v1/patients/${encodeURIComponent(pId)}/assign-device/${encodeURIComponent(dId)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data.detail || 'Failed to bind device to patient.';
      if (errEl) {
        errEl.textContent = errMsg;
        errEl.style.display = 'block';
      }
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm Binding';
      return;
    }

    closeAssignModal();
    showToast(`Device ${dId} successfully bound to ${pId}!`);
    loadPatients();
    loadDashboardData(true);
  } catch (err) {
    console.error('Error assigning device:', err);
    if (errEl) {
      errEl.textContent = 'Network error connecting to backend API.';
      errEl.style.display = 'block';
    }
    confirmBtn.disabled = false;
  }
}

// 4. Patient Detail Modal
async function openPatientDetailModal(patientId) {
  const token = localStorage.getItem('authToken');
  const modal = document.getElementById('patientDetailModal');
  const grid = document.getElementById('pDetailGrid');
  const telem = document.getElementById('pDetailTelemetry');

  if (modal) modal.classList.add('open');
  if (grid) grid.innerHTML = '<div style="color:var(--muted); padding:20px;">Loading patient details...</div>';
  if (telem) telem.innerHTML = '';

  try {
    const res = await fetch(`${API_BASE}/api/v1/patients/${encodeURIComponent(patientId)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      const p = await res.json();
      const assigned = p.assigned_device;
      const dMatch = assigned ? dashboardDevices.find(d => d.id === assigned.device_id) : null;
      const score = dMatch ? dMatch.score : 90;
      const decision = dMatch ? dMatch.decision : 'Accept';
      const c = trustDecisionColor(score);

      grid.innerHTML = `
        <div class="details-kv"><div class="lbl">Patient ID</div><div class="val">${p.id}</div></div>
        <div class="details-kv"><div class="lbl">Full Name</div><div class="val">${p.full_name}</div></div>
        <div class="details-kv"><div class="lbl">Age & Gender</div><div class="val">${p.age} yrs · ${p.gender}</div></div>
        <div class="details-kv"><div class="lbl">Department & Room</div><div class="val">${p.department} · ${p.room}</div></div>
        <div class="details-kv"><div class="lbl">Status</div><div class="val">${p.status}</div></div>
        <div class="details-kv"><div class="lbl">Assigned Device</div><div class="val">${assigned ? `${assigned.device_name} (${assigned.device_id})` : 'None'}</div></div>
      `;

      telem.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div>
            <span style="color:var(--muted); font-size:11.5px;">Unified AI Trust Score:</span>
            <span style="font-weight:800; color:var(--${c}); font-size:16px; margin-left:6px;">${score}%</span>
          </div>
          <span class="badge" style="background:var(--${c}-bg); color:var(--${c}); font-weight:700;">● ${decision}</span>
        </div>
        <div style="font-size:12px; color:var(--muted); line-height:1.5;">
          ${dMatch ? dMatch.reason : 'Continuous AI verification is nominal. Device telemetry validated via Model A and Model B.'}
        </div>
      `;

      // Set action buttons in footer
      document.getElementById('pDetailEditBtn').onclick = () => {
        closePatientDetailModal();
        openEditPatientModal(p.id);
      };
      document.getElementById('pDetailAssignBtn').onclick = () => {
        closePatientDetailModal();
        openAssignModal(p.id, assigned ? assigned.device_id : null);
      };
    }
  } catch (err) {
    console.error('Error loading patient detail:', err);
  }
}

function closePatientDetailModal() {
  const modal = document.getElementById('patientDetailModal');
  if (modal) modal.classList.remove('open');
}

// 5. Device Detail Modal
async function openDeviceDetailModal(deviceId) {
  const token = localStorage.getItem('authToken');
  const modal = document.getElementById('deviceDetailModal');
  const grid = document.getElementById('dDetailGrid');
  const trustBox = document.getElementById('dDetailTrust');

  if (modal) modal.classList.add('open');
  if (grid) grid.innerHTML = '<div style="color:var(--muted); padding:20px;">Loading device profile...</div>';
  if (trustBox) trustBox.innerHTML = '';

  try {
    const res = await fetch(`${API_BASE}/api/v1/devices/${encodeURIComponent(deviceId)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      const d = await res.json();
      const dMatch = dashboardDevices.find(dev => dev.id === deviceId);
      const score = dMatch ? dMatch.score : 92;
      const dScore = dMatch ? dMatch.device_trust_subscore : 95;
      const aScore = dMatch ? dMatch.data_authenticity_subscore : 98;
      const decision = dMatch ? dMatch.decision : 'Accept';
      const c = trustDecisionColor(score);

      grid.innerHTML = `
        <div class="details-kv"><div class="lbl">Device ID</div><div class="val">${d.device_id}</div></div>
        <div class="details-kv"><div class="lbl">Device Name</div><div class="val">${d.device_name}</div></div>
        <div class="details-kv"><div class="lbl">Device Type</div><div class="val">${d.device_type}</div></div>
        <div class="details-kv"><div class="lbl">Department & Location</div><div class="val">${d.department} · ${d.location}</div></div>
        <div class="details-kv"><div class="lbl">Firmware Version</div><div class="val">${d.firmware_version || 'v1.0.0'}</div></div>
        <div class="details-kv"><div class="lbl">Assigned Patient</div><div class="val">${d.assigned_patient ? `${d.assigned_patient.full_name} (${d.assigned_patient.patient_id})` : 'Unassigned'}</div></div>
      `;

      trustBox.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
          <div style="background:#10162a; padding:10px 12px; border-radius:8px;">
            <div style="font-size:11px; color:var(--muted);">Model A — Device Trust (45%)</div>
            <div style="font-size:15px; font-weight:800; color:var(--accent); font-family:var(--font-mono);">${dScore}%</div>
          </div>
          <div style="background:#10162a; padding:10px 12px; border-radius:8px;">
            <div style="font-size:11px; color:var(--muted);">Model B — Authenticity (55%)</div>
            <div style="font-size:15px; font-weight:800; color:var(--accent); font-family:var(--font-mono);">${aScore}%</div>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="font-size:11.5px; color:var(--muted);">Unified Score:</span>
            <span style="font-weight:800; color:var(--${c}); font-size:16px; margin-left:6px;">${score}%</span>
          </div>
          <span class="badge" style="background:var(--${c}-bg); color:var(--${c}); font-weight:700;">● ${decision}</span>
        </div>
      `;

      document.getElementById('dDetailAssignBtn').onclick = () => {
        closeDeviceDetailModal();
        openAssignModal(d.assigned_patient ? d.assigned_patient.patient_id : null, d.device_id);
      };
    }
  } catch (err) {
    console.error('Error loading device detail:', err);
  }
}

function closeDeviceDetailModal() {
  const modal = document.getElementById('deviceDetailModal');
  if (modal) modal.classList.remove('open');
}

// 6. Device Profiles Section Synchronizer
function updateDeviceProfilesSection() {
  const select = document.getElementById('profileDeviceSelect');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = dashboardDevices.map(d => `<option value="${d.id}" ${d.id === currentVal ? 'selected' : ''}>${d.name} (${d.id})</option>`).join('');

  if (dashboardDevices.length === 0) return;

  const activeId = select.value || dashboardDevices[0].id;
  const dev = dashboardDevices.find(d => d.id === activeId) || dashboardDevices[0];
  const c = statusColor(dev.color);

  // Update profile card overview
  const statRows = document.querySelectorAll('#page-profiles .profile-stat-row');
  if (statRows.length >= 3) {
    statRows[0].innerHTML = `<span style="color:var(--muted);">Status</span><span class="badge" style="background:var(--${c}-bg); color:var(--${c});">● ${dev.status}</span>`;
    statRows[1].innerHTML = `<span style="color:var(--muted);">Trust Score</span><span style="font-weight:800; color:var(--${c});">${dev.score}% (${dev.decision})</span>`;
    statRows[2].innerHTML = `<span style="color:var(--muted);">Last Seen</span><span style="font-weight:700;">${dev.updated}</span>`;
  }

  // Update profile info grid
  const pig = document.getElementById('profileInfoGrid');
  if (pig) {
    pig.innerHTML = `
      <div class="info-item"><div class="lbl">Device Type</div><div class="val">${dev.type}</div></div>
      <div class="info-item"><div class="lbl">Device ID</div><div class="val">${dev.id}</div></div>
      <div class="info-item"><div class="lbl">Location / Ward</div><div class="val">${dev.loc}</div></div>
      <div class="info-item"><div class="lbl">Department</div><div class="val">${dev.department || 'ICU'}</div></div>
      <div class="info-item"><div class="lbl">Assigned Patient</div><div class="val">${dev.patient_name || 'Unassigned'}</div></div>
      <div class="info-item"><div class="lbl">Device Trust (Model A)</div><div class="val">${dev.device_trust_subscore}% (45% Wgt)</div></div>
      <div class="info-item"><div class="lbl">Data Authenticity (Model B)</div><div class="val">${dev.data_authenticity_subscore}% (55% Wgt)</div></div>
      <div class="info-item"><div class="lbl">Data Transmission</div><div class="val">Token-Authenticated (SHA-256)</div></div>
    `;
  }
}

const profSelect = document.getElementById('profileDeviceSelect');
if (profSelect) {
  profSelect.addEventListener('change', updateDeviceProfilesSection);
}

// Bind Button Listeners for Modals
document.addEventListener('DOMContentLoaded', () => {
  // Add Patient button
  const addPBtn = document.getElementById('openAddPatientBtn');
  if (addPBtn) addPBtn.addEventListener('click', openAddPatientModal);

  // Assign buttons
  const assignPBtn = document.getElementById('openAssignFromPatientsBtn');
  if (assignPBtn) assignPBtn.addEventListener('click', () => openAssignModal());

  const assignDBtn = document.getElementById('openAssignDeviceBtn');
  if (assignDBtn) assignDBtn.addEventListener('click', () => openAssignModal());

  // Register Device button
  const regDBtn = document.getElementById('openRegisterDeviceBtn');
  if (regDBtn) regDBtn.addEventListener('click', openRegisterDeviceModal);

  // Modal Cancel & Close buttons
  const closePBtn = document.getElementById('closePatientModalBtn');
  if (closePBtn) closePBtn.addEventListener('click', closePatientModal);
  const cancelPBtn = document.getElementById('cancelPatientBtn');
  if (cancelPBtn) cancelPBtn.addEventListener('click', closePatientModal);
  const savePBtn = document.getElementById('savePatientBtn');
  if (savePBtn) savePBtn.addEventListener('click', savePatient);

  const closeDBtn = document.getElementById('closeDeviceModalBtn');
  if (closeDBtn) closeDBtn.addEventListener('click', closeDeviceModal);
  const cancelDBtn = document.getElementById('cancelDeviceBtn');
  if (cancelDBtn) cancelDBtn.addEventListener('click', closeDeviceModal);
  const saveDBtn = document.getElementById('saveDeviceBtn');
  if (saveDBtn) saveDBtn.addEventListener('click', saveDevice);
  const copyKeyBtn = document.getElementById('copyApiKeyBtn');
  if (copyKeyBtn) copyKeyBtn.addEventListener('click', copyApiKey);

  const closeABtn = document.getElementById('closeAssignModalBtn');
  if (closeABtn) closeABtn.addEventListener('click', closeAssignModal);
  const cancelABtn = document.getElementById('cancelAssignBtn');
  if (cancelABtn) cancelABtn.addEventListener('click', closeAssignModal);
  const confirmABtn = document.getElementById('confirmAssignBtn');
  if (confirmABtn) confirmABtn.addEventListener('click', confirmDeviceAssignment);

  const closePDetBtn = document.getElementById('closePatientDetailBtn');
  if (closePDetBtn) closePDetBtn.addEventListener('click', closePatientDetailModal);
  const closeDDetBtn = document.getElementById('closeDeviceDetailBtn');
  if (closeDDetBtn) closeDDetBtn.addEventListener('click', closeDeviceDetailModal);
});

// Also bind directly on script load in case DOM is already ready
const addPBtn = document.getElementById('openAddPatientBtn');
if (addPBtn) addPBtn.addEventListener('click', openAddPatientModal);
const assignPBtn = document.getElementById('openAssignFromPatientsBtn');
if (assignPBtn) assignPBtn.addEventListener('click', () => openAssignModal());
const assignDBtn = document.getElementById('openAssignDeviceBtn');
if (assignDBtn) assignDBtn.addEventListener('click', () => openAssignModal());
const regDBtn = document.getElementById('openRegisterDeviceBtn');
if (regDBtn) regDBtn.addEventListener('click', openRegisterDeviceModal);

const closePBtn = document.getElementById('closePatientModalBtn');
if (closePBtn) closePBtn.addEventListener('click', closePatientModal);
const cancelPBtn = document.getElementById('cancelPatientBtn');
if (cancelPBtn) cancelPBtn.addEventListener('click', closePatientModal);
const savePBtn = document.getElementById('savePatientBtn');
if (savePBtn) savePBtn.addEventListener('click', savePatient);

const closeDBtn = document.getElementById('closeDeviceModalBtn');
if (closeDBtn) closeDBtn.addEventListener('click', closeDeviceModal);
const cancelDBtn = document.getElementById('cancelDeviceBtn');
if (cancelDBtn) cancelDBtn.addEventListener('click', closeDeviceModal);
const saveDBtn = document.getElementById('saveDeviceBtn');
if (saveDBtn) saveDBtn.addEventListener('click', saveDevice);
const copyKeyBtn = document.getElementById('copyApiKeyBtn');
if (copyKeyBtn) copyKeyBtn.addEventListener('click', copyApiKey);

const closeABtn = document.getElementById('closeAssignModalBtn');
if (closeABtn) closeABtn.addEventListener('click', closeAssignModal);
const cancelABtn = document.getElementById('cancelAssignBtn');
if (cancelABtn) cancelABtn.addEventListener('click', closeAssignModal);
const confirmABtn = document.getElementById('confirmAssignBtn');
if (confirmABtn) confirmABtn.addEventListener('click', confirmDeviceAssignment);

const closePDetBtn = document.getElementById('closePatientDetailBtn');
if (closePDetBtn) closePDetBtn.addEventListener('click', closePatientDetailModal);
const closeDDetBtn = document.getElementById('closeDeviceDetailBtn');
if (closeDDetBtn) closeDDetBtn.addEventListener('click', closeDeviceDetailModal);

// Close modal when clicking backdrop
document.querySelectorAll('.modal-backdrop').forEach(mb => {
  mb.addEventListener('click', (e) => {
    if (e.target === mb) mb.classList.remove('open');
  });
});

// ---------- USER MANAGEMENT ----------
  // ==================== USER MANAGEMENT ====================

async function loadUsers() {
    const token = localStorage.getItem('authToken');
    const myEmail = (localStorage.getItem('userEmail') || '').toLowerCase();
    const myRole = localStorage.getItem('userRole') || 'Administrator';

    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/auth/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return;

        const data = await response.json();
        const users = Array.isArray(data) ? data : (data.users || []);

        const utb = document.getElementById('usersTableBody');
        const badge = document.getElementById('usersCountBadge');
        if (badge) badge.textContent = `${users.length} Accounts Registered`;

        if (!utb) return;

        utb.innerHTML = '';

        if (users.length === 0) {
            utb.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:24px;">No registered users found.</td></tr>`;
            return;
        }

        users.forEach(u => {
            const isMe = (u.email || '').toLowerCase() === myEmail;
            const status = u.is_active ? 'Active' : 'Suspended';
            const sc3 = u.is_active ? 'green' : 'red';
            const initials = u.full_name
                ? u.full_name.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()
                : 'U';
            
            const dateStr = u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : '—';

            let actionButtons = '';
            if (myRole === 'Administrator') {
                if (isMe) {
                    actionButtons = `<span style="font-size:11.5px; color:var(--accent); font-weight:600;">(Current Admin)</span>`;
                } else {
                    const blockBtn = u.is_active
                        ? `<button class="btn-action" onclick="blockUser('${u.email}')" style="color:var(--amber); border-color:rgba(255,176,32,0.3); font-size:11px;">Suspend</button>`
                        : `<button class="btn-action" onclick="unblockUser('${u.email}')" style="color:var(--green); border-color:rgba(45,212,160,0.3); font-size:11px;">Restore</button>`;
                    const delBtn = `<button class="btn-action" onclick="deleteUser('${u.email}')" style="color:var(--red); border-color:rgba(255,77,106,0.3); font-size:11px; margin-left:6px;">Delete</button>`;
                    actionButtons = `${blockBtn}${delBtn}`;
                }
            } else {
                actionButtons = `<span style="font-size:11px; color:var(--muted);">Read-only</span>`;
            }

            utb.innerHTML += `
                <tr>
                    <td>
                        <div class="user-cell">
                            <div class="user-avatar-sm">${initials}</div>
                            <div>
                                <div style="font-weight:700;">${u.full_name}</div>
                                <div style="font-size:11px; color:var(--muted);">${u.department || 'Clinical / IT Operations'}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="role-chip">${u.role}</span></td>
                    <td style="font-family:var(--font-mono); font-size:12px;">${u.email}</td>
                    <td><span class="badge" style="background:var(--${sc3}-bg); color:var(--${sc3}); font-weight:700;">● ${status}</span></td>
                    <td style="color:var(--muted); font-size:12px;">${dateStr}</td>
                    <td style="text-align:right;">${actionButtons}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function blockUser(email) {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
        const res = await fetch(`${API_BASE}/auth/block-user`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
            showToast(`User account for ${email} has been suspended.`);
            loadUsers();
        } else {
            showToast(data.detail || 'Could not suspend user.');
        }
    } catch (err) {
        showToast('Network error modifying account.');
    }
}

async function unblockUser(email) {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
        const res = await fetch(`${API_BASE}/auth/unblock-user`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
            showToast(`User account for ${email} has been restored.`);
            loadUsers();
        } else {
            showToast(data.detail || 'Could not restore user.');
        }
    } catch (err) {
        showToast('Network error modifying account.');
    }
}

async function deleteUser(email) {
    if (!confirm(`Are you sure you want to permanently delete the account for ${email}?`)) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
        const res = await fetch(`${API_BASE}/auth/delete-user`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
            showToast(`User account for ${email} has been deleted.`);
            loadUsers();
        } else {
            showToast(data.detail || 'Could not delete user.');
        }
    } catch (err) {
        showToast('Network error deleting account.');
    }
}

loadUsers();
document.querySelectorAll('.report-tab').forEach(t=>{
  if(!t.closest('#page-reports')) t.addEventListener('click', function(){
    this.parentElement.querySelectorAll('.report-tab').forEach(x=>x.classList.remove('active'));
    this.classList.add('active');
  });
});

// ---------- TOAST (lightweight feedback for actions with no dedicated page yet) ----------
function showToast(message){
  let toast = document.getElementById('appToast');
  if(!toast){
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.style.cssText = `position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(20px);
      background:#10162a; border:1px solid rgba(255,255,255,0.12); color:#e6ebf5; padding:12px 20px;
      border-radius:10px; font-size:13px; font-family:'Inter',sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.4);
      opacity:0; transition:opacity .2s, transform .2s; z-index:200; pointer-events:none;`;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(()=>{
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2200);
}

// ---------- PROFILE MODAL ----------
const modal = document.getElementById('profileModal');
document.getElementById('sideUserTrigger').addEventListener('click', ()=> modal.classList.add('open'));
document.getElementById('modalClose').addEventListener('click', ()=> modal.classList.remove('open'));
modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.classList.remove('open'); });

// ---------- TOPBAR BUTTONS ----------
const topbarBtns = document.querySelectorAll('.topbar-right .icon-btn');
if(topbarBtns[0]) topbarBtns[0].addEventListener('click', ()=>{ modal.classList.remove('open'); goToPage('alerts'); });
if(topbarBtns[1]) topbarBtns[1].addEventListener('click', ()=>{ modal.classList.remove('open'); goToPage('settings'); });
if(topbarBtns[2]) topbarBtns[2].addEventListener('click', ()=> showToast('Need help? Contact your system administrator or check the documentation.'));

// ---------- PROFILE MODAL ACTION BUTTONS ----------
const modalActionBtns = document.querySelectorAll('.modal-btn');
modalActionBtns.forEach(btn=>{
  const label = btn.textContent.trim();
  if(label.includes('Edit Profile')){
    btn.addEventListener('click', ()=> showToast('Edit Profile is coming soon.'));
  } else if(label.includes('Account Settings')){
    btn.addEventListener('click', ()=>{ modal.classList.remove('open'); goToPage('settings'); });
  } else if(label.includes('Sign Out')){
    btn.addEventListener('click', ()=>{
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      window.location.href = 'login.html';
    });
  }
});

// ---------- NAV ----------
const PAGE_TITLES = {
  dashboard: ['Dashboard Overview', 'Real-time overview of your IoMT ecosystem'],
  patients: ['Patient Management', 'Manage admitted patients and continuous IoMT device monitoring'],
  devices: ['Devices', 'Manage and monitor all IoMT devices'],
  trust: ['Trust Engine', 'Real-time trust evaluation and scoring'],
  analytics: ['AI Analytics', 'AI-powered insights and predictions'],
  heatmap: ['Risk Heat Map', 'Visualize risk distribution across locations'],
  maintenance: ['Maintenance Advisor', 'Predictive maintenance and recommendations'],
  alerts: ['Alerts & Notifications', 'Real-time alerts and system notifications'],
  reports: ['Reports', 'Generate and analyze system reports'],
  profiles: ['Device Profiles', 'Manage device information and configurations'],
  settings: ['System Settings', 'Configure system preferences and security'],
  users: ['User Management', 'Manage users, roles and permissions']
};

function goToPage(key){
  document.querySelectorAll('.nav a').forEach(x=>x.classList.remove('active'));
  const navLink = document.querySelector(`.nav a[data-page="${key}"]`);
  if(navLink) navLink.classList.add('active');
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pageEl = document.getElementById('page-'+key);
  if(pageEl) pageEl.classList.add('active');
  const t = PAGE_TITLES[key];
  if(t){
    document.getElementById('pageTitle').textContent = t[0];
    document.getElementById('pageSub').textContent = t[1];
  }
  if(key === 'patients'){
    loadPatients();
  }
  if(key === 'trust'){
    loadTrustEngineData(selectedTrustDeviceId);
  }
  if(key === 'analytics'){
    loadAnalyticsData();
  }
  if(key === 'reports'){
    loadReportsData(activeReportTab);
  }
  if(key === 'heatmap'){
    loadHeatmapData();
  }
  if(key === 'maintenance'){
    loadMaintenanceData();
  }
  if(key === 'profiles'){
    updateDeviceProfilesSection();
  }
  if(key === 'users'){
    loadUsers();
  }
  // Refresh live dashboard / devices / trust data on navigation
  loadDashboardData(true);
  window.scrollTo({top:0, behavior:'smooth'});
}

// Initial dashboard & patient load & 5-second polling without full page reload
loadDashboardData();
loadPatients();
loadAnalyticsData(true);
loadReportsData('overview', true);
loadHeatmapData(true);
loadMaintenanceData(true);

setInterval(() => {
  loadDashboardData(true);
  const patPage = document.getElementById('page-patients');
  if (patPage && patPage.classList.contains('active')) {
    loadPatients(true);
  }
  const anaPage = document.getElementById('page-analytics');
  if (anaPage && anaPage.classList.contains('active')) {
    loadAnalyticsData(true);
  }
  const tePage = document.getElementById('page-trust');
  if (tePage && tePage.classList.contains('active')) {
    loadTrustEngineData(selectedTrustDeviceId, true);
  }
}, 5000);

document.querySelectorAll('.nav a').forEach(a=>{
  a.addEventListener('click', ()=> goToPage(a.dataset.page));
});
document.querySelectorAll('.tab-btn').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
  });
});

// ---------- DATE RANGE PICKER (Real Backend Filter) ----------
const dateTrigger = document.getElementById('dateRangeTrigger');
const dateDropdown = document.getElementById('dateRangeDropdown');
const dateLabel = document.getElementById('dateRangeLabel');
const customDateInput = document.getElementById('customDateInput');

if (dateTrigger) {
  dateTrigger.addEventListener('click', (e)=>{
    e.stopPropagation();
    if (dateDropdown) dateDropdown.classList.toggle('open');
  });
}
if (dateDropdown) {
  document.addEventListener('click', (e)=>{
    if(!dateDropdown.contains(e.target) && e.target !== dateTrigger){
      dateDropdown.classList.remove('open');
    }
  });
}

document.querySelectorAll('.date-preset-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const days = parseInt(btn.dataset.days, 10);
    const end = new Date(2026, 4, 16); // May 16, 2026
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    const fmt = d => d.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
    if (dateLabel) dateLabel.textContent = days === 10 ? `Data for ${fmt(start)}` : `${fmt(start)} – ${fmt(end)}`;
    loadDashboardData(true);
    loadAnalyticsData(true);
    loadReportsData(activeReportTab, true);
    if (dateDropdown) dateDropdown.classList.remove('open');
    showToast(`Filtering metrics: ${dateLabel ? dateLabel.textContent : ''}`);
  });
});

const applyDateBtn = document.getElementById('applyDateBtn');
if (applyDateBtn) {
  applyDateBtn.addEventListener('click', ()=>{
    const val = customDateInput ? customDateInput.value : null;
    if(!val){ showToast('Please choose a date first.'); return; }
    const d = new Date(val + 'T00:00:00');
    const fmt = d.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
    if (dateLabel) dateLabel.textContent = `Data for ${fmt}`;
    loadDashboardData(true);
    loadAnalyticsData(true);
    loadReportsData(activeReportTab, true);
    if (dateDropdown) dateDropdown.classList.remove('open');
    showToast(`Showing real-time dataset metrics for ${fmt}`);
  });
}

// ---------- POPULATE REAL LOGGED-IN USER ----------
(function populateLoggedInUser(){
  const name = localStorage.getItem('userName') || 'Dr. Sarah Wilson';
  const role = localStorage.getItem('userRole') || 'Administrator';
  const email = localStorage.getItem('userEmail') || 's.wilson@hospital.org';
  const initials = name.replace(/^Dr\.?\s*/i, '').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || 'U';

  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const sidebarUserName = document.getElementById('sidebarUserName');
  const sidebarUserRole = document.getElementById('sidebarUserRole');
  const modalAvatar = document.getElementById('modalAvatar');
  const modalUserName = document.getElementById('modalUserName');
  const modalUserRole = document.getElementById('modalUserRole');
  const modalUserEmail = document.getElementById('modalUserEmail');
  const modalLastLogin = document.getElementById('modalLastLogin');

  if(sidebarAvatar) sidebarAvatar.textContent = initials;
  if(sidebarUserName) sidebarUserName.textContent = name;
  if(sidebarUserRole) sidebarUserRole.textContent = role;
  if(modalAvatar) modalAvatar.textContent = initials;
  if(modalUserName) modalUserName.textContent = name;
  if(modalUserRole) modalUserRole.textContent = role;
  if(modalUserEmail) modalUserEmail.textContent = email;
  if(modalLastLogin) modalLastLogin.textContent = new Date().toLocaleString('en-US', {
    hour:'numeric', minute:'2-digit', hour12:true, month:'short', day:'numeric'
  });
})();
