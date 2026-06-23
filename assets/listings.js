/* ════════════════════════════════════════════
   IMONDO — listings.js  (Sesiunea 4, spec complet)
   Listare proprietăți pentru vanzari.html / inchirieri.html.
   - Citește Firestore (status === 'activ'), filtrează pe tip_tranzactie
   - La intrare: TOATE ofertele (fără filtru aplicat)
   - Filtrare INSTANT (fără buton Aplică)
   - Multi-select ZONE + multi-select CAMERE (checkbox-uri)
   - Filtre ADAPTIVE per tipologie (afișează doar criteriile relevante)
   - Filtre: zonă, camere, suprafață, etaj, buget, facilități
   - Pre-completare din URL (compatibil cu filtrul hero)
   - Card → proprietate.html?id=

   Pagina apelează:  initListings({ type:'vanzare'|'inchiriere' })
   și oferă containerele: #listFilter #listMeta #listLoading #listGrid
   ════════════════════════════════════════════ */
const FIREBASE_CONFIG = window.IMONDO_FIREBASE_CONFIG || {
  apiKey: "AIzaSyCisA7tcMYHAv46aqcne3DpKL1_YIKiApE",
  authDomain: "imondo-crm.firebaseapp.com",
  projectId: "imondo-crm",
  storageBucket: "imondo-crm.firebasestorage.app",
  messagingSenderId: "777057248353",
  appId: "1:777057248353:web:3a4fee4d6618451eb3f620"
};
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700&q=85';
const TIPOLOGII = ['Apartament','Garsonieră','Casă/Vilă','Duplex','Teren','Spațiu comercial','Spațiu birouri'];

/* Reguli adaptive: ce grupuri de filtre se afișează per tipologie */
const ADAPTIVE = {
  '':                 ['zona','camere','suprafata','etaj','buget','facilitati'],
  'Apartament':       ['zona','camere','suprafata','etaj','buget','facilitati'],
  'Garsonieră':       ['zona','camere','suprafata','etaj','buget','facilitati'],
  'Duplex':           ['zona','camere','suprafata','etaj','buget','facilitati'],
  'Casă/Vilă':        ['zona','camere','suprafata','buget','facilitati'],
  'Teren':            ['zona','suprafata','buget'],
  'Spațiu comercial': ['zona','suprafata','buget','facilitati'],
  'Spațiu birouri':   ['zona','suprafata','buget','facilitati']
};

const $ = id => document.getElementById(id);
const L = () => (window.T_SHARED && window.T_SHARED[document.documentElement.lang||'ro']) || window.T_SHARED.ro;
const isRentOf = p => (p.tip_tranzactie||p.tipTranzactie||'').toLowerCase().includes('inchir');

let PAGE_TYPE = 'vanzare';
let pool = [];
let f = { tip:'', zone:new Set(), camere:new Set(), supraf_min:'', supraf_max:'', etaj_min:'', etaj_max:'', buget:'', fac:new Set() };

/* ── helperi card ── */
function fmtPrice(p){
  const pret = p.pret || p.pret_nou || 0;
  return pret ? new Intl.NumberFormat('de-DE').format(pret) + ' €' + (isRentOf(p) ? ' <small>/ lună</small>' : '') : 'Preț la cerere';
}
function titleOf(p){
  const camere = p.camere || p.nrCamere || '';
  const zona = p.zona || p.adresa || '';
  return p.denumire || p.titlu || ((p.tipologie||p.tipProprietate||'Proprietate') + (camere ? ' ' + camere + ' camere' : '') + (zona ? ', ' + zona : ''));
}
function card(p){
  const isRent = isRentOf(p);
  const img = (p.poze||p.imagini||[])[0] || FALLBACK_IMG;
  const url = 'proprietate.html?id=' + encodeURIComponent(p.id||'');
  const specs = [
    (p.camere||p.nrCamere) ? `🛏 ${p.camere||p.nrCamere} cam.` : null,
    p.suprafata ? `📐 ${p.suprafata} mp` : null,
    p.etaj ? `🏢 Et. ${p.etaj}` : null
  ].filter(Boolean);
  return `<a class="pcard" href="${url}">
    <div class="pi"><img src="${img}" alt="${titleOf(p)}" loading="lazy" onerror="this.src='${FALLBACK_IMG}'">
      <span class="ptag ${isRent?'ptag-i':'ptag-v'}">${isRent?L().list_rent:L().list_sale}</span>
      <span class="pref">${p.id||''}</span></div>
    <div class="pbody"><div class="pprice">${fmtPrice(p)}</div><div class="ptitle">${titleOf(p)}</div>
      <div class="ploc">📍 ${p.zona||p.adresa||'—'}</div>
      <div class="pspecs">${specs.map(s=>`<span>${s}</span>`).join('')}</div></div>
  </a>`;
}

