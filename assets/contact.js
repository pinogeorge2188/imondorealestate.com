/* ════════════════════════════════════════════════════════════════
   IMONDO — DATELE DE CONTACT ALE AGENȚIEI. SINGURUL LOC DE MODIFICAT.
   Se editează direct pe GitHub (creionul), apoi „Commit changes”: e live în 1–3 minute.

   Toate paginile citesc de aici: antet, subsol, butonul de telefon de pe mobil, WhatsApp,
   pagina de contact, fișele, datele pentru Google (schema), politica de confidențialitate.
   Numerele brokerilor NU sunt aici — sunt în assets/agenti.js.

   Textul scris direct în pagini (officeimondo@gmail.com, +40 752 942 828) e doar rezerva
   pentru vizitatorii fără JavaScript; NU îl modifica acolo, îl înlocuiește automat valoarea de mai jos.
   ════════════════════════════════════════════════════════════════ */
window.IMONDO_CONTACT = {
  telefon:  '+40752942828',          // cu +40, fără spații
  whatsapp: '40752942828',           // fără +, fără spații
  email:    'officeimondo@gmail.com'
};

/* ── de aici în jos nu se modifică ── */
(function () {
  const C = window.IMONDO_CONTACT;
  // valorile scrise în pagini (rezerva fără JavaScript) — se înlocuiesc cu cele de mai sus
  const OLD = { tel: '+40752942828', wa: '40752942828', email: 'officeimondo@gmail.com', fmt: '+40 752 942 828' };
  C.telefonAfisat = String(C.telefon).replace(/^\+40(\d{3})(\d{3})(\d{3})$/, '+40 $1 $2 $3');
  C.waLink = 'https://wa.me/' + C.whatsapp;
  if (C.telefon === OLD.tel && C.whatsapp === OLD.wa && C.email === OLD.email) return;   // nimic de înlocuit
  const swap = s => String(s).split(OLD.email).join(C.email).split(OLD.fmt).join(C.telefonAfisat).split(OLD.tel).join(C.telefon).split('wa.me/' + OLD.wa).join('wa.me/' + C.whatsapp);
  function apply(root) {
    (root || document).querySelectorAll('a[href]').forEach(a => {
      if (a.closest('[data-agent]')) return;                       // linkurile brokerilor (assets/agenti.js) rămân ale lor
      const h = a.getAttribute('href'), nh = swap(h); if (nh !== h) a.setAttribute('href', nh);
    });
    const w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) {
      if (n.parentNode && n.parentNode.closest && n.parentNode.closest('[data-agent]')) continue;
      const v = n.nodeValue; if (v && (v.indexOf(OLD.email) >= 0 || v.indexOf(OLD.fmt) >= 0 || v.indexOf(OLD.tel) >= 0)) n.nodeValue = swap(v);
    }
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => { const t = s.textContent, nt = swap(t); if (nt !== t) s.textContent = nt; });
  }
  window.IMONDO_contactApply = apply;
  function run() { apply(document); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);   // și după ce antetul / subsolul / fișele s-au desenat
})();
