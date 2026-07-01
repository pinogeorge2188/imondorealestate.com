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

function fmtFrom(p){
  const v = parseInt(p.pret_de_la||0,10);
  return v ? ('de la ' + new Intl.NumberFormat('de-DE').format(v) + ' €') : '';
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
    if($('projMeta')) $('projMeta').innerHTML = `<span class="list-count"><strong>${list.length}</strong> proiecte rezidențiale</span>`;
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

let pdImgs=[], pdIdx=0;
window.pjGo = i => { pdIdx=i; renderPjGallery(); };
window.pjNav = d => window.pjGo((pdIdx+d+pdImgs.length)%pdImgs.length);
function renderPjGallery(){
  const g=$('pjGallery'); if(!g) return;
  g.innerHTML = pdImgs.map((s,i)=>`<img src="${s}" class="${i===pdIdx?'on':''}" alt="Foto ${i+1}" onerror="this.src='${FALLBACK_IMG}'">`).join('')
    + (pdImgs.length>1?`<button class="pd-prev" onclick="pjNav(-1)">‹</button><button class="pd-next" onclick="pjNav(1)">›</button>
       <div class="pd-dots">${pdImgs.map((_,i)=>`<div class="pd-dot ${i===pdIdx?'on':''}" onclick="pjGo(${i})"></div>`).join('')}</div>`:'');
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

  /* galerie */
  pdImgs = (p.poze||[]).filter(Boolean); if(!pdImgs.length) pdImgs=[FALLBACK_IMG]; pdIdx=0; renderPjGallery();
  if(p.stadiu) $('pjGallery').insertAdjacentHTML('beforeend', `<span class="pd-badge ptag-i">${p.stadiu}</span>`);

  $('pjName').textContent = nume;
  $('pjMeta').textContent = [p.dezvoltator, zona].filter(Boolean).join(' · ');
  $('pjFrom').innerHTML = fmtFrom(p);

  /* specs */
  const specs = [
    {v:p.tipuri_apartamente, l:'Tipuri apartamente'},
    {v:p.suprafete, l:'Suprafețe'},
    {v:p.stadiu, l:'Stadiu'},
    {v:p.termen_finalizare, l:'Finalizare'}
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

  /* WhatsApp precompletat */
  const wa = encodeURIComponent('Bună ziua! Sunt interesat(ă) de proiectul "' + nume + '" de pe imondorealestate.com. Aș dori mai multe detalii.');
  $('pjWa').href = 'https://wa.me/40752942828?text=' + wa;

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
