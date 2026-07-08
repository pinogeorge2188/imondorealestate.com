/* ════════════════════════════════════════════
   IMONDO — fise.js
   Pagini private de prezentare proprietate:
   fisa-client.html (branduit + comision cumpărător + CTA agent)
   fisa-colaborare.html (100% neutru, fără brand, fără comision)
   Ambele citesc proprietatea din Firestore după ?id= (ca proprietate.html),
   dar fără filtru de status (fișe private, trimise direct).
   Randează în containere comune; ce lipsește pe o pagină e ignorat.
   ════════════════════════════════════════════ */
const FIREBASE_CONFIG = window.IMONDO_FIREBASE_CONFIG || {
  apiKey: "AIzaSyCisA7tcMYHAv46aqcne3DpKL1_YIKiApE",
  authDomain: "imondo-crm.firebaseapp.com",
  projectId: "imondo-crm",
  storageBucket: "imondo-crm.firebasestorage.app",
  messagingSenderId: "777057248353",
  appId: "1:777057248353:web:3a4fee4d6618451eb3f620"
};
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=85';
const $ = id => document.getElementById(id);
const esc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function hide(id){ var e=$(id); if(e) e.style.display='none'; }
function has(v){ return v!=null && String(v).trim()!==''; }
function showSec(secId){ if(secId){ var s=$(secId); if(s) s.style.display=''; } }
function fillGrid(id, secId, rows){
  rows=rows.filter(Boolean); var el=$(id); if(!el) return;
  if(!rows.length){ if(secId) hide(secId); el.innerHTML=''; return; }
  el.innerHTML = rows.map(function(r){ return '<div class="spec"><span class="spec-l">'+esc(r.l)+'</span><span class="spec-v">'+esc(r.v)+'</span></div>'; }).join(''); showSec(secId);
}
function fillChips(id, secId, arr){
  arr=arr.filter(Boolean); var el=$(id); if(!el) return;
  if(!arr.length){ if(secId) hide(secId); el.innerHTML=''; return; }
  el.innerHTML = arr.map(function(f){ return '<span class="chip">'+esc(f)+'</span>'; }).join(''); showSec(secId);
}

