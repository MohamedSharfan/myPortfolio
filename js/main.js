import { projects, services, skills, moments, WEB3FORMS_KEY, EMAIL } from './content.js';
import { initLiquidReveal } from './hero-reveal.js';

const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) };
const pad = (n, l = 2) => String(n).padStart(l, '0');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const WEBGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } })();

history.scrollRestoration = 'manual';
scrollTo(0, 0);

/* ---------------- adaptive grid (scale up above 1920) ---------------- */
function applyAdaptiveGrid() {
  const FONT_BASE = 16, baseWidth = 1920, coef = 0.6666;
  const widthReduction = ((baseWidth - innerWidth) / baseWidth) * 100;
  const size = FONT_BASE - (FONT_BASE * (widthReduction * coef)) / 100;
  if (size > FONT_BASE) document.documentElement.style.fontSize = size + 'px';
  else document.documentElement.style.removeProperty('font-size');
}
applyAdaptiveGrid();
addEventListener('resize', applyAdaptiveGrid);

/* ---------------- smooth scroll + lock ---------------- */
let lenis = null;
if (!REDUCED && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
let locks = 0;
function stopScroll() {
  if (locks++ > 0) return;
  lenis && lenis.stop();
  Object.assign(document.documentElement.style, { overflow: 'hidden' });
}
function startScroll() {
  if (--locks > 0) return;
  locks = 0;
  lenis && lenis.start();
  document.documentElement.style.removeProperty('overflow');
}
function scrollToId(id) {
  const el = id === 'home' ? 0 : document.getElementById(id);
  if (el === null) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else (el === 0 ? scrollTo({ top: 0, behavior: 'smooth' }) : el.scrollIntoView({ behavior: 'smooth' }));
}

/* ---------------- render dynamic content ---------------- */
const ICONS = {
  Python: 'python/python-original', TensorFlow: 'tensorflow/tensorflow-original', 'Scikit-learn': 'scikitlearn/scikitlearn-original', Jupyter: 'jupyter/jupyter-original',
  React: 'react/react-original', 'Next.js': 'nextjs/nextjs-original', 'Node.js': 'nodejs/nodejs-original', TypeScript: 'typescript/typescript-original', JavaScript: 'javascript/javascript-original',
  HTML: 'html5/html5-original', CSS: 'css3/css3-original', Java: 'java/java-original', MySQL: 'mysql/mysql-original', Docker: 'docker/docker-original', Git: 'git/git-original',
};
const icon = (id, cls = '') => `<svg class="${cls}"><use href="#${id}"/></svg>`;

function renderContent() {
  const n = projects.length;
  // project index
  $('#indexList').innerHTML = projects.map((p, i) => {
    const href = p.live || p.github || '#room';
    const ext = href.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
    return `<li data-reveal><a class="pcard" href="${href}"${ext} data-tilt data-cursor="${p.live ? 'Live' : p.github ? 'Code' : 'View'}">
      <span class="pcard__glow"></span>
      <div class="pcard__meta"><span>${esc(p.category)}</span><span class="pcard__badge">${icon('i-arrow-ur')}</span></div>
      <span class="pcard__num" aria-hidden="true">${pad(i + 1)}</span>
      <div class="pcard__body"><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p>
        <div class="pcard__tags">${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div></div>
    </a></li>`;
  }).join('');
  // services
  $('#serviceRows').innerHTML = services.map((s, i) => `<li class="srow" data-reveal><button class="srow__in" data-open="modal" data-cursor="Hire">
      <span class="srow__i">${pad(i + 1)}</span><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p><span class="srow__badge">${icon('i-arrow-ur')}</span></button></li>`).join('');
  // marquee
  const rows = [['AI Eng', skills['AI Engineering'], 'mrow--dark'], ['ML', skills['Machine Learning'], ''], ['Web', skills.Web, 'mrow--dark'], ['Tools', skills.Tools, '']];
  $('#marquee').innerHTML = rows.map(([g, list, cls], r) => {
    const set = list.map((s) => `<span class="mchip">${ICONS[s] ? `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${ICONS[s]}.svg" alt="" width="48" height="48" decoding="async">` : ''}${esc(s)}<small>${esc(g)}</small></span>`).join('');
    return `<div class="mrow ${cls}" data-dir="${r % 2 ? 1 : -1}">${`<div class="mrow__set">${set}</div>`.repeat(4)}</div>`;
  }).join('');
  // season
  $('#seasonTrack').innerHTML = moments.map((m) => m.kind === 'quote'
    ? `<li class="scard scard--quote"><blockquote>“${esc(m.text)}”</blockquote></li>`
    : `<li class="scard">${m.img ? `<img src="${m.img}" alt="${esc(m.title)}" loading="lazy">` : ''}<span class="scard__art"></span>
        <span class="scard__status ${['FINALIST', 'FOUNDER'].includes(m.status) ? 'is-hot' : ''}">${esc(m.status)}</span>
        <div class="scard__body"><h3>${esc(m.title)}</h3><p class="scard__place">${esc(m.place)}, ${esc(m.year)}</p><p>${esc(m.note)}</p></div></li>`).join('');
  // stats
  const tools = Object.values(skills).flat().length;
  const stats = [
    { n: n, s: '', l: 'Projects in the room' },
    { n: moments.filter((m) => m.kind === 'moment' && /COMPETED|FINALIST/.test(m.status)).length, s: '', l: 'Hackathons in 2026' },
    { n: 110, s: '+', l: 'Teams at DHACK — finished top 5' },
    { n: tools, s: '', l: 'Skills & tools in the stack' },
  ];
  $('#statsGrid').innerHTML = stats.map((s) => `<li data-reveal><p class="stat__n"><span data-count="${s.n}">0</span>${s.s ? `<small>${s.s}</small>` : ''}</p><p class="stat__l">${esc(s.l)}</p></li>`).join('');
  // room dots / total
  $('#roomDots').innerHTML = projects.map(() => '<li></li>').join('');
  $('#roomTotal').textContent = pad(n);
  $$('[data-year]').forEach((e) => (e.textContent = new Date().getFullYear()));
}
renderContent();

/* ---------------- clock (Sri Lanka) ---------------- */
function tickClock() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Colombo', hour: 'numeric', minute: '2-digit', hour12: true, day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const time = `${get('hour')}:${get('minute')}${(get('dayPeriod') || '').toLowerCase().replace(/\s|\./g, '')}`;
  $$('[data-time]').forEach((e) => (e.textContent = time));
  $$('[data-date]').forEach((e) => (e.textContent = `${get('day')} ${get('month')}, ${get('year')}`));
}
tickClock();
setInterval(tickClock, 1000);

/* ---------------- hero card carousel ---------------- */
(function heroCard() {
  const items = [
    { c: 'Focus', t: 'RAG systems & AI agents.' },
    { c: 'Hackathon', t: 'GovNavAI — DHACK \'26 2nd place.' },
    { c: 'Studying', t: 'Machine learning, in public.' },
    { c: 'Currently building', t: 'StudyBuddy — O/L revision guides.' },
  ];
  const slot = $('#hcardSlot'), dots = $('#hcardDots');
  slot.innerHTML = items.map((it) => `<div class="hcard__item"><small>${it.c}</small><b>${it.t}</b></div>`).join('');
  dots.innerHTML = items.map(() => '<i></i>').join('');
  const els = $$('.hcard__item', slot), ds = $$('i', dots);
  let i = 0;
  const show = (next, dir) => {
    els.forEach((el, k) => {
      el.style.opacity = k === next ? 1 : 0;
      el.style.transform = `translateY(${k === next ? 0 : k === i ? -14 * dir : 14 * dir}px)`;
    });
    ds.forEach((d, k) => d.classList.toggle('on', k === next));
    i = next;
  };
  els.forEach((el, k) => { el.style.opacity = k ? 0 : 1; el.style.transform = `translateY(${k ? 14 : 0}px)` });
  ds[0].classList.add('on');
  const step = (s) => show((i + s + items.length) % items.length, s);
  $('#hcard').addEventListener('click', () => step(1));
  $('#hcardNext').addEventListener('click', (e) => { e.stopPropagation(); step(1) });
  $('#hcardPrev').addEventListener('click', (e) => { e.stopPropagation(); step(-1) });
  setInterval(() => { if (!document.hidden) step(1) }, 4200);
})();

/* ---------------- menu + modal ---------------- */
const menu = $('#navmenu'), modal = $('#modal');
function openLayer(el) {
  if (!el.hidden) return;
  el.hidden = false;
  stopScroll();
  if (el === menu) $$('.navmenu__nav button', menu).forEach((b, i) => (b.style.transitionDelay = `${i * 45 + 80}ms`));
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-open')));
  setTimeout(() => (el === modal ? $('input', modal) : $('.navmenu__close', menu))?.focus({ preventScroll: true }), 120);
}
function closeLayer(el) {
  if (el.hidden) return;
  el.classList.remove('is-open');
  if (el === menu) $$('.navmenu__nav button', menu).forEach((b) => (b.style.transitionDelay = '0ms'));
  setTimeout(() => {
    el.hidden = true;
    startScroll();
    if (el === modal) setTimeout(() => { $('#modalForm').reset(); $('.modal__form-wrap').hidden = false; $('.modal__success').hidden = true }, 300);
  }, 420);
}
document.addEventListener('click', (e) => {
  const open = e.target.closest('[data-open]');
  const close = e.target.closest('[data-close]');
  const go = e.target.closest('[data-scroll]');
  if (open) {
    e.preventDefault();
    if (!menu.hidden) closeLayer(menu);
    openLayer(open.dataset.open === 'menu' ? menu : modal);
  } else if (close) {
    closeLayer(close.dataset.close === 'menu' ? menu : modal);
  } else if (go) {
    e.preventDefault();
    if (!menu.hidden) { closeLayer(menu); setTimeout(() => scrollToId(go.dataset.scroll), 450) } else scrollToId(go.dataset.scroll);
  }
});
modal.addEventListener('click', (e) => { if (e.target === modal) closeLayer(modal) });
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeLayer(modal); closeLayer(menu) } });

