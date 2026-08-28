import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const stage = document.querySelector('#stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfeafa);
scene.fog = new THREE.Fog(0xcfeafa, 9, 18);

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
const defaultCamera = new THREE.Vector3(3.25, 2.25, 4.55);
camera.position.copy(defaultCamera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.target.set(0, 1.02, 0);
controls.minDistance = 3.0;
controls.maxDistance = 7.2;
controls.maxPolarAngle = Math.PI * 0.53;
controls.minPolarAngle = Math.PI * 0.24;
controls.enablePan = false;
controls.update();

// Soft outdoor/studio hybrid lighting.
scene.add(new THREE.HemisphereLight(0xf8fcff, 0xb8aa8e, 2.35));
const key = new THREE.DirectionalLight(0xfff7e8, 4.4);
key.position.set(3.8, 6.2, 4.4);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -4;
key.shadow.camera.right = 4;
key.shadow.camera.top = 5;
key.shadow.camera.bottom = -2;
key.shadow.bias = -0.0004;
scene.add(key);

const fill = new THREE.DirectionalLight(0xbddcff, 1.3);
fill.position.set(-4, 2.2, 2.5);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffffff, 1.4);
rim.position.set(0, 4, -5);
scene.add(rim);

// Ground / miniature display platform.
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(7, 96),
  new THREE.MeshStandardMaterial({ color: 0xdce7cd, roughness: 0.92, metalness: 0 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const podium = new THREE.Mesh(
  new THREE.CylinderGeometry(1.65, 1.78, 0.10, 72),
  new THREE.MeshStandardMaterial({ color: 0xf8f5ed, roughness: 0.78 })
);
podium.position.y = 0.05;
podium.receiveShadow = true;
podium.castShadow = true;
scene.add(podium);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1.54, 0.018, 10, 90),
  new THREE.MeshStandardMaterial({ color: 0x82b9dc, roughness: 0.55 })
);
ring.rotation.x = Math.PI / 2;
ring.position.y = 0.108;
scene.add(ring);

function makeSugarBumpTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 7200; i += 1) {
    const v = 108 + Math.floor(Math.random() * 42);
    const a = 0.18 + Math.random() * 0.42;
    const r = 0.25 + Math.random() * 1.15;
    ctx.fillStyle = `rgba(${v},${v},${v},${a})`;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.15, 1.15);
  return texture;
}

function mesh(geometry, material, cast = true) {
  const m = new THREE.Mesh(geometry, material);
  m.castShadow = cast;
  m.receiveShadow = cast;
  return m;
}

const mats = {
  sugar: new THREE.MeshStandardMaterial({
    color: 0xf4ead3,
    roughness: 0.92,
    metalness: 0,
    bumpMap: makeSugarBumpTexture(),
    bumpScale: 0.035
  }),
  black: new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.48 }),
  eye: new THREE.MeshPhysicalMaterial({ color: 0x08090b, roughness: 0.16, clearcoat: 0.8, clearcoatRoughness: 0.12 }),
  eyeGlow: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  cheek: new THREE.MeshStandardMaterial({ color: 0xf0a5a8, roughness: 0.75, transparent: true, opacity: 0.82 }),
  mouth: new THREE.MeshStandardMaterial({ color: 0x321c1b, roughness: 0.6 })
};

const character = new THREE.Group();
character.position.y = 0.12;
scene.add(character);

const bodyRig = new THREE.Group();
character.add(bodyRig);

const body = mesh(new RoundedBoxGeometry(1.42, 1.42, 1.42, 8, 0.12), mats.sugar);
body.position.y = 1.17;
bodyRig.add(body);

// Face is built in real 3D so it stays attached when camera moves.
const face = new THREE.Group();
face.position.set(0, 1.24, 0.712);
bodyRig.add(face);

function createEye(x) {
  const holder = new THREE.Group();
  holder.position.set(x, 0.12, 0.02);
  const eye = mesh(new THREE.SphereGeometry(0.135, 28, 20), mats.eye);
  eye.scale.set(0.86, 1.18, 0.40);
  holder.add(eye);
  const shine = mesh(new THREE.SphereGeometry(0.031, 14, 10), mats.eyeGlow, false);
  shine.position.set(-0.036, 0.052, 0.055);
  holder.add(shine);
  face.add(holder);
  return holder;
}

const eyeL = createEye(-0.235);
const eyeR = createEye(0.235);

