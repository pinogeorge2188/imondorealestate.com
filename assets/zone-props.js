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
const $ = id => document.getElementById(id);
const L = () => (window.T_SHARED && window.T_SHARED[document.documentElement.lang||'ro']) || window.T_SHARED.ro;
/* Tip tranzacție canonic: 'vanzare' | 'inchiriere' | '' (lipsă). Insensibil la diacritice/majuscule
   — CRM salvează „Vânzare" / „Închiriere" (cu Î: „închiriere".includes("inchir") === false). */
const tipTranz = p => { const n = String((p&&(p.tip_tranzactie||p.tipTranzactie))||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(); return n.startsWith('vanz') ? 'vanzare' : n.startsWith('inchir') ? 'inchiriere' : ''; };
const isRentOf = p => tipTranz(p) === 'inchiriere';
/* Normalizare insensibilă la diacritice (site "Herăstrău" vs CRM "Herastrau") */
const norm = s => String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[șşȘŞ]/g,'s').replace(/[țţȚŢ]/g,'t').toLowerCase().trim();

const C = () => window.IMONDO_card, I = () => window.IMONDO_i18n;   // texte de card + traducere (assets/i18n.js)
/* card: assets/i18n.js → IMONDO_card.html (același pe prima pagină, liste, zone, similare) */
const card = (p, base) => C().html(p, { base });

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
    const snap = await (await import('/assets/data.js')).incarcaProprietari(db);
    snap.forEach(doc=>{
      (doc.data().proprietati||[]).forEach(p=>{
        const st=(p.status||'').toLowerCase();
        if((st==='activ'||st==='active') && tipTranz(p)) all.push(p);
      });
    });
    const list = all.filter(p => norm(p.zona) === norm(zona));

    if($('zoneLoading')) $('zoneLoading').style.display='none';
    const deseneaza = () => {
      if(list.length){
        $('zoneGrid').innerHTML = `<div class="pgrid">${list.map(p=>card(p,base)).join('')}</div>`;
        if($('zoneMeta')) $('zoneMeta').innerHTML = `<span class="list-count"><strong>${list.length}</strong> <span>${I().forma(list.length,'rezultate')}</span> · ${zona}</span>`;
      } else {
        $('zoneGrid').innerHTML = `<div class="list-empty"><div class="ico">🏠</div><h3>Momentan nu avem oferte active în ${zona}</h3><p>Revino curând sau spune-ne ce cauți — găsim împreună.</p><a href="${base}contact.html" class="btn btn-gd">Caut în ${zona} →</a></div>`;
      }
      if(window.IMONDO_setLang) window.IMONDO_setLang(document.documentElement.lang||'ro');
    };
    deseneaza();
    document.addEventListener('imondo:lang', deseneaza);   // cardurile se refac în limba nouă
  }catch(err){
    console.warn('IMONDO zone-props:', err.message);
    if($('zoneLoading')) $('zoneLoading').innerHTML = '<p style="color:var(--ink4);font-size:.85rem">Nu am putut încărca proprietățile. Reîncarcă pagina.</p>';
  }
};
