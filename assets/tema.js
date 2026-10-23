/* ════════════════════════════════════════════════════════════════
   IMONDO — COMUTATORUL ZI / NOAPTE (22.10.2026). Culorile: assets/tema.css.
   Tema se alege ÎNAINTE de prima randare, din scriptul de 2 rânduri din <head> al fiecărei pagini:
     prima vizită → setarea sistemului; după un click → alegerea vizitatorului (localStorage „imondo_tema”), cu prioritate.
   Aici: butonul din banda de sus (lângă limbi; vizibil și pe telefon) și urmărirea setării sistemului.
   ════════════════════════════════════════════════════════════════ */
(function () {
  if (window.IMONDO_tema) return;
  var KEY = 'imondo_tema', root = document.documentElement;
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z"/></svg>';
  function salvata() { try { var t = localStorage.getItem(KEY); return t === 'dark' || t === 'light' ? t : null; } catch (e) { return null; } }
  function sistem() { return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  function curenta() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function aplica(t) {
    root.setAttribute('data-theme', t);
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', '#0D0D0D');
    var tr = function (x) { return window.IMONDO_i18n ? IMONDO_i18n.tr(x) : x; };   // eticheta în limba paginii
    document.querySelectorAll('.tema-btn').forEach(function (b) {
      var noapte = t === 'dark';
      b.innerHTML = noapte ? SUN : MOON;
      b.removeAttribute('data-ro-aria-label'); b.removeAttribute('data-ro-title');
      b.setAttribute('aria-label', tr(noapte ? 'Treci la tema de zi' : 'Treci la tema de noapte'));
      b.setAttribute('title', tr(noapte ? 'Temă de zi' : 'Temă de noapte'));
      b.setAttribute('aria-pressed', noapte ? 'true' : 'false');
    });
  }
  function comuta() { var t = curenta() === 'dark' ? 'light' : 'dark'; try { localStorage.setItem(KEY, t); } catch (e) {} aplica(t); }
  /* butonul: imediat după selectorul de limbă, în afara zonei care se ascunde pe telefon */
  function monteaza() {
    if (document.querySelector('.tema-btn')) return true;
    var bar = document.querySelector('.lang-bar'); if (!bar) return false;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'tema-btn'; b.addEventListener('click', comuta);
    var left = bar.querySelector('.lang-bar-left');
    if (left && left.nextSibling) bar.insertBefore(b, left.nextSibling); else bar.appendChild(b);
    aplica(curenta());
    return true;
  }
  window.IMONDO_tema = { comuta: comuta, aplica: aplica, monteaza: monteaza };
  document.addEventListener('imondo:lang', function () { aplica(curenta()); });
  // fără alegere salvată, tema urmează sistemul și când acesta se schimbă
  if (window.matchMedia) { var mq = matchMedia('(prefers-color-scheme: dark)'), f = function () { if (!salvata()) aplica(sistem()); };
    if (mq.addEventListener) mq.addEventListener('change', f); else if (mq.addListener) mq.addListener(f); }
  // antetul e construit de assets/include.js (sau e scris în pagină): îl așteptăm
  if (!monteaza()) {
    var obs = new MutationObserver(function () { if (monteaza()) obs.disconnect(); });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { obs.disconnect(); }, 10000);
  }
})();
