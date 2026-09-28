// Footer: the "AI twin" — the portrait rebuilt as a glowing 3D point cloud that assembles as you arrive.
import * as THREE from 'three';

const VERT = /* glsl */`
  uniform float uTime, uAssemble, uSize, uPixel;
  attribute vec3 aScatter;
  attribute vec3 aColor;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float a = smoothstep(0.0, 1.0, clamp(uAssemble * 1.25 - aSeed * 0.25, 0.0, 1.0));
    vec3 p = mix(aScatter, position, a);
    p.x += sin(uTime * 0.9 + aSeed * 40.0) * 0.012;
    p.y += cos(uTime * 0.7 + aSeed * 30.0) * 0.012;
    p.z += sin(uTime * 1.3 + p.y * 6.0) * 0.02;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixel * (5.0 / -mv.z);
    vColor = aColor;
    vAlpha = 0.35 + 0.65 * a;
  }
`;
const FRAG = /* glsl */`
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float g = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * (0.55 + g * 0.8), g * vAlpha * 0.85);
  }
`;

export async function initTwin(canvas, src) {
  const img = new Image();
  img.src = src;
  await img.decode();

  const mobile = matchMedia('(max-width: 767px)').matches;
  const step = mobile ? 5 : 3;
  const S = 360; // sampling height
  const sw = Math.round(S * img.naturalWidth / img.naturalHeight);
  const c = document.createElement('canvas'); c.width = sw; c.height = S;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, sw, S);
  const data = g.getImageData(0, 0, sw, S).data;

  const pos = [], col = [], scat = [], seed = [];
  const acc = new THREE.Color('#cf8047'), tmp = new THREE.Color();
  const cx = sw / 2, cy = S * 0.36; // face centre (approx)
  for (let y = 0; y < S; y += step) {
    for (let x = 0; x < sw; x += step) {
      const i = (y * sw + x) * 4;
      if (data[i + 3] < 140) continue;
      const r = data[i] / 255, gg = data[i + 1] / 255, b = data[i + 2] / 255;
      const lum = 0.3 * r + 0.59 * gg + 0.11 * b;
      const nx = (x - cx) / S, ny = -(y - cy) / S;
      // depth: head is a dome, torso a flatter dome, plus luminance relief
      const head = Math.max(0, 1 - (nx * nx) / 0.045 - (ny * ny) / 0.09);
      const body = Math.max(0, 1 - (nx * nx) / 0.35) * (y > S * 0.55 ? 1 : 0);
      const z = Math.sqrt(head) * 0.34 + Math.sqrt(body) * 0.18 + lum * 0.06;
      pos.push(nx * 3, ny * 3, z * 3);
      tmp.setRGB(r, gg, b).lerp(acc, 0.55).multiplyScalar(0.6 + lum * 0.9);
      col.push(tmp.r, tmp.g, tmp.b);
      const a = Math.random() * Math.PI * 2, rr = 2 + Math.random() * 3.5;
      scat.push(Math.cos(a) * rr, (Math.random() - 0.5) * 5, Math.sin(a) * rr - 1);
      seed.push(Math.random());
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 3));
  geo.setAttribute('aScatter', new THREE.Float32BufferAttribute(scat, 3));
  geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uAssemble: { value: 0 }, uSize: { value: mobile ? 6 : 4.2 }, uPixel: { value: 1 } },
  });
  const points = new THREE.Points(geo, mat);
  points.position.y = 0.35;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  const dpr = Math.min(devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);
  mat.uniforms.uPixel.value = dpr;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, mobile ? 8.8 : 6.2);
  scene.add(points);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  let running = false, raf = 0, assemble = 0, assembleTarget = 0;
  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5 }, { passive: true });
  const clock = new THREE.Clock();
  function loop() {
    raf = 0;
    const t = clock.getElapsedTime();
    assemble += (assembleTarget - assemble) * 0.05;
    mat.uniforms.uTime.value = t;
    mat.uniforms.uAssemble.value = assemble;
    points.rotation.y = Math.sin(t * 0.25) * (mobile ? 0.3 : 0.55) + mouse.x * 0.6;
    points.rotation.x = mouse.y * 0.2;
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(loop);
  }
  new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running && !raf) raf = requestAnimationFrame(loop) }).observe(canvas);

  return { setAssemble(v) { assembleTarget = v } };
}
