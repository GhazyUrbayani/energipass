const DATA = window.ENERGIPASS_DATA;
const state = {
  route: 'dashboard',
  tenderId: 'solar-a',
  tenderStatus: 'all',
  tenderSearch: '',
  evidenceSearch: '',
  evidenceCategory: 'all',
  evidenceStatus: 'all',
  evidenceValidity: 'all',
  generated: false,
};

const main = document.getElementById('main-content');
const topbarTitle = document.getElementById('topbar-title');
const sidebar = document.querySelector('.sidebar');
const mobileMenu = document.getElementById('mobile-menu');
const helpDialog = document.getElementById('help-dialog');

const labels = { ready:'Ready', missing:'Missing', expired:'Expired', review:'Needs Review' };
const titles = { dashboard:'Beranda', tender:'Detail Tender', evidence:'Evidence', pack:'Paket Tender' };

function getTender(){ return DATA.tenders.find(t => t.id === state.tenderId) || DATA.tenders[0]; }
function getEvidence(id){ return DATA.evidence.find(e => e.id === id); }
function counts(tender = getTender()){
  return tender.requirements.reduce((acc,r)=>{acc[r.status]=(acc[r.status]||0)+1;return acc;},{ready:0,missing:0,expired:0,review:0});
}
function statusLabel(status){ return `<span class="status-label status-${status}"><span class="status-dot" aria-hidden="true"></span>${labels[status]}</span>`; }
function esc(value=''){ return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }

function routeTo(route){
  state.route = route;
  state.generated = false;
  document.querySelectorAll('.nav-item').forEach(btn => {
    const active = btn.dataset.route === route;
    btn.classList.toggle('active', active);
    active ? btn.setAttribute('aria-current','page') : btn.removeAttribute('aria-current');
  });
  topbarTitle.textContent = titles[route];
  sidebar.classList.remove('open');
  mobileMenu.setAttribute('aria-expanded','false');
  render();
  window.scrollTo({top:0, behavior:'smooth'});
  main.focus({preventScroll:true});
}

document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click',()=>routeTo(btn.dataset.route)));
mobileMenu.addEventListener('click',()=>{
  const open = sidebar.classList.toggle('open');
  mobileMenu.setAttribute('aria-expanded', String(open));
});
document.getElementById('help-button').addEventListener('click',()=>helpDialog.showModal());
document.getElementById('help-close').addEventListener('click',()=>helpDialog.close());

