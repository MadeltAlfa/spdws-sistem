/* ============================================================
   ACCOUNTS
============================================================ */
const ACCOUNTS = {
  admin: { pass:'admin123', role:'admin', name:'Maheswari' },
  user:  { pass:'user123',  role:'user',  name:'Pengguna Umum' }
};

function show(id)  { document.getElementById(id).classList.add('visible'); }
function hide(id)  { document.getElementById(id).classList.remove('visible'); }

function doLogin() {
  const u   = document.getElementById('login-user').value.trim();
  const p   = document.getElementById('login-pass').value.trim();
  const err = document.getElementById('login-err');
  const acc = ACCOUNTS[u];
  if (acc && acc.pass === p) {
    err.style.display = 'none';
    hide('login-screen');
    if (acc.role === 'admin') {
      document.getElementById('admin-name').textContent = acc.name;
      show('admin-screen');
      renderUnits(); renderSchedule(); renderLog(); renderPengaduanAdmin();
    } else {
      show('monitor-screen');
      startMonitor();
    }
  } else {
    err.style.display = 'block';
  }
}
function doLogout() {
  hide('monitor-screen');
  hide('admin-screen');
  show('login-screen');
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const ls = document.getElementById('login-screen');
    if (ls.classList.contains('visible')) doLogin();
  }
});

