// About section: a slowly spinning "neural globe" — fibonacci-sphere nodes linked to their neighbours.
import * as THREE from 'three';

export function initGlobe(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.z = 6.2;

  const N = 420, R = 1.9;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i;
    pts.push(new THREE.Vector3(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R));
  }
  const group = new THREE.Group();
  scene.add(group);

  const pGeo = new THREE.BufferGeometry().setFromPoints(pts);
  const colors = new Float32Array(N * 3);
  const dark = new THREE.Color('#111111'), acc = new THREE.Color('#b15f2c');
  for (let i = 0; i < N; i++) (Math.random() < 0.08 ? acc : dark).toArray(colors, i * 3);
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  group.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.55 })));

  const seg = [];
  for (let i = 0; i < N; i++) {
    let c = 0;
    for (let j = i + 1; j < N && c < 3; j++) if (pts[i].distanceTo(pts[j]) < 0.36) { seg.push(pts[i], pts[j]); c++ }
  }
  group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seg), new THREE.LineBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.1 })));

  // orbit ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.004, 8, 160), new THREE.MeshBasicMaterial({ color: 0xb15f2c, transparent: true, opacity: 0.5 }));
  ring.rotation.x = Math.PI / 2.3;
  scene.add(ring);
  const sat = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), new THREE.MeshBasicMaterial({ color: 0xb15f2c }));
  scene.add(sat);

  group.rotation.z = 0.35;
  let running = false, raf = 0, scrollSpin = 0;
  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5 }, { passive: true });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const clock = new THREE.Clock();
  function loop() {
    raf = 0;
    const t = clock.getElapsedTime();
    group.rotation.y = t * 0.12 + scrollSpin;
    group.rotation.x += (mouse.y * 0.4 - group.rotation.x) * 0.04;
    const a = t * 0.6;
    const v = new THREE.Vector3(Math.cos(a) * 2.45, 0, Math.sin(a) * 2.45).applyEuler(ring.rotation);
    sat.position.copy(v);
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(loop);
  }
  new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running && !raf) raf = requestAnimationFrame(loop) }).observe(canvas);

  return { setSpin(v) { scrollSpin = v } };
}