/* ---------------- forms (web3forms) ---------------- */
async function send(form) {
  const fd = new FormData(form);
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject: `Portfolio — message from ${fd.get('name')}`, from_name: 'SHARFAN.EXE portfolio', name: fd.get('name'), email: fd.get('email'), message: fd.get('message') }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success) throw new Error(j.message || 'Failed');
}
function mailtoFallback(form) {
  const fd = new FormData(form);
  return `mailto:${EMAIL}?subject=${encodeURIComponent('Hello from ' + (fd.get('name') || 'your portfolio'))}&body=${encodeURIComponent(fd.get('message') || '')}`;
}
$('#modalForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.currentTarget, btn = $('button[type=submit]', f), label = $('span', btn);
  btn.disabled = true; label.textContent = 'Sending…';
  try { await send(f); $('.modal__form-wrap').hidden = true; $('.modal__success').hidden = false }
  catch { location.href = mailtoFallback(f) }
  finally { btn.disabled = false; label.textContent = 'Send request' }
});
$('#contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.currentTarget, status = $('.cform__status', f), btn = $('button[type=submit]', f);
  if (!f.reportValidity()) return;
  btn.disabled = true; status.textContent = 'Sending…';
  try { await send(f); f.reset(); status.textContent = 'Message received — I will reply within one business day.' }
  catch { status.innerHTML = `Couldn't send. <a href="${mailtoFallback(f)}" style="text-decoration:underline">Email me instead</a>.` }
  finally { btn.disabled = false }
});

