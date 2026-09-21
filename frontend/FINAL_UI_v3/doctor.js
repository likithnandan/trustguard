// ---------- AUTH: populate real logged-in user ----------
const userName = localStorage.getItem('userName') || 'Dr. Alex Rivera';
const userRole = localStorage.getItem('userRole') || 'Doctor';
const userEmail = localStorage.getItem('userEmail') || 'doctor@hospital.org';
const initials = userName.replace(/^Dr\.?\s*/i, '').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() || 'DR';

['sidebarAvatar','modalAvatar'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent = initials; });
document.getElementById('sidebarUserName').textContent = userName;
document.getElementById('sidebarUserRole').textContent = userRole;
document.getElementById('modalUserName').textContent = userName;
document.getElementById('modalUserRole').textContent = userRole;
document.getElementById('modalUserEmail').textContent = userEmail;
document.getElementById('modalLastLogin').textContent = new Date().toLocaleString('en-US', {hour:'numeric', minute:'2-digit', hour12:true, month:'short', day:'numeric'});

// Administrators can jump back to the full admin dashboard; doctors get the
// focused portal only, per the intended separation between the two roles.
if(userRole === 'Administrator'){
  const backBtn = document.getElementById('backToAdminBtn');
  backBtn.style.display = 'flex';
  backBtn.addEventListener('click', ()=> window.location.href = 'index.html');
}

function signOut(){
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  window.location.href = 'login.html';
}
document.getElementById('signOutBtn').addEventListener('click', signOut);
document.getElementById('modalSignOut').addEventListener('click', signOut);

const profileModal = document.getElementById('profileModal');
document.getElementById('sideUserTrigger').addEventListener('click', ()=> profileModal.classList.add('open'));
document.getElementById('modalClose').addEventListener('click', ()=> profileModal.classList.remove('open'));
profileModal.addEventListener('click', (e)=>{ if(e.target === profileModal) profileModal.classList.remove('open'); });

// ---------- DYNAMIC PATIENT DATA LAYER ----------
let patients = [];
let activePatientId = null;
const API_BASE = 'http://127.0.0.1:8000';

function trustLevel(score){
  if(score >= 80) return 'good';
  if(score >= 50) return 'warn';
  return 'bad';
}
function trustColorVar(level){
  return level === 'good' ? 'green' : level === 'warn' ? 'amber' : 'red';
}