/* ── filtrare ── */
function applyFilters(){
  const vis = ADAPTIVE[f.tip] || ADAPTIVE[''];
  let out = pool.slice();
  if(f.tip) out = out.filter(p => (p.tipologie||p.tipProprietate||'') === f.tip);
  if(vis.includes('zona') && f.zone.size)   out = out.filter(p => f.zone.has(p.zona||''));
  if(vis.includes('camere') && f.camere.size) out = out.filter(p => {
    const c = parseInt(p.camere||p.nrCamere||0,10);
    return [...f.camere].some(v => v==='4' ? c>=4 : c===parseInt(v,10));
  });
  if(vis.includes('suprafata')){
    const mn=parseInt(f.supraf_min||0,10), mx=parseInt(f.supraf_max||0,10);
    if(mn) out = out.filter(p => parseInt(p.suprafata||0,10) >= mn);
    if(mx) out = out.filter(p => { const s=parseInt(p.suprafata||0,10); return s && s<=mx; });
  }
  if(vis.includes('etaj')){
    const mn=parseInt(f.etaj_min,10), mx=parseInt(f.etaj_max,10);
    if(!isNaN(mn)) out = out.filter(p => parseInt(p.etaj||0,10) >= mn);
    if(!isNaN(mx)) out = out.filter(p => parseInt(p.etaj||0,10) <= mx);
  }
  if(vis.includes('buget') && f.buget){
    const max = parseInt(String(f.buget).replace(/\D/g,''),10);
    if(max) out = out.filter(p => { const pr=parseInt(p.pret||p.pret_nou||0,10); return pr && pr<=max; });
  }
  if(vis.includes('facilitati') && f.fac.size)
    out = out.filter(p => { const set=new Set((p.facilitati||[])); return [...f.fac].every(x=>set.has(x)); });
  renderResults(out);
}

function renderResults(list){
  $('listGrid').innerHTML = list.length
    ? `<div class="pgrid">${list.map(card).join('')}</div>`
    : `<div class="list-empty"><div class="ico">🔍</div><h3 data-t="empty_h">${L().empty_h}</h3><p data-t="empty_p">${L().empty_p}</p><button class="btn btn-gd" onclick="IMONDO_resetFilters()" data-t="empty_cta">${L().empty_cta}</button></div>`;
  $('listMeta').innerHTML = `<span class="list-count"><strong>${list.length}</strong> <span data-t="count_label">${L().count_label}</span></span>`;
}