/* ---------------- cursor + magnetic + tilt ---------------- */
if (FINE && !REDUCED) {
  document.documentElement.classList.add('has-cursor');
  const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), lab = $('.cursor__label');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3' });
  gsap.set(cur, { opacity: 0 });
  let seen = false;
  addEventListener('pointermove', (e) => {
    if (!seen) { seen = true; gsap.set([dot, ring], { x: e.clientX, y: e.clientY }); gsap.to(cur, { opacity: 1, duration: 0.3 }) }
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
  }, { passive: true });
  addEventListener('pointerdown', () => cur.classList.add('is-down'));
  addEventListener('pointerup', () => cur.classList.remove('is-down'));
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor]');
    if (t) { lab.textContent = t.dataset.cursor; cur.classList.add('is-label') }
    else cur.classList.remove('is-label');
  });
  document.addEventListener('pointerleave', () => gsap.to(cur, { opacity: 0 }));
  document.addEventListener('pointerenter', () => gsap.to(cur, { opacity: 1 }));

  $$('.magnetic').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, .4)' }), y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, .4)' });
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.3); y((e.clientY - r.top - r.height / 2) * 0.35) });
    el.addEventListener('pointerleave', () => { x(0); y(0) });
  });

  $$('[data-tilt]').forEach((el) => {
    const max = el.classList.contains('stats__panel') ? 3 : 7;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      gsap.to(el, { rotateY: (px - 0.5) * max * 2, rotateX: -(py - 0.5) * max * 2, transformPerspective: 1000, duration: 0.6, ease: 'power3.out' });
      el.style.setProperty('--mx', `${px * 100}%`); el.style.setProperty('--my', `${py * 100}%`);
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1,.5)' }));
  });
}