function tenderSelector(){
  return `<label class="field"><span class="eyebrow">Tender aktif</span><select class="inline-select" id="tender-select" aria-label="Pilih tender">${DATA.tenders.map(t=>`<option value="${t.id}" ${t.id===state.tenderId?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label>`;
}
function bindTenderSelector(){
  const sel = document.getElementById('tender-select');
  if(sel) sel.addEventListener('change', e=>{ state.tenderId=e.target.value; state.generated=false; render(); });
}

function summaryMarkup(c){
  return `<div class="status-summary" aria-label="Ringkasan kesiapan">
    <div class="status-stat"><div class="count">${c.ready}</div><div class="label">Ready</div></div>
    <div class="status-stat attention"><div class="count">${c.missing}</div><div class="label">Missing</div></div>
    <div class="status-stat"><div class="count" style="color:var(--red-700)">${c.expired}</div><div class="label">Expired</div></div>
    <div class="status-stat"><div class="count" style="color:var(--navy-700)">${c.review}</div><div class="label">Needs Review</div></div>
  </div>`;
}

function renderDashboard(){
  const t=getTender(), c=counts(t);
  const unresolved=c.missing+c.expired+c.review;
  const attention=t.requirements.filter(r=>r.status!=='ready').slice(0,5);
  main.innerHTML=`
    <div class="page-header">
      <div><h1>Kesiapan tender</h1></div>
      <div class="page-actions">${tenderSelector()}<button class="primary-button" id="open-gap">Periksa Tender</button></div>
    </div>
    <section class="tender-strip" aria-label="Tender aktif">
      <div><span class="eyebrow">Tender Aktif</span><h2>${esc(t.name)}</h2><p>${esc(t.buyer)}</p></div>
      <div class="deadline-box"><span class="eyebrow">Deadline</span><strong>${esc(t.deadline)}</strong></div>
    </section>
    ${summaryMarkup(c)}
    <div class="content-grid dashboard-grid">
      <div>
        <section class="section">
          <div class="section-header"><h2 class="section-title">Perlu Tindakan</h2><span class="result-count">${attention.length} dari ${unresolved}</span></div>
          <div class="section-body"><div class="action-list">
            ${attention.map(r=>`<div class="action-item"><div><div class="action-title">${esc(r.requirement)}</div><div class="action-meta">${esc(r.status==='expired'?r.validity:r.note)}</div></div><button class="action-button" data-requirement="${r.id}">${r.status==='missing'?'Tambah Evidence':r.status==='expired'?'Perbarui':'Periksa'}</button></div>`).join('') || '<div class="callout success"><strong>Semua persyaratan siap.</strong></div>'}
          </div></div>
          ${unresolved>attention.length?`<div class="section-footer"><button class="text-button" id="all-gaps">Lihat semua (${unresolved})</button></div>`:''}
        </section>
      </div>
      <div>
        <section class="section">
          <div class="section-header"><h2 class="section-title">Aktivitas terbaru</h2></div>
          <div class="section-body"><ul class="activity-list">${DATA.activities.map(a=>`<li><div class="activity-time">${esc(a.time)}</div><div class="activity-main"><strong>${esc(a.item)}</strong><span>${esc(a.action)} · ${esc(a.source)}</span></div></li>`).join('')}</ul></div>
        </section>
      </div>
    </div>`;
  bindTenderSelector();
  document.getElementById('open-gap').addEventListener('click',()=>routeTo('tender'));
  document.getElementById('all-gaps')?.addEventListener('click',()=>{state.tenderStatus='all';state.tenderSearch='';routeTo('tender');});
  document.querySelectorAll('[data-requirement]').forEach(btn=>btn.addEventListener('click',()=>{
    const r=t.requirements.find(item=>item.id===btn.dataset.requirement);
    state.tenderStatus='all';state.tenderSearch=r.requirement;routeTo('tender');
  }));
}

function renderTender(){
  const t=getTender(), c=counts(t);
  const filtered=t.requirements.filter(r=>{
    const matchStatus=state.tenderStatus==='all'||r.status===state.tenderStatus;
    const q=state.tenderSearch.trim().toLowerCase();
    const ev=r.evidenceId?getEvidence(r.evidenceId):null;
    const matchSearch=!q||r.requirement.toLowerCase().includes(q)||(ev?.name||'').toLowerCase().includes(q);
    return matchStatus&&matchSearch;
  });
  main.innerHTML=`
    <div class="page-header">
      <div><h1>${esc(t.name)}</h1><p>${esc(t.buyer)} · Deadline ${esc(t.deadline)}</p></div>
      <div class="page-actions">${tenderSelector()}<button class="secondary-button" id="go-pack">Lihat Paket Tender</button></div>
    </div>
    ${summaryMarkup(c)}
    <section class="section">
      <div class="section-header"><h2 class="section-title">Persyaratan tender</h2><span class="result-count">${filtered.length} dari ${t.requirements.length}</span></div>
      <div class="toolbar">
        <div class="field grow"><label for="tender-search">Cari persyaratan atau evidence</label><input class="input" id="tender-search" value="${esc(state.tenderSearch)}" placeholder="TKDN, ISO 14001, CSMS…"></div>
        <div class="field"><label for="status-filter">Status</label><select class="select" id="status-filter"><option value="all">Semua status</option>${Object.entries(labels).map(([v,l])=>`<option value="${v}" ${state.tenderStatus===v?'selected':''}>${l}</option>`).join('')}</select></div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Persyaratan</th><th>Evidence</th><th>Sumber</th><th>Masa berlaku</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>${filtered.map(r=>{
          const ev=r.evidenceId?getEvidence(r.evidenceId):null;
          return `<tr><td><div class="cell-title">${esc(r.requirement)}</div>${r.note?`<div class="cell-sub">${esc(r.note)}</div>`:''}</td><td>${ev?`<div class="cell-title">${esc(ev.name)}</div><div class="cell-sub">${esc(ev.version)}</div>`:'<span class="cell-sub">Belum ditautkan</span>'}</td><td>${esc(r.source)}</td><td class="no-wrap">${esc(r.validity)}</td><td>${statusLabel(r.status)}</td><td>${ev?`<button class="action-button" data-evidence="${ev.id}">Lihat</button>`:`<button class="action-button prominent" data-add="${r.id}">Tambah Evidence</button>`}</td></tr>`;
        }).join('') || `<tr><td colspan="6"><div class="empty-state">Tidak ada persyaratan yang sesuai.</div></td></tr>`}</tbody>
      </table></div>
    </section>
    <p class="subtle-note">Kualifikasi tetap ditentukan buyer melalui sistem resmi.</p>`;
  bindTenderSelector();
  document.getElementById('go-pack').addEventListener('click',()=>routeTo('pack'));
  document.getElementById('tender-search').addEventListener('input',e=>{state.tenderSearch=e.target.value;renderTender();document.getElementById('tender-search')?.focus();});
  document.getElementById('status-filter').addEventListener('change',e=>{state.tenderStatus=e.target.value;renderTender();});
  document.querySelectorAll('[data-evidence]').forEach(btn=>btn.addEventListener('click',()=>openDrawer(btn.dataset.evidence)));
  document.querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',()=>{ state.evidenceSearch=''; routeTo('evidence'); }));
}

function renderEvidence(){
  const q=state.evidenceSearch.trim().toLowerCase();
  const rows=DATA.evidence.filter(ev=>{
    const mQ=!q||[ev.name,ev.category,ev.source,ev.reference].join(' ').toLowerCase().includes(q);
    const mC=state.evidenceCategory==='all'||ev.category===state.evidenceCategory;
    const mS=state.evidenceStatus==='all'||ev.status===state.evidenceStatus;
    const isExp=ev.status==='expired';
    const mV=state.evidenceValidity==='all'||(state.evidenceValidity==='expired'&&isExp)||(state.evidenceValidity==='active'&&!isExp);
    return mQ&&mC&&mS&&mV;
  });
  const categories=[...new Set(DATA.evidence.map(e=>e.category))];
  main.innerHTML=`
    <div class="page-header"><div><h1>Evidence</h1></div><div class="page-actions"><button class="secondary-button" id="back-tender">Kembali ke Tender</button><button class="primary-button" id="demo-add">Tambah Evidence</button></div></div>
    <section class="section">
      <div class="toolbar">
        <div class="field grow"><label for="evidence-search">Cari evidence</label><input class="input" id="evidence-search" value="${esc(state.evidenceSearch)}" placeholder="Nama dokumen atau sertifikat…"></div>
        <div class="field"><label for="category-filter">Jenis Evidence</label><select class="select" id="category-filter"><option value="all">Semua jenis</option>${categories.map(c=>`<option ${state.evidenceCategory===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
        <div class="field"><label for="evidence-status">Status</label><select class="select" id="evidence-status"><option value="all">Semua status</option>${Object.entries(labels).map(([v,l])=>`<option value="${v}" ${state.evidenceStatus===v?'selected':''}>${l}</option>`).join('')}</select></div>
        <div class="field"><label for="validity-filter">Masa Berlaku</label><select class="select" id="validity-filter"><option value="all">Semua</option><option value="active" ${state.evidenceValidity==='active'?'selected':''}>Belum kedaluwarsa</option><option value="expired" ${state.evidenceValidity==='expired'?'selected':''}>Kedaluwarsa</option></select></div>
      </div>
      <div class="section-header"><h2 class="section-title">Daftar Evidence</h2><span class="result-count">${rows.length} evidence</span></div>
      <div class="table-wrap"><table><thead><tr><th>Evidence</th><th>Kategori</th><th>Sumber</th><th>Terbit</th><th>Berlaku hingga</th><th>Digunakan di</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
        ${rows.map(ev=>`<tr><td><div class="cell-title">${esc(ev.name)}</div><div class="cell-sub">${esc(ev.reference)}</div></td><td>${esc(ev.category)}</td><td>${esc(ev.source)}</td><td class="no-wrap">${esc(ev.issued)}</td><td class="no-wrap">${esc(ev.expiry)}</td><td>${ev.usedIn.map(id=>`<span class="cell-sub">${esc(DATA.tenders.find(t=>t.id===id)?.name||id)}</span>`).join('')}</td><td>${statusLabel(ev.status)}</td><td><button class="action-button" data-evidence="${ev.id}">Lihat</button></td></tr>`).join('') || '<tr><td colspan="8"><div class="empty-state">Tidak ada evidence yang sesuai.</div></td></tr>'}
      </tbody></table></div>
    </section>`;
  document.getElementById('back-tender').addEventListener('click',()=>routeTo('tender'));
  document.getElementById('demo-add').addEventListener('click',()=>alert('Penambahan evidence belum tersedia di demo.'));
  document.getElementById('evidence-search').addEventListener('input',e=>{state.evidenceSearch=e.target.value;renderEvidence();document.getElementById('evidence-search')?.focus();});
  document.getElementById('category-filter').addEventListener('change',e=>{state.evidenceCategory=e.target.value;renderEvidence();});
  document.getElementById('evidence-status').addEventListener('change',e=>{state.evidenceStatus=e.target.value;renderEvidence();});
  document.getElementById('validity-filter').addEventListener('change',e=>{state.evidenceValidity=e.target.value;renderEvidence();});
  document.querySelectorAll('[data-evidence]').forEach(btn=>btn.addEventListener('click',()=>openDrawer(btn.dataset.evidence)));
}

function renderPack(){
  const t=getTender();
  const categoryMap={Legal:[],Teknis:[],HSE:[],TKDN:[],ESG:[],'Pengalaman proyek':[]};
  t.requirements.forEach(r=>{
    const ev=r.evidenceId?getEvidence(r.evidenceId):null;
    let cat=ev?.category;
    if(!cat){
      const req=r.requirement.toLowerCase();
      if(req.includes('csms')||req.includes('hse')||req.includes('polis')) cat='HSE';
      else if(req.includes('tkdn')||req.includes('local content')) cat='TKDN';
      else if(req.includes('project')||req.includes('pengalaman')||req.includes('referensi')) cat='Pengalaman proyek';
      else if(req.includes('lingkungan')||req.includes('esg')||req.includes('anti-bribery')) cat='ESG';
      else if(req.includes('nib')||req.includes('npwp')||req.includes('akta')||req.includes('bank')||req.includes('integritas')) cat='Legal';
      else cat='Teknis';
    }
    (categoryMap[cat] ||= []).push(r);
  });
  const c=counts(t); const unresolved=c.missing+c.expired+c.review;
  const included=t.requirements.filter(r=>r.evidenceId&&r.status==='ready').length;
  main.innerHTML=`
    <div class="page-header"><div><h1>Paket Tender</h1><p>${esc(t.name)}</p></div><div class="page-actions">${tenderSelector()}<button class="secondary-button" id="see-gap">Periksa Persyaratan</button></div></div>
    <div class="pack-grid">
      <section class="section">
        <div class="section-header"><h2 class="section-title">Kesiapan per kategori</h2></div>
        <div class="section-body"><div class="category-progress">
          ${Object.entries(categoryMap).map(([cat,items])=>{const ready=items.filter(x=>x.status==='ready').length;const pct=items.length?Math.round(ready/items.length*100):0;return `<div class="progress-row"><div class="progress-name">${esc(cat)}</div><div class="progress-track" aria-label="${pct}% ready"><div class="progress-fill" style="width:${pct}%"></div></div><div class="progress-count">${ready}/${items.length} Ready</div></div>`}).join('')}
        </div></div>
      </section>
      <div>
        <section class="section">
          <div class="section-header"><h2 class="section-title">Siapkan Paket</h2></div>
          <div class="section-body">
            <div class="callout ${unresolved?'warning':'success'}"><strong>${unresolved?`${unresolved} persyaratan perlu tindakan.`:'Semua persyaratan siap.'}</strong></div>
            <button class="primary-button" id="generate-pack" style="width:100%;margin-top:16px">Siapkan Paket</button>
            <button class="secondary-button" id="see-gap-2" style="width:100%;margin-top:10px">Periksa Persyaratan</button>
            <p class="subtle-note">Simulasi paket tender.</p>
          </div>
        </section>
      </div>
    </div>
    ${state.generated?`<div class="confirm-panel" role="status" aria-live="polite"><h3>Paket demo siap.</h3><div class="confirm-metrics"><div class="confirm-metric"><span>Evidence siap</span><strong>${included}</strong></div><div class="confirm-metric"><span>Perlu tindakan</span><strong>${unresolved}</strong></div><div class="confirm-metric"><span>Disiapkan</span><strong>30 Sep 2026<br><small>08:48 WIB</small></strong></div></div></div>`:''}
    <p class="subtle-note">Paket ini bukan bukti kelulusan kualifikasi. Pengajuan tetap melalui sistem buyer.</p>`;
  bindTenderSelector();
  const go=()=>routeTo('tender'); document.getElementById('see-gap').addEventListener('click',go);document.getElementById('see-gap-2').addEventListener('click',go);
  document.getElementById('generate-pack').addEventListener('click',()=>{state.generated=true;renderPack();});
}

function openDrawer(id){
  const ev=getEvidence(id); if(!ev)return;
  document.getElementById('drawer-title').textContent=ev.name;
  document.getElementById('drawer-content').innerHTML=`
    ${ev.status==='expired'?'<div class="callout warning"><strong>Perbarui sebelum digunakan.</strong></div>':''}
    <dl class="detail-grid"><dt>Kategori</dt><dd>${esc(ev.category)}</dd><dt>Sumber</dt><dd>${esc(ev.source)}</dd><dt>Referensi</dt><dd>${esc(ev.reference)}</dd><dt>Versi</dt><dd>${esc(ev.version)}</dd><dt>Berlaku sejak</dt><dd>${esc(ev.effective)}</dd><dt>Berlaku hingga</dt><dd>${esc(ev.expiry)}</dd><dt>Diperbarui</dt><dd>${esc(ev.updated)}</dd><dt>Status</dt><dd>${statusLabel(ev.status)}</dd></dl>`;
  const drawer=document.getElementById('evidence-drawer'),backdrop=document.getElementById('drawer-backdrop');
  drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');backdrop.hidden=false;document.getElementById('drawer-close').focus();
}
function closeDrawer(){const drawer=document.getElementById('evidence-drawer');drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.getElementById('drawer-backdrop').hidden=true;}
document.getElementById('drawer-close').addEventListener('click',closeDrawer);document.getElementById('drawer-backdrop').addEventListener('click',closeDrawer);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer();});

function render(){
  if(state.route==='dashboard')renderDashboard();
  if(state.route==='tender')renderTender();
  if(state.route==='evidence')renderEvidence();
  if(state.route==='pack')renderPack();
}
render();
