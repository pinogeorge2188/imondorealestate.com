/* ════════════════════════════════════════════════════════════════
   IMONDO — încărcarea proprietăților pentru site (13.10.2026)

   În loc să citească toată colecția `proprietari` (o citire Firestore pe proprietar, la fiecare vizitator),
   citește lista publică pregătită de CRM (`site_cache`: 2–4 documente), plus — dacă există — fișele
   modificate de la ultima regenerare (citite individual, ca vizitatorul să vadă imediat schimbarea).

   SIGURANȚĂ: dacă lista lipsește, e incompletă, e prea veche (peste toleranța din Panoul CRM) sau dă
   eroare, se citește colecția direct, exact ca înainte. Dacă lista nu răspunde în 2 secunde, pornește
   în paralel și citirea directă și se folosește primul rezultat bun. Site-ul nu poate ajunge mai prost decât înainte.

   Rezultatul are aceeași formă ca un QuerySnapshot (forEach → doc.id, doc.data()), deci paginile
   rămân neschimbate. O singură încărcare pe pagină, oricâte secțiuni o cer.

   CALCULATORUL DE RATĂ (23.10.2026): cifrele vin în `index.credit` (scrise de CRM la regenerarea listei),
   deci pagina proprietății nu face nicio citire în plus → `snapshot.credit` (null dacă lipsesc).
   ════════════════════════════════════════════════════════════════ */
const FS_URL = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
const TIMEOUT_MS = 2000;
const VIITOR_MAX_MS = 5 * 60 * 1000;
let _incarcare = null;   // un singur proiect Firebase → o singură încărcare pe pagină
let _credit = null;      // cifrele calculatorului din index (citit oricum); rămân și dacă lista cade pe citirea directă

function ms(v) { if (v && typeof v.toMillis === 'function') return v.toMillis(); const t = Date.parse(v); return isFinite(t) ? t : 0; }

function snapshot(docs, sursa) {
  return {
    sursa, size: docs.length, empty: !docs.length,
    forEach(cb) { docs.forEach(d => cb({ id: d.id, data: () => d.data, exists: () => true })); }
  };
}

async function direct(F, db) {
  const snap = await F.getDocs(F.collection(db, 'proprietari'));
  const docs = []; snap.forEach(d => docs.push({ id: d.id, data: d.data() }));
  return snapshot(docs, 'direct');
}

/* lista din cache; null = nu e utilizabilă (→ citire directă) */
async function dinCache(F, db) {
  const snap = await F.getDocs(F.collection(db, 'site_cache'));
  const by = {}; snap.forEach(d => { by[d.id] = d.data(); });
  const idx = by.index;
  if (idx && idx.credit) _credit = idx.credit;
  if (!idx || !(idx.K > 0)) return null;
  const owners = {};
  for (let i = 0; i < idx.K; i++) {
    const b = by['lista_' + i];
    if (!b || b.versiune !== idx.versiune) return null;
    Object.assign(owners, b.proprietari || {});
  }
  const now = Date.now(), dupa = ms(idx.inclus_pana_la), m = (by.meta && by.meta.modificati) || {};
  const pend = Object.keys(m).map(id => { let t = ms(m[id]); if (t > now + VIITOR_MAX_MS) t = now; return { id, t }; })
    .filter(x => x.t > dupa).sort((a, b) => a.t - b.t);
  const patchMax = idx.patch_max != null ? idx.patch_max : 10, tolMs = (idx.toleranta_min || 15) * 60000;
  let sursa = 'cache';
  if (pend.length && pend.length <= patchMax) {
    const fresh = await Promise.all(pend.map(p => F.getDoc(F.doc(db, 'proprietari', p.id))));
    pend.forEach((p, i) => { if (fresh[i].exists()) owners[p.id] = fresh[i].data(); else delete owners[p.id]; });
    sursa = 'cache + ' + pend.length + ' fișe proaspete';
  } else if (pend.length) {
    if (now - pend[0].t > tolMs) return null;          // prea multe modificări nepreluate, de prea mult timp
    sursa = 'cache (fără ultimele ' + pend.length + ' modificări)';
  }
  return snapshot(Object.keys(owners).map(id => ({ id, data: owners[id] })), sursa);
}

async function incarca(db) {
  const F = await import(FS_URL);
  let directP = null;
  const pornesteDirect = () => directP || (directP = direct(F, db));
  const cacheP = dinCache(F, db).catch(e => { console.warn('[IMONDO] lista site-ului:', e && e.message); return null; });
  const primul = await Promise.race([cacheP, new Promise(r => setTimeout(() => r('timeout'), TIMEOUT_MS))]);
  if (primul && primul !== 'timeout') return primul;
  if (primul === null) return pornesteDirect();
  // lista întârzie: pornim și citirea directă; câștigă primul rezultat bun
  pornesteDirect();
  return primulBun([cacheP.then(r => r || Promise.reject(new Error('cache'))), directP]);
}

/* ca Promise.any (care lipsește pe browserele mai vechi): primul rezultat bun; eroare doar dacă eșuează toate */
function primulBun(ps) {
  return new Promise((resolve, reject) => {
    let rest = ps.length, ultima;
    ps.forEach(p => p.then(resolve, e => { ultima = e; if (--rest === 0) reject(ultima); }));
  });
}

/* o singură încărcare pe pagină (pagina principală o cere din două secțiuni); după o eroare se poate reîncerca */
export function incarcaProprietari(db) {
  if (!_incarcare) {
    _incarcare = incarca(db).then(s => { s.credit = _credit; if (window.IMONDO_DEBUG || /[?&]imondo_debug/.test(location.search)) console.info('[IMONDO] proprietăți din: ' + s.sursa); return s; });
    _incarcare.catch(() => { _incarcare = null; });
  }
  return _incarcare;
}
