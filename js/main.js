/* Anwesa Ray — portfolio interactions. No libraries, ~8 KB. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mqMobile = matchMedia('(max-width: 820px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const crt = $('.crt'), screen = $('#screen'), stage = $('#stage');
  let k = 1;

  /* ---------- 1. Fit the 1297×948 desktop into the CRT screen ---------- */
  function fit() {
    const kp = Math.min(crt.clientWidth / 1440, 1.25);
    root.style.setProperty('--kp', kp.toFixed(4));
    if (mqMobile.matches) { k = 1; root.style.setProperty('--k', 1); }
    else { k = screen.clientWidth / 1297; root.style.setProperty('--k', k.toFixed(4)); }
    drawSky();
  }

  /* ---------- 2. Pixel-mosaic sky (drawn, not downloaded) ---------- */
  const sky = $('#sky');
  function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
  function noise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  const fbm = (x, y) => noise(x, y) * .55 + noise(x * 2.1, y * 2.1) * .28 + noise(x * 4.3, y * 4.3) * .17;
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (c1, c2, t) => c1.map((v, i) => Math.round(lerp(v, c2[i], t)));
  const STOPS = [[0, [62, 127, 214]], [.45, [110, 166, 234]], [1, [183, 214, 246]]];
  function base(t) { for (let i = 1; i < STOPS.length; i++) if (t <= STOPS[i][0]) { const [p0, c0] = STOPS[i - 1], [p1, c1] = STOPS[i]; return mix(c0, c1, (t - p0) / (p1 - p0)); } return STOPS[2][1]; }
  function drawSky() {
    const dpr = Math.min(devicePixelRatio || 1, 2), W = screen.clientWidth, H = screen.clientHeight;
    if (!W || !H) return;
    sky.width = Math.round(W * dpr); sky.height = Math.round(H * dpr);
    const c = sky.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgb(84,140,214)'); g.addColorStop(.5, 'rgb(128,176,232)'); g.addColorStop(1, 'rgb(190,215,242)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const s = mqMobile.matches ? 12 : 13.6 * k, gap = Math.max(1, 1.6 * Math.min(k, 1.4)), ang = -0.07;
    c.save(); c.translate(W / 2, H / 2); c.rotate(ang);
    const R = Math.hypot(W, H) / 2 + s;
    for (let y = -R; y < R; y += s) for (let x = -R; x < R; x += s) {
      // position back in screen space for colour lookup
      const sx = W / 2 + x * Math.cos(ang) - y * Math.sin(ang), sy = H / 2 + x * Math.sin(ang) + y * Math.cos(ang);
      if (sx < -s || sy < -s || sx > W + s || sy > H + s) continue;
      const t = Math.min(Math.max(sy / H, 0), 1);
      const cloud = Math.max(0, fbm(sx / W * 3.2 + 7, sy / H * 2.4 + 3) - .42) * 1.9;
      let col = mix(base(t), [214, 230, 248], Math.min(cloud, .85) * .62);
      const j = (hash(Math.round(x / s), Math.round(y / s)) - .5) * 22;
      col = col.map(v => Math.max(0, Math.min(255, v + j)));
      c.fillStyle = `rgb(${col})`; c.fillRect(x + gap / 2, y + gap / 2, s - gap, s - gap);
    }
    c.restore();
  }

  /* ---------- 3. Desktop icons: click to select, double-click (or tap) to open ---------- */
  const coarse = matchMedia('(pointer: coarse)').matches;
  const icons = $$('.icon');
  let z = 30;
  const front = el => { el.style.zIndex = ++z; };
  function select(icon) { icons.forEach(i => i.classList.toggle('is-selected', i === icon)); }
  function openTarget(sel) {
    const t = $(sel); if (!t) return;
    if (t.classList.contains('popup')) { t.classList.add('open'); front(t); t.focus({ preventScroll: true }); }
    else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }
  function doneHint() { $('#icon-paintings').classList.add('hint-done'); }
  icons.forEach(icon => {
    icon.addEventListener('click', () => { doneHint(); if (coarse || mqMobile.matches) openTarget(icon.dataset.open); else select(icon); });
    icon.addEventListener('dblclick', () => openTarget(icon.dataset.open));
    icon.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); openTarget(icon.dataset.open); } });
  });
  if (!reduced) setTimeout(() => { const p = $('#icon-paintings'); p.classList.add('wiggle'); setTimeout(() => p.classList.remove('wiggle'), 1800); }, 1400);
  $$('.popup [data-close]').forEach(b => b.addEventListener('click', () => b.closest('.popup').classList.remove('open')));

  /* ---------- 4. Draggable windows ---------- */
  $$('.win [data-drag]').forEach(bar => {
    const win = bar.closest('.win');
    let sx, sy, ox = 0, oy = 0, on = false;
    bar.addEventListener('pointerdown', e => {
      if (mqMobile.matches || e.target.closest('button')) return;
      on = true; sx = e.clientX; sy = e.clientY; front(win); win.classList.add('dragging'); bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove', e => {
      if (!on) return;
      const scale = stage.contains(win) ? k : 1;
      win.style.translate = `${ox + (e.clientX - sx) / scale}px ${oy + (e.clientY - sy) / scale}px`;
    });
    const end = e => { if (!on) return; on = false; const scale = stage.contains(win) ? k : 1; ox += (e.clientX - sx) / scale; oy += (e.clientY - sy) / scale; win.classList.remove('dragging'); };
    bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
  });

  /* ---------- 5. paint.exe ---------- */
  const grid = $('#paint-grid');
  const HEART = ['............', '...BP..YB...', '..BPMLYBPM..', '..PMLYBPML..', '...LYBPML...', '....BPML....', '.....ML.....', '............', '............'];
  const PAL = { P: '#FFB3C7', M: '#B9E6D3', L: '#C9B8FF', Y: '#FFE07A', B: '#A9D8FF' };
  const cells = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 12; c++) { const i = document.createElement('i'); const ch = (HEART[r] || '')[c]; if (PAL[ch]) i.style.background = PAL[ch]; grid.appendChild(i); cells.push(i); }
  let brush = '#FFB3C7', painting = false, erase = false;
  const paintAt = e => { const el = document.elementFromPoint(e.clientX, e.clientY); if (el && el.parentNode === grid) el.style.background = erase ? '#fff' : brush; };
  grid.addEventListener('pointerdown', e => { painting = true; erase = e.button === 2 || e.altKey; grid.setPointerCapture(e.pointerId); paintAt(e); doneHint(); });
  grid.addEventListener('pointermove', e => painting && paintAt(e));
  grid.addEventListener('pointerup', () => painting = false);
  grid.addEventListener('contextmenu', e => e.preventDefault());
  $$('.paint .swatches button').forEach(b => b.addEventListener('click', () => { brush = b.dataset.c; $$('.paint .swatches button').forEach(x => x.setAttribute('aria-pressed', x === b)); }));
  $('#paint-clear').addEventListener('click', () => cells.forEach(c => c.style.background = '#fff'));

  /* ---------- 6. Pixels falling out of the monitor ---------- */
  const cas = $('#cascade'), pc = ['#ffb3c700', '#ffe07a00', '#c9b8ff00', '#b9e6d300', '#a9d8ff00', '#ffc9a800'];
  let sd = 7; const rnd = () => { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; };
  const bits = [];
  cas.style.cssText += 'width:1440px;transform:scale(var(--kp,1));transform-origin:0 0;right:auto';
  for (let i = 0; i < 70; i++) {
    const y = rnd() * 230, spread = 220 + y * 1.6, x = 720 + (rnd() - .5) * spread * 2, sz = Math.max(6, 22 - y / 20), deg = (rnd() - .5) * 40;
    const b = document.createElement('i');
    b.style.cssText = `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;background:${pc[i % 6]};rotate:${deg}deg`;
    cas.appendChild(b); bits.push([b, 60 + (i % 9) * 22, deg]);
  }
  let ticking = false;
  function onScroll() {
    ticking = false;
    const p = Math.min(Math.max(scrollY / (crt.offsetHeight * .7), 0), 1);
    bits.forEach(([b, d, deg]) => { b.style.setProperty('--o', p > .02 ? 1 : 0); b.style.transform = `translateY(${p * d}px) rotate(${p * deg}deg)`; });
  }
  if (!reduced) addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* ---------- 7. About windows tumble in ---------- */
  const wins = $('#about-wins');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { wins.classList.add('in'); io.disconnect(); } }), { threshold: .25 });
    io.observe(wins);
  } else wins.classList.add('in');

  /* ---------- 8. Behance-style case-study modal ---------- */
  const modal = $('#modal'), mbody = $('#modal-body'), sheet = $('.sheet', modal);
  let lastFocus = null, pushed = false;
  async function openCase(slug, push = true) {
    try {
      const res = await fetch(`work/${slug}.html`); if (!res.ok) throw 0;
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const art = doc.querySelector('article'); if (!art) throw 0;
      art.querySelectorAll('[src^="../"]').forEach(n => n.setAttribute('src', n.getAttribute('src').slice(3)));
      mbody.replaceChildren(art);
    } catch { location.href = `work/${slug}.html`; return; }
    lastFocus = document.activeElement;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; sheet.scrollTop = 0; sheet.focus();
    if (push) { history.pushState({ case: slug }, '', `#/work/${slug}`); pushed = true; }
  }
  function closeCase(fromPop) {
    if (!modal.classList.contains('open')) return;
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
    if (!fromPop && pushed) { pushed = false; history.back(); }
    else if (!fromPop) history.replaceState(null, '', location.pathname + '#work');
    lastFocus && lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-case]');
    if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); const pop = a.closest('.popup'); if (pop) pop.classList.remove('open'); openCase(a.dataset.case); }
  });
  $$('[data-close]', modal).forEach(b => b.addEventListener('click', () => closeCase()));
  addEventListener('popstate', () => { const m = location.hash.match(/^#\/work\/([\w-]+)/); if (m) openCase(m[1], false); else closeCase(true); });
  const initial = location.hash.match(/^#\/work\/([\w-]+)/); if (initial) openCase(initial[1], false);

  /* ---------- 9. Paintings: hover to grow, click for a closer look ---------- */
  const gallery = $('#gallery'), pts = $$('.pt', gallery), featured = $('.pt.is-active', gallery);
  const activate = el => pts.forEach(p => p.classList.toggle('is-active', p === el));
  if (!coarse) {
    pts.forEach(p => { p.addEventListener('mouseenter', () => activate(p)); p.addEventListener('focus', () => activate(p)); });
    gallery.addEventListener('mouseleave', () => activate(featured));
  }
  const lb = $('#lightbox'), lbImg = $('img', lb);
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-lightbox]'); if (!a) return;
    e.preventDefault(); const im = $('img', a); lbImg.src = a.getAttribute('href'); lbImg.alt = im ? im.alt : '';
    lb.classList.add('open'); $('.x', lb).focus();
  });
  lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('[data-close]')) lb.classList.remove('open'); });

  /* ---------- 10. Keyboard + email ---------- */
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (lb.classList.contains('open')) lb.classList.remove('open');
    else if (modal.classList.contains('open')) closeCase();
    else $$('.popup.open').forEach(p => p.classList.remove('open'));
  });
  $('#mail').addEventListener('click', () => {
    if (navigator.clipboard) navigator.clipboard.writeText('anwesaray26@gmail.com').then(() => { $('#copied').textContent = 'email copied ✓'; setTimeout(() => $('#copied').textContent = '', 2500); }).catch(() => {});
  });
  document.addEventListener('click', e => { if (!e.target.closest('.icon') && stage.contains(e.target)) icons.forEach(i => i.classList.remove('is-selected')); });

  fit();
  new ResizeObserver(fit).observe(screen);
  mqMobile.addEventListener('change', fit);
})();