/* ---------------- text splitting ---------------- */
function splitWords(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) frag.append(' ');
      else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.append(s) }
    });
    node.replaceWith(frag);
  });
  return $$('.w', el);
}

/* ---------------- scroll-driven motion ---------------- */
function setupScroll() {
  // reveals
  $$('[data-lines]').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.fromTo($$('.line > span', el), { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  $$('[data-words]').forEach((el) => {
    const words = splitWords(el);
    gsap.fromTo(words, { opacity: 0.12, y: 24 }, { opacity: 1, y: 0, stagger: 0.05, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 55%', scrub: 0.6 } });
  });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }),
  });

  // page background "journey" — each section repaints the page as you move into it
  const THEMES = { white: '#ffffff', surface: '#f1f0ee', ink: '#0a0a0a', light: '#ffffff' };
  $$('[data-theme]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: sec.id === 'room' ? 'top top' : sec.id === 'season' ? 'top 60%' : 'top 55%', end: sec.id === 'room' ? 'bottom top' : sec.id === 'season' ? 'bottom 60%' : 'bottom 55%',
      onToggle: (self) => { if (self.isActive) document.body.style.backgroundColor = THEMES[sec.dataset.theme] },
    });
  });

  // scroll bar
  gsap.to('.scrollbar span', { scaleY: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  // HERO: letters fly apart, portrait sinks back in z
  const letters = $$('.hero__watermark span');
  const heroTl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 } });
  letters.forEach((l, i) => heroTl.to(l, { xPercent: (i - 3) * 55, yPercent: -30 - Math.abs(i - 3) * 12, rotate: (i - 3) * 6, opacity: 0.15, ease: 'none' }, 0));
  heroTl.to('.hero__portrait', { scale: 0.82, yPercent: 8, rotateX: 12, ease: 'none' }, 0)
    .to('.hero__grid', { yPercent: -18, opacity: 0, ease: 'none' }, 0)
    .to('.hero__glow', { scale: 1.6, opacity: 0.4, ease: 'none' }, 0);

  // hero mouse parallax (3D tilt of the portrait)
  if (FINE && !REDUCED) {
    const ry = gsap.quickTo('.hero__face', 'rotateY', { duration: 1, ease: 'power3' }), rx = gsap.quickTo('.hero__face', 'rotateX', { duration: 1, ease: 'power3' });
    const tx = gsap.quickTo('.hero__twin', 'rotateY', { duration: 1, ease: 'power3' }), tr = gsap.quickTo('.hero__twin', 'rotateX', { duration: 1, ease: 'power3' });
    const wx = gsap.quickTo('.hero__watermark', 'x', { duration: 1.2, ease: 'power3' });
    const gx = gsap.quickTo('.hero__glow', 'x', { duration: 1.6, ease: 'power3' });
    addEventListener('pointermove', (e) => {
      if (scrollY > innerHeight) return;
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      ry(x * 10); rx(-y * 6); tx(x * 10); tr(-y * 6); wx(-x * 40); gx(x * 120);
    }, { passive: true });
  }

  // CREATE BAND: tiles flip up in 3D
  gsap.fromTo('.band__row li', { rotateX: -85, y: 60, opacity: 0, transformOrigin: '50% 100%' }, {
    rotateX: 0, y: 0, opacity: 1, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.band', start: 'top 95%', end: 'top 55%', scrub: 0.6 },
  });

  // SERVICES rows slide in with slight 3D
  gsap.utils.toArray('.srow').forEach((row, i) => gsap.fromTo(row, { rotateX: -25, transformPerspective: 900, transformOrigin: '50% 0%' }, { rotateX: 0, ease: 'none', scrollTrigger: { trigger: row, start: 'top 100%', end: 'top 70%', scrub: 0.5 } }));

  // STATS count-up
  $$('[data-count]').forEach((el) => {
    const target = +el.dataset.count;
    ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'center center', onUpdate: (s) => (el.textContent = Math.round(s.progress * target)), onLeave: () => (el.textContent = target) });
  });
  gsap.fromTo('.stats__panel', { y: 60, scale: 0.96, rotateX: 10, transformPerspective: 1200 }, { y: 0, scale: 1, rotateX: 0, ease: 'none', scrollTrigger: { trigger: '.stats', start: 'top bottom', end: 'top 40%', scrub: 0.6 } });

  // index cards: staggered 3D rise
  gsap.utils.toArray('.index__list > li').forEach((li, i) => gsap.fromTo(li, { rotateX: 18, y: 80, transformOrigin: '50% 100%' }, { rotateX: 0, y: 0, ease: 'none', scrollTrigger: { trigger: li, start: 'top 105%', end: 'top 60%', scrub: 0.6 } }));

  // footer watermark + title parallax
  gsap.fromTo('.footer__watermark', { yPercent: 40, letterSpacing: '0.05em' }, { yPercent: 0, letterSpacing: '-0.05em', ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: 0.5 } });

  setupMarquee();
  setupSeason();
}

