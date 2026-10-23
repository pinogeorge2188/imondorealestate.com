/* ════════════════════════════════════════════
   IMONDO — projects.js
   Proiecte rezidențiale (Sesiunea 8, Repriza 3).
   Citește colecția Firestore `proiecte`, FILTRAT server-side
   pe status === 'Activ' (regula permite citire publică doar a celor active).
   - initProjectsList()  → grilă pe proiecte.html (#projGrid)
   - initProjectDetail() → pagină individuală proiect.html?slug= (sau ?id=)
   ════════════════════════════════════════════ */
const FIREBASE_CONFIG = window.IMONDO_FIREBASE_CONFIG || {
  apiKey: "AIzaSyCisA7tcMYHAv46aqcne3DpKL1_YIKiApE",
  authDomain: "imondo-crm.firebaseapp.com",
  projectId: "imondo-crm",
  storageBucket: "imondo-crm.firebasestorage.app",
  messagingSenderId: "777057248353",
  appId: "1:777057248353:web:3a4fee4d6618451eb3f620"
};
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85';
const $ = id => document.getElementById(id);

function fmtEur(v){ return new Intl.NumberFormat('de-DE').format(v) + ' €'; }
function fmtFrom(p){
  const v = parseInt(p.pret_de_la||0,10);
  return v ? ('de la ' + fmtEur(v) + (p.pret_plus_tva ? ' + TVA' : '')) : '';
}
function projUrl(p){
  return p.slug ? ('proiect.html?slug=' + encodeURIComponent(p.slug))
                : ('proiect.html?id=' + encodeURIComponent(p.id||''));
}