/* ============================================================
   MONITOR
============================================================ */
const DAYS = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function startMonitor() {
  updateTime(); setInterval(updateTime, 1000);
  setInterval(simulateSensor, 5000);
}
function updateTime() {
  const now = new Date();
  document.getElementById('monitor-time').textContent =
    now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  document.getElementById('monitor-date').textContent =
    `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

function simulateSensor() {
  const tds = Math.floor(Math.random()*220 + 60);
  const ph  = +(6.3 + Math.random()*2.2).toFixed(1);
  let vol   = parseInt(document.getElementById('vol-num').textContent);
  vol = Math.max(5, Math.min(95, vol + Math.floor(Math.random()*7-3)));

  document.getElementById('tds-val').textContent = tds;
  document.getElementById('ph-val').textContent  = ph;
  document.getElementById('vol-num').textContent  = vol;

  const fill = document.getElementById('vol-fill');
  fill.style.width = vol+'%';
  if (vol > 50)       fill.style.background = 'linear-gradient(90deg,#0ea5e9,#38bdf8)';
  else if (vol > 25)  fill.style.background = 'linear-gradient(90deg,#ca8a04,#facc15)';
  else                fill.style.background = 'linear-gradient(90deg,#dc2626,#f87171)';

  const tdsOk = tds < 300;
  const phOk  = ph >= 6.5 && ph <= 8.5;
  const volOk = vol > 10;

  setStatus('tds-val','tds-status', tdsOk, tds, '#0369a1','#ca8a04');
  setStatus('ph-val','ph-status',   phOk,  ph, '#0369a1','#ca8a04');

  const hero = document.getElementById('status-hero');
  const word = document.getElementById('status-word');
  const desc = document.getElementById('status-desc');
  if (!tdsOk || !phOk || !volOk) {
    word.className='status-word s-error'; word.textContent='TIDAK TERSEDIA';
    desc.textContent='Mohon tunggu — sedang dilakukan pengecekan sistem oleh petugas';
    hero.style.background='linear-gradient(135deg,#7f1d1d,#991b1b)';
  } else if (vol <= 25) {
    word.className='status-word s-periksa'; word.textContent='PERIKSA';
    desc.textContent='Volume air mendekati batas — petugas sedang dihubungi';
    hero.style.background='linear-gradient(135deg,#78350f,#92400e)';
  } else {
    word.className='status-word s-aman'; word.textContent='AMAN';
    desc.textContent='Air siap dikonsumsi · Semua komponen berfungsi normal';
    hero.style.background='linear-gradient(135deg,#0369a1,#0284c7)';
  }
}
function setStatus(valId, statId, ok, val, okColor, warnColor) {
  document.getElementById(valId).style.color = ok ? okColor : warnColor;
  const el = document.getElementById(statId);
  el.innerHTML = ok ? '<i class="fa-solid fa-check"></i> Aman' : '<i class="fa-solid fa-triangle-exclamation"></i> Periksa';
  el.className   = 'sensor-status ' + (ok ? 'ss-ok' : 'ss-warn');
}

/* ============================================================
   PENGADUAN — USER SIDE
============================================================ */
let pengaduanList = [];   // shared store
let selectedKat = '';
let selectedPrio = '';
let selectedStar = 0;

function togglePengaduan() {
  const form = document.getElementById('pengaduan-form');
  const isOpen = form.classList.contains('open');
  form.classList.toggle('open');
  document.getElementById('peng-btn-text').textContent = isOpen ? 'Buat Laporan Pengaduan' : 'Tutup Form';
}

function selectKat(el, val) {
  document.querySelectorAll('.kat-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedKat = val;
}

function selectPrio(btn) {
  document.querySelectorAll('.prio-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  selectedPrio = btn.textContent.replace(/[^a-zA-Z]/g,'').trim();
  // extract word
  const txt = btn.textContent;
  if (txt.includes('Rendah')) selectedPrio='Rendah';
  else if (txt.includes('Sedang')) selectedPrio='Sedang';
  else selectedPrio='Tinggi';
}

function setStar(n) {
  selectedStar = n;
  const stars = document.querySelectorAll('.star');
  stars.forEach((s,i) => s.classList.toggle('active', i < n));
  const labels = ['','Sangat Buruk','Buruk','Cukup','Baik','Sangat Baik'];
  document.getElementById('star-label').textContent = `${n} bintang — ${labels[n]}`;
}

function submitPengaduan() {
  if (!selectedKat)  { showToast('<i class="fa-solid fa-triangle-exclamation"></i> Pilih kategori masalah terlebih dahulu','t-error'); return; }
  if (!selectedPrio) { showToast('<i class="fa-solid fa-triangle-exclamation"></i> Pilih tingkat urgensi terlebih dahulu','t-error'); return; }
  const desc  = document.getElementById('peng-desc').value.trim();
  const kontak= document.getElementById('peng-kontak').value.trim();

  const entry = {
    id:     'RPT-' + String(pengaduanList.length+1).padStart(3,'0'),
    kat:    selectedKat,
    prio:   selectedPrio,
    desc:   desc || '(Tidak ada deskripsi tambahan)',
    kontak: kontak || '-',
    star:   selectedStar,
    unit:   'SPDWS-01',   // unit aktif (monitor unit ini)
    time:   new Date().toLocaleString('id-ID'),
    status: 'Baru'
  };
  pengaduanList.unshift(entry);
  updatePengaduanBadge();
  renderPengaduanHistory();
  renderPengaduanAdmin();

  // reset form
  document.getElementById('peng-desc').value = '';
  document.getElementById('peng-kontak').value = '';
  document.querySelectorAll('.kat-chip').forEach(c=>c.classList.remove('selected'));
  document.querySelectorAll('.prio-btn').forEach(b=>b.classList.remove('sel'));
  document.querySelectorAll('.star').forEach(s=>s.classList.remove('active'));
  document.getElementById('star-label').textContent = 'Pilih rating bintang';
  selectedKat=''; selectedPrio=''; selectedStar=0;

  togglePengaduan();
  showToast('<i class="fa-solid fa-check"></i> Laporan berhasil dikirim! Petugas akan segera merespons.','t-success');
}

function renderPengaduanHistory() {
  const wrap = document.getElementById('peng-history');
  const list = document.getElementById('peng-history-list');
  if (pengaduanList.length === 0) { wrap.style.display='none'; return; }
  wrap.style.display = 'block';
  const prioColor = { Tinggi:'<i class="fa-solid fa-circle" style="color:var(--r500)"></i>', Sedang:'<i class="fa-solid fa-circle" style="color:var(--y500)"></i>', Rendah:'<i class="fa-solid fa-circle" style="color:var(--g500)"></i>' };
  list.innerHTML = pengaduanList.slice(0,5).map(p => `
    <div class="peng-item">
      <div>
        <div class="peng-item-cat">${prioColor[p.prio]||''} ${p.kat}</div>
        <div class="peng-item-time">${p.id} · ${p.time}</div>
      </div>
      <div class="peng-item-status ps-${p.status==='Baru'?'terkirim':p.status==='Diproses'?'proses':'selesai'}">
        ${p.status}
      </div>
    </div>
  `).join('');
}

function updatePengaduanBadge() {
  const newCount = pengaduanList.filter(p=>p.status==='Baru').length;
  const badge = document.getElementById('peng-admin-badge');
  badge.textContent = newCount;
  badge.style.display = newCount > 0 ? '' : 'none';
}

/* ============================================================
   ADMIN: PAGE NAV
============================================================ */
function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  el.classList.add('active');
}

/* ============================================================
   ADMIN: UNITS
============================================================ */
const units = [
  {id:'SPDWS-01',name:'Alun-alun Kota',        air:72,filter:85,uv:90,status:'g',tags:[]},
  {id:'SPDWS-02',name:'Mall Pusat',             air:55,filter:70,uv:88,status:'g',tags:[]},
  {id:'SPDWS-03',name:'Taman Kota Selatan',     air:61,filter:12,uv:75,status:'r',tags:['Filter Kritis']},
  {id:'SPDWS-04',name:'Kampus UII',             air:80,filter:90,uv:95,status:'g',tags:[]},
  {id:'SPDWS-05',name:'Perpustakaan Daerah',    air:47,filter:66,uv:22,status:'y',tags:['UV Rendah']},
  {id:'SPDWS-06',name:'Puskesmas Utara',        air:33,filter:78,uv:80,status:'y',tags:['Air Rendah']},
  {id:'SPDWS-07',name:'Stasiun Bus Terminal A', air:8, filter:88,uv:91,status:'r',tags:['Air Kritis']},
  {id:'SPDWS-08',name:'Taman Bermain Barat',    air:91,filter:82,uv:87,status:'g',tags:[]},
  {id:'SPDWS-09',name:'Pasar Tradisional',      air:44,filter:55,uv:60,status:'y',tags:['Filter Rendah']},
  {id:'SPDWS-10',name:'Kantor Kecamatan',       air:0, filter:0, uv:0, status:'r',tags:['Offline']},
];
function bC(v){return v>50?'#22c55e':v>25?'#eab308':'#ef4444';}
function bT(v){return v>50?'#16a34a':v>25?'#ca8a04':'#dc2626';}
function renderUnits() {
  document.getElementById('unit-grid').innerHTML = units.map(u=>`
    <div class="unit-card">
      <div class="u-status-dot dot-${u.status}"></div>
      <div class="u-id">${u.id}</div>
      <div class="u-name">${u.name}</div>
      <div class="u-bars">
        ${['Air','Filter','UV'].map((l,i)=>{const v=[u.air,u.filter,u.uv][i];return`
        <div class="u-bar-row">
          <div class="u-bar-lbl">${l}</div>
          <div class="u-bar-bg"><div class="u-bar-fill" style="width:${v}%;background:${bC(v)}"></div></div>
          <div class="u-bar-pct" style="color:${bT(v)}">${v}%</div>
        </div>`;}).join('')}
      </div>
      <div class="u-tags">
        ${u.tags.map(t=>`<span class="u-tag ut-${t.includes('Kritis')||t==='Offline'?'r':'y'}">${t}</span>`).join('')}
        ${u.tags.length===0?'<span class="u-tag ut-g">Normal</span>':''}
      </div>
    </div>
  `).join('');
}

/* ============================================================
   ADMIN: SCHEDULE
============================================================ */
const schedData = [
  {type:'r',icon:'<i class="fa-solid fa-wrench"></i>',title:'Ganti Filter Air',     unit:'SPDWS-03',loc:'Taman Kota Selatan',    time:'08:00'},
  {type:'b',icon:'<i class="fa-solid fa-droplet"></i>',title:'Isi Volume Air',        unit:'SPDWS-07',loc:'Stasiun Bus Terminal A', time:'09:30'},
  {type:'y',icon:'<i class="fa-solid fa-sun"></i>',title:'Cek Lampu UV',          unit:'SPDWS-05',loc:'Perpustakaan Daerah',   time:'11:00'},
  {type:'g',icon:'<i class="fa-solid fa-check"></i>',title:'Cek Rutin Bulanan',     unit:'SPDWS-02',loc:'Mall Pusat',             time:'13:00'},
  {type:'b',icon:'<i class="fa-solid fa-droplet"></i>',title:'Isi Volume Air',        unit:'SPDWS-06',loc:'Puskesmas Utara',       time:'15:30'},
];
let doneTasks = new Set();
function renderSchedule() {
  document.getElementById('sched-list').innerHTML = schedData.map((s,i)=>`
    <div class="sched-item">
      <div class="sched-ico si-${s.type}">${s.icon}</div>
      <div>
        <div class="sched-title">${s.title}</div>
        <div class="sched-loc"><i class="fa-solid fa-location-dot"></i> ${s.unit} · ${s.loc}</div>
      </div>
      <div class="sched-time"><i class="fa-regular fa-clock"></i> ${s.time}</div>
      <button class="sched-btn ${doneTasks.has(i)?'done':''}" onclick="toggleDone(${i})">
        ${doneTasks.has(i)?'<i class="fa-solid fa-check"></i> Selesai':'Tandai Selesai'}
      </button>
    </div>
  `).join('');
}
function toggleDone(i) {
  if (doneTasks.has(i)) doneTasks.delete(i);
  else {
    doneTasks.add(i);
    logData.unshift({date:new Date().toLocaleString('id-ID'),unit:schedData[i].unit,type:schedData[i].title,officer:'Maheswari',status:'Selesai'});
    renderLog();
    showToast('<i class="fa-solid fa-check"></i> Tugas selesai — dicatat ke Log Maintenance','t-success');
  }
  renderSchedule();
}

/* ============================================================
   ADMIN: FORM
============================================================ */
function setCheck(btn, type) {
  const grp = btn.closest('.check-btns');
  grp.querySelectorAll('.ck-btn').forEach(b=>b.className='ck-btn');
  btn.classList.add(type==='ok'?'ok-active':'bad-active');
}
function saveForm() {
  const unit = document.getElementById('form-unit').value;
  if (!unit) { showToast('<i class="fa-solid fa-triangle-exclamation"></i> Pilih unit terlebih dahulu','t-error'); return; }
  logData.unshift({date:new Date().toLocaleString('id-ID'),unit:unit.split('·')[0].trim(),type:'Cek Fisik Lapangan',officer:'Maheswari',status:'Selesai'});
  renderLog();
  document.getElementById('form-unit').value='';
  document.querySelectorAll('.ck-btn').forEach(b=>b.className='ck-btn');
  document.getElementById('form-notes').value='';
  showToast('<i class="fa-solid fa-check"></i> Laporan berhasil disimpan ke Log Maintenance','t-success');
}

/* ============================================================
   ADMIN: LOG
============================================================ */
let logData = [
  {date:'30/06/2025 07:45',unit:'SPDWS-04',type:'Cek Rutin',        officer:'Maheswari', status:'Selesai'},
  {date:'29/06/2025 14:00',unit:'SPDWS-01',type:'Ganti Filter Air', officer:'Budi Santoso',status:'Selesai'},
  {date:'29/06/2025 10:30',unit:'SPDWS-08',type:'Isi Volume Air',   officer:'Maheswari', status:'Selesai'},
  {date:'28/06/2025 09:00',unit:'SPDWS-05',type:'Cek Lampu UV',     officer:'Rina Dewi',   status:'Selesai'},
  {date:'28/06/2025 13:00',unit:'SPDWS-02',type:'Cek Rutin',        officer:'Budi Santoso',status:'Selesai'},
  {date:'27/06/2025 16:00',unit:'SPDWS-03',type:'Ganti Filter Air', officer:'Maheswari', status:'Ditunda'},
  {date:'27/06/2025 08:00',unit:'SPDWS-06',type:'Isi Volume Air',   officer:'Rina Dewi',   status:'Selesai'},
  {date:'30/06/2025 10:00',unit:'SPDWS-07',type:'Isi Volume Air',   officer:'Budi Santoso',status:'Terjadwal'},
  {date:'30/06/2025 11:00',unit:'SPDWS-05',type:'Cek Lampu UV',     officer:'Maheswari', status:'Terjadwal'},
];
function renderLog() {
  const fu = document.getElementById('log-filter-unit').value;
  const fs = document.getElementById('log-filter-status').value;
  const map = {Selesai:'ls-done',Terjadwal:'ls-sched',Ditunda:'ls-late'};
  document.getElementById('log-tbody').innerHTML = logData
    .filter(r=>(!fu||r.unit===fu)&&(!fs||r.status===fs))
    .map(r=>`<tr>
      <td>${r.date}</td><td><strong>${r.unit}</strong></td>
      <td>${r.type}</td><td>${r.officer}</td>
      <td><span class="ls ${map[r.status]}">${r.status}</span></td>
    </tr>`).join('');
}

/* ============================================================
   ADMIN: PENGADUAN VIEW
============================================================ */
function renderPengaduanAdmin() {
  const fp = document.getElementById('peng-filter-prio')?.value || '';
  const fs = document.getElementById('peng-filter-status')?.value || '';
  const list = document.getElementById('peng-admin-list');
  if (!list) return;

  const filtered = pengaduanList.filter(p=>
    (!fp || p.prio===fp) && (!fs || p.status===fs)
  );

  document.getElementById('peng-admin-sub').textContent =
    `${pengaduanList.length} total laporan · ${pengaduanList.filter(p=>p.status==='Baru').length} baru belum ditangani`;

  if (filtered.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--n400);">
      <div style="font-size:48px;margin-bottom:12px;"><i class="fa-solid fa-inbox"></i></div>
      <div style="font-weight:700;font-size:16px;">Belum ada pengaduan</div>
      <div style="font-size:13px;margin-top:4px;">Laporan dari pengguna akan muncul di sini</div>
    </div>`;
    return;
  }

  const prioClass = {Tinggi:'pb-r',Sedang:'pb-y',Rendah:'pb-g'};
  const catClass  = {
    'Air tidak keluar':'pc-red','Air berbau/keruh':'pc-red','Kebocoran air':'pc-red',
    'Layar rusak':'pc-yellow','Mesin berbunyi aneh':'pc-yellow','Kerusakan fisik':'pc-yellow',
    'Sensor tidak respon':'pc-blue','Lainnya':'pc-green'
  };
  const statusClass = {Baru:'psa-new',Diproses:'psa-proc',Selesai:'psa-done'};

  list.innerHTML = filtered.map((p,idx)=>`
    <div class="peng-admin-card">
      <div>
        <span class="peng-cat-badge ${catClass[p.kat]||'pc-blue'}">${p.kat}</span>
      </div>
      <div style="flex:1;min-width:0;">
        <div class="peng-unit"><i class="fa-solid fa-building"></i> ${p.unit} · ${p.id}</div>
        <div class="peng-msg">${p.desc}</div>
        <div class="peng-meta">
          <i class="fa-regular fa-clock"></i> ${p.time}
          ${p.kontak!=='-'?' · <i class="fa-solid fa-phone"></i> '+p.kontak:''}
          ${p.star>0?' · '+'<i class="fa-solid fa-star"></i>'.repeat(p.star)+' ('+p.star+'/5)':''}
        </div>
        <div class="peng-status-admin ${statusClass[p.status]}">● ${p.status}</div>
      </div>
      <div class="peng-prio">
        <div class="prio-badge ${prioClass[p.prio]}">${p.prio}</div>
        <div style="margin-top:8px;display:flex;flex-direction:column;gap:4px;">
          ${p.status==='Baru'?`<button onclick="setPengStatus(${pengaduanList.indexOf(p)},'Diproses')" style="font-size:11px;padding:5px 10px;border-radius:7px;border:1px solid var(--y500);background:var(--y-bg);color:var(--y600);cursor:pointer;font-weight:700;">Proses</button>`:''}
          ${p.status!=='Selesai'?`<button onclick="setPengStatus(${pengaduanList.indexOf(p)},'Selesai')" style="font-size:11px;padding:5px 10px;border-radius:7px;border:1px solid var(--g500);background:var(--g-bg);color:var(--g600);cursor:pointer;font-weight:700;">Selesai</button>`:''}
        </div>
      </div>
    </div>
  `).join('');
}

function setPengStatus(idx, status) {
  pengaduanList[idx].status = status;
  updatePengaduanBadge();
  renderPengaduanHistory();
  renderPengaduanAdmin();
  showToast(`<i class="fa-solid fa-check"></i> Status pengaduan diperbarui: ${status}`,'t-success');
}

/* ============================================================
   TOAST
============================================================ */
function showToast(msg, cls='t-info') {
  const t = document.getElementById('toast');
  t.innerHTML = msg; t.className = `toast ${cls} show`;
  setTimeout(()=>t.className='toast', 3200);
}