/* ---------------- marquee (velocity-reactive) ---------------- */
function setupMarquee() {
  const rows = $$('.mrow').map((el) => ({ el, dir: +el.dataset.dir, x: 0, w: 0 }));
  const measure = () => rows.forEach((r) => (r.w = r.el.firstElementChild.offsetWidth));
  measure(); addEventListener('resize', measure);
  let skew = 0, boost = 0;
  gsap.ticker.add((_, dt) => {
    const v = lenis ? lenis.velocity : 0;
    boost += (Math.min(Math.abs(v) * 0.35, 4) - boost) * 0.1;
    skew += (clamp(v * 0.25, -8, 8) - skew) * 0.1;
    rows.forEach((r) => {
      if (!r.w) return;
      r.x += r.dir * (0.045 * dt) * (1 + boost) * (REDUCED ? 0 : 1);
      r.x = (r.x % r.w) - (r.x % r.w > 0 ? r.w : 0); // keep in (-w, 0]
      r.el.style.transform = `translate3d(${r.x}px,0,0) skewX(${-skew}deg)`;
    });
  });
}

/* ---------------- season: pinned horizontal reel with 3D coverflow ---------------- */
function setupSeason() {
  const sec = $('#season'), track = $('#seasonTrack'), cards = $$('.scard', track), bar = $('#seasonProgress');
  let dist = 0;
  const size = () => { dist = Math.max(0, track.scrollWidth - innerWidth); sec.style.height = `${innerHeight + dist}px` };
  size();
  const update = () => {
    const vc = innerWidth / 2;
    cards.forEach((c) => {
      const r = c.getBoundingClientRect();
      const d = clamp((r.left + r.width / 2 - vc) / vc, -1.4, 1.4);
      c.style.transform = `rotateY(${-d * 28}deg) translateZ(${-Math.abs(d) * 160}px)`;
      c.style.opacity = 1 - Math.max(0, Math.abs(d) - 0.9) * 0.9;
    });
  };
  ScrollTrigger.create({
    trigger: sec, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true, onRefreshInit: size,
    onUpdate: (s) => { track.style.transform = `translate3d(${-s.progress * dist}px,0,0)`; bar.style.setProperty('--p', s.progress); update() },
  });
  update();
}

