/* ════════════════════════════════════════════
   IMONDO — listings.js
   Listare proprietăți pentru vanzari.html / inchirieri.html.
   Citește Firestore (status === 'activ'), filtrează pe
   tip_tranzactie, construiește filtre (zonă/camere/buget/tipologie),
   card → proprietate.html?id=. Pre-completează din URL.

   Pagina apelează:  initListings({ type:'vanzare'|'inchiriere' })
   și oferă containerele: #listFilter #listMeta #listGrid
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

const $ = id => document.getElementById(id);
const L = () => (window.T_SHARED && window.T_SHARED[document.documentElement.lang||'ro']) || window.T_SHARED.ro;
const isRentOf = p => (p.tip_tranzactie||p.tipTranzactie||'').toLowerCase().includes('inchir');

let PAGE_TYPE = 'vanzare';
let pool = [];       // proprietăți de tipul paginii
let filters = { zona:'', camere:'', buget:'', tip:'' };

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
  const imgs = p.poze || p.imagini || [];
  const img = imgs[0] || FALLBACK_IMG;
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

function applyFilters(){
  let out = pool.slice();
  if(filters.zona)   out = out.filter(p => (p.zona||'') === filters.zona);
  if(filters.tip)    out = out.filter(p => (p.tipologie||p.tipProprietate||'') === filters.tip);
  if(filters.camere){
    out = out.filter(p => {
      const c = parseInt(p.camere||p.nrCamere||0,10);
      return filters.camere==='4' ? c>=4 : c===parseInt(filters.camere,10);
    });
  }
  if(filters.buget){
    const max = parseInt(String(filters.buget).replace(/\D/g,''),10);
    if(max) out = out.filter(p => { const pr=parseInt(p.pret||p.pret_nou||0,10); return pr && pr<=max; });
  }
  renderResults(out);
}

function renderResults(list){
  $('listGrid').innerHTML = list.length
    ? `<div class="pgrid">${list.map(card).join('')}</div>`
    : `<div class="list-empty"><div class="ico">🔍</div><h3 data-t="empty_h">${L().empty_h}</h3><p data-t="empty_p">${L().empty_p}</p><button class="btn btn-gd" onclick="IMONDO_resetFilters()" data-t="empty_cta">${L().empty_cta}</button></div>`;
  $('listMeta').innerHTML = `<span class="list-count"><strong>${list.length}</strong> <span data-t="count_label">${L().count_label}</span></span>`;
}

function buildFilterBar(){
  const zones = [...new Set(pool.map(p=>p.zona).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ro'));
  const opt = (v,t,sel)=>`<option value="${v}"${sel?' selected':''}>${t}</option>`;
  $('listFilter').innerHTML = `
    <div class="filter-bar">
      <div class="fbf"><label data-t="filt_zone">Zonă</label>
        <select id="fZona"><option value="" data-t="filt_all">Toate</option>${zones.map(z=>opt(z,z,filters.zona===z)).join('')}</select></div>
      <div class="fbf"><label data-t="filt_type">Tip proprietate</label>
        <select id="fTip"><option value="" data-t="filt_all">Toate</option>${TIPOLOGII.map(t=>opt(t,t,filters.tip===t)).join('')}</select></div>
      <div class="fbf"><label data-t="filt_rooms">Camere</label>
        <select id="fCamere"><option value="" data-t="filt_any">Orice</option>${['1','2','3'].map(c=>opt(c,c,filters.camere===c)).join('')}${opt('4','4+',filters.camere==='4')}</select></div>
      <div class="fbf"><label data-t="filt_budget">Buget maxim (€)</label>
        <input id="fBuget" type="text" inputmode="numeric" placeholder="${L().filt_budget_ph}" value="${filters.buget||''}"></div>
      <button class="fb-reset" onclick="IMONDO_resetFilters()" data-t="filt_reset">Resetează</button>
    </div>`;
  $('fZona').onchange   = e=>{ filters.zona=e.target.value; syncUrl(); applyFilters(); };
  $('fTip').onchange    = e=>{ filters.tip=e.target.value; syncUrl(); applyFilters(); };
  $('fCamere').onchange = e=>{ filters.camere=e.target.value; syncUrl(); applyFilters(); };
  let bt; $('fBuget').oninput = e=>{ filters.buget=e.target.value; clearTimeout(bt); bt=setTimeout(()=>{ syncUrl(); applyFilters(); },350); };
}

function syncUrl(){
  const u = new URL(location.href);
  ['zona','tip','camere','buget'].forEach(k=>{ filters[k] ? u.searchParams.set(k,filters[k]) : u.searchParams.delete(k); });
  history.replaceState(null,'',u);
}
function readUrl(){
  const q = new URLSearchParams(location.search);
  filters.zona   = q.get('zona')   || '';
  filters.tip    = q.get('tip')    || '';
  filters.camere = q.get('camere') || '';
  filters.buget  = q.get('buget')  || '';
}

window.IMONDO_resetFilters = function(){
  filters = { zona:'', camere:'', buget:'', tip:'' };
  syncUrl(); buildFilterBar(); applyFilters();
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
    const wantRent = PAGE_TYPE==='inchiriere';
    pool = all.filter(p => isRentOf(p)===wantRent);

    $('listLoading').style.display='none';
    buildFilterBar();
    applyFilters();
    if(window.IMONDO_setLang) window.IMONDO_setLang(document.documentElement.lang||'ro');
  }catch(err){
    console.warn('IMONDO listings:', err.message);
    $('listLoading').innerHTML = '<p style="color:var(--ink4);font-size:.85rem">Nu am putut încărca proprietățile. Verifică conexiunea și reîncarcă pagina.</p>';
  }
};
