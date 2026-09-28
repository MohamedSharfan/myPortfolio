// "Sharfan's room" — a procedural Three.js room walked through with scroll.
// Door opens → camera walks the room stopping at each framed project → dives into the desk monitor.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const RW = 8, RH = 4, RL = 22;          // room width / height / length (door at z=0, back wall at z=-RL)
const FRAME_Y = 1.95, EYE = 1.72;
const ACCENTS = ['#cf8047', '#e2ae7a', '#b15f2c', '#d99a5b'];
const T_IN = 0.1, T_OUT = 0.86;          // project walk segment of the timeline

const smooth = (a, b, x) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t) };
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function tex(w, h, draw, { repeat, srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]) }
  return t;
}
const rand = (a, b) => a + Math.random() * (b - a);
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
function wrapText(g, text, maxW) {
  const words = text.split(' '), lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (g.measureText(test).width > maxW && line) { lines.push(line); line = w } else line = test;
  }
  lines.push(line);
  return lines;
}

/* ---------------- textures ---------------- */
const floorTex = () => tex(1024, 1024, (g, w, h) => {
  const pw = 128;
  for (let x = 0; x < w; x += pw) {
    for (let y = -rand(0, 400); y < h; y += 420) {
      const l = rand(22, 32);
      g.fillStyle = `hsl(${rand(22, 30)} ${rand(30, 42)}% ${l}%)`;
      g.fillRect(x, y, pw, 420);
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; g.strokeRect(x, y, pw, 420);
      for (let k = 0; k < 14; k++) {
        g.strokeStyle = `rgba(0,0,0,${rand(0.04, 0.12)})`; g.lineWidth = rand(1, 2.5);
        const gx = x + rand(6, pw - 6);
        g.beginPath(); g.moveTo(gx, y); g.bezierCurveTo(gx + rand(-8, 8), y + 140, gx + rand(-8, 8), y + 280, gx + rand(-4, 4), y + 420); g.stroke();
      }
    }
  }
}, { repeat: [2, 5.5] });

