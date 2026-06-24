/* ════════════════════════════════════════════
   IMONDO — zone-props.js
   Pentru paginile de zonă (zone/*.html).
   Citește Firestore (status === 'activ'), filtrează pe `zona`,
   afișează proprietățile (vânzare + închiriere) din acea zonă.
   Card → ../proprietate.html?id= (base configurabil).

   Pagina apelează:  initZoneProps({ zona:'Floreasca', base:'../' })
   și oferă containerele: #zoneLoading #zoneGrid #zoneMeta
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
const $ = id => document.getElementById(id);
const L = () => (window.T_SHARED && window.T_SHARED[document.documentElement.lang||'ro']) || window.T_SHARED.ro;
const isRentOf = p => (p.tip_tranzactie||p.tipTranzactie||'').toLowerCase().includes('inchir');

function fmtPrice(p){
  const pret = p.pret || p.pret_nou || 0;
  return pret ? new Intl.NumberFormat('de-DE').format(pret) + ' €' + (isRentOf(p) ? ' <small>/ lună</small>' : '') : 'Preț la cerere';
}
function titleOf(p){
  const camere = p.camere || p.nrCamere || '';
  const zona = p.zona || p.adresa || '';
  return p.denumire || p.titlu || ((p.tipologie||p.tipProprietate||'Proprietate') + (camere ? ' ' + camere + ' camere' : '') + (zona ? ', ' + zona : ''));
}
function card(p, base){
  const isRent = isRentOf(p);
  const img = (p.poze||p.imagini||[])[0] || FALLBACK_IMG;
  const url = base + 'proprietate.html?id=' + encodeURIComponent(p.id||'');
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

window.initZoneProps = async function(opts){
  const zona = (opts.zona||'').trim();
  const base = opts.base || '';
  try{
    const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const appId = 'imondo-zone';
    const fbApp = getApps().find(a=>a.name===appId) || initializeApp(FIREBASE_CONFIG, appId);
    const db = getFirestore(fbApp);

    const all = [];
    const snap = await getDocs(collection(db,'proprietari'));
    snap.forEach(doc=>{
      (doc.data().proprietati||[]).forEach(p=>{
        const st=(p.status||'').toLowerCase();
        if(st==='activ'||st==='active') all.push(p);
      });
    });
    const list = all.filter(p => (p.zona||'').trim().toLowerCase() === zona.toLowerCase());

    if($('zoneLoading')) $('zoneLoading').style.display='none';
    if(list.length){
      $('zoneGrid').innerHTML = `<div class="pgrid">${list.map(p=>card(p,base)).join('')}</div>`;
      if($('zoneMeta')) $('zoneMeta').innerHTML = `<span class="list-count"><strong>${list.length}</strong> <span data-t="count_label">${L().count_label}</span> · ${zona}</span>`;
    } else {
      $('zoneGrid').innerHTML = `<div class="list-empty"><div class="ico">🏠</div><h3>Momentan nu avem oferte active în ${zona}</h3><p>Revino curând sau spune-ne ce cauți — găsim împreună.</p><a href="${base}contact.html" class="btn btn-gd">Caut în ${zona} →</a></div>`;
    }
    if(window.IMONDO_setLang) window.IMONDO_setLang(document.documentElement.lang||'ro');
  }catch(err){
    console.warn('IMONDO zone-props:', err.message);
    if($('zoneLoading')) $('zoneLoading').innerHTML = '<p style="color:var(--ink4);font-size:.85rem">Nu am putut încărca proprietățile. Reîncarcă pagina.</p>';
  }
};