function createBrow(x) {
  const brow = mesh(new RoundedBoxGeometry(0.19, 0.035, 0.035, 4, 0.015), mats.black, false);
  brow.position.set(x, 0.325, 0.05);
  brow.rotation.z = x < 0 ? -0.05 : 0.05;
  face.add(brow);
  return brow;
}
createBrow(-0.235);
createBrow(0.235);

const mouth = mesh(new THREE.TorusGeometry(0.12, 0.025, 12, 32, Math.PI), mats.mouth, false);
mouth.position.set(0, -0.17, 0.06);
mouth.rotation.z = Math.PI;
face.add(mouth);

for (const x of [-0.405, 0.405]) {
  const cheek = mesh(new THREE.SphereGeometry(0.09, 20, 14), mats.cheek, false);
  cheek.position.set(x, -0.095, 0.035);
  cheek.scale.set(1.25, 0.60, 0.25);
  face.add(cheek);
}

const limbGeo = new THREE.CapsuleGeometry(0.045, 0.28, 5, 10);
const handGeo = new THREE.SphereGeometry(0.105, 22, 16);
const footGeo = new THREE.SphereGeometry(0.12, 22, 16);

function createArm(side) {
  const pivot = new THREE.Group();
  pivot.position.set(side * 0.73, 1.30, 0.03);
  const arm = mesh(limbGeo, mats.black);
  arm.position.y = -0.23;
  pivot.add(arm);
  const hand = mesh(handGeo, mats.black);
  hand.position.y = -0.49;
  hand.scale.set(1.02, 0.92, 0.95);
  pivot.add(hand);
  pivot.rotation.z = side * 0.10;
  character.add(pivot);
  return pivot;
}

function createLeg(side) {
  const pivot = new THREE.Group();
  pivot.position.set(side * 0.275, 0.52, 0.015);
  const leg = mesh(limbGeo, mats.black);
  leg.scale.set(0.92, 0.86, 0.92);
  leg.position.y = -0.22;
  pivot.add(leg);
  const foot = mesh(footGeo, mats.black);
  foot.position.set(side * 0.015, -0.48, 0.055);
  foot.scale.set(1.25, 0.55, 1.18);
  pivot.add(foot);
  character.add(pivot);
  return pivot;
}

const armL = createArm(-1);
const armR = createArm(1);
const legL = createLeg(-1);
const legR = createLeg(1);

// A soft blob shadow helps the character feel planted even before full game art exists.
const blobShadow = new THREE.Mesh(
  new THREE.CircleGeometry(0.62, 48),
  new THREE.MeshBasicMaterial({ color: 0x172033, transparent: true, opacity: 0.12, depthWrite: false })
);
blobShadow.rotation.x = -Math.PI / 2;
blobShadow.position.y = 0.115;
scene.add(blobShadow);

const tune = { speed: 1, waddle: 1, stride: 1 };
let state = 'idle';
let stateStarted = performance.now() / 1000;

function setState(next) {
  state = next;
  stateStarted = performance.now() / 1000;
  document.querySelectorAll('.motion-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.state === next);
  });
}

document.querySelectorAll('.motion-btn').forEach(btn => {
  btn.addEventListener('click', () => setState(btn.dataset.state));
});

document.querySelector('#resetView').addEventListener('click', () => {
  camera.position.copy(defaultCamera);
  controls.target.set(0, 1.02, 0);
  controls.update();
});

for (const id of ['speed', 'waddle', 'stride']) {
  const input = document.querySelector(`#${id}`);
  const value = document.querySelector(`#${id}Value`);
  input.addEventListener('input', () => {
    tune[id] = Number(input.value);
    value.textContent = tune[id].toFixed(2);
  });
}

function resetPose() {
  character.position.set(0, 0.12, 0);
  character.rotation.set(0, 0, 0);
  character.scale.set(1, 1, 1);
  bodyRig.rotation.set(0, 0, 0);
  bodyRig.position.set(0, 0, 0);
  armL.rotation.set(0, 0, -0.10);
  armR.rotation.set(0, 0, 0.10);
  legL.rotation.set(0, 0, 0);
  legR.rotation.set(0, 0, 0);
  blobShadow.scale.set(1, 1, 1);
  blobShadow.material.opacity = 0.12;
}