/* ---------------- 3D: room, globe, twin ---------------- */
async function setup3D() {
  const roomSec = $('#room');
  if (!WEBGL || REDUCED) {
    roomSec.classList.add('is-static');
    $('.room__intro-sub').textContent = 'Every project is listed in the index below.';
    return;
  }
  const [{ initRoom }, { initGlobe }, { initTwin }] = await Promise.all([import('./room.js'), import('./globe.js'), import('./twin.js')]);

  // ROOM
  const panel = $('#rpanel'), dots = $$('#roomDots li'), idxEl = $('#roomIdx');
  const intro = $('.room__intro'), hud = $('.room__hud'), outro = $('.room__outro'), flash = $('.room__flash'), dotsWrap = $('#roomDots');
  let swapT = 0;
  const panelHTML = (p, i) => `<div class="rpanel__swap">
      <div class="rpanel__meta"><span><b>${pad(i + 1)}</b> / ${pad(projects.length)}</span><span>${esc(p.category)}</span></div>
      <h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p>
      <div class="rpanel__tags">${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>
      <div class="rpanel__links">
        ${p.live ? `<a href="${p.live}" target="_blank" rel="noopener" data-cursor="Live">Live demo ${icon('i-arrow-ur')}</a>` : ''}
        ${p.github ? `<a class="alt" href="${p.github}" target="_blank" rel="noopener" data-cursor="Code">${icon('i-github')} GitHub</a>` : ''}
        ${!p.live && !p.github ? '<span class="note">Prototype · links coming soon</span>' : ''}
      </div></div>`;
  const room = initRoom($('.room__canvas'), projects, {
    onActive(i) {
      dots.forEach((d, k) => { d.classList.toggle('on', k === i); d.classList.toggle('done', i >= 0 && k < i) });
      if (i < 0) { panel.classList.remove('is-on'); return }
      idxEl.textContent = pad(i + 1);
      const swap = $('.rpanel__swap', panel);
      clearTimeout(swapT);
      if (swap && panel.classList.contains('is-on')) {
        swap.classList.add('is-out');
        swapT = setTimeout(() => { panel.innerHTML = panelHTML(projects[i], i); const s = $('.rpanel__swap', panel); s.classList.add('is-out'); requestAnimationFrame(() => s.classList.remove('is-out')) }, 220);
      } else panel.innerHTML = panelHTML(projects[i], i);
      panel.classList.add('is-on');
    },
    onFrame(p) {
      const inT = 1 - smooth(0.018, 0.05, p);
      intro.style.opacity = inT; intro.style.transform = `scale(${1 + (1 - inT) * 0.15})`;
      const h = smooth(0.08, 0.11, p) * (1 - smooth(0.87, 0.9, p));
      hud.style.opacity = h; dotsWrap.style.opacity = h;
      flash.style.opacity = smooth(0.94, 0.99, p);
      outro.style.opacity = smooth(0.955, 0.985, p);
    },
  });
  const mobile = matchMedia('(max-width: 767px)').matches;
  gsap.fromTo('.room__stage', { clipPath: mobile ? 'inset(10% 5% 0% 5% round 1.5rem)' : 'inset(14% 22% 0% 22% round 2rem)' }, {
    clipPath: 'inset(0% 0% 0% 0% round 0rem)', ease: 'none',
    scrollTrigger: { trigger: roomSec, start: 'top bottom', end: 'top top', scrub: 0.4 },
  });
  ScrollTrigger.create({ trigger: roomSec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => room.setProgress(s.progress) });

  // GLOBE
  const globe = initGlobe($('.about__globe'));
  ScrollTrigger.create({ trigger: '#about', start: 'top bottom', end: 'bottom top', onUpdate: (s) => globe.setSpin(s.progress * Math.PI * 1.5) });

  // FOOTER TWIN
  initTwin($('.footer__twin'), 'assets/me/face.webp').then((twin) => {
    ScrollTrigger.create({ trigger: '.footer', start: 'top 95%', end: 'top 5%', onUpdate: (s) => twin.setAssemble(s.progress) });
  });
  ScrollTrigger.refresh();
}

