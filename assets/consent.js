/* ════════════════════════════════════════════════════════════════
   IMONDO — consimțământ cookie-uri (14.10.2026)
   Google Analytics (și, când va avea un ID real, Meta Pixel) se încarcă DOAR după „Accept toate”.
   „Refuz opționalele” le ține oprite efectiv; o schimbare ulterioară din „Accept” în „Refuz” șterge
   cookie-urile de analiză și reîncarcă pagina, ca scripturile să nu mai ruleze.
   Bannerul apare pe orice pagină până la prima alegere; „Setări cookie-uri” (subsol / politică) îl redeschide.
   Încărcat pe toate paginile: direct (index, fișe) sau prin include.js.
   ════════════════════════════════════════════════════════════════ */
(function () {
  if (window.IMONDO_consent) return;
  const KEY = 'imondo_cookie';
  const GA_ID = 'G-49RFGB91ZH';
  const META_PIXEL_ID = '';            // gol = Meta Pixel nu se încarcă deloc (azi nu există un ID real)
  const base = (function () {           // calea spre rădăcina site-ului (pagini din zone/ → '../')
    const s = document.currentScript && document.currentScript.getAttribute('src') || '';
    return s.replace(/assets\/consent\.js.*$/, '');
  })();

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) { } }

  let loaded = false;
  function loadTrackers() {
    if (loaded) return; loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.gtag('js', new Date()); window.gtag('config', GA_ID);
    if (META_PIXEL_ID) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', META_PIXEL_ID); window.fbq('track', 'PageView');
    }
  }
  function clearTrackerCookies() {
    const host = location.hostname, parts = host.split('.'), domains = ['', host, '.' + host];
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => /^(_ga|_gid|_gat|_fbp|_fbc)/.test(n)).forEach(n => {
      domains.forEach(d => { document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : ''); });
    });
  }

  const CSS = `
.imck{position:fixed;left:0;right:0;bottom:0;z-index:9000;background:#1A1714;border-top:1px solid rgba(201,168,76,.25);padding:1.1rem 4%;display:flex;gap:1.2rem;align-items:center;justify-content:space-between;flex-wrap:wrap;font-family:'Jost','Poppins',sans-serif}
.imck p{margin:0;font-size:.8rem;line-height:1.6;color:rgba(255,255,255,.72);max-width:680px}
.imck a{color:#C9A84C}
.imck-b{display:flex;gap:.6rem;flex-wrap:wrap}
.imck button{font-family:inherit;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;padding:.7rem 1.1rem;cursor:pointer;border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff}
.imck button.acc{background:#C9A84C;border-color:#C9A84C;color:#0D0D0D}`;
  let banner = null;
  function showBanner() {
    if (banner) { banner.style.display = 'flex'; return; }
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    banner = document.createElement('div'); banner.className = 'imck'; banner.setAttribute('role', 'dialog'); banner.setAttribute('aria-label', 'Cookie-uri');
    banner.innerHTML = '<p>Folosim cookie-uri strict necesare pentru funcționarea site-ului și, doar cu acordul tău, cookie-uri de analiză (Google Analytics). '
      + '<a href="' + base + 'confidentialitate.html#cookies">Politica de cookie-uri</a>.</p>'
      + '<div class="imck-b"><button type="button" data-v="essential">Refuz opționalele</button><button type="button" class="acc" data-v="all">Accept toate</button></div>';
    banner.addEventListener('click', ev => { const b = ev.target.closest('button[data-v]'); if (b) set(b.dataset.v); });
    document.body.appendChild(banner);
  }
  function set(v) {
    const before = get();
    store(v);
    if (banner) banner.style.display = 'none';
    if (v === 'all') loadTrackers();
    else if (before === 'all' || loaded) { clearTrackerCookies(); location.reload(); }   // oprește efectiv ce rula deja
  }
  function init() { const v = get(); if (v === 'all') loadTrackers(); else if (v !== 'essential') showBanner(); }

  window.IMONDO_consent = { get, set, open: showBanner, allowed: () => get() === 'all', _loaded: () => loaded };
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
