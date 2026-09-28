// Liquid cursor reveal: paints the "AI twin" image along a soft, decaying brush trail
// over the real portrait. Canvas matches the portrait box exactly.

export function initLiquidReveal(box, canvas, src, { brushRadius = 120, decay = 0.016 } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.remove(); return () => {} }

  const ctx = canvas.getContext('2d');
  const cover = document.createElement('canvas');
  const coverCtx = cover.getContext('2d');
  const brush = document.createElement('canvas');
  const brushCtx = brush.getContext('2d');
  const img = new Image();
  img.decoding = 'async';
  img.src = src;

  let dpr = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0, radius = 0, diam = 0;
  let rect = box.getBoundingClientRect();
  let points = [];
  let last = null;
  let idle = 999;
  let raf = 0;
  let ready = false;

  function measure() {
    rect = box.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.width = Math.max(1, Math.round(rect.width * dpr));
    H = canvas.height = Math.max(1, Math.round(rect.height * dpr));
    // scale the brush with the portrait so it feels the same on every screen
    radius = Math.max(60, brushRadius * (rect.height / 900)) * dpr;
    diam = Math.ceil(radius * 2);
    brush.width = brush.height = diam;
    cover.width = W; cover.height = H;
    if (img.complete && img.naturalWidth) {
      // same geometry as object-fit: contain; object-position: bottom (box has the image's aspect)
      const s = Math.min(W / img.naturalWidth, H / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      coverCtx.clearRect(0, 0, W, H);
      coverCtx.drawImage(img, (W - w) / 2, H - h, w, h);
      ready = true;
    }
  }

  function stamp(x, y) {
    const c = diam / 2;
    brushCtx.globalCompositeOperation = 'source-over';
    brushCtx.clearRect(0, 0, diam, diam);
    const g = brushCtx.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(255,255,255,.82)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    brushCtx.fillStyle = g;
    brushCtx.fillRect(0, 0, diam, diam);
    brushCtx.globalCompositeOperation = 'source-in';
    brushCtx.drawImage(cover, x - c, y - c, diam, diam, 0, 0, diam, diam);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(brush, x - c, y - c);
  }

  function tick() {
    raf = 0;
    const drawing = points.length > 0;
    if (drawing) idle = 0; else idle++;
    if (idle > 120) { ctx.clearRect(0, 0, W, H); return }
    const fade = drawing ? decay : Math.min(decay + idle * 0.004, 0.5);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgba(0,0,0,${fade})`;
    ctx.fillRect(0, 0, W, H);
    if (drawing && ready) { for (const p of points) stamp(p.x, p.y) }
    points.length = 0;
    raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick) };

  function onMove(e) {
    rect = box.getBoundingClientRect();
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;
    if (x < -radius || y < -radius || x > W + radius || y > H + radius) { last = null; return }
    if (last) {
      const dx = x - last.x, dy = y - last.y;
      const dist = Math.hypot(dx, dy);
      const step = Math.max(radius * 0.3, 1);
      const n = Math.min(Math.ceil(dist / step), 60);
      for (let i = 1; i <= n; i++) points.push({ x: last.x + (dx * i) / n, y: last.y + (dy * i) / n });
    } else points.push({ x, y });
    last = { x, y };
    kick();
  }

  img.onload = measure;
  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(box);
  addEventListener('pointermove', onMove, { passive: true });

  // public: sweep a trail across the face (used for the intro + touch devices)
  function sweep(duration = 1400) {
    const t0 = performance.now();
    last = null;
    const run = (now) => {
      const t = Math.min((now - t0) / duration, 1);
      const x = W * (0.2 + 0.6 * t);
      const y = H * (0.22 + 0.12 * Math.sin(t * Math.PI * 2));
      points.push({ x, y });
      kick();
      if (t < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }

  // touch: reveal where the finger taps/drags
  box.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { last = null; onMove(e) } });

  return { sweep, destroy() { ro.disconnect(); removeEventListener('pointermove', onMove) } };
}
