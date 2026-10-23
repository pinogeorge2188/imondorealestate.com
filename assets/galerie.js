/* ════════════════════════════════════════════════════════════════
   IMONDO — GALERIA MOZAIC, una singură pentru tot site-ul (24.10.2026)
   Pagina proprietății și pagina de proiect folosesc ACEST cod (nu copii): o fotografie mare + trei mici,
   „+N foto” pe a patra, click → imaginea întreagă pe tot ecranul (assets/lightbox.js, încărcat aici dacă lipsește).

   IMONDO_galerie.mozaic(element, {
     fotos:      [url, ...]          — DOAR fotografii (schițele au secțiunea lor; nu se pun aici)
     eticheta:   'De vânzare'        — insigna de pe fotografia mare (opțional)
     etichetaAuriu: true             — insigna aurie (închiriere / stadiu proiect)
     rezerva:    url                 — imaginea afișată când nu există nicio fotografie (fără click)
     laDeschidere: function (i) {}  — apelată când se deschide pe tot ecranul (statistici)
   })
   Stilul e aici (o singură dată); culorile de noapte sunt în assets/tema.css (.pv-gal, .pv-badge).
   ════════════════════════════════════════════════════════════════ */
(function () {
  if (window.IMONDO_galerie) return;
  var CSS = '.pv-gal{display:grid;grid-template-columns:2fr 1fr;grid-template-rows:repeat(3,1fr);gap:8px;height:540px;margin-bottom:2rem}'
    + '.pv-gal button{position:relative;padding:0;border:0;background:#F9F5EE;cursor:zoom-in;overflow:hidden;display:block;width:100%;height:100%}'
    + '.pv-gal.gol button{cursor:default}'
    + '.pv-gal img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}'
    + '.pv-gal button:hover img{transform:scale(1.03)}.pv-gal.gol button:hover img{transform:none}'
    + '.pv-gal .big{grid-row:1/4;grid-column:1}'
    + '.pv-gal.n1{grid-template-columns:1fr}.pv-gal.n1 .big{grid-row:1/4}'
    + '.pv-gal.n2 .sm{grid-row:span 3}.pv-gal.n3 .sm{grid-row:span 1}.pv-gal.n3 .sm:nth-of-type(3){grid-row:2/4}'
    + ".pv-gal .more{position:absolute;inset:0;background:rgba(13,13,13,.55);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Poppins',sans-serif;font-size:1.05rem;font-weight:500;letter-spacing:.04em}"
    + '.pv-badge{position:absolute;top:1rem;left:1rem;z-index:2;font-size:.62rem;font-weight:500;letter-spacing:.14em;text-transform:uppercase;padding:.4rem .9rem;background:#0D0D0D;color:#fff}'
    + '.pv-badge.i{background:#C9A84C;color:#0D0D0D}'
    + '@media(max-width:960px){.pv-gal{height:auto;grid-template-columns:repeat(3,1fr);grid-template-rows:260px 90px}'
    + '.pv-gal .big{grid-row:1;grid-column:1/4}.pv-gal .sm{grid-row:2 !important}'
    + '.pv-gal.n1{grid-template-rows:260px}.pv-gal.n2 .sm{grid-column:1/4}}';
  var st = document.createElement('style'); st.setAttribute('data-galerie', '1'); st.textContent = CSS; document.head.appendChild(st);

  /* vizualizatorul pe tot ecranul: același fișier ca restul site-ului */
  if (!window.IMONDO_lightbox && !document.querySelector('script[src*="lightbox.js"]')) {
    var cur = document.currentScript && document.currentScript.src, s = document.createElement('script');
    s.src = cur ? cur.replace(/galerie\.js(\?.*)?$/, 'lightbox.js') : 'assets/lightbox.js'; document.head.appendChild(s);
  }
  var tx = function (ro, en) { return window.IMONDO_i18n && IMONDO_i18n.limba() === 'en' ? en : ro; };
  var esc = function (v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };

  function mozaic(el, o) {
    if (!el) return;
    o = o || {};
    var fotos = (o.fotos || []).filter(Boolean), are = fotos.length > 0;
    var shown = are ? fotos.slice(0, 4) : (o.rezerva ? [o.rezerva] : []), rest = fotos.length - 4;
    el.className = 'pv-gal n' + Math.max(1, Math.min(shown.length, 4)) + (are ? '' : ' gol');
    var badge = o.eticheta ? '<span class="pv-badge' + (o.etichetaAuriu ? ' i' : '') + '">' + esc(o.eticheta) + '</span>' : '';
    el.innerHTML = shown.map(function (u, i) {
      return '<button type="button" class="' + (i ? 'sm' : 'big') + '"' + (are ? ' data-i="' + i + '"' : ' tabindex="-1"')
        + ' aria-label="' + tx('Fotografia', 'Photo') + ' ' + (i + 1) + (are ? tx(', deschide pe tot ecranul', ', open full screen') : '') + '">'
        + '<img src="' + esc(u) + '" alt="' + tx('Foto', 'Photo') + ' ' + (i + 1) + '"' + (i ? ' loading="lazy"' : '') + (o.rezerva ? ' onerror="if(this.src!==\'' + esc(o.rezerva) + '\')this.src=\'' + esc(o.rezerva) + '\'"' : '') + '>'
        + (i === 0 ? badge : '') + (i === 3 && rest > 0 ? '<span class="more">+' + rest + ' ' + tx('foto', 'photos') + '</span>' : '') + '</button>';
    }).join('');
    el.onclick = function (ev) {
      var b = ev.target.closest && ev.target.closest('button[data-i]'); if (!b || !are) return;
      deschide(fotos, +b.getAttribute('data-i'), o.laDeschidere);
    };
  }
  function deschide(fotos, i, cb) {
    var go = function () { window.IMONDO_lightbox.open(fotos, i || 0); if (cb) cb(i || 0); };
    if (window.IMONDO_lightbox) return go();
    var n = 0, t = setInterval(function () { if (window.IMONDO_lightbox || ++n > 40) { clearInterval(t); if (window.IMONDO_lightbox) go(); } }, 50);
  }
  window.IMONDO_galerie = { mozaic: mozaic, deschide: deschide };
})();