const wallTex = () => tex(512, 512, (g, w, h) => {
  g.fillStyle = '#2a2521'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${Math.random() > .5 ? '255,240,220' : '0,0,0'},${rand(0.01, 0.05)})`; g.fillRect(rand(0, w), rand(0, h), rand(1, 3), rand(1, 3)) }
}, { repeat: [6, 2] });

const rugTex = () => tex(512, 1024, (g, w, h) => {
  g.fillStyle = '#1a1614'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#b15f2c'; g.lineWidth = 10; g.strokeRect(24, 24, w - 48, h - 48);
  g.strokeStyle = 'rgba(226,174,122,.5)'; g.lineWidth = 3; g.strokeRect(50, 50, w - 100, h - 100);
  for (let y = 110; y < h - 100; y += 64) {
    g.fillStyle = 'rgba(207,128,71,.28)';
    g.beginPath(); g.moveTo(w / 2, y); g.lineTo(w / 2 + 40, y + 32); g.lineTo(w / 2, y + 64); g.lineTo(w / 2 - 40, y + 32); g.closePath(); g.fill();
  }
});

function frameTex(p, i, n) {
  const acc = ACCENTS[i % ACCENTS.length];
  return tex(1200, 820, (g, w, h) => {
    g.fillStyle = '#0f0e0d'; g.fillRect(0, 0, w, h);
    let rg = g.createRadialGradient(w * 0.88, h * 0.08, 0, w * 0.88, h * 0.08, w * 0.9);
    rg.addColorStop(0, hexA(acc, 0.55)); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(0, 0, w, h);
    for (let y = 18; y < h; y += 30) for (let x = 18; x < w; x += 30) { g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(x, y, 2, 2) }
    // giant number
    g.font = '700 560px Onest'; g.textAlign = 'right'; g.textBaseline = 'alphabetic';
    g.fillStyle = 'rgba(255,255,255,.05)'; g.fillText(String(i + 1).padStart(2, '0'), w + 20, h - 40);
    // header
    g.textAlign = 'left'; g.font = '500 26px "JetBrains Mono"'; g.fillStyle = 'rgba(255,255,255,.55)';
    g.fillText(`PROJECT ${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`, 64, 88);
    g.textAlign = 'right'; g.fillText(p.category.toUpperCase(), w - 64, 88);
    g.textAlign = 'left';
    if (p.featured) {
      g.fillStyle = acc; g.beginPath(); g.roundRect(64, 118, 196, 46, 23); g.fill();
      g.fillStyle = '#fff'; g.font = '600 22px "JetBrains Mono"'; g.fillText('★ FEATURED', 88, 149);
    }
    // title
    g.font = '600 118px Onest'; g.fillStyle = '#fff';
    const lines = wrapText(g, p.title, w - 128);
    const lh = 112;
    let ty = h - 170 - (lines.length - 1) * lh;
    for (const l of lines) { g.fillText(l, 60, ty); ty += lh }
    // tags
    g.font = '500 26px Onest';
    let tx = 64;
    for (const t of p.tags.slice(0, 4)) {
      const tw = g.measureText(t).width + 44;
      if (tx + tw > w - 60) break;
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2;
      g.beginPath(); g.roundRect(tx, h - 108, tw, 52, 26); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.9)'; g.fillText(t, tx + 22, h - 73);
      tx += tw + 12;
    }
    // accent rule
    g.fillStyle = acc; g.fillRect(64, h - 30, 120, 4);
  });
}

const neonTex = () => tex(1024, 256, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  g.font = '700 150px Onest'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = '#ff9a55'; g.shadowBlur = 30; g.fillStyle = '#ffd2ad';
  g.fillText('SHARFAN.EXE', w / 2, h / 2 + 8);
  g.shadowBlur = 0; g.fillStyle = '#fff3e8'; g.fillText('SHARFAN.EXE', w / 2, h / 2 + 8);
});

const signTex = (text) => tex(512, 128, (g, w, h) => {
  g.fillStyle = '#0c0b0a'; g.fillRect(0, 0, w, h);
  g.font = '600 46px "JetBrains Mono"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = '#ff9a55'; g.shadowBlur = 18; g.fillStyle = '#ffcfa6'; g.fillText(text, w / 2, h / 2 + 2);
});

const plateTex = () => tex(512, 160, (g, w, h) => {
  g.fillStyle = '#c9a27a'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
  g.fillStyle = '#2a1a10'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '600 26px "JetBrains Mono"'; g.fillText('ROOM 01', w / 2, 50);
  g.font = '700 54px Onest'; g.fillText('SHARFAN', w / 2, 108);
});

const skyTex = () => tex(512, 512, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b1020'); gr.addColorStop(1, '#2a1c2a');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${rand(0.2, 0.9)})`; g.fillRect(rand(0, w), rand(0, h * 0.8), rand(1, 2.4), rand(1, 2.4)) }
  const mg = g.createRadialGradient(w * 0.7, h * 0.28, 0, w * 0.7, h * 0.28, 110); mg.addColorStop(0, 'rgba(255,240,220,.9)'); mg.addColorStop(0.35, 'rgba(255,230,200,.25)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = mg; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff4e6'; g.beginPath(); g.arc(w * 0.7, h * 0.28, 34, 0, Math.PI * 2); g.fill();
  // city silhouette
  g.fillStyle = '#07070b';
  let x = 0; while (x < w) { const bw = rand(24, 60), bh = rand(40, 170); g.fillRect(x, h - bh, bw, bh); for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(255,190,120,${rand(0.2, 0.7)})`; g.fillRect(x + rand(4, bw - 8), h - rand(10, bh - 8), 3, 4); g.fillStyle = '#07070b' } x += bw + 2 }
});

const screenTex = () => tex(1024, 620, (g, w, h) => {
  g.fillStyle = '#0d0f12'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#16191e'; g.fillRect(0, 0, w, 44);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(28 + i * 26, 22, 8, 0, 7); g.fill() });
  g.font = '500 20px "JetBrains Mono"'; g.fillStyle = 'rgba(255,255,255,.55)'; g.fillText('sharfan.exe — index.py', 120, 29);
  const code = [
    ['#c678dd', 'from', '#e5c07b', ' sharfan ', '#c678dd', 'import', '#fff', ' Engineer'],
    ['#fff', ''],
    ['#fff', 'me = Engineer(', '#98c379', '"Mohamed Sharfan"', '#fff', ')'],
    ['#fff', 'me.focus = [', '#98c379', '"AI/ML"', '#fff', ', ', '#98c379', '"Full-stack"', '#fff', ']'],
    ['#fff', 'me.stack  = [', '#98c379', '"Python"', '#fff', ', ', '#98c379', '"TensorFlow"', '#fff', ', ', '#98c379', '"React"', '#fff', ']'],
    ['#fff', ''],
    ['#c678dd', 'for', '#fff', ' project ', '#c678dd', 'in', '#fff', ' me.projects:'],
    ['#fff', '    project.ship()   ', '#7f848e', '# 10 and counting'],
    ['#fff', ''],
    ['#e5c07b', '>>> ', '#fff', 'me.render(', '#98c379', '"index"', '#fff', ')'],
    ['#cf8047', '█'],
  ];
  g.font = '500 30px "JetBrains Mono"';
  code.forEach((row, li) => {
    let x = 44; const y = 110 + li * 44;
    g.fillStyle = 'rgba(255,255,255,.2)'; g.fillText(String(li + 1).padStart(2, ' '), 6, y);
    for (let k = 0; k < row.length; k += 2) { g.fillStyle = row[k]; g.fillText(row[k + 1], x, y); x += g.measureText(row[k + 1]).width }
  });
});

/* ---------------- scene ---------------- */
export function initRoom(canvas, projects, { onActive, onFrame } = {}) {
  const mobileQ = matchMedia('(max-width: 767px)');
  let mobile = mobileQ.matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x07070a, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x07070a, 9, 34);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.04, 80);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.55, 0.55, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, ...o });
  const box = (w, h, d, mat, x = 0, y = 0, z = 0, parent = scene) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m;
  };
  const plane = (w, h, mat, parent = scene) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); parent.add(m); return m };

  /* lights */
  scene.add(new THREE.HemisphereLight(0xffe2c4, 0x140f0c, 0.55));
  const warm = [];
  [-3.5, -10, -16.5].forEach((z) => { const l = new THREE.PointLight(0xffb27a, 9, 11, 1.6); l.position.set(0, 3.5, z); scene.add(l); warm.push(l) });
  const spill = new THREE.PointLight(0xffa060, 3, 7, 1.8); spill.position.set(0, 2.2, -1.2); scene.add(spill);

  /* room shell */
  const wallMat = std({ map: wallTex(), color: 0xb8aaa0 });
  const floor = plane(RW, RL, std({ map: floorTex(), roughness: 0.55 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -RL / 2);
  const ceil = plane(RW, RL, std({ color: 0x151210 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, RH, -RL / 2);
  const lw = plane(RL, RH, wallMat); lw.rotation.y = Math.PI / 2; lw.position.set(-RW / 2, RH / 2, -RL / 2);
  const rw = plane(RL, RH, wallMat); rw.rotation.y = -Math.PI / 2; rw.position.set(RW / 2, RH / 2, -RL / 2);
  const bw = plane(RW, RH, wallMat); bw.position.set(0, RH / 2, -RL);
  // skirting
  const skirt = std({ color: 0x0e0c0b });
  box(0.04, 0.12, RL, skirt, -RW / 2 + 0.02, 0.06, -RL / 2); box(0.04, 0.12, RL, skirt, RW / 2 - 0.02, 0.06, -RL / 2);

  // LED strips (bloom)
  const led = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xff8a3d, emissiveIntensity: 2.6 });
  box(0.03, 0.03, RL - 0.4, led, -RW / 2 + 0.06, RH - 0.06, -RL / 2);
  box(0.03, 0.03, RL - 0.4, led, RW / 2 - 0.06, RH - 0.06, -RL / 2);
  box(RW - 0.2, 0.03, 0.03, led, 0, RH - 0.06, -RL + 0.06);

  // rug
  const rug = plane(3, 12, std({ map: rugTex(), roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.006, -10);

  /* front wall + door */
  const extMat = std({ color: 0x3a3430, map: wallTex() });
  const facadeMat = std({ color: 0x8f8880, roughness: 0.95, map: tex(512, 512, (g, w, h) => {
    g.fillStyle = '#b9b1a8'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 7000; i++) { g.fillStyle = `rgba(0,0,0,${rand(0.02, 0.07)})`; g.fillRect(rand(0, w), rand(0, h), rand(1, 3), rand(1, 3)) }
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; for (let y = 0; y <= h; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke() }
  }, { repeat: [10, 3] }) });
  const DW = 1.6, DH = 2.7, FW = 40, FH = 12;
  // inner face of the front wall (dark, like the room)
  box((RW - DW) / 2, RH, 0.2, extMat, -(RW + DW) / 4, RH / 2, -0.01);
  box((RW - DW) / 2, RH, 0.2, extMat, (RW + DW) / 4, RH / 2, -0.01);
  box(DW, RH - DH, 0.2, extMat, 0, DH + (RH - DH) / 2, -0.01);
  // outside facade (wide + tall so the approach fills the screen)
  box((FW - DW) / 2, FH, 0.2, facadeMat, -(FW + DW) / 4, FH / 2, 0.12);
  box((FW - DW) / 2, FH, 0.2, facadeMat, (FW + DW) / 4, FH / 2, 0.12);
  box(DW, FH - DH, 0.2, facadeMat, 0, DH + (FH - DH) / 2, 0.12);
  // night sky dome
  const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, map: tex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#05060a'); gr.addColorStop(0.5, '#0d0b12'); gr.addColorStop(1, '#1a120c');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${rand(0.15, 0.8)})`; g.fillRect(rand(0, w), rand(0, h * 0.55), rand(0.6, 1.6), rand(0.6, 1.6)) }
  }) }));
  scene.add(sky);
  const trim = std({ color: 0x151210, roughness: 0.4 });
  box(0.1, DH + 0.1, 0.5, trim, -DW / 2 - 0.05, DH / 2, 0.05);
  box(0.1, DH + 0.1, 0.5, trim, DW / 2 + 0.05, DH / 2, 0.05);
  box(DW + 0.2, 0.1, 0.5, trim, 0, DH + 0.05, 0.05);
  // light leaking under the door + sign above
  box(DW - 0.1, 0.012, 0.3, new THREE.MeshBasicMaterial({ color: 0xffb070 }), 0, 0.006, 0.3);
  const sign = plane(1.4, 0.35, new THREE.MeshBasicMaterial({ map: signTex('STEP INSIDE'), toneMapped: false, color: 0xcccccc }));
  sign.position.set(0, DH + 0.5, 0.23);

  const doorPivot = new THREE.Group(); doorPivot.position.set(-DW / 2, 0, 0.06); scene.add(doorPivot);
  const door = box(DW, DH, 0.06, std({ color: 0x6b4a33, roughness: 0.55 }), DW / 2, DH / 2, 0, doorPivot);
  const plate = plane(0.5, 0.16, std({ map: plateTex(), roughness: 0.4, metalness: 0.3 }), door); plate.position.set(0, 0.35, 0.035);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), std({ color: 0xb8864f, metalness: 0.8, roughness: 0.3 }));
  knob.position.set(DW / 2 - 0.15, -0.1, 0.06); door.add(knob);

  // outside ground + porch light
  const ground = plane(30, 14, std({ color: 0x0c0b0a, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.001, 7);
  const porch = new THREE.PointLight(0xffc38f, 14, 12, 1.5); porch.position.set(0, 3.4, 1.4); scene.add(porch);
  const porchLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.08, 20), new THREE.MeshBasicMaterial({ color: 0xffe2c0 })); porchLamp.position.set(0, 3.55, 0.3); scene.add(porchLamp);
  [-5, 5].forEach((x) => { const l = new THREE.PointLight(0xffd2a8, 6, 9, 1.6); l.position.set(x, 3, 2.5); scene.add(l) });

  /* project frames */
  const frames = [];
  const n = projects.length;
  const cone = tex(128, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,190,130,.55)'); gr.addColorStop(1, 'rgba(255,190,130,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(w * 0.35, 0); g.lineTo(w * 0.65, 0); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
  });
  const coneMat = new THREE.MeshBasicMaterial({ map: cone, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 });
  projects.forEach((p, i) => {
    const left = i % 2 === 0;
    const z = -3 - i * 1.5;
    const g = new THREE.Group();
    g.position.set(left ? -RW / 2 + 0.02 : RW / 2 - 0.02, FRAME_Y, z);
    g.rotation.y = left ? Math.PI / 2 : -Math.PI / 2;
    box(2.02, 1.42, 0.06, std({ color: 0x0c0b0a, roughness: 0.35 }), 0, 0, 0.03, g);
    const pic = plane(1.9, 1.3, new THREE.MeshBasicMaterial({ map: frameTex(p, i, n), color: 0xdddddd }), g); pic.position.z = 0.065;
    box(0.8, 0.035, 0.07, new THREE.MeshStandardMaterial({ color: 0, emissive: 0xffc08a, emissiveIntensity: 2.2 }), 0, 0.82, 0.1, g);
    const c = plane(1.9, 1.7, coneMat, g); c.position.set(0, 0.02, 0.02);
    scene.add(g);
    frames.push({ g, pic, left, z, x: g.position.x });
  });

  /* desk corner at the back wall */
  const dz = -RL + 0.55;
  const deskMat = std({ color: 0x2b1e16, roughness: 0.5 });
  box(2.8, 0.06, 1.0, deskMat, 0, 0.78, dz);
  [[-1.3, -0.4], [1.3, -0.4], [-1.3, 0.4], [1.3, 0.4]].forEach(([x, zz]) => box(0.06, 0.78, 0.06, std({ color: 0x111 }), x, 0.39, dz + zz));
  const monZ = -RL + 0.42;
  box(0.08, 0.3, 0.08, std({ color: 0x111 }), 0, 0.96, monZ - 0.05);
  box(1.36, 0.82, 0.05, std({ color: 0x0a0a0a, roughness: 0.3 }), 0, 1.33, monZ);
  const screen = plane(1.28, 0.75, new THREE.MeshBasicMaterial({ map: screenTex(), toneMapped: false, color: 0xbbbbbb }));
  screen.position.set(0, 1.33, monZ + 0.03);
  const screenGlow = new THREE.PointLight(0x9fb4ff, 2.5, 3, 2); screenGlow.position.set(0, 1.3, monZ + 0.5); scene.add(screenGlow);
  box(0.9, 0.025, 0.28, std({ color: 0x1b1b1b }), 0, 0.82, dz + 0.25);
  // lamp
  const lampMat = std({ color: 0x151515, metalness: 0.6, roughness: 0.35 });
  box(0.22, 0.03, 0.22, lampMat, 1.05, 0.82, dz - 0.1);
  const arm = box(0.03, 0.6, 0.03, lampMat, 1.05, 1.1, dz - 0.1); arm.rotation.z = 0.25;
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.18, 24, 1, true), std({ color: 0xcf8047, side: THREE.DoubleSide }));
  shade.position.set(0.95, 1.42, dz - 0.1); shade.rotation.z = 0.5; scene.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffe0b8 })); bulb.position.set(0.93, 1.36, dz - 0.1); scene.add(bulb);
  const lampL = new THREE.PointLight(0xffc48a, 5, 4, 1.8); lampL.position.set(0.9, 1.3, dz); scene.add(lampL);
  // chair (pushed aside)
  const chair = new THREE.Group(); chair.position.set(-1.1, 0, dz + 0.95); chair.rotation.y = 0.6; scene.add(chair);
  const chairMat = std({ color: 0x1c1c1c, roughness: 0.6 });
  box(0.55, 0.07, 0.55, chairMat, 0, 0.5, 0, chair); box(0.55, 0.6, 0.06, chairMat, 0, 0.85, 0.26, chair); box(0.05, 0.45, 0.05, lampMat, 0, 0.25, 0, chair);
  // neon sign
  const neon = plane(2.6, 0.65, new THREE.MeshBasicMaterial({ map: neonTex(), transparent: true, toneMapped: false, color: 0xffffff }));
  neon.position.set(0, 2.85, -RL + 0.02);
  const neonL = new THREE.PointLight(0xff9050, 4, 5, 1.8); neonL.position.set(0, 2.8, -RL + 0.6); scene.add(neonL);
  // window
  const win = plane(1.7, 1.4, new THREE.MeshBasicMaterial({ map: skyTex(), color: 0x999999 })); win.position.set(-2.6, 2.1, -RL + 0.02);
  const wf = std({ color: 0x0d0c0b }); box(1.8, 0.06, 0.06, wf, -2.6, 2.8, -RL + 0.04); box(1.8, 0.06, 0.06, wf, -2.6, 1.4, -RL + 0.04); box(0.06, 1.46, 0.06, wf, -3.47, 2.1, -RL + 0.04); box(0.06, 1.46, 0.06, wf, -1.73, 2.1, -RL + 0.04); box(0.04, 1.4, 0.05, wf, -2.6, 2.1, -RL + 0.05);
  const moon = new THREE.PointLight(0x9fb0ff, 1.5, 5, 2); moon.position.set(-2.6, 2.1, -RL + 0.8); scene.add(moon);
  // bookshelf
  const shelf = new THREE.Group(); shelf.position.set(2.7, 0, -RL + 0.22); scene.add(shelf);
  const shelfMat = std({ color: 0x241913 });
  box(1.4, 0.04, 0.36, shelfMat, 0, 0.02, 0, shelf);
  [0.5, 1.05, 1.6, 2.15].forEach((y) => {
    box(1.4, 0.04, 0.36, shelfMat, 0, y, 0, shelf);
    let x = -0.62;
    while (x < 0.6) {
      const bw = rand(0.05, 0.1), bh = rand(0.28, 0.44);
      const b = box(bw, bh, rand(0.22, 0.3), std({ color: new THREE.Color().setHSL(rand(0.02, 0.1), rand(0.2, 0.55), rand(0.12, 0.45)) }), x + bw / 2, y + 0.02 + bh / 2, 0, shelf);
      if (Math.random() < 0.12) b.rotation.z = 0.2;
      x += bw + 0.008;
    }
  });
  box(0.04, 2.2, 0.36, shelfMat, -0.7, 1.1, 0, shelf); box(0.04, 2.2, 0.36, shelfMat, 0.7, 1.1, 0, shelf);
  // plant
  const plant = new THREE.Group(); plant.position.set(-1.9, 0, -RL + 0.6); scene.add(plant);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.42, 20), std({ color: 0xb15f2c, roughness: 0.7 })); pot.position.y = 0.21; plant.add(pot);
  const leafMat = std({ color: 0x2f4a2a, roughness: 0.8, side: THREE.DoubleSide });
  for (let k = 0; k < 11; k++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), leafMat);
    leaf.scale.set(0.35, 1.3, 0.1);
    const a = (k / 11) * Math.PI * 2;
    leaf.position.set(Math.cos(a) * 0.14, 0.72 + Math.random() * 0.25, Math.sin(a) * 0.14);
    leaf.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6);
    plant.add(leaf);
  }

  /* dust */
  const DUST = mobile ? 260 : 600;
  const dustGeo = new THREE.BufferGeometry();
  const dp = new Float32Array(DUST * 3), seeds = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) { dp[i * 3] = rand(-3.8, 3.8); dp[i * 3 + 1] = rand(0.1, 3.9); dp[i * 3 + 2] = rand(-RL + 0.3, -0.3); seeds[i] = Math.random() * 100 }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dotTex = tex(64, 64, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w) });
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: dotTex, color: 0xffc79a, size: 0.03, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(dust);
  const dustBase = dp.slice();

  /* ---------- camera timeline ---------- */
  let keys = [];
  const segLen = (T_OUT - T_IN) / n;
  function buildKeys() {
    keys = [];
    const push = (t, x, y, z, yaw, pitch = 0) => keys.push({ t, x, y, z, yaw, pitch });
    push(0, 0, 1.6, mobile ? 11 : 8.6, 0, 0.03);
    push(0.055, 0, 1.66, 3.2, 0, 0);
    push(T_IN, 0, EYE, -0.6, 0, -0.02);
    frames.forEach((f, i) => {
      const dist = mobile ? 4.2 : 3.5;
      const cx = f.left ? f.x + dist : f.x - dist;
      const tx = f.x, ty = FRAME_Y + (mobile ? -0.5 : 0), tz = f.z + (mobile ? 0 : f.left ? -0.62 : 0.62);
      const yaw = Math.atan2(-(tx - cx), -(tz - f.z));
      const pitch = Math.atan2(ty - EYE, Math.hypot(tx - cx, tz - f.z));
      const t0 = T_IN + i * segLen;
      if (i > 0) push(t0 + segLen * 0.12, 0, EYE, (frames[i - 1].z + f.z) / 2 - 0.3, 0, 0);
      push(t0 + segLen * 0.42, cx, EYE, f.z, yaw, pitch);
      push(t0 + segLen * 0.86, cx, EYE, f.z - 0.08, yaw, pitch);
    });
    push(0.9, 0, 1.62, -17.9, 0, -0.04);
    push(0.95, 0, 1.4, monZ + 1.9, 0, -0.03);
    push(1, 0, 1.33, monZ + 0.18, 0, 0);
  }
  buildKeys();

  const cam = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0 };
  function sample(p) {
    if (p <= keys[0].t) return Object.assign(cam, keys[0]);
    for (let k = 1; k < keys.length; k++) {
      const a = keys[k - 1], b = keys[k];
      if (p <= b.t) {
        const u = easeIO((p - a.t) / (b.t - a.t || 1));
        cam.x = a.x + (b.x - a.x) * u; cam.y = a.y + (b.y - a.y) * u; cam.z = a.z + (b.z - a.z) * u;
        cam.yaw = a.yaw + (b.yaw - a.yaw) * u; cam.pitch = a.pitch + (b.pitch - a.pitch) * u;
        return cam;
      }
    }
    return Object.assign(cam, keys[keys.length - 1]);
  }
  function activeAt(p) {
    if (p < T_IN || p > T_OUT) return -1;
    const i = Math.floor((p - T_IN) / segLen);
    const u = (p - T_IN - i * segLen) / segLen;
    return u > 0.3 && u < 0.97 ? Math.min(i, n - 1) : -1;
  }

  /* ---------- loop ---------- */
  let target = 0, cur = 0, running = false, raf = 0, lastActive = -2;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', (e) => { mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1 }, { passive: true });
  const dir = new THREE.Vector3();
  const clock = new THREE.Clock();

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const m = mobileQ.matches;
    if (m !== mobile) { mobile = m; buildKeys() }
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.enabled = !mobile;
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 62 : 50;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  function frame() {
    raf = 0;
    const t = clock.getElapsedTime();
    cur += (target - cur) * 0.085;
    if (Math.abs(target - cur) < 1e-5) cur = target;
    const p = cur;
    sample(p);
    mouse.sx += (mouse.x - mouse.sx) * 0.05; mouse.sy += (mouse.y - mouse.sy) * 0.05;
    const bobble = Math.sin(t * 0.8) * 0.012;
    camera.position.set(cam.x, cam.y + bobble, cam.z);
    const yaw = cam.yaw - mouse.sx * 0.06, pitch = cam.pitch - mouse.sy * 0.035;
    dir.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
    camera.lookAt(camera.position.x + dir.x, camera.position.y + dir.y, camera.position.z + dir.z);

    doorPivot.rotation.y = easeIO(smooth(0.012, 0.06, p)) * 1.8;
    spill.intensity = 3 + smooth(0.01, 0.06, p) * 4;
    warm.forEach((l, i) => { l.intensity = 9 * smooth(0.03 + i * 0.01, 0.09 + i * 0.01, p) + 0.4 });
    lampL.intensity = 5 + Math.sin(t * 7) * 0.12;

    // frames: lean slightly toward the viewer when active
    const act = activeAt(p);
    frames.forEach((f, i) => {
      f.k = (f.k || 0) + ((i === act ? 1 : 0) - (f.k || 0)) * 0.08;
      f.pic.material.color.setScalar(0.62 + 0.3 * f.k);
    });
    if (act !== lastActive) { lastActive = act; onActive && onActive(act) }
    onFrame && onFrame(p);

    // dust drift
    const pos = dustGeo.attributes.position.array;
    for (let i = 0; i < DUST; i++) {
      const s = seeds[i];
      pos[i * 3] = dustBase[i * 3] + Math.sin(t * 0.2 + s) * 0.15;
      pos[i * 3 + 1] = dustBase[i * 3 + 1] + Math.sin(t * 0.3 + s * 1.7) * 0.12;
    }
    dustGeo.attributes.position.needsUpdate = true;

    composer.render();
    if (running) raf = requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    if (running && !raf) raf = requestAnimationFrame(frame);
  }, { rootMargin: '200px' });
  io.observe(canvas);

  return {
    setProgress(p) { target = Math.min(Math.max(p, 0), 1) },
    jump(p) { target = cur = p },
    count: n,
    T_IN, T_OUT,
    renderOnce() { if (!raf) raf = requestAnimationFrame(frame) },
  };
}