/* ── construcție panou ── */
function checkRow(name, val, label, checked){
  return `<label class="lf-check"><input type="checkbox" data-f="${name}" value="${val}"${checked?' checked':''}>${label}</label>`;
}
function buildPanel(){
  const zones = [...new Set(pool.map(p=>p.zona).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ro'));
  const facs  = [...new Set(pool.flatMap(p=>p.facilitati||[]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ro'));
  const types = ['', ...TIPOLOGII];

  $('listFilter').innerHTML = `<div class="lpanel">
    <div class="lp-types">
      ${types.map(t=>`<button class="lp-type${f.tip===t?' on':''}" data-tip="${t}">${t===''?`<span data-t="filt_all">Toate</span>`:t}</button>`).join('')}
    </div>
    <div class="lp-groups">
      <div class="lf-group" data-group="zona"><div class="lf-title" data-t="filt_zone">Zonă</div>
        <div class="lf-checks">${zones.length?zones.map(z=>checkRow('zone',z,z,f.zone.has(z))).join(''):'<span style="font-size:.78rem;color:var(--ink4)">—</span>'}</div></div>

      <div class="lf-group" data-group="camere"><div class="lf-title" data-t="filt_rooms">Camere</div>
        <div class="lf-checks">${['1','2','3'].map(c=>checkRow('camere',c,c,f.camere.has(c))).join('')}${checkRow('camere','4',L().filt_rooms4,f.camere.has('4'))}</div></div>

      <div class="lf-group" data-group="suprafata"><div class="lf-title" data-t="filt_area">Suprafață (mp)</div>
        <div class="lf-range"><input type="text" inputmode="numeric" data-f="supraf_min" placeholder="${L().filt_min}" value="${f.supraf_min}"><span>–</span><input type="text" inputmode="numeric" data-f="supraf_max" placeholder="${L().filt_max}" value="${f.supraf_max}"></div></div>

      <div class="lf-group" data-group="etaj"><div class="lf-title" data-t="filt_floor">Etaj</div>
        <div class="lf-range"><input type="text" inputmode="numeric" data-f="etaj_min" placeholder="${L().filt_min}" value="${f.etaj_min}"><span>–</span><input type="text" inputmode="numeric" data-f="etaj_max" placeholder="${L().filt_max}" value="${f.etaj_max}"></div></div>

      <div class="lf-group" data-group="buget"><div class="lf-title" data-t="filt_budget">Buget maxim (€)</div>
        <div class="lf-range"><input type="text" inputmode="numeric" data-f="buget" placeholder="${L().filt_budget_ph}" value="${f.buget}"></div></div>

      <div class="lf-group" data-group="facilitati"><div class="lf-title" data-t="filt_facilities">Facilități</div>
        <div class="lf-checks">${facs.length?facs.map(x=>checkRow('fac',x,x,f.fac.has(x))).join(''):'<span style="font-size:.78rem;color:var(--ink4)">—</span>'}</div></div>
    </div>
    <div class="lf-reset"><button class="fb-reset" onclick="IMONDO_resetFilters()" data-t="filt_reset">Resetează</button></div>
  </div>`;

  /* pills tipologie → adaptiv */
  document.querySelectorAll('.lp-type').forEach(b=>b.onclick=()=>{
    f.tip = b.dataset.tip;
    clearHidden();
    document.querySelectorAll('.lp-type').forEach(x=>x.classList.toggle('on', x===b));
    adaptVisibility(); syncUrl(); applyFilters();
  });
  /* checkbox-uri (zone, camere, facilități) */
  document.querySelectorAll('.lf-check input').forEach(c=>c.onchange=()=>{
    const set = c.dataset.f==='zone'?f.zone : c.dataset.f==='camere'?f.camere : f.fac;
    c.checked ? set.add(c.value) : set.delete(c.value);
    syncUrl(); applyFilters();
  });
  /* range/text (suprafață, etaj, buget) */
  let t; document.querySelectorAll('.lf-range input').forEach(inp=>inp.oninput=()=>{
    f[inp.dataset.f] = inp.value;
    clearTimeout(t); t=setTimeout(()=>{ syncUrl(); applyFilters(); },350);
  });

  adaptVisibility();
}

/* ascunde/arată grupuri în funcție de tipologie */
function adaptVisibility(){
  const vis = ADAPTIVE[f.tip] || ADAPTIVE[''];
  document.querySelectorAll('.lf-group').forEach(g=>{
    g.classList.toggle('hidden', !vis.includes(g.dataset.group));
  });
}
/* curăță valorile filtrelor ascunse de tipologia curentă (să nu constrângă invizibil) */
function clearHidden(){
  const vis = ADAPTIVE[f.tip] || ADAPTIVE[''];
  if(!vis.includes('zona')) f.zone.clear();
  if(!vis.includes('camere')) f.camere.clear();
  if(!vis.includes('suprafata')){ f.supraf_min=''; f.supraf_max=''; }
  if(!vis.includes('etaj')){ f.etaj_min=''; f.etaj_max=''; }
  if(!vis.includes('buget')) f.buget='';
  if(!vis.includes('facilitati')) f.fac.clear();
}

/* ── URL sync ── */
function syncUrl(){
  const u = new URL(location.href);
  const setOrDel=(k,v)=> v ? u.searchParams.set(k,v) : u.searchParams.delete(k);
  setOrDel('tip', f.tip);
  setOrDel('zona', [...f.zone].join(','));
  setOrDel('camere', [...f.camere].join(','));
  setOrDel('supraf_min', f.supraf_min);
  setOrDel('supraf_max', f.supraf_max);
  setOrDel('etaj_min', f.etaj_min);
  setOrDel('etaj_max', f.etaj_max);
  setOrDel('buget', f.buget);
  setOrDel('fac', [...f.fac].join(','));
  history.replaceState(null,'',u);
}
function readUrl(){
  const q = new URLSearchParams(location.search);
  f.tip = q.get('tip') || '';
  (q.get('zona')||'').split(',').filter(Boolean).forEach(v=>f.zone.add(v));
  (q.get('camere')||'').split(',').filter(Boolean).forEach(v=>f.camere.add(v));
  (q.get('fac')||'').split(',').filter(Boolean).forEach(v=>f.fac.add(v));
  f.supraf_min = q.get('supraf_min')||'';
  f.supraf_max = q.get('supraf_max')||'';
  f.etaj_min   = q.get('etaj_min')||'';
  f.etaj_max   = q.get('etaj_max')||'';
  f.buget      = q.get('buget')||'';
}

window.IMONDO_resetFilters = function(){
  f = { tip:'', zone:new Set(), camere:new Set(), supraf_min:'', supraf_max:'', etaj_min:'', etaj_max:'', buget:'', fac:new Set() };
  syncUrl(); buildPanel(); applyFilters();
  if(window.IMONDO_setLang) window.IMONDO_setLang(document.documentElement.lang||'ro');
};

window.initListings = async function(opts){
  PAGE_TYPE = opts.type || 'vanzare';
  readUrl();
  try{
    const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const appId = 'imondo-list';
    const fbApp = getApps().find(a=>a.name===appId) || initializeApp(FIREBASE_CONFIG, appId);
    const db = getFirestore(fbApp);
    const all = [];
    const snap = await getDocs(collection(db,'proprietari'));
    snap.forEach(doc=>{
      (doc.data().proprietati||[]).forEach(p=>{
        const st=(p.status||'').toLowerCase();
        if(st==='activ'||st==='active') all.push({...p,_ownerId:doc.id});
      });
    });
    pool = all.filter(p => isRentOf(p) === (PAGE_TYPE==='inchiriere'));

    $('listLoading').style.display='none';
    buildPanel();
    applyFilters();
    if(window.IMONDO_setLang) window.IMONDO_setLang(document.documentElement.lang||'ro');
  }catch(err){
    console.warn('IMONDO listings:', err.message);
    $('listLoading').innerHTML = '<p style="color:var(--ink4);font-size:.85rem">Nu am putut încărca proprietățile. Verifică conexiunea și reîncarcă pagina.</p>';
  }
};