// ---------- LOAD PATIENTS FROM BACKEND API ----------
async function loadDoctorPatients(silent = false){
  const token = localStorage.getItem('authToken');
  if(!token){
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/doctor/patients`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if(res.status === 401 || res.status === 403){
      window.location.href = 'login.html';
      return;
    }

    if(!res.ok){
      if(!silent) console.error('Failed to load doctor patients:', res.status);
      return;
    }

    const data = await res.json();
    const fetched = Array.isArray(data) ? data : (data.patients || []);
    
    if(fetched.length > 0){
      patients = fetched;
      if(!activePatientId || !patients.some(p => p.id === activePatientId)){
        activePatientId = patients[0].id;
      }
      const searchVal = document.getElementById('patientSearch') ? document.getElementById('patientSearch').value : '';
      renderPatientList(searchVal);
      renderPatientDetail(activePatientId);
    } else {
      document.getElementById('patientList').innerHTML = '<div style="padding:20px; color:var(--muted); font-size:13px; text-align:center;">No admitted patients found.</div>';
    }
  } catch(err) {
    if(!silent) console.error('Network error loading doctor patients:', err);
  }
}

// ---------- RENDER PATIENT LIST ----------
function renderPatientList(filter=''){
  const list = document.getElementById('patientList');
  if(!list) return;
  list.innerHTML = '';
  const f = filter.trim().toLowerCase();
  patients
    .filter(p => !f || p.name.toLowerCase().includes(f) || p.room.toLowerCase().includes(f) || p.id.toLowerCase().includes(f))
    .forEach(p => {
      const level = trustLevel(p.trust);
      const color = trustColorVar(level);
      const initials = p.name ? p.name.replace(/^Dr\.?\s*/i, '').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() : 'PT';
      const item = document.createElement('div');
      item.className = 'dp-patient-item' + (p.id === activePatientId ? ' active' : '');
      item.innerHTML = `
        <div class="dp-patient-avatar">${initials}<span class="dp-status-dot" style="background:var(--${color});"></span></div>
        <div>
          <div class="dp-patient-name">${p.name}</div>
          <div class="dp-patient-meta">${p.room}</div>
        </div>`;
      item.addEventListener('click', ()=>{ 
        activePatientId = p.id; 
        renderPatientList(document.getElementById('patientSearch').value); 
        renderPatientDetail(p.id); 
      });
      list.appendChild(item);
    });
}

// ---------- FETCH PATIENT TRUST HISTORY ----------
async function fetchPatientTrustHistory(patientId){
  const token = localStorage.getItem('authToken');
  if(!token) return [];
  try {
    const res = await fetch(`${API_BASE}/api/v1/doctor/patients/${encodeURIComponent(patientId)}/history?limit=8`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if(res.ok){
      const data = await res.json();
      return data.history || [];
    }
  } catch(err) {
    console.error('Error fetching patient trust history:', err);
  }
  return [];
}

// ---------- RENDER PATIENT DETAIL ----------
async function renderPatientDetail(id){
  const p = patients.find(x => x.id === id);
  const detailContainer = document.getElementById('patientDetail');
  if(!detailContainer) return;
  if(!p){
    detailContainer.innerHTML = '<div style="padding:40px; color:var(--muted); text-align:center;">Select a patient from the sidebar to view continuous telemetry and trust verification.</div>';
    return;
  }
  const level = trustLevel(p.trust);
  const color = trustColorVar(level);
  const initials = p.name ? p.name.replace(/^Dr\.?\s*/i, '').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() : 'PT';

  // Accurate operational verification banner copy (No clinical diagnosis claims)
  const bannerCopy = {
    good: {title:'Telemetry Verified / Trusted Within System', sub: p.reason || 'Telemetry signature and operational parameters verified via continuous AI evaluation.', icon:'✓'},
    warn: {title:'Verification / Monitoring Required', sub: p.reason || 'Telemetry confidence degraded — operational monitoring required.', icon:'!'},
    bad:  {title:'Software Isolation Decision / Security Alert', sub: p.reason || 'Software isolation decision enforced due to low trust score. Review device operational integrity.', icon:'✕'}
  }[level];

  // Assigned Devices Badges
  const devicesList = p.assignedDevices && p.assignedDevices.length > 0 ? p.assignedDevices : [{
    deviceId: p.deviceId || 'N/A',
    deviceName: p.device || 'Assigned IoMT Device',
    deviceType: 'IoMT Monitor',
    deviceStatus: 'Active'
  }];

  const devicesBadgesHtml = devicesList.map(d => `
    <div class="device-badge">
      <span class="device-badge-dot"></span>
      <strong>${d.deviceName}</strong> (${d.deviceId}) · <span style="color:var(--muted);">${d.deviceType}</span>
    </div>
  `).join('');

  // Dual-Model AI Subscores
  const devTrust = p.deviceTrust !== undefined ? p.deviceTrust : p.trust;
  const dataAuth = p.dataAuthenticity !== undefined ? p.dataAuthenticity : p.trust;
  const devLevel = trustLevel(devTrust);
  const authLevel = trustLevel(dataAuth);

  // Vitals Grid
  const v = p.vitals || {};
  const vitalDefs = [
    {key:'heartRate', name:'Heart Rate', value: v.heartRate !== undefined ? v.heartRate : '--', unit:'bpm', range:'Normal: 60-100 bpm'},
    {key:'spo2', name:'SpO2', value: v.spo2 !== undefined ? v.spo2 : '--', unit:'%', range:'Normal: 95-100%'},
    {key:'sysBP', name:'Blood Pressure', value: (v.sysBP !== undefined && v.diaBP !== undefined && v.sysBP !== '--') ? `${v.sysBP}/${v.diaBP}` : '--', unit:'mmHg', range:'Normal: <120/80 mmHg'},
    {key:'temp', name:'Temperature', value: v.temp !== undefined ? v.temp : '--', unit:'°C/°F', range:'Normal: 36.5-37.5°C / 98-99°F'},
    {key:'glucose', name:'Blood Glucose', value: v.glucose !== undefined ? v.glucose : '--', unit:'mg/dL', range:'Normal: 70-140 mg/dL'},
    {key:'respRate', name:'Respiratory Rate', value: v.respRate !== undefined ? v.respRate : '--', unit:'breaths/min', range:'Normal: 12-20 breaths/min'}
  ];

  const vitalsHtml = vitalDefs.map(item => {
    const flagged = p.flaggedVital === 'all' || p.flaggedVital === item.key;
    const badge = flagged ? '⚠️' : '✅';
    return `<div class="card vital-card">
      <span class="vital-badge">${badge}</span>
      <div class="vital-name">${item.name}</div>
      <div class="vital-value">${item.value}<span class="vital-unit">${item.unit}</span></div>
      <div class="vital-range">${item.range}</div>
    </div>`;
  }).join('');

  // XAI Factors
  const xaiObj = p.xai || {};
  const topDev = xaiObj.top_device_factors || [];
  const topAuth = xaiObj.top_authenticity_factors || [];

  const devFactorsHtml = topDev.length > 0 ? topDev.map(f => `
    <div class="xai-factor-item">
      <span class="xai-factor-name">${f.feature}</span>
      <span class="xai-factor-score">Imp: ${(f.importance * 100).toFixed(1)}%</span>
    </div>
  `).join('') : '<div style="color:var(--muted); font-size:11.5px; padding:6px 0;">No significant hardware anomalies detected.</div>';

  const authFactorsHtml = topAuth.length > 0 ? topAuth.map(f => `
    <div class="xai-factor-item">
      <span class="xai-factor-name">${f.feature}</span>
      <span class="xai-factor-score">Imp: ${(f.importance * 100).toFixed(1)}%</span>
    </div>
  `).join('') : '<div style="color:var(--muted); font-size:11.5px; padding:6px 0;">Network flow signatures verified within normal baseline.</div>';

  // Render main container structure
  detailContainer.innerHTML = `
    <div class="verify-banner ${level}">
      <div class="verify-icon">${bannerCopy.icon}</div>
      <div>
        <div class="verify-title">${bannerCopy.title}</div>
        <div class="verify-sub">${bannerCopy.sub}</div>
      </div>
    </div>

    <div class="patient-header">
      <div class="patient-header-left">
        <div class="patient-avatar-lg">${initials}</div>
        <div>
          <div class="patient-title">${p.name}</div>
          <div class="patient-sub">${p.id} · ${p.age} yrs · ${p.gender} · ${p.room} · ${p.department}</div>
          <div class="device-badges">${devicesBadgesHtml}</div>
        </div>
      </div>
      <div class="patient-trust-score">
        <div class="patient-trust-value" style="color:var(--${color});">${p.trust}%</div>
        <div class="patient-trust-label">Unified Trust Score (${p.decision || 'Accept'})</div>
      </div>
    </div>

    <!-- AI TRUST VERIFICATION SECTION -->
    <div class="trust-breakdown-grid">
      <div class="trust-kpi-card">
        <div class="trust-kpi-title">Model A — Device Trust</div>
        <div class="trust-kpi-val" style="color:var(--${trustColorVar(devLevel)});">${devTrust}%</div>
        <div class="trust-kpi-weight">45% Engine Weight (Operational Integrity)</div>
      </div>
      <div class="trust-kpi-card">
        <div class="trust-kpi-title">Model B — Data Authenticity</div>
        <div class="trust-kpi-val" style="color:var(--${trustColorVar(authLevel)});">${dataAuth}%</div>
        <div class="trust-kpi-weight">55% Engine Weight (Security & Authenticity)</div>
      </div>
      <div class="trust-kpi-card">
        <div class="trust-kpi-title">Continuous Verification Policy</div>
        <div class="trust-kpi-val" style="color:var(--${color});">${p.decision || 'Accept'}</div>
        <div class="trust-kpi-weight">Score = 0.45×Model_A + 0.55×Model_B</div>
      </div>
    </div>

    <!-- LIVE CLINICAL VITALS -->
    <div class="vitals-grid">${vitalsHtml}</div>

    <!-- EXPLAINABLE AI (XAI) ATTRIBUTION SECTION -->
    <div class="card" style="margin-bottom:20px;">
      <div class="card-title" style="margin-bottom:4px;">Why was this trust decision made?</div>
      <div style="font-size:12px; color:var(--muted); margin-bottom:12px;">Top contributing operational and security factors from continuous AI model evaluation:</div>
      
      <div class="xai-grid">
        <div class="xai-column">
          <div class="xai-col-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>
            Model A — Top Device Hardware Factors
          </div>
          ${devFactorsHtml}
        </div>
        <div class="xai-column">
          <div class="xai-col-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/></svg>
            Model B — Top Data Authenticity Factors
          </div>
          ${authFactorsHtml}
        </div>
      </div>

      <div style="margin-top:14px; padding-top:10px; border-top:1px solid var(--border-soft);">
        <div class="why-row">
          <div class="why-label">AI Telemetry Assessment Rationale</div>
          <span style="font-size:12.5px; color:var(--muted); text-align:right; max-width:65%;">${p.reason || 'All telemetry parameters verified within operational baseline.'}</span>
        </div>
        <div class="why-row">
          <div class="why-label">Recommended Verification Action</div>
          <span style="font-size:12.5px; font-weight:700; color:var(--${color});">${p.recommendedAction || 'None — proceed with standard patient monitoring.'}</span>
        </div>
        ${p.evaluatedAt ? `
        <div class="why-row">
          <div class="why-label">Latest Evaluation Timestamp</div>
          <span style="font-size:11.5px; color:var(--muted); font-family:var(--font-mono);">${new Date(p.evaluatedAt).toLocaleTimeString()} (${p.evaluatedAt.substring(0,10)})</span>
        </div>` : ''}
      </div>
    </div>

    <!-- CONTINUOUS TRUST EVALUATION HISTORY -->
    <div class="card" id="patientHistoryCard">
      <div class="card-title" style="margin-bottom:4px;">Continuous Trust Evaluation History</div>
      <div style="font-size:12px; color:var(--muted); margin-bottom:10px;">Recent audit trail of AI trust evaluations for this patient:</div>
      <div id="historyTableContainer" style="overflow-x:auto;">
        <div style="padding:14px; color:var(--muted); font-size:12px; text-align:center;">Loading evaluation history...</div>
      </div>
    </div>
  `;

  // Fetch and populate recent trust history asynchronously
  fetchPatientTrustHistory(id).then(history => {
    const histContainer = document.getElementById('historyTableContainer');
    if(!histContainer) return;
    if(!history || history.length === 0){
      histContainer.innerHTML = '<div style="padding:14px; color:var(--muted); font-size:12px; text-align:center;">No historical trust evaluations available for this patient.</div>';
      return;
    }

    const rowsHtml = history.map(h => {
      const hScore = h.trustScore !== null ? `${h.trustScore}%` : '--';
      const hDev = h.deviceTrust !== null ? `${h.deviceTrust}%` : '--';
      const hAuth = h.dataAuthenticity !== null ? `${h.dataAuthenticity}%` : '--';
      const hTime = h.timestamp ? new Date(h.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'}) : 'Recent';
      const hLevel = trustLevel(h.trustScore || 100);
      const hCol = trustColorVar(hLevel);
      return `
        <tr>
          <td style="font-family:var(--font-mono); color:var(--muted);">${hTime}</td>
          <td><strong>${h.deviceName || h.deviceId}</strong></td>
          <td style="font-family:var(--font-mono);">${hDev}</td>
          <td style="font-family:var(--font-mono);">${hAuth}</td>
          <td style="font-family:var(--font-mono); font-weight:700; color:var(--${hCol});">${hScore}</td>
          <td><span class="why-tag" style="background:var(--${hCol}-bg); color:var(--${hCol});">${h.decision}</span></td>
          <td style="color:var(--muted); font-size:11.5px; max-width:280px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${h.clinicalReason || 'Normal verification'}</td>
        </tr>
      `;
    }).join('');

    histContainer.innerHTML = `
      <table class="dp-history-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Device</th>
            <th>Model A (45%)</th>
            <th>Model B (55%)</th>
            <th>Unified Trust</th>
            <th>Decision</th>
            <th>Assessment Rationale</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  });
}

document.getElementById('patientSearch').addEventListener('input', (e)=> renderPatientList(e.target.value));

// Initial load and continuous dynamic polling every 4 seconds
loadDoctorPatients();
setInterval(()=> loadDoctorPatients(true), 4000);