/* Citește DOAR proiectele active (server-side where — cerut de regula Firestore) */
async function loadActiveProjects(){
  const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
  const { getFirestore, collection, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  const appId = 'imondo-proj';
  const app = getApps().find(a=>a.name===appId) || initializeApp(FIREBASE_CONFIG, appId);
  const db = getFirestore(app);
  const q = query(collection(db,'proiecte'), where('status','==','Activ'));
  const snap = await getDocs(q);
  const list = [];
  snap.forEach(d=>{ const o = Object.assign({}, d.data()); o.id = d.id; list.push(o); });
  return list;
}

function projectCard(p){
  const img = (p.poze||[])[0] || FALLBACK_IMG;
  const meta = [p.dezvoltator, p.zona, p.stadiu].filter(Boolean).join(' · ');
  return `<a class="projcard" href="${projUrl(p)}">
    <div class="projcard-img"><img src="${img}" alt="${p.nume_ansamblu||'Proiect rezidențial'}" loading="lazy" onerror="this.src='${FALLBACK_IMG}'">
      ${p.stadiu?`<span class="projcard-stage">${p.stadiu}</span>`:''}</div>
    <div class="projcard-body">
      <h3>${p.nume_ansamblu||'Proiect rezidențial'}</h3>
      ${meta?`<div class="projcard-meta">${meta}</div>`:''}
      ${p.descriere_scurta?`<p class="projcard-desc">${p.descriere_scurta}</p>`:''}
      <div class="projcard-foot"><span class="projcard-from">${fmtFrom(p)}</span><span class="projcard-cta">Detalii →</span></div>
    </div>
  </a>`;
}

/* ── LISTĂ (proiecte.html) ── */
window.initProjectsList = async function(){
  try{
    const list = await loadActiveProjects();
    if($('projLoading')) $('projLoading').style.display='none';
    if(!list.length){
      $('projGrid').innerHTML = `<div class="list-empty"><div class="ico">🏗️</div><h3>Proiecte în pregătire</h3><p>Momentan nu avem ansambluri publicate. Revino curând sau lasă-ne datele tale.</p><a href="contact.html" class="btn btn-gd">Anunță-mă când e gata</a></div>`;
      return;
    }
    // featured întâi
    list.sort((a,b)=> (b.featured?1:0) - (a.featured?1:0));
    $('projGrid').innerHTML = `<div class="proj-grid">${list.map(projectCard).join('')}</div>`;
    if($('projMeta')) $('projMeta').innerHTML = `<span class="list-count"><strong>${list.length}</strong> ${window.IMONDO_i18n ? IMONDO_i18n.forma(list.length, 'proiecte') : 'proiecte rezidențiale'}</span>`;   // „1 proiect rezidențial”
  }catch(err){
    console.warn('IMONDO proiecte:', err.message);
    if($('projLoading')) $('projLoading').innerHTML = '<p style="color:var(--ink4);font-size:.85rem">Nu am putut încărca proiectele. Reîncarcă pagina.</p>';
  }
};

/* ── DETALIU (proiect.html?slug= sau ?id=) ── */
window.initProjectDetail = async function(){
  const q = new URLSearchParams(location.search);
  const slug = q.get('slug'), id = q.get('id');
  if(!slug && !id){ showProjError('Lipsește identificatorul proiectului din adresă.'); return; }
  try{
    const list = await loadActiveProjects();
    const p = list.find(x => slug ? x.slug===slug : String(x.id)===String(id));
    if(!p){ showProjError('Proiectul căutat nu este disponibil sau a fost retras.'); return; }
    renderProjectDetail(p);
  }catch(err){
    console.warn('IMONDO proiect:', err.message);
    showProjError('Nu am putut încărca proiectul. Verifică conexiunea și reîncarcă.');
  }
};

function showProjError(msg){
  if($('projDetailLoading')) $('projDetailLoading').style.display='none';
  if($('projDetail')) $('projDetail').style.display='none';
  const el = $('projError'); if(el){ const m=$('projErrorMsg'); if(m&&msg) m.textContent=msg; el.style.display='block'; }
}

function renderProjectDetail(p){
  const nume = p.nume_ansamblu || 'Proiect rezidențial';
  const zona = p.zona || '';
  /* SEO dinamic (browser) */
  document.title = (p.meta_title || (nume + ' | IMONDO Real Estate'));
  const metaDesc = p.meta_description || p.descriere_scurta || ('Proiect rezidențial în ' + zona);
  document.querySelector('meta[name=description]').setAttribute('content', metaDesc);
  $('ogTitle') && $('ogTitle').setAttribute('content', nume + ' — IMONDO Real Estate');
  $('ogDesc') && $('ogDesc').setAttribute('content', metaDesc);
  $('canonical') && $('canonical').setAttribute('href', 'https://imondorealestate.com/' + projUrl(p));

  /* galerie: mozaicul comun (assets/galerie.js) — o mare + trei mici, „+N foto”, pe tot ecranul la click.
     Înlocuiește caruselul vechi (toate pozele suprapuse, arătate prin opacitate), care se bloca pe tema de noapte. */
  IMONDO_galerie.mozaic($('pjGallery'), { fotos: (p.poze||[]).filter(Boolean), eticheta: p.stadiu || '', etichetaAuriu: true, rezerva: FALLBACK_IMG,
    laDeschidere: () => { if (window.IMONDO_track) IMONDO_track('galerie_deschisa', { proiect: p.slug || p.id }); } });

  $('pjName').textContent = nume;
  $('pjMeta').textContent = [p.dezvoltator, zona].filter(Boolean).join(' · ');
  $('pjFrom').innerHTML = fmtFrom(p);

  /* specs */
  const parcare = parseInt(p.pret_parcare||0,10);
  const specs = [
    {v:p.tipuri_apartamente, l:'Tipuri apartamente'},
    {v:p.suprafete, l:'Suprafețe'},
    {v:p.stadiu, l:'Stadiu'},
    {v:p.termen_finalizare, l:'Finalizare'},
    {v: parcare ? (fmtEur(parcare) + (p.pret_parcare_plus_tva ? ' + TVA' : '')) : '', l:'Loc de parcare'}
  ].filter(s=>s.v);
  $('pjSpecs').innerHTML = specs.map(s=>`<div class="pd-spec"><span class="pd-spec-val" style="font-size:1.05rem">${s.v}</span><span class="pd-spec-lab">${s.l}</span></div>`).join('');

  $('pjDesc').textContent = p.descriere || p.descriere_scurta || ('Ansamblu rezidențial în ' + zona + '. Contactați-ne pentru detalii complete.');

  /* facilități */
  const fac=(p.facilitati||[]).filter(Boolean);
  if(fac.length){ $('pjFacSec').style.display=''; $('pjFac').innerHTML = fac.map(f=>`<span class="pd-fac">✓ ${f}</span>`).join(''); }

  /* resurse: broșură + tur virtual */
  let res='';
  if(p.brosura_pdf) res += `<a href="${p.brosura_pdf}" target="_blank" rel="noopener" class="btn btn-ol">📄 Broșură PDF</a>`;
  if(p.tur_virtual) res += `<a href="${p.tur_virtual}" target="_blank" rel="noopener" class="btn btn-ol">🎥 Tur virtual</a>`;
  if(res){ $('pjResSec').style.display=''; $('pjRes').innerHTML=res; }

  /* hartă — cerc de aproximare din coordonate manuale (CRM) */
  const lat = parseFloat(String(p.latitudine||'').replace(',', '.'));
  const lng = parseFloat(String(p.longitudine||'').replace(',', '.'));
  if(window.L && isFinite(lat) && isFinite(lng)){
    $('pjMapSec').style.display='';
    try{
      const map = L.map('pjMapCanvas', { scrollWheelZoom:false, attributionControl:true }).setView([lat, lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
      L.circle([lat, lng], { radius: 400, color:'#C9A84C', weight:2, fillColor:'#C9A84C', fillOpacity:0.18 }).addTo(map);
      setTimeout(()=>map.invalidateSize(), 200);
    }catch(e){ console.warn('Hartă:', e); $('pjMapSec').style.display='none'; }
  }

  /* WhatsApp precompletat */
  const wa = encodeURIComponent('Bună ziua! Sunt interesat(ă) de proiectul "' + nume + '" de pe imondorealestate.com. Aș dori mai multe detalii.');
  $('pjWa').href = 'https://wa.me/' + ((window.IMONDO_CONTACT && IMONDO_CONTACT.whatsapp) || '40752942828') + '?text=' + wa;

  /* schema RealEstateAgent + Residence (dinamic) */
  try{
    const ld = {"@context":"https://schema.org","@type":"ApartmentComplex","name":nume,
      "description":(p.descriere||metaDesc||'').slice(0,300),
      "image":(p.poze||[]).slice(0,5),
      "address":{"@type":"PostalAddress","addressLocality":zona||"București","addressRegion":"București","addressCountry":"RO"}};
    const s=document.createElement('script'); s.type='application/ld+json'; s.textContent=JSON.stringify(ld); document.head.appendChild(s);
  }catch(e){}

  $('projDetailLoading').style.display='none';
  $('projDetail').style.display='';
}
