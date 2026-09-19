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

// ---------- RENDER PATIENT DETAIL ----------
function renderPatientDetail(id){
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

  const bannerCopy = {
    good: {title:'Data Verified', sub: p.reason || 'This device\u2019s data passed both encryption integrity checks and AI authenticity analysis. Safe to act on.', icon:'✓'},
    warn: {title:'Verify Before Acting', sub: p.reason || 'Telemetry confidence reduced — potential operational drift or transmission latency.', icon:'!'},
    bad:  {title:'Caution — Do Not Act Without Verification', sub: p.reason || 'Critical anomaly or signature mismatch detected. Verify patient vitals manually before clinical action.', icon:'✕'}
  }[level];

  const v = p.vitals || {};
  const vitalDefs = [
    {key:'heartRate', name:'Heart Rate', value: v.heartRate !== undefined ? v.heartRate : '--', unit:'bpm', range:'Normal: 60-100 bpm'},
    {key:'spo2', name:'SpO2', value: v.spo2 !== undefined ? v.spo2 : '--', unit:'%', range:'Normal: 95-100%'},
    {key:'sysBP', name:'Blood Pressure', value: (v.sysBP !== undefined && v.diaBP !== undefined && v.sysBP !== '--') ? `${v.sysBP}/${v.diaBP}` : '--', unit:'mmHg', range:'Normal: <120/80 mmHg'},
    {key:'temp', name:'Temperature', value: v.temp !== undefined ? v.temp : '--', unit:'°C/°F', range:'Normal: 36.5-37.5°C / 98-99°F'},
    {key:'glucose', name:'Blood Glucose', value: v.glucose !== undefined ? v.glucose : '--', unit:'mg/dL', range:'Normal: 70-140 mg/dL'},
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
          <div class="patient-sub">${p.id} · ${p.age} yrs · ${p.gender} · ${p.room}</div>
          <div class="patient-sub">Source device: ${p.device} (${p.deviceId})</div>
        </div>
      </div>
      <div class="patient-trust-score">
        <div class="patient-trust-value" style="color:var(--${color});">${p.trust}%</div>
        <div class="patient-trust-label">Continuous Trust Score</div>
      </div>
    </div>

    <div class="vitals-grid">${vitalsHtml}</div>

    <div class="card">
      <div class="card-title" style="margin-bottom:6px;">Why this data is ${level === 'good' ? 'trusted' : 'flagged'}</div>
      <div class="why-row">
        <div class="why-label">Source device status</div>
        <span class="why-tag" style="background:var(--${color}-bg); color:var(--${color});">${p.trust}% Trust Score (${p.decision || 'Accept'})</span>
      </div>
      <div class="why-row">
        <div class="why-label">Continuous AI Rationale</div>
        <span style="font-size:12.5px; color:var(--muted); text-align:right; max-width:60%;">${p.reason || 'Verified telemetry parameters.'}</span>
      </div>
      <div class="why-row">
        <div class="why-label">Recommended Clinical Action</div>
        <span style="font-size:12.5px; font-weight:700; color:var(--${color});">${p.recommendedAction || (level === 'good' ? 'None — continue normal monitoring' : level === 'warn' ? 'Cross-check with manual reading' : 'Escalate to biomedical engineering immediately')}</span>
      </div>
      ${p.evaluatedAt ? `
      <div class="why-row">
        <div class="why-label">Last Evaluation Event</div>
        <span style="font-size:11.5px; color:var(--muted); font-family:var(--font-mono);">${new Date(p.evaluatedAt).toLocaleTimeString()} (${p.evaluatedAt.substring(0,10)})</span>
      </div>` : ''}
    </div>
  `;
}

document.getElementById('patientSearch').addEventListener('input', (e)=> renderPatientList(e.target.value));

// Initial load and continuous dynamic polling every 4 seconds
loadDoctorPatients();
setInterval(()=> loadDoctorPatients(true), 4000);