function animateIdle(t) {
  const breath = Math.sin(t * 2.1);
  bodyRig.position.y = breath * 0.012;
  bodyRig.rotation.z = Math.sin(t * 1.15) * 0.012;
  character.scale.set(1 - breath * 0.004, 1 + breath * 0.007, 1 - breath * 0.004);
  armL.rotation.z = -0.10 + Math.sin(t * 1.7) * 0.025;
  armR.rotation.z = 0.10 - Math.sin(t * 1.7) * 0.025;
}

function animateRun(t) {
  const p = t * 12.5 * tune.speed;
  const step = Math.sin(p);
  const hop = Math.abs(Math.sin(p));
  const half = Math.sin(p * 0.5);
  const legSwing = 0.44 * tune.stride;

  legL.rotation.x = step * legSwing;
  legR.rotation.x = -step * legSwing;
  armL.rotation.x = -step * 0.20;
  armR.rotation.x = step * 0.20;
  armL.rotation.z = -0.08;
  armR.rotation.z = 0.08;

  character.position.y = 0.12 + hop * 0.055;
  character.rotation.z = half * 0.055 * tune.waddle;
  character.rotation.y = half * 0.026 * tune.waddle;
  bodyRig.rotation.z = half * 0.025 * tune.waddle;

  const squash = Math.max(0, Math.cos(p * 2)) * 0.018;
  character.scale.set(1 + squash, 1 - squash * 1.45, 1 + squash * 0.45);
  blobShadow.scale.set(1 - hop * 0.12, 1 - hop * 0.12, 1);
  blobShadow.material.opacity = 0.13 - hop * 0.035;
}

function animateStumble(local) {
  const d = 2.15;
  const q = Math.min(local / d, 1);
  const ease = 1 - Math.pow(1 - q, 3);
  const panic = Math.sin(local * 24) * Math.max(0, 1 - q);

  if (q < 0.32) {
    const k = q / 0.32;
    character.rotation.z = -k * 0.42 + panic * 0.06;
    character.rotation.x = k * 0.10;
    character.position.x = -k * 0.12;
    armL.rotation.z = -0.85 - panic * 0.2;
    armR.rotation.z = 0.75 + panic * 0.2;
    legL.rotation.x = panic * 0.45;
    legR.rotation.x = -panic * 0.45;
  } else if (q < 0.72) {
    const k = (q - 0.32) / 0.40;
    character.rotation.z = -0.42 - k * 1.15;
    character.rotation.x = k * 0.42;
    character.position.y = 0.12 - Math.sin(k * Math.PI) * 0.12;
    character.position.x = -0.12 - k * 0.28;
    armL.rotation.z = -1.1;
    armR.rotation.z = 1.0;
  } else {
    const k = (q - 0.72) / 0.28;
    character.rotation.z = -1.57 * (1 - k);
    character.rotation.x = 0.42 * (1 - k);
    character.position.x = -0.40 * (1 - k);
    character.position.y = 0.12;
    armL.rotation.z = -1.1 * (1 - k) - 0.10 * k;
    armR.rotation.z = 1.0 * (1 - k) + 0.10 * k;
  }

  if (local >= d) setState('idle');
  void ease;
}

function animateVictory(t) {
  const p = t * 5.2;
  const bounce = Math.abs(Math.sin(p));
  character.position.y = 0.12 + bounce * 0.12;
  character.rotation.z = Math.sin(p * 0.5) * 0.035;
  armL.rotation.z = -1.92 + Math.sin(p) * 0.10;
  armR.rotation.z = 1.92 - Math.sin(p) * 0.10;
  legL.rotation.x = Math.sin(p) * 0.10;
  legR.rotation.x = -Math.sin(p) * 0.10;
  const s = 1 + bounce * 0.018;
  character.scale.set(s, 1 - bounce * 0.008, s);
}

function animateBlink(t) {
  // Semi-random-looking deterministic blink rhythm.
  const cycle = t % 4.6;
  let scaleY = 1;
  if (cycle > 3.82 && cycle < 4.04) {
    const k = (cycle - 3.82) / 0.22;
    scaleY = 0.12 + Math.abs(k - 0.5) * 1.76;
  }
  eyeL.scale.y = scaleY;
  eyeR.scale.y = scaleY;
}

const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime();
  const now = performance.now() / 1000;
  const local = now - stateStarted;
  resetPose();
  animateBlink(t);

  if (state === 'run') animateRun(t);
  else if (state === 'stumble') animateStumble(local);
  else if (state === 'victory') animateVictory(t);
  else animateIdle(t);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

function resize() {
  const rect = stage.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

new ResizeObserver(resize).observe(stage);
resize();
frame();
