/* ════════════════════════════════════════════════════════════════
   IMONDO — BROKERII: caseta „Brokerul tău” (pagina proprietății) și fișa client.
   Cheia = codul agentului din CRM (agent_uid). Se editează direct pe GitHub. Ce pui aici e PUBLIC.

   Pentru fiecare agent schimbi DOAR rândurile marcate cu  ← :
     telefon:  '+407XXXXXXXX'   cu +40 în față, fără spații
     whatsapp: '407XXXXXXXX'    același număr, fără +
     email:    'nume@...'       până la redirecționare poate rămâne cel al agenției
   foto: 'assets/agenti/<nume>.jpg' (JPG pătrat, 800×800 px, sub 200 KB). Gol = inițialele pe cerc crem.

   Un rând lăsat gol ('') sau un agent care lipsește → se folosesc datele agenției (assets/contact.js).
   ════════════════════════════════════════════════════════════════ */
window.IMONDO_AGENTI = {

  /* ── George Țigăneșteanu ── */
  'yK4xsmxSEZhAEqbFWwfkqzULEw53': {
    nume: 'George Țigăneșteanu',
    rol: 'Fondator & Broker Owner',
    telefon: '+40752942828',              // ← telefonul lui George
    whatsapp: '40752942828',              // ← WhatsApp George (fără +)
    email: 'officeimondo@gmail.com',      // ← email George
    foto: ''
  },

  /* ── Stefan Stoiciu ── */
  'XgUMCUu1lPRK1WNaGqzU26gHo322': {
    nume: 'Stefan Stoiciu',
    rol: 'Consultant Imobiliar',
    telefon: '',                          // ← telefonul lui Stefan, ex. '+40722123456'
    whatsapp: '',                         // ← WhatsApp Stefan, ex. '40722123456'
    email: '',                            // ← email Stefan (gol = emailul agenției)
    foto: ''
  },

  /* ── Camelia Anton ── */
  '9jer25MpP6XaOWBARjGj4viXOjy1': {
    nume: 'Camelia Anton',
    rol: 'Consultant Imobiliar',
    telefon: '',                          // ← telefonul Cameliei, ex. '+40733123456'
    whatsapp: '',                         // ← WhatsApp Camelia, ex. '40733123456'
    email: '',                            // ← email Camelia (gol = emailul agenției)
    foto: ''
  }

};

/* rezervă: proprietate fără agent sau agent care nu e în lista de mai sus — datele agenției (assets/contact.js) */
window.IMONDO_AGENTIE = (function () {
  const C = window.IMONDO_CONTACT || { telefon: '+40752942828', whatsapp: '40752942828', email: 'officeimondo@gmail.com' };
  return { nume: 'IMONDO Real Estate', rol: 'Consultant dedicat', telefon: C.telefon, whatsapp: C.whatsapp, email: C.email, foto: '' };
})();
