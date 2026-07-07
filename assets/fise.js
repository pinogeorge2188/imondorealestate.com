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

function render(p, agent){
  var nume = p.denumire || p.titlu || (p.tipologie || 'Proprietate');
  var isRent = /inchir/i.test(p.tip_tranzactie||'');
  document.title = nume + (document.title.indexOf('Colaborare')>=0 ? ' — Fișă proprietate' : ' — IMONDO Real Estate');

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

  /* caracteristici — doar câmpurile existente */
  var specs = [
    p.tipologie ? {l:'Tip proprietate', v:p.tipologie} : null,
    p.tip_tranzactie ? {l:'Tranzacție', v:p.tip_tranzactie} : null,
    p.camere ? {l:'Camere', v:p.camere} : null,
    (p.bai||p.numar_bai) ? {l:'Băi', v:(p.bai||p.numar_bai)} : null,
    p.suprafata ? {l:'Suprafață', v:p.suprafata+' mp'} : null,
    p.etaj ? {l:'Etaj', v:(''+p.etaj)+(p.etaje_total?(' / '+p.etaje_total):'')} : null,
    p.an_constructie ? {l:'An construcție', v:p.an_constructie} : null,
    p.compartimentare ? {l:'Compartimentare', v:p.compartimentare} : null,
    p.finisaje ? {l:'Finisaje', v:p.finisaje} : null
  ].filter(Boolean);
  $('fSpecs').innerHTML = specs.map(function(s){ return '<div class="spec"><span class="spec-l">'+esc(s.l)+'</span><span class="spec-v">'+esc(s.v)+'</span></div>'; }).join('');

  /* descriere — pe paragrafe */
  if(p.descriere && String(p.descriere).trim()){
    $('fDesc').innerHTML = String(p.descriere).split(/\n\s*\n/).map(function(par){ return '<p>'+esc(par).replace(/\n/g,'<br>')+'</p>'; }).join('');
  } else { hide('fDescSec'); }

  /* facilități */
  var fac=(p.facilitati||[]).filter(Boolean);
  if(fac.length){ $('fFac').innerHTML = fac.map(function(f){ return '<span class="chip">'+esc(f)+'</span>'; }).join(''); }
  else { hide('fFacSec'); }

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