/* ---------------- loader → intro ---------------- */
const liquid = initLiquidReveal($('.hero__portrait'), $('.hero__twin'), 'assets/me/face-twin.webp', { brushRadius: 130 });

function intro() {
  document.body.classList.remove('is-loading');
  gsap.to('.header', { opacity: 1, y: 0, duration: 0.9, delay: 0.15, ease: 'power3.out' });
  gsap.fromTo('.hero__portrait', { y: 80, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 1.6, ease: 'expo.out' });
  gsap.fromTo('.hero__watermark span', { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.3, stagger: 0.05, delay: 0.3, ease: 'expo.out' });
  $$('[data-intro]').forEach((el) => {
    const d = +el.dataset.intro / 1000;
    if (el.hasAttribute('data-lines')) {
      gsap.set(el, { opacity: 1 });
      gsap.fromTo($$('.line > span', el), { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1.1, stagger: 0.12, delay: d, ease: 'power4.out' });
    } else gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, delay: d, ease: 'power3.out' });
  });
  setTimeout(() => { $('.hero__scan').classList.add('is-run'); liquid.sweep && liquid.sweep(1500) }, 900);
  // touch screens have no cursor — let the AI twin sweep across the face on its own
  if (!FINE && liquid.sweep) setInterval(() => { if (scrollY < innerHeight * 0.5 && !document.hidden) liquid.sweep(1700) }, 4200);
}

(function loader() {
  const el = $('#loader'), fill = $('#loaderFill'), count = $('#loaderCount'), boot = $('#bootBtn'), path = $('#lossPath');
  const len = path.getTotalLength();
  path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
  stopScroll();
  const load = (src) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = src });
  let assets = false;
  Promise.all([load('assets/me/face.webp'), load('assets/me/face-twin.webp'), document.fonts.ready]).then(() => (assets = true));
  setTimeout(() => (assets = true), 6000); // never block forever

  const FILL_MS = REDUCED ? 200 : 1500;
  const t0 = performance.now();
  let shown = 0, done = false;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function tick(now) {
    let target = ease(Math.min((now - t0) / FILL_MS, 1)) * 100;
    if (!assets) target = Math.min(target, 92);
    shown += (target - shown) * 0.2;
    if (target === 100 && 100 - shown < 0.6) shown = 100;
    const v = Math.round(shown);
    fill.style.width = v + '%';
    count.textContent = pad(v, 3);
    path.style.strokeDashoffset = len * (1 - shown / 100);
    if (v < 100) return requestAnimationFrame(tick);
    boot.classList.add('is-on'); boot.tabIndex = 0; boot.focus({ preventScroll: true });
    setTimeout(exit, 2600);
  }
  requestAnimationFrame(tick);

  function exit() {
    if (done) return; done = true;
    boot.classList.remove('is-on');
    gsap.to('.loader__center, .loader__block', { opacity: 0, y: -12, duration: 0.45, ease: 'power2.in' });
    gsap.to(el, {
      yPercent: -100, duration: REDUCED ? 0.01 : 1.1, delay: 0.15, ease: 'expo.inOut',
      onComplete: () => { el.remove(); startScroll(); ScrollTrigger.refresh() },
    });
    setTimeout(intro, REDUCED ? 0 : 650);
  }
  boot.addEventListener('click', exit);
})();

/* ---------------- boot ---------------- */
setupScroll();
document.fonts.ready.then(setup3D);
