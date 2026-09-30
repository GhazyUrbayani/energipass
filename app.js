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
const titles = { dashboard:'Beranda', tender:'Tender Gap Checker', evidence:'Evidence Library', pack:'Paket Tender' };

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
  return `<div class="status-summary" aria-label="Ringkasan readiness">
    <div class="status-stat"><div class="count">${c.ready}</div><div class="label">Ready</div></div>
    <div class="status-stat attention"><div class="count">${c.missing}</div><div class="label">Missing</div></div>
    <div class="status-stat"><div class="count" style="color:var(--red-700)">${c.expired}</div><div class="label">Expired</div></div>
    <div class="status-stat"><div class="count" style="color:var(--navy-700)">${c.review}</div><div class="label">Needs Review</div></div>
  </div>`;
}

function renderDashboard(){
  const t=getTender(), c=counts(t);
  const attention=t.requirements.filter(r=>r.status!=='ready').slice(0,5);
  main.innerHTML=`
    <div class="page-header">
      <div><span class="eyebrow">Vendor readiness</span><h1>Ketahui apa yang masih kurang sebelum tender ditutup.</h1><p>Fokus pada requirement yang membutuhkan tindakan, bukan pada dashboard dekoratif.</p></div>
      <div class="page-actions">${tenderSelector()}<button class="primary-button" id="open-gap">Buka Gap Checker</button></div>
    </div>
    <section class="tender-strip" aria-label="Tender aktif">
      <div><span class="eyebrow">Tender Aktif</span><h2>${esc(t.name)}</h2><p>${esc(t.buyer)} · Data contoh fiktif untuk demonstrasi</p></div>
      <div class="deadline-box"><span class="eyebrow">Deadline</span><strong>${esc(t.deadline)}</strong></div>
    </section>
    ${summaryMarkup(c)}
    <div class="content-grid two-col">
      <div>
        <section class="section">
          <div class="section-header"><div><h2 class="section-title">Perlu Tindakan</h2><p class="section-subtitle">Prioritas berdasarkan gap pada tender yang sedang dipilih.</p></div><span class="result-count">${attention.length} item utama</span></div>
          <div class="section-body"><div class="action-list">
            ${attention.map(r=>`<div class="action-item"><div><div class="action-title">${esc(r.requirement)}</div><div class="action-meta">${esc(r.note)}</div></div><button class="action-button" data-requirement="${r.id}">${r.status==='missing'?'Tambah Evidence':r.status==='expired'?'Perbarui Evidence':'Lihat Requirement'}</button></div>`).join('') || '<div class="callout success"><strong>Semua requirement siap.</strong><p>Tetap lakukan pengecekan akhir terhadap dokumen tender resmi.</p></div>'}
          </div></div>
        </section>
        <section class="section">
          <div class="section-header"><div><h2 class="section-title">Aktivitas Evidence Terbaru</h2><p class="section-subtitle">Jejak perubahan operasional yang relevan untuk kesiapan tender.</p></div></div>
          <div class="section-body"><ul class="activity-list">${DATA.activities.map(a=>`<li><div class="activity-time">${esc(a.time)}</div><div class="activity-main"><strong>${esc(a.item)}</strong><span>${esc(a.action)} · ${esc(a.source)}</span></div></li>`).join('')}</ul></div>
        </section>
      </div>
      <div>
        <section class="section">
          <div class="section-header"><div><h2 class="section-title">Posisi EnergiPass</h2><p class="section-subtitle">Layer kesiapan, bukan pengganti sistem resmi.</p></div></div>
          <div class="section-body">
            <div class="source-compare"><div class="source-box"><strong>CIVD / Buyer VMS</strong><span>Official qualification / source-of-truth process</span></div><div class="source-arrow">→</div><div class="source-box"><strong>EnergiPass</strong><span>Readiness dan evidence-mapping layer sebelum submission</span></div></div>
            <div class="callout neutral" style="margin-top:16px"><strong>EnergiPass tidak menggantikan CIVD atau sistem procurement buyer.</strong><p>Referensi atau tautkan evidence yang sudah ada bila memungkinkan.</p></div>
          </div>
        </section>
        <section class="section">
          <div class="section-header"><div><h2 class="section-title">Traceability</h2><p class="section-subtitle">Evidence dapat ditelusuri sebelum digunakan.</p></div></div>
          <div class="section-body"><div class="meta-list"><div class="meta-item"><span>Last workspace update</span><strong>${esc(DATA.vendor.lastSync)}</strong></div><div class="meta-item"><span>Vendor ID</span><strong>${esc(DATA.vendor.id)}</strong></div><div class="meta-item"><span>Mode</span><strong>Data mock</strong></div><div class="meta-item"><span>Authority</span><strong>Tidak ada approval resmi</strong></div></div></div>
        </section>
      </div>
    </div>`;
  bindTenderSelector();
  document.getElementById('open-gap').addEventListener('click',()=>routeTo('tender'));
  document.querySelectorAll('[data-requirement]').forEach(btn=>btn.addEventListener('click',()=>routeTo('tender')));
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
      <div><span class="eyebrow">Hero feature · Gap checker</span><h1>${esc(t.name)}</h1><p>${esc(t.buyer)} · Deadline ${esc(t.deadline)}</p></div>
      <div class="page-actions">${tenderSelector()}<button class="secondary-button" id="go-pack">Lihat Paket Tender</button></div>
    </div>
    ${summaryMarkup(c)}
    <div class="callout neutral" style="margin-bottom:20px"><strong>Status readiness bukan keputusan kualifikasi vendor.</strong><p>Buyer dan sistem resmi tetap menentukan evidence yang diterima.</p></div>
    <section class="section">
      <div class="section-header"><div><h2 class="section-title">Requirement & Evidence Mapping</h2><p class="section-subtitle">Periksa kecocokan evidence, sumber, masa berlaku, dan tindakan berikutnya.</p></div><span class="result-count">${filtered.length} dari ${t.requirements.length} requirement</span></div>
      <div class="toolbar">
        <div class="field grow"><label for="tender-search">Cari requirement atau evidence</label><input class="input" id="tender-search" value="${esc(state.tenderSearch)}" placeholder="Contoh: TKDN, ISO 14001, CSMS…"></div>
        <div class="field"><label for="status-filter">Status</label><select class="select" id="status-filter"><option value="all">Semua status</option>${Object.entries(labels).map(([v,l])=>`<option value="${v}" ${state.tenderStatus===v?'selected':''}>${l}</option>`).join('')}</select></div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Requirement</th><th>Evidence Vendor</th><th>Source</th><th>Validity</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${filtered.map(r=>{
          const ev=r.evidenceId?getEvidence(r.evidenceId):null;
          return `<tr><td><div class="cell-title">${esc(r.requirement)}</div><div class="cell-sub">${esc(r.note)}</div></td><td>${ev?`<div class="cell-title">${esc(ev.name)}</div><div class="cell-sub">${esc(ev.version)}</div>`:'<span class="cell-sub">Belum dipetakan</span>'}</td><td>${esc(r.source)}</td><td class="no-wrap">${esc(r.validity)}</td><td>${statusLabel(r.status)}</td><td>${ev?`<button class="action-button" data-evidence="${ev.id}">Lihat</button>`:`<button class="action-button prominent" data-add="${r.id}">Tambah Evidence</button>`}</td></tr>`;
        }).join('') || `<tr><td colspan="6"><div class="empty-state">Tidak ada requirement yang sesuai filter.</div></td></tr>`}</tbody>
      </table></div>
    </section>`;
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
    <div class="page-header"><div><span class="eyebrow">Evidence Library</span><h1>Evidence yang dapat ditelusuri dan digunakan ulang.</h1><p>Reference / link existing evidence where possible. EnergiPass tidak dimaksudkan menjadi source of truth baru.</p></div><div class="page-actions"><button class="secondary-button" id="back-tender">Kembali ke Tender</button><button class="primary-button" id="demo-add">Tambah Evidence</button></div></div>
    <section class="section">
      <div class="toolbar">
        <div class="field grow"><label for="evidence-search">Cari dokumen, sertifikat, atau evidence</label><input class="input" id="evidence-search" value="${esc(state.evidenceSearch)}" placeholder="Cari dokumen, sertifikat, atau evidence…"></div>
        <div class="field"><label for="category-filter">Jenis Evidence</label><select class="select" id="category-filter"><option value="all">Semua jenis</option>${categories.map(c=>`<option ${state.evidenceCategory===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
        <div class="field"><label for="evidence-status">Status</label><select class="select" id="evidence-status"><option value="all">Semua status</option>${Object.entries(labels).map(([v,l])=>`<option value="${v}" ${state.evidenceStatus===v?'selected':''}>${l}</option>`).join('')}</select></div>
        <div class="field"><label for="validity-filter">Masa Berlaku</label><select class="select" id="validity-filter"><option value="all">Semua</option><option value="active" ${state.evidenceValidity==='active'?'selected':''}>Aktif / tidak kedaluwarsa</option><option value="expired" ${state.evidenceValidity==='expired'?'selected':''}>Kedaluwarsa</option></select></div>
      </div>
      <div class="section-header"><div><h2 class="section-title">Daftar Evidence</h2><p class="section-subtitle">Sumber, versi, dan validity tetap terlihat sebelum evidence digunakan.</p></div><span class="result-count">${rows.length} evidence</span></div>
      <div class="table-wrap"><table><thead><tr><th>Evidence</th><th>Category</th><th>Source</th><th>Issued Date</th><th>Expiry</th><th>Used In</th><th>Status</th><th>Action</th></tr></thead><tbody>
        ${rows.map(ev=>`<tr><td><div class="cell-title">${esc(ev.name)}</div><div class="cell-sub">${esc(ev.reference)}</div></td><td>${esc(ev.category)}</td><td>${esc(ev.source)}</td><td class="no-wrap">${esc(ev.issued)}</td><td class="no-wrap">${esc(ev.expiry)}</td><td>${ev.usedIn.map(id=>`<span class="cell-sub">${esc(DATA.tenders.find(t=>t.id===id)?.name||id)}</span>`).join('')}</td><td>${statusLabel(ev.status)}</td><td><button class="action-button" data-evidence="${ev.id}">Lihat</button></td></tr>`).join('') || '<tr><td colspan="8"><div class="empty-state">Tidak ada evidence yang sesuai filter.</div></td></tr>'}
      </tbody></table></div>
    </section>
    <div class="callout neutral" style="margin-top:20px"><strong>Prinsip data</strong><p>EnergiPass menyimpan mapping dan metadata readiness. Evidence sebaiknya tetap merujuk ke sumber yang relevan apabila sumber tersebut sudah tersedia.</p></div>`;
  document.getElementById('back-tender').addEventListener('click',()=>routeTo('tender'));
  document.getElementById('demo-add').addEventListener('click',()=>alert('MVP: alur tambah evidence disimulasikan. Implementasi produksi perlu menentukan sumber dokumen dan kontrol akses.'));
  document.getElementById('evidence-search').addEventListener('input',e=>{state.evidenceSearch=e.target.value;renderEvidence();document.getElementById('evidence-search')?.focus();});
  document.getElementById('category-filter').addEventListener('change',e=>{state.evidenceCategory=e.target.value;renderEvidence();});
  document.getElementById('evidence-status').addEventListener('change',e=>{state.evidenceStatus=e.target.value;renderEvidence();});
  document.getElementById('validity-filter').addEventListener('change',e=>{state.evidenceValidity=e.target.value;renderEvidence();});
  document.querySelectorAll('[data-evidence]').forEach(btn=>btn.addEventListener('click',()=>openDrawer(btn.dataset.evidence)));
}

function renderPack(){
  const t=getTender();
  const categoryMap={Legal:[],Technical:[],HSE:[],TKDN:[],ESG:[],'Project Experience':[]};
  t.requirements.forEach(r=>{
    const ev=r.evidenceId?getEvidence(r.evidenceId):null;
    let cat=ev?.category;
    if(!cat){
      const req=r.requirement.toLowerCase();
      if(req.includes('csms')||req.includes('hse')||req.includes('polis')) cat='HSE';
      else if(req.includes('tkdn')||req.includes('local content')) cat='TKDN';
      else if(req.includes('project')||req.includes('pengalaman')||req.includes('referensi')) cat='Project Experience';
      else if(req.includes('lingkungan')||req.includes('esg')||req.includes('anti-bribery')) cat='ESG';
      else if(req.includes('nib')||req.includes('npwp')||req.includes('akta')||req.includes('bank')||req.includes('integritas')) cat='Legal';
      else cat='Technical';
    }
    (categoryMap[cat] ||= []).push(r);
  });
  const c=counts(t); const unresolved=c.missing+c.expired+c.review;
  const included=t.requirements.filter(r=>r.evidenceId&&r.status==='ready').length;
  main.innerHTML=`
    <div class="page-header"><div><span class="eyebrow">Output kesiapan tender</span><h1>Paket Tender</h1><p>Ringkasan evidence yang siap digunakan untuk ${esc(t.name)}.</p></div><div class="page-actions">${tenderSelector()}<button class="secondary-button" id="see-gap">Lihat Gap</button></div></div>
    <div class="pack-grid">
      <section class="section">
        <div class="section-header"><div><h2 class="section-title">Readiness per kategori</h2><p class="section-subtitle">Status ini hanya menunjukkan kesiapan evidence di workspace.</p></div></div>
        <div class="section-body"><div class="category-progress">
          ${Object.entries(categoryMap).map(([cat,items])=>{const ready=items.filter(x=>x.status==='ready').length;const pct=items.length?Math.round(ready/items.length*100):0;return `<div class="progress-row"><div class="progress-name">${esc(cat)}</div><div class="progress-track" aria-label="${pct}% ready"><div class="progress-fill" style="width:${pct}%"></div></div><div class="progress-count">${ready}/${items.length} Ready</div></div>`}).join('')}
        </div></div>
      </section>
      <div>
        <section class="section">
          <div class="section-header"><div><h2 class="section-title">Siapkan Paket</h2><p class="section-subtitle">Generate hanya menyiapkan bundle demonstrasi.</p></div></div>
          <div class="section-body">
            <div class="callout ${unresolved?'warning':'success'}"><strong>${unresolved} requirement masih perlu ditinjau atau diselesaikan.</strong><p>Periksa gap sebelum mengirimkan dokumen melalui sistem buyer yang resmi.</p></div>
            <button class="primary-button" id="generate-pack" style="width:100%;margin-top:16px">Generate Tender Pack</button>
            <button class="secondary-button" id="see-gap-2" style="width:100%;margin-top:10px">Lihat Gap</button>
            <p class="subtle-note">Tidak ada approval resmi yang dibuat oleh tindakan ini.</p>
          </div>
        </section>
      </div>
    </div>
    ${state.generated?`<div class="confirm-panel" role="status" aria-live="polite"><h3>Paket Tender berhasil disiapkan.</h3><p>Bundle demonstrasi telah dibuat untuk review internal sebelum submission pada sistem buyer.</p><div class="confirm-metrics"><div class="confirm-metric"><span>Evidence included</span><strong>${included}</strong></div><div class="confirm-metric"><span>Unresolved items</span><strong>${unresolved}</strong></div><div class="confirm-metric"><span>Generated</span><strong>30 Sep 2026<br><small>08:48 WIB</small></strong></div></div></div>`:''}
    <div class="callout neutral" style="margin-top:20px"><strong>EnergiPass tidak menggantikan CIVD atau sistem procurement buyer.</strong><p>Paket ini adalah output kesiapan internal, bukan bukti kelulusan kualifikasi.</p></div>`;
  bindTenderSelector();
  const go=()=>routeTo('tender'); document.getElementById('see-gap').addEventListener('click',go);document.getElementById('see-gap-2').addEventListener('click',go);
  document.getElementById('generate-pack').addEventListener('click',()=>{state.generated=true;renderPack();});
}

function openDrawer(id){
  const ev=getEvidence(id); if(!ev)return;
  document.getElementById('drawer-title').textContent=ev.name;
  document.getElementById('drawer-content').innerHTML=`
    <div class="callout ${ev.status==='expired'?'warning':'neutral'}"><strong>${labels[ev.status]}</strong><p>${ev.status==='expired'?'Evidence ini perlu diperbarui sebelum digunakan sebagai dokumen yang berlaku.':'Periksa kembali sumber dan requirement tender sebelum submission.'}</p></div>
    <dl class="detail-grid" style="margin-top:18px"><dt>Category</dt><dd>${esc(ev.category)}</dd><dt>Source</dt><dd>${esc(ev.source)}</dd><dt>Reference</dt><dd>${esc(ev.reference)}</dd><dt>Version</dt><dd>${esc(ev.version)}</dd><dt>Effective date</dt><dd>${esc(ev.effective)}</dd><dt>Expiry / valid until</dt><dd>${esc(ev.expiry)}</dd><dt>Last updated</dt><dd>${esc(ev.updated)}</dd><dt>Status</dt><dd>${statusLabel(ev.status)}</dd></dl>
    <div class="callout neutral" style="margin-top:18px"><strong>Traceability note</strong><p>Metadata ini menunjukkan sumber dan versi evidence. EnergiPass tidak mengubah dokumen menjadi approval resmi.</p></div>`;
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
