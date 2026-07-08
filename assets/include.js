/* ════════════════════════════════════════════
   IMONDO — include.js
   Injectează header + footer + breadcrumb (template
   strings, NU fetch → merge și pe file://).
   Folosit DOAR de paginile noi. index.html e
   self-contained (Varianta B).

   Fiecare pagină setează ÎNAINTE de acest script:
     window.IMONDO_PAGE = {
       active: 'sales'|'rent'|'projects'|'services'|'about'|'contact',
       crumbs: [{t:'nav_sales', href:'vanzari.html'}]  // breadcrumb (fără Acasă)
     };
   ════════════════════════════════════════════ */
(function(){
  const PAGE = window.IMONDO_PAGE || {active:'', crumbs:[]};
  const T = window.T_SHARED;
  const PHONE = "+40752942828", PHONE_FMT = "+40 752 942 828";
  const WA = "https://wa.me/40752942828";
  const EMAIL = "officeimondo@gmail.com";
  const B = PAGE.base || ''; // prefix pentru pagini în subfolder (ex: zone/ → '../')

  /* ── Google Analytics 4 — o singură dată, pe toate paginile care încarcă include.js.
     index.html e self-contained și are GA direct în <head>, deci NU trece pe aici. ── */
  (function(){
    const GA_ID = 'G-49RFGB91ZH';
    if(window.__imondoGA) return; window.__imondoGA = true;
    if(document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return; // deja prezent → nu dubla
    const s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
  })();

  /* ── HEADER ── */
  const a = k => PAGE.active===k ? ' class="active"' : '';
  const header = `
  <div class="lang-bar">
    <div class="lang-bar-left">
      <span data-t="tagline">Agenție imobiliară premium</span>
      <div class="lang-switch">
        <button class="lang-btn on" data-lang="ro">RO</button>
        <button class="lang-btn" data-lang="en">EN</button>
        <button class="lang-btn" data-lang="es">ES</button>
        <button class="lang-btn" data-lang="fr">FR</button>
      </div>
    </div>
    <div class="lang-bar-contact">
      <a href="tel:${PHONE}">${PHONE_FMT}</a>
      <a href="mailto:${EMAIL}">${EMAIL}</a><!-- [DE COMPLETAT: email pe domeniu] -->
    </div>
  </div>
  <nav id="nav">
    <div class="nav-in">
      <a href="${B}index.html" class="logo">IMONDO<em>.</em></a>
      <ul class="nav-links">
        <li class="has-drop"><a href="${B}vanzari.html"${a('sales')}><span data-t="nav_props">Proprietăți</span> <span class="caret">▾</span></a>
          <ul class="drop">
            <li><a href="${B}vanzari.html" data-t="nav_sales">Vânzări</a></li>
            <li><a href="${B}inchirieri.html" data-t="nav_rent">Închirieri</a></li>
          </ul>
        </li>
        <li><a href="${B}proiecte.html"${a('projects')} data-t="nav_projects">Proiecte</a></li>
        <li><a href="${B}servicii.html"${a('services')} data-t="nav_services">Servicii</a></li>
        <li><a href="${B}index.html#zones" data-t="nav_zones">Zone</a></li>
        <li><a href="${B}despre.html"${a('about')} data-t="nav_about">Despre IMONDO</a></li>
        <li><a href="${B}contact.html"${a('contact')} data-t="nav_contact">Contact</a></li>
      </ul>
      <div class="nav-r">
        <a href="tel:${PHONE}" class="btn btn-ol" style="padding:.6rem 1.1rem;font-size:.62rem">${PHONE_FMT}</a>
        <a href="${B}contact.html" class="btn btn-dk" data-t="nav_cta">Consultanță gratuită</a>
      </div>
      <button class="hbg" id="hbg"><span></span><span></span><span></span></button>
    </div>
  </nav>
  <div class="mob-nav" id="mobNav">
    <div class="mob-label" data-t="nav_props">Proprietăți</div>
    <div class="mob-sub"><a href="${B}vanzari.html" data-t="nav_sales">Vânzări</a></div>
    <div class="mob-sub"><a href="${B}inchirieri.html" data-t="nav_rent">Închirieri</a></div>
    <a href="${B}proiecte.html" data-t="nav_projects">Proiecte</a>
    <a href="${B}servicii.html" data-t="nav_services">Servicii</a>
    <a href="${B}index.html#zones" data-t="nav_zones">Zone</a>
    <a href="${B}despre.html" data-t="nav_about">Despre IMONDO</a>
    <a href="${B}contact.html" data-t="nav_contact">Contact</a>
    <a href="${B}contact.html" data-t="nav_cta" style="color:var(--gold)">Consultanță gratuită</a>
  </div>`;

  /* ── BREADCRUMB ── */
  let breadcrumb = '';
  if(PAGE.crumbs && PAGE.crumbs.length){
    const items = [`<a href="${B}index.html" data-t="crumb_home">Acasă</a>`];
    PAGE.crumbs.forEach((c,i)=>{
      const last = i===PAGE.crumbs.length-1;
      if(last) items.push(`<span class="current" data-t="${c.t}">${c.label||''}</span>`);
      else items.push(`<a href="${B}${c.href}" data-t="${c.t}">${c.label||''}</a>`);
    });
    breadcrumb = `<div class="breadcrumb"><div class="container">${items.join('<span class="sep">›</span>')}</div></div>`;
  }

  /* ── FOOTER ── */
  const footer = `
  <footer>
    <div class="container">
      <div class="fgrid">
        <div class="fbrand"><a href="${B}index.html" class="flogo">IMONDO<em>.</em></a><p data-t="foot_p">Agenție imobiliară premium în București. Transparență, profesionalism și rezultate reale — pentru fiecare client în parte.</p></div>
        <div class="fcol"><h4 data-t="fc1_h">Proprietăți</h4><ul><li><a href="${B}vanzari.html" data-t="fc1_1">De vânzare</a></li><li><a href="${B}inchirieri.html" data-t="fc1_2">De închiriat</a></li><li><a href="${B}proiecte.html" data-t="fc1_3">Proiecte rezidențiale</a></li></ul></div>
        <div class="fcol"><h4 data-t="fc2_h">Servicii</h4><ul><li><a href="${B}servicii.html" data-t="fc2_1">Pentru proprietari</a></li><li><a href="${B}servicii.html" data-t="fc2_2">Pentru cumpărători</a></li><li><a href="${B}servicii.html" data-t="fc2_3">Pentru chiriași</a></li></ul></div>
        <div class="fcol"><h4 data-t="fc3_h">Contact</h4><ul><li><a href="tel:${PHONE}">${PHONE_FMT}</a></li><li><a href="mailto:${EMAIL}">${EMAIL}</a></li><li><a href="${WA}" data-t="fc3_wa">WhatsApp</a></li><li><a href="https://imondorealestate.com">imondorealestate.com</a></li><li><a href="${B}contact.html">București, Sector 1</a></li></ul></div>
      </div>
      <div class="flegal">
        <div class="flegal-links">
          <a href="${B}index.html" data-t="leg1">Politică de Confidențialitate</a>
          <a href="${B}index.html" data-t="leg2">Termeni și Condiții</a>
          <a href="${B}index.html" data-t="leg3">Politică Cookie-uri</a>
          <a href="https://anpc.ro" target="_blank" rel="noopener">ANPC</a>
        </div>
        <span class="fcopy" data-t="leg_copy">© 2025 IMONDO REAL ESTATE S.R.L. · CUI RO 44477606</span>
      </div>
      <div class="fbot-row">
        <span class="fcopy" style="font-size:.62rem">IMONDO REAL ESTATE S.R.L. · CUI RO 44477606 · București, Sector 1, România · Toate drepturile rezervate</span>
        <div class="lang-switch" style="gap:.4rem">
          <button class="lang-btn on" data-lang="ro" style="color:rgba(255,255,255,.4);border-color:transparent">RO</button>
          <button class="lang-btn" data-lang="en" style="color:rgba(255,255,255,.4);border-color:transparent">EN</button>
          <button class="lang-btn" data-lang="es" style="color:rgba(255,255,255,.4);border-color:transparent">ES</button>
          <button class="lang-btn" data-lang="fr" style="color:rgba(255,255,255,.4);border-color:transparent">FR</button>
        </div>
      </div>
    </div>
  </footer>
  <a href="${WA}" target="_blank" class="wa" title="WhatsApp IMONDO">💬</a>
  <div class="mcta">
    <a href="tel:${PHONE}" data-event="click_telefon"><span class="mcta-ico">📞</span><span data-t="mcta_call">Sună</span></a>
    <a id="mctaWa" href="${WA}" target="_blank" rel="noopener" data-event="click_whatsapp"><span class="mcta-ico">💬</span><span data-t="mcta_wa">WhatsApp</span></a>
    <a href="${B}contact.html?subiect=evaluare" class="mcta-gd" data-event="cta_evaluare"><span class="mcta-ico">✦</span><span data-t="mcta_eval">Evaluare</span></a>
  </div>`;

  /* ── INJECTARE ── */
  function inject(id, html){ const el=document.getElementById(id); if(el) el.innerHTML=html; }
  inject('site-header', header);
  inject('site-breadcrumb', breadcrumb);
  inject('site-footer', footer);

  /* ── WhatsApp precompletat contextual (per pagină) ── */
  (function(){
    const ctx = PAGE.waText || ('Bună ziua! Vă scriu de pe ' + document.title.replace(/\s*\|.*$/,'').trim() + ' (imondorealestate.com). Aș dori mai multe informații.');
    const url = WA + '?text=' + encodeURIComponent(ctx);
    document.querySelectorAll('a.wa, #mctaWa').forEach(a=>a.setAttribute('href', url));
  })();

  /* ── LIMBĂ ── */
  let curLang = 'ro';
  function setLang(lang){
    curLang = lang;
    document.documentElement.lang = lang;
    const d = T[lang]; if(!d) return;
    document.querySelectorAll('[data-t]').forEach(el=>{ const k=el.dataset.t; if(d[k]) el.textContent=d[k]; });
    document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('on', b.dataset.lang===lang));
  }
  window.IMONDO_setLang = setLang;
  document.querySelectorAll('.lang-btn').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));

  /* ── NAV scroll + meniu mobil ── */
  window.addEventListener('scroll',()=>{ const n=document.getElementById('nav'); if(n) n.classList.toggle('s', scrollY>40); });
  const hbg=document.getElementById('hbg'), mobNav=document.getElementById('mobNav');
  if(hbg) hbg.addEventListener('click',()=>mobNav.classList.toggle('open'));
  document.addEventListener('click',e=>{
    if(mobNav && mobNav.classList.contains('open') && !mobNav.contains(e.target) && !document.getElementById('nav').contains(e.target))
      mobNav.classList.remove('open');
  });

  /* ── REVEAL (cu fallback siguranță) ── */
  const ro2=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');ro2.unobserve(e.target)}})},{threshold:.08,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('[data-r]').forEach(el=>ro2.observe(el));
  setTimeout(()=>document.querySelectorAll('[data-r]:not(.in)').forEach(el=>el.classList.add('in')),3000);

  /* ── SCHEMA BreadcrumbList (SEO intern) ── */
  if(PAGE.crumbs && PAGE.crumbs.length){
    const base='https://imondorealestate.com/';
    const items=[{name:(T.ro.crumb_home||'Acasă'),url:base}];
    PAGE.crumbs.forEach(c=>items.push({name:(c.label||''), url: c.href && c.href!=='#' ? base+c.href : null }));
    const ld={"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":items.map((it,i)=>{
      const o={"@type":"ListItem","position":i+1,"name":it.name};
      if(it.url) o.item=it.url;
      return o;
    })};
    const s=document.createElement('script'); s.type='application/ld+json'; s.textContent=JSON.stringify(ld);
    document.head.appendChild(s);
  }

  /* ── TRACKING delegat (telefon/WhatsApp + data-event) — no-op fără GTM/GA/Meta ── */
  function imTrack(name){try{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:name});if(typeof gtag==='function')gtag('event',name);if(typeof fbq==='function')fbq('trackCustom',name);}catch(e){}}
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href]'); if(!a) return;
    const href=a.getAttribute('href')||'';
    const ev=a.dataset.event || (href.startsWith('tel:')?'click_telefon':/wa\.me|whatsapp/i.test(href)?'click_whatsapp':null);
    if(ev)imTrack(ev);
  });

  /* ── FORMULARE LEAD segmentate (Formspree) — handler delegat ── */
  document.addEventListener('submit', async e=>{
    const f = e.target;
    if(!(f.matches && f.matches('form[data-lead]'))) return;
    e.preventDefault();
    const btn = f.querySelector('button[type=submit]');
    const ok = (f.parentNode && f.parentNode.querySelector('.fok')) || f.querySelector('.fok');
    const orig = btn ? btn.textContent : '';
    if(btn){ btn.textContent='Se trimite...'; btn.disabled=true; }
    f.style.opacity='.6'; f.style.pointerEvents='none';
    try{
      const res = await fetch(f.action, {method:'POST', body:new FormData(f), headers:{'Accept':'application/json'}});
      if(!res.ok) throw 0;
      f.style.display='none'; if(ok) ok.style.display='block';
      imTrack('submit_formular_' + (f.dataset.lead||'lead'));
    }catch(_){
      if(btn){ btn.textContent='Eroare — reîncearcă'; btn.disabled=false; }
      f.style.opacity='1'; f.style.pointerEvents='auto';
      setTimeout(()=>{ if(btn) btn.textContent=orig; }, 2500);
    }
  });

  /* aplică limba implicită (RO) pentru a sincroniza eventualele texte injectate */
  setLang('ro');
})();