async function loadPropertyById(id){
  const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
  const { getFirestore, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  const appId='imondo-fisa';
  const app=getApps().find(a=>a.name===appId)||initializeApp(FIREBASE_CONFIG,appId);
  const db=getFirestore(app);
  const snap=await getDocs(collection(db,'proprietari'));
  let found=null;
  snap.forEach(function(doc){
    var o=doc.data();
    (o.proprietati||[]).forEach(function(p){ if(String(p.id)===String(id)) found={ p:p, agent:(o.agent_nume||'') }; });
  });
  return found;
}

/* ── GALERIE (imagine mare + thumbnails) ── */
let gImgs=[], gIdx=0;
function buildGallery(){
  var g=$('fGallery'); if(!g) return;
  g.innerHTML = '<div class="gal-main"><img id="fMainImg" src="'+esc(gImgs[0])+'" alt="" loading="eager" onerror="this.src=\''+FALLBACK_IMG+'\'">'
    + (gImgs.length>1 ? '<button class="gal-nav gal-prev" onclick="fisaNav(-1)" aria-label="Anterior">‹</button><button class="gal-nav gal-next" onclick="fisaNav(1)" aria-label="Următor">›</button>' : '')
    + '</div>'
    + (gImgs.length>1 ? '<div class="gal-thumbs" id="fThumbs">'+gImgs.map(function(u,i){ return '<img class="'+(i===0?'on':'')+'" src="'+esc(u)+'" onclick="fisaGo('+i+')" loading="lazy" alt="" onerror="this.style.display=\'none\'">'; }).join('')+'</div>' : '');
}
window.fisaGo = function(i){ gIdx=i; var m=$('fMainImg'); if(m) m.src=gImgs[i]; var ts=document.querySelectorAll('#fThumbs img'); ts.forEach(function(t,j){ t.classList.toggle('on', j===i); }); };
window.fisaNav = function(d){ window.fisaGo((gIdx+d+gImgs.length)%gImgs.length); };

function showErr(msg){
  hide('fLoading'); hide('fContent');
  var el=$('fError'); if(el){ var m=$('fErrorMsg'); if(m&&msg) m.textContent=msg; el.style.display='block'; }
}

/* pagina de colaborare e neutră (fără brand) → scoate orice mențiune IMONDO din textele proprietății */
function neutralize(s){ return String(s==null?'':s).replace(/IMONDO\s+Real\s+Estate/gi,'Agenția').replace(/\bIMONDO\b/gi,'Agenția').replace(/ {2,}/g,' ').trim(); }

function render(p, agent){
  /* branded = pagina client (are containerul de comision); altfel = colaborare (neutru) */
  var neutral = !document.getElementById('fCommission');
  var nume = p.denumire || p.titlu || (p.tipologie || 'Proprietate');
  if(neutral) nume = neutralize(nume);
  var isRent = /inchir/i.test(p.tip_tranzactie||'');
  document.title = nume + (neutral ? ' — Fișă proprietate' : ' — IMONDO Real Estate');

  /* galerie */
  gImgs = (p.poze||[]).filter(Boolean); if(!gImgs.length) gImgs=[FALLBACK_IMG]; gIdx=0; buildGallery();

  $('fName').textContent = nume;
  if($('fLoc')) $('fLoc').textContent = p.zona || p.adresa || '';
  $('fPrice').innerHTML = p.pret ? (Number(p.pret).toLocaleString('ro-RO')+' €'+(isRent?' <small>/ lună</small>':'')) : 'Preț la cerere';

  /* comision cumpărător — DOAR pe fisa-client (containerul există doar acolo) */
  if($('fCommission')){
    var c = p.comision_cumparator;
    if(c!=null && String(c).trim()!==''){
      var cv = String(c).trim(); if(!/[%€]|lei/i.test(cv)) cv += '%';
      $('fCommission').innerHTML = '<span class="com-l">Comision cumpărător</span><span class="com-v">'+esc(cv)+'</span>';
      $('fCommission').style.display='';
    } else { hide('fCommission'); }
  }

  /* Caracteristici — toate câmpurile completate (afișare adaptivă: doar ce există) */
  fillGrid('fSpecs', null, [
    has(p.tipologie) ? {l:'Tip proprietate', v:p.tipologie} : null,
    has(p.tip_tranzactie) ? {l:'Tranzacție', v:p.tip_tranzactie} : null,
    has(p.camere) ? {l:'Camere', v:p.camere} : null,
    (has(p.bai)||has(p.numar_bai)) ? {l:'Băi', v:(p.bai||p.numar_bai)} : null,
    has(p.bucatarii) ? {l:'Bucătării', v:p.bucatarii} : null,
    has(p.compartimentare) ? {l:'Compartimentare', v:p.compartimentare} : null,
    has(p.confort) ? {l:'Confort', v:p.confort} : null,
    has(p.suprafata) ? {l:'Suprafață', v:p.suprafata+' mp'} : null,
    has(p.suprafata_utila) ? {l:'Suprafață utilă', v:p.suprafata_utila+' mp'} : null,
    has(p.suprafata_construita) ? {l:'Suprafață construită', v:p.suprafata_construita+' mp'} : null,
    has(p.suprafata_utila_totala) ? {l:'Supr. utilă totală', v:p.suprafata_utila_totala+' mp'} : null,
    has(p.suprafata_balcoane) ? {l:'Balcoane/terase', v:p.suprafata_balcoane+' mp'} : null,
    has(p.suprafata_teren) ? {l:'Suprafață teren', v:p.suprafata_teren+' mp'} : null,
    has(p.deschidere_teren) ? {l:'Deschidere teren', v:p.deschidere_teren+' m'} : null,
    has(p.clasificare_teren) ? {l:'Clasificare', v:p.clasificare_teren} : null,
    has(p.etaj) ? {l:'Etaj', v:(''+p.etaj)+(has(p.total_etaje)?(' / '+p.total_etaje):(p.etaje_total?(' / '+p.etaje_total):''))} : null,
    has(p.an_constructie) ? {l:'An construcție', v:p.an_constructie} : null,
    has(p.an_renovare) ? {l:'An renovare', v:p.an_renovare} : null,
    has(p.tip_imobil) ? {l:'Tip imobil', v:p.tip_imobil} : null,
    has(p.structura_cladire) ? {l:'Structură', v:p.structura_cladire} : null,
    has(p.regim_inaltime) ? {l:'Regim înălțime', v:p.regim_inaltime} : null,
    has(p.suprafata_curte) ? {l:'Curte', v:p.suprafata_curte+' mp'} : null,
    has(p.vad) ? {l:'Vad', v:p.vad} : null,
    has(p.clasa_cladire) ? {l:'Clasă clădire', v:p.clasa_cladire} : null,
    has(p.front_stradal) ? {l:'Front stradal', v:p.front_stradal+' m'} : null,
    has(p.destinatie) ? {l:'Destinație', v:p.destinatie} : null
  ]);

  /* Utilități — chips */
  var util=[];
  if(p.utilitate_curent) util.push('Curent');
  if(p.utilitate_apa) util.push('Apă');
  if(p.utilitate_canalizare) util.push('Canalizare');
  if(p.utilitate_gaz) util.push('Gaz');
  if(p.utilitate_fibra) util.push('Fibră');
  (p.teren_utilitati||[]).forEach(function(u){ if(u) util.push(u); });
  if(p.climatizare) util.push('Climatizare');
  if(has(p.sistem_incalzire)) util.push('Încălzire: '+p.sistem_incalzire);
  fillChips('fUtil', 'fUtilSec', util);

  /* Finisaje */
  fillGrid('fFinisaj', 'fFinisajSec', [
    has(p.stare_finisaj) ? {l:'Stare finisaj', v:p.stare_finisaj} : null,
    has(p.finisaj_pereti) ? {l:'Pereți', v:p.finisaj_pereti} : null,
    has(p.finisaj_podele) ? {l:'Podele', v:p.finisaj_podele} : null,
    has(p.tip_ferestre) ? {l:'Ferestre', v:p.tip_ferestre} : null,
    has(p.tip_usi) ? {l:'Uși', v:p.tip_usi} : null
  ]);

  /* descriere — pe paragrafe (neutralizată pe colaborare) */
  if(p.descriere && String(p.descriere).trim()){
    var descTxt = neutral ? neutralize(p.descriere) : String(p.descriere);
    $('fDesc').innerHTML = descTxt.split(/\n\s*\n/).map(function(par){ return '<p>'+esc(par).replace(/\n/g,'<br>')+'</p>'; }).join('');
  } else { hide('fDescSec'); }

  /* Dotări & facilități — chips (câmpuri noi + facilitati existente) */
  var dot=[];
  if(has(p.mobilat)) dot.push('Mobilat: '+p.mobilat);
  if(has(p.parcare)) dot.push('Parcare: '+p.parcare);
  if(p.utilat) dot.push('Utilat');
  if(p.lift) dot.push('Lift');
  if(p.contorizare_individuala) dot.push('Contorizare individuală');
  (p.spatii_utile||[]).forEach(function(s){ if(s) dot.push(s); });
  (p.facilitati||[]).forEach(function(f){ if(f) dot.push(f); });
  fillChips('fFac', 'fFacSec', dot);

  /* agent (CTA) — doar pe fisa-client */
  if($('fAgentName')) $('fAgentName').textContent = agent || 'Consultant IMONDO';

  hide('fLoading'); $('fContent').style.display='';
}

window.initFisa = async function(){
  var id = new URLSearchParams(location.search).get('id');
  if(!id){ showErr('Lipsește identificatorul proprietății din adresă.'); return; }
  try{
    var found = await loadPropertyById(id);
    if(!found){ showErr('Proprietatea căutată nu este disponibilă.'); return; }
    render(found.p, found.agent);
  }catch(err){
    console.warn('IMONDO fișă:', err.message);
    showErr('Nu am putut încărca proprietatea. Verifică conexiunea și reîncarcă.');
  }
};
