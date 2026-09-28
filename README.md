# SHARFAN.EXE — Mohamed Sharfan's portfolio

A 3D, motion-first portfolio. Live: https://mohamedsharfan.github.io/myPortfolio/

**The scroll journey**

1. **Boot loader** — a loss curve trains from 000 → 100 epochs, then *Boot Sharfan*.
2. **Hero** — move the cursor over the portrait to paint the halftone *AI twin* over the real photo; the name sits behind the head and flies apart on scroll.
3. **About** — a rotating neural globe and a word-by-word manifesto.
4. **The room** — a Three.js room you walk through by scrolling: the door opens, the camera stops at every framed project on the walls (with live/GitHub links), then dives into the desk monitor.
5. **Project index, services, velocity-reactive stack marquee, a 3D coverflow "Season 2026" reel, count-up stats.**
6. **Footer** — the portrait rebuilt as a 3D point cloud that assembles as you arrive, plus a contact form.

**Stack:** plain HTML/CSS + ES modules, [Three.js](https://threejs.org) (room, globe, point-cloud twin, bloom), [GSAP + ScrollTrigger](https://gsap.com), [Lenis](https://lenis.darkroom.engineering) smooth scroll. No build step — GitHub Pages serves it as-is.

## Edit content

Everything lives in [`js/content.js`](js/content.js): projects, services, skills, season moments, socials.
Add `img: 'assets/...'` to a moment to show a real photo on its card.

## Run locally

```bash
python -m http.server 5173
```

Then open http://localhost:5173 (ES modules need a server, not `file://`).
