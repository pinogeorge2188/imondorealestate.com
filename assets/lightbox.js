/* ════════════════════════════════════════════════════════════════
   IMONDO — imagine pe tot ecranul, cu zoom (14.10.2026)
   window.IMONDO_lightbox.open(urls, index, eticheta?)
   - imaginea ÎNTREAGĂ (niciodată tăiată), fundal crem #F9F5EE
   - zoom: dublu-click / dublu-tap, rotița mouse-ului, „ciupit” cu două degete, butoanele + / −
   - mutare cu mouse-ul / degetul când e mărită; glisare stânga-dreapta când nu e mărită
   - tastatură: ← → (navigare), + − (zoom), Esc (închide)
   ════════════════════════════════════════════════════════════════ */
(function () {
  if (window.IMONDO_lightbox) return;
  const CSS = `
.imlb{position:fixed;inset:0;z-index:10000;background:#F9F5EE;display:none;flex-direction:column;touch-action:none;user-select:none;-webkit-user-select:none}
.imlb.on{display:flex}
.imlb-bar{display:flex;align-items:center;justify-content:space-between;padding:.7rem 1rem;color:#0D0D0D;font-family:'Jost','Poppins',sans-serif;font-size:.85rem;letter-spacing:.06em;gap:.6rem}
.imlb-bar .imlb-lbl{color:#9A7B2F;text-transform:uppercase;font-size:.72rem;letter-spacing:.14em}
.imlb-btns{display:flex;gap:.4rem}
.imlb button{width:42px;height:42px;border:1px solid rgba(13,13,13,.18);background:rgba(255,255,255,.7);color:#0D0D0D;font-size:1.15rem;cursor:pointer;border-radius:50%;line-height:1;display:flex;align-items:center;justify-content:center;transition:.2s}
.imlb button:hover{background:#C9A84C;border-color:#C9A84C}
.imlb-stage{position:relative;flex:1;overflow:hidden;cursor:zoom-in}
.imlb-stage.z{cursor:grab}.imlb-stage.drag{cursor:grabbing}
.imlb-stage img{position:absolute;left:50%;top:50%;max-width:96%;max-height:96%;width:auto;height:auto;object-fit:contain;transform-origin:center center;will-change:transform;pointer-events:none}
.imlb-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:2}
.imlb-prev{left:.8rem}.imlb-next{right:.8rem}
.imlb-hint{text-align:center;color:rgba(13,13,13,.45);font-family:'Jost','Poppins',sans-serif;font-size:.72rem;padding:.4rem 0 .8rem}
@media(max-width:600px){.imlb-nav{display:none!important}}`;
  let root, stage, img, cnt, lbl, list = [], idx = 0, z = 1, tx = 0, ty = 0;
  const ptr = new Map(); let pinch0 = null, pan0 = null, lastTap = 0, swipe0 = null;

  function build() {
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    root = document.createElement('div'); root.className = 'imlb'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
    root.innerHTML = '<div class="imlb-bar"><span><span class="imlb-cnt"></span> <span class="imlb-lbl"></span></span><div class="imlb-btns">'
      + '<button type="button" data-a="out" aria-label="Micșorează">−</button><button type="button" data-a="in" aria-label="Mărește">+</button>'
      + '<button type="button" data-a="x" aria-label="Închide">×</button></div></div>'
      + '<div class="imlb-stage"><img alt=""><button type="button" class="imlb-nav imlb-prev" data-a="prev" aria-label="Anterioara">‹</button>'
      + '<button type="button" class="imlb-nav imlb-next" data-a="next" aria-label="Următoarea">›</button></div>'
      + '<div class="imlb-hint">Dublu-click sau ciupește pentru zoom</div>';
    document.body.appendChild(root);
    stage = root.querySelector('.imlb-stage'); img = stage.querySelector('img');
    cnt = root.querySelector('.imlb-cnt'); lbl = root.querySelector('.imlb-lbl');
    root.addEventListener('click', ev => {
      const a = ev.target.closest('[data-a]'); if (!a) return;
      ({ x: close, prev: () => go(-1), next: () => go(1), in: () => zoomAt(z * 1.6), out: () => zoomAt(z / 1.6) })[a.dataset.a]();
    });
    stage.addEventListener('wheel', ev => { ev.preventDefault(); zoomAt(z * (ev.deltaY < 0 ? 1.2 : 1 / 1.2), ev.clientX, ev.clientY); }, { passive: false });
    stage.addEventListener('dblclick', ev => { ev.preventDefault(); toggleZoom(ev.clientX, ev.clientY); });
    stage.addEventListener('pointerdown', down); stage.addEventListener('pointermove', move);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => stage.addEventListener(t, up));
    document.addEventListener('keydown', ev => {
      if (!root.classList.contains('on')) return;
      if (ev.key === 'Escape') close(); else if (ev.key === 'ArrowLeft') go(-1); else if (ev.key === 'ArrowRight') go(1);
      else if (ev.key === '+' || ev.key === '=') zoomAt(z * 1.6); else if (ev.key === '-') zoomAt(z / 1.6);
    });
  }
  function apply() {
    img.style.transform = 'translate(calc(-50% + ' + tx + 'px), calc(-50% + ' + ty + 'px)) scale(' + z + ')';
    stage.classList.toggle('z', z > 1.01);
  }
  function clampPan() {
    const r = stage.getBoundingClientRect(), w = img.offsetWidth * z, h = img.offsetHeight * z;
    const mx = Math.max(0, (w - r.width) / 2), my = Math.max(0, (h - r.height) / 2);
    tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty));
  }
  function zoomAt(nz, cx, cy) {
    nz = Math.max(1, Math.min(5, nz));
    const r = stage.getBoundingClientRect();
    const px = (cx == null ? r.left + r.width / 2 : cx) - (r.left + r.width / 2), py = (cy == null ? r.top + r.height / 2 : cy) - (r.top + r.height / 2);
    tx = px - (px - tx) * (nz / z); ty = py - (py - ty) * (nz / z); z = nz;
    if (z === 1) { tx = 0; ty = 0; }
    clampPan(); apply();
  }
  function toggleZoom(cx, cy) { zoomAt(z > 1.01 ? 1 : 2.5, cx, cy); }
  function down(ev) {
    stage.setPointerCapture && stage.setPointerCapture(ev.pointerId);
    ptr.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), z, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; pan0 = null; swipe0 = null; return; }
    if (ev.pointerType !== 'mouse') {   // dublu-tap pe telefon
      const now = Date.now(); if (now - lastTap < 300) { toggleZoom(ev.clientX, ev.clientY); lastTap = 0; return; } lastTap = now;
    }
    if (z > 1.01) { pan0 = { x: ev.clientX, y: ev.clientY, tx, ty }; stage.classList.add('drag'); }
    else swipe0 = { x: ev.clientX, y: ev.clientY };
  }
  function move(ev) {
    if (!ptr.has(ev.pointerId)) return;
    ptr.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (pinch0 && ptr.size === 2) { const [a, b] = [...ptr.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); z = pinch0.z; zoomAt(pinch0.z * d / pinch0.d, pinch0.cx, pinch0.cy); return; }
    if (pan0) { tx = pan0.tx + ev.clientX - pan0.x; ty = pan0.ty + ev.clientY - pan0.y; clampPan(); apply(); }
  }
  function up(ev) {
    if (swipe0 && ptr.size === 1) { const dx = ev.clientX - swipe0.x, dy = ev.clientY - swipe0.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1); }
    ptr.delete(ev.pointerId); if (ptr.size < 2) pinch0 = null;
    if (!ptr.size) { pan0 = null; swipe0 = null; stage.classList.remove('drag'); }
  }
  function show() {
    z = 1; tx = 0; ty = 0; apply();
    img.src = list[idx];
    cnt.textContent = list.length > 1 ? (idx + 1) + ' / ' + list.length : '';
    root.querySelectorAll('.imlb-nav').forEach(b => { b.style.display = list.length > 1 ? '' : 'none'; });
  }
  function go(d) { if (list.length < 2) return; idx = (idx + d + list.length) % list.length; show(); }
  let prevOverflow = '';
  function open(urls, i, eticheta) {
    if (!root) build();
    list = (urls || []).filter(Boolean); if (!list.length) return;
    idx = Math.max(0, Math.min(list.length - 1, i || 0));
    lbl.textContent = eticheta || '';
    prevOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    root.classList.add('on'); show();
    root.querySelector('[data-a="x"]').focus();
  }
  function close() { root.classList.remove('on'); document.body.style.overflow = prevOverflow; img.removeAttribute('src'); }
  window.IMONDO_lightbox = { open, close, _state: () => ({ open: !!root && root.classList.contains('on'), idx, z, src: img && img.getAttribute('src') }) };
})();

/* fotografiile fără schițe (schițele / planurile se arată separat) — pentru galerii și carduri */
window.IMONDO_fotos = function (p) {
  const all = ((p && (p.poze || p.imagini)) || []).filter(Boolean), sc = new Set((p && p.poze_schite) || []);
  const f = all.filter(u => !sc.has(u));
  if (!f.length) return { fotos: all, schite: [], cover: all[0] || '' };   // doar schițe: rămân în galerie
  return { fotos: f, schite: all.filter(u => sc.has(u)), cover: f[0] };
};
