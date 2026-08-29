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
  sugar: new THREE.MeshStandardMaterial({ color: 0xf4ead3, roughness: 0.92, metalness: 0, bumpMap: makeSugarBumpTexture(), bumpScale: 0.035 }),
  black: new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.48 }),
  eye: new THREE.MeshPhysicalMaterial({ color: 0x08090b, roughness: 0.16, clearcoat: 0.8, clearcoatRoughness: 0.12 }),
  eyeGlow: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  cheek: new THREE.MeshStandardMaterial({ color: 0xf0a5a8, roughness: 0.75, transparent: true, opacity: 0.82 }),
  mouth: new THREE.MeshStandardMaterial({ color: 0x321c1b, roughness: 0.6 }),
  tongue: new THREE.MeshStandardMaterial({ color: 0xe87983, roughness: 0.72 }),
  star: new THREE.MeshStandardMaterial({ color: 0xffd85a, roughness: 0.42, emissive: 0x6b4500, emissiveIntensity: 0.12 })
};

const character = new THREE.Group();
character.position.y = 0.12;
scene.add(character);

// One shared rig root for the cube, face, arms and legs.
// This keeps body lean/waddle connected to the limbs instead of animating as separate pieces.
const bodyRig = new THREE.Group();
character.add(bodyRig);

const body = mesh(new RoundedBoxGeometry(1.42, 1.42, 1.42, 8, 0.12), mats.sugar);
body.position.y = 1.17;
bodyRig.add(body);

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

function createXEye(x) {
  const holder = new THREE.Group();
  holder.position.set(x, 0.12, 0.075);
  for (const angle of [-0.72, 0.72]) {
    const bar = mesh(new RoundedBoxGeometry(0.17, 0.027, 0.032, 4, 0.012), mats.black, false);
    bar.rotation.z = angle;
    holder.add(bar);
  }
  holder.visible = false;
  face.add(holder);
  return holder;
}

const xEyeL = createXEye(-0.235);
const xEyeR = createXEye(0.235);

function createBrow(x) {
  const brow = mesh(new RoundedBoxGeometry(0.19, 0.035, 0.035, 4, 0.015), mats.black, false);
  brow.position.set(x, 0.325, 0.05);
  brow.rotation.z = x < 0 ? -0.05 : 0.05;
  face.add(brow);
  return brow;
}

const browL = createBrow(-0.235);
const browR = createBrow(0.235);

const smileMouth = mesh(new THREE.TorusGeometry(0.12, 0.025, 12, 32, Math.PI), mats.mouth, false);
smileMouth.position.set(0, -0.17, 0.06);
smileMouth.rotation.z = Math.PI;
face.add(smileMouth);

const effortMouth = mesh(new THREE.SphereGeometry(0.075, 22, 16), mats.mouth, false);
effortMouth.position.set(0, -0.18, 0.065);
effortMouth.scale.set(0.72, 0.90, 0.30);
effortMouth.visible = false;
face.add(effortMouth);

const shockMouth = mesh(new THREE.TorusGeometry(0.075, 0.021, 12, 28), mats.mouth, false);
shockMouth.position.set(0, -0.18, 0.067);
shockMouth.scale.set(0.78, 1.16, 0.38);
shockMouth.visible = false;
face.add(shockMouth);

const grimaceMouth = mesh(new RoundedBoxGeometry(0.19, 0.034, 0.035, 4, 0.012), mats.mouth, false);
grimaceMouth.position.set(0, -0.17, 0.066);
grimaceMouth.visible = false;
face.add(grimaceMouth);

const victoryMouth = new THREE.Group();
victoryMouth.position.set(0, -0.17, 0.065);
const victoryCavity = mesh(new THREE.SphereGeometry(0.105, 22, 16), mats.mouth, false);
victoryCavity.scale.set(0.95, 1.12, 0.30);
victoryMouth.add(victoryCavity);
const tongue = mesh(new THREE.SphereGeometry(0.057, 18, 12), mats.tongue, false);
tongue.position.set(0, -0.045, 0.031);
tongue.scale.set(1.0, 0.48, 0.25);
victoryMouth.add(tongue);
victoryMouth.visible = false;
face.add(victoryMouth);

const cheeks = [];
for (const x of [-0.405, 0.405]) {
  const cheek = mesh(new THREE.SphereGeometry(0.09, 20, 14), mats.cheek, false);
  cheek.position.set(x, -0.095, 0.035);
  cheek.scale.set(1.25, 0.60, 0.25);
  face.add(cheek);
  cheeks.push(cheek);
}

const dizzyFX = new THREE.Group();
dizzyFX.position.set(0, 2.02, 0.02);
bodyRig.add(dizzyFX);
for (const [x, y, s] of [[-0.42, 0.03, 0.07], [0.02, 0.16, 0.055], [0.42, -0.01, 0.065]]) {
  const star = mesh(new THREE.OctahedronGeometry(s, 0), mats.star, false);
  star.position.set(x, y, 0.04);
  dizzyFX.add(star);
}
dizzyFX.visible = false;

const legGeo = new THREE.CapsuleGeometry(0.045, 0.28, 5, 10);
const armGeo = new THREE.CapsuleGeometry(0.043, 0.15, 5, 10);
const handGeo = new THREE.SphereGeometry(0.095, 22, 16);
const footGeo = new THREE.SphereGeometry(0.12, 22, 16);

function createArm(side) {
  const shoulder = new THREE.Group();
  // Closer than v8, but still slightly outside the body silhouette so the arms remain readable.
  shoulder.position.set(side * 0.77, 1.29, 0.075);
  const upper = mesh(armGeo, mats.black);
  upper.position.y = -0.13;
  shoulder.add(upper);
  const elbow = new THREE.Group();
  elbow.position.y = -0.29;
  shoulder.add(elbow);
  const forearm = mesh(armGeo, mats.black);
  forearm.position.y = -0.13;
  elbow.add(forearm);
  const hand = mesh(handGeo, mats.black);
  hand.position.y = -0.31;
  hand.scale.set(1.02, 0.92, 0.95);
  elbow.add(hand);
  shoulder.userData.elbow = elbow;
  bodyRig.add(shoulder);
  return shoulder;
}

function createLeg(side) {
  const pivot = new THREE.Group();
  pivot.position.set(side * 0.275, 0.52, 0.015);
  const leg = mesh(legGeo, mats.black);
  leg.scale.set(0.92, 0.86, 0.92);
  leg.position.y = -0.22;
  pivot.add(leg);
  const foot = mesh(footGeo, mats.black);
  foot.position.set(side * 0.015, -0.48, 0.055);
  foot.scale.set(1.25, 0.55, 1.18);
  pivot.add(foot);
  bodyRig.add(pivot);
  return pivot;
}

const armL = createArm(-1);
const armR = createArm(1);
const legL = createLeg(-1);
const legR = createLeg(1);
const elbowL = armL.userData.elbow;
const elbowR = armR.userData.elbow;

const baseRig = { armLX: -0.77, armRX: 0.77, armY: 1.29, armZ: 0.075, legLX: -0.275, legRX: 0.275, legY: 0.52 };

const blobShadow = new THREE.Mesh(
  new THREE.CircleGeometry(0.62, 48),
  new THREE.MeshBasicMaterial({ color: 0x172033, transparent: true, opacity: 0.12, depthWrite: false })
);
blobShadow.rotation.x = -Math.PI / 2;
blobShadow.position.y = 0.115;
scene.add(blobShadow);

const tune = { speed: 1, waddle: 1, stride: 1, stepLength: 1, arms: 1 };
let state = 'idle';
let stateStarted = performance.now() / 1000;

function setState(next) {
  state = next;
  stateStarted = performance.now() / 1000;
  document.querySelectorAll('.motion-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.state === next));
}

document.querySelectorAll('.motion-btn').forEach(btn => btn.addEventListener('click', () => setState(btn.dataset.state)));

document.querySelector('#resetView').addEventListener('click', () => {
  camera.position.copy(defaultCamera);
  controls.target.set(0, 1.02, 0);
  controls.update();
});

for (const id of ['speed', 'waddle', 'stride', 'stepLength', 'arms']) {
  const input = document.querySelector(`#${id}`);
  const value = document.querySelector(`#${id}Value`);
  input.addEventListener('input', () => {
    tune[id] = Number(input.value);
    value.textContent = tune[id].toFixed(2);
  });
}

function resetFace() {
  eyeL.visible = true;
  eyeR.visible = true;
  xEyeL.visible = false;
  xEyeR.visible = false;
  eyeL.scale.set(1, 1, 1);
  eyeR.scale.set(1, 1, 1);
  browL.position.set(-0.235, 0.325, 0.05);
  browR.position.set(0.235, 0.325, 0.05);
  browL.rotation.z = -0.05;
  browR.rotation.z = 0.05;
  smileMouth.visible = true;
  effortMouth.visible = false;
  effortMouth.scale.set(0.72, 0.90, 0.30);
  shockMouth.visible = false;
  grimaceMouth.visible = false;
  victoryMouth.visible = false;
  dizzyFX.visible = false;
  cheeks.forEach(c => { c.scale.set(1.25, 0.60, 0.25); c.material.opacity = 0.82; });
}

function showOnlyMouth(which) {
  smileMouth.visible = which === 'smile';
  effortMouth.visible = which === 'effort';
  shockMouth.visible = which === 'shock';
  grimaceMouth.visible = which === 'grimace';
  victoryMouth.visible = which === 'victory';
}

function faceRun() {
  eyeL.scale.set(1.02, 1.03, 1);
  eyeR.scale.set(1.02, 1.03, 1);
  browL.rotation.z = -0.085;
  browR.rotation.z = 0.085;
  browL.position.y = 0.322;
  browR.position.y = 0.322;
  effortMouth.scale.set(0.60, 0.70, 0.26);
  showOnlyMouth('effort');
  cheeks.forEach(c => { c.scale.set(1.31, 0.62, 0.25); c.material.opacity = 0.90; });
}

function facePanic() {
  eyeL.scale.set(1.11, 1.13, 1);
  eyeR.scale.set(1.11, 1.13, 1);
  browL.position.y = 0.37;
  browR.position.y = 0.37;
  browL.rotation.z = 0.12;
  browR.rotation.z = -0.12;
  showOnlyMouth('shock');
}

function faceImpact() {
  eyeL.scale.set(1.02, 0.13, 1);
  eyeR.scale.set(1.02, 0.13, 1);
  browL.position.y = 0.285;
  browR.position.y = 0.285;
  browL.rotation.z = -0.28;
  browR.rotation.z = 0.28;
  showOnlyMouth('grimace');
  cheeks.forEach(c => { c.material.opacity = 0.66; });
}

function faceDazed(t) {
  eyeL.visible = false;
  eyeR.visible = false;
  xEyeL.visible = true;
  xEyeR.visible = true;
  browL.position.y = 0.30;
  browR.position.y = 0.30;
  browL.rotation.z = -0.10;
  browR.rotation.z = 0.10;
  showOnlyMouth('shock');
  shockMouth.scale.set(0.68, 0.76, 0.32);
  dizzyFX.visible = true;
  dizzyFX.rotation.y = t * 2.8;
  dizzyFX.children.forEach((star, i) => {
    star.rotation.x = t * (2.1 + i * 0.35);
    star.rotation.z = -t * (1.6 + i * 0.28);
  });
  cheeks.forEach(c => { c.material.opacity = 0.54; });
}

function faceRecover(k) {
  eyeL.scale.set(1, 0.58 + k * 0.42, 1);
  eyeR.scale.set(1, 0.58 + k * 0.42, 1);
  browL.rotation.z = -0.20 * (1 - k) - 0.05 * k;
  browR.rotation.z = 0.20 * (1 - k) + 0.05 * k;
  if (k < 0.65) showOnlyMouth('grimace');
  else showOnlyMouth('smile');
}

function faceVictory() {
  eyeL.scale.set(1.06, 0.84, 1);
  eyeR.scale.set(1.06, 0.84, 1);
  browL.position.y = 0.36;
  browR.position.y = 0.36;
  browL.rotation.z = 0.08;
  browR.rotation.z = -0.08;
  showOnlyMouth('victory');
  cheeks.forEach(c => { c.scale.set(1.42, 0.68, 0.25); c.material.opacity = 0.98; });
}

function resetPose() {
  character.position.set(0, 0.12, 0);
  character.rotation.set(0, 0, 0);
  character.scale.set(1, 1, 1);
  bodyRig.rotation.set(0, 0, 0);
  bodyRig.position.set(0, 0, 0);

  armL.position.set(baseRig.armLX, baseRig.armY, baseRig.armZ);
  armR.position.set(baseRig.armRX, baseRig.armY, baseRig.armZ);
  armL.rotation.set(0.02, -0.08, -0.18);
  armR.rotation.set(-0.02, 0.08, 0.18);
  elbowL.rotation.set(-0.90, 0, 0.20);
  elbowR.rotation.set(-0.90, 0, -0.20);

  legL.position.set(baseRig.legLX, baseRig.legY, 0.015);
  legR.position.set(baseRig.legRX, baseRig.legY, 0.015);
  legL.rotation.set(0, 0, 0);
  legR.rotation.set(0, 0, 0);

  blobShadow.scale.set(1, 1, 1);
  blobShadow.material.opacity = 0.12;
  shockMouth.scale.set(1, 1, 1);
}

function animateIdle(t) {
  const breath = Math.sin(t * 2.1);
  // Very small whole-rig breathing keeps the face, body and limbs visually connected.
  bodyRig.position.y = breath * 0.004;
  bodyRig.rotation.z = Math.sin(t * 1.15) * 0.010;
  character.scale.set(1 - breath * 0.004, 1 + breath * 0.007, 1 - breath * 0.004);
  armL.rotation.z = -0.18 + Math.sin(t * 1.7) * 0.018;
  armR.rotation.z = 0.18 - Math.sin(t * 1.7) * 0.018;
  armL.rotation.y = -0.08 + Math.sin(t * 1.25) * 0.012;
  armR.rotation.y = 0.08 - Math.sin(t * 1.25) * 0.012;
  elbowL.rotation.x = -0.90 + Math.sin(t * 1.5) * 0.018;
  elbowR.rotation.x = -0.90 - Math.sin(t * 1.5) * 0.018;
}

function animateRun(t) {
  faceRun();

  const p = t * 17.2 * tune.speed;
  const step = Math.sin(p);
  const leftLift = Math.pow(Math.max(0, step), 1.65);
  const rightLift = Math.pow(Math.max(0, -step), 1.65);
  const landing = Math.pow(Math.abs(Math.cos(p)), 10);
  const waddle = Math.sin(p * 0.5);

  const lift = 0.055 * tune.stride;
  const strideDepth = 0.125 * tune.stepLength;
  const depthSwing = 0.055 + 0.050 * tune.stepLength;

  legL.position.y = baseRig.legY + leftLift * lift;
  legR.position.y = baseRig.legY + rightLift * lift;
  legL.position.z = 0.015 + step * strideDepth + leftLift * 0.012;
  legR.position.z = 0.015 - step * strideDepth + rightLift * 0.012;
  legL.rotation.x = step * depthSwing;
  legR.rotation.x = -step * depthSwing;
  legL.rotation.z = -0.008 - leftLift * 0.008;
  legR.rotation.z = 0.008 + rightLift * 0.008;

  // Bent-arm "hut-dul" swing, but kept closer to the body than v8.
  // Because the arms now live under bodyRig, torso lean/waddle carries the shoulders naturally.
  const armPump = step * (0.20 + 0.07 * tune.stepLength) * tune.arms;
  const elbowPump = step * 0.12 * tune.arms;
  armL.rotation.x = 0.02 + armPump;
  armR.rotation.x = -0.02 - armPump;
  armL.rotation.y = -0.09 + step * 0.045 * tune.arms;
  armR.rotation.y = 0.09 - step * 0.045 * tune.arms;
  armL.rotation.z = -0.19 - waddle * 0.014 * tune.waddle - step * 0.014 * tune.arms;
  armR.rotation.z = 0.19 - waddle * 0.014 * tune.waddle - step * 0.014 * tune.arms;
  armL.position.x = baseRig.armLX - Math.max(0, step) * 0.006 * tune.arms;
  armR.position.x = baseRig.armRX + Math.max(0, -step) * 0.006 * tune.arms;
  armL.position.y = baseRig.armY - step * 0.010 * tune.arms;
  armR.position.y = baseRig.armY + step * 0.010 * tune.arms;
  armL.position.z = baseRig.armZ - step * 0.042 * tune.arms * tune.stepLength;
  armR.position.z = baseRig.armZ + step * 0.042 * tune.arms * tune.stepLength;
  elbowL.rotation.x = -0.92 - elbowPump;
  elbowR.rotation.x = -0.92 + elbowPump;
  elbowL.rotation.z = 0.21 + step * 0.030 * tune.arms;
  elbowR.rotation.z = -0.21 + step * 0.030 * tune.arms;

  // Whole-body motion is now the parent motion: torso, shoulders and hips travel together.
  character.position.x = waddle * 0.018 * tune.waddle;
  character.position.y = 0.12 + (leftLift + rightLift) * 0.002;
  character.rotation.z = waddle * 0.045 * tune.waddle;
  character.rotation.y = step * 0.012 * tune.stepLength + waddle * 0.006 * tune.waddle;

  bodyRig.position.x = -waddle * 0.008 * tune.waddle;
  bodyRig.position.z = 0.006 + Math.abs(step) * 0.008 * tune.stepLength;
  bodyRig.rotation.x = -0.026;
  bodyRig.rotation.y = -step * 0.009 * tune.stepLength;
  bodyRig.rotation.z = -waddle * 0.018 * tune.waddle;

  const squash = landing * 0.008;
  character.scale.set(1 + squash * 0.45, 1 - squash, 1 + squash * 0.24);
  blobShadow.scale.set(1 + squash * 1.4, 1 + squash * 1.4, 1);
  blobShadow.material.opacity = 0.12 + landing * 0.009;
}

function animateStumble(local) {
  const d = 2.75;
  const q = Math.min(local / d, 1);

  if (q < 0.22) {
    const k = q / 0.22;
    const panic = Math.sin(local * 30);
    facePanic();
    character.rotation.z = -k * 0.20 + panic * 0.045;
    character.rotation.x = k * 0.08;
    character.position.x = -k * 0.10;
    character.position.y = 0.12 + Math.abs(panic) * 0.018;
    bodyRig.rotation.z = panic * 0.045;
    armL.rotation.z = -0.68 - panic * 0.22;
    armR.rotation.z = 0.68 + panic * 0.22;
    armL.rotation.x = panic * 0.22;
    armR.rotation.x = -panic * 0.22;
    elbowL.rotation.x = -0.28 + panic * 0.10;
    elbowR.rotation.x = -0.28 - panic * 0.10;
    legL.rotation.x = panic * 0.48;
    legR.rotation.x = -panic * 0.48;
  } else if (q < 0.52) {
    const raw = (q - 0.22) / 0.30;
    const k = 1 - Math.pow(1 - raw, 3);
    if (raw < 0.72) facePanic();
    else faceImpact();
    character.rotation.z = -0.20 - k * 1.18;
    character.rotation.x = 0.08 + k * 0.24;
    character.position.x = -0.10 - k * 0.36;
    character.position.y = 0.12 - k * 0.025;
    armL.rotation.z = -0.92 - k * 0.20;
    armR.rotation.z = 0.92 + k * 0.16;
    armL.rotation.x = -0.18 * k;
    armR.rotation.x = 0.22 * k;
    elbowL.rotation.x = -0.26;
    elbowR.rotation.x = -0.30;
    const hit = Math.max(0, (raw - 0.72) / 0.28);
    character.scale.set(1 + hit * 0.035, 1 - hit * 0.055, 1 + hit * 0.015);
    blobShadow.scale.set(1 + k * 0.20, 1 - k * 0.12, 1);
    blobShadow.material.opacity = 0.12 + k * 0.035;
  } else if (q < 0.78) {
    const k = (q - 0.52) / 0.26;
    const wobble = Math.sin(local * 18) * (1 - k) * 0.035;
    faceDazed(local);
    character.rotation.z = -1.38 + wobble;
    character.rotation.x = 0.32 - k * 0.05;
    character.position.x = -0.46;
    character.position.y = 0.095 + Math.abs(wobble) * 0.02;
    armL.rotation.z = -1.08 + wobble;
    armR.rotation.z = 1.02 - wobble;
    elbowL.rotation.x = -0.55;
    elbowR.rotation.x = -0.48;
    legL.rotation.x = 0.15;
    legR.rotation.x = -0.18;
    blobShadow.scale.set(1.18, 0.86, 1);
    blobShadow.material.opacity = 0.15;
  } else {
    const raw = (q - 0.78) / 0.22;
    const k = raw * raw * (3 - 2 * raw);
    const wobble = Math.sin(local * 20) * (1 - k) * 0.025;
    faceRecover(k);
    character.rotation.z = -1.38 * (1 - k) + wobble;
    character.rotation.x = 0.27 * (1 - k);
    character.position.x = -0.46 * (1 - k);
    character.position.y = 0.095 + 0.025 * k;
    armL.rotation.z = -1.08 * (1 - k) - 0.18 * k;
    armR.rotation.z = 1.02 * (1 - k) + 0.18 * k;
    elbowL.rotation.x = -0.55 * (1 - k) - 0.90 * k;
    elbowR.rotation.x = -0.48 * (1 - k) - 0.90 * k;
    legL.rotation.x = 0.15 * (1 - k);
    legR.rotation.x = -0.18 * (1 - k);
    blobShadow.scale.set(1.18 - k * 0.18, 0.86 + k * 0.14, 1);
    blobShadow.material.opacity = 0.15 - k * 0.03;
  }

  if (local >= d) setState('idle');
}

function animateVictory(t) {
  faceVictory();
  const p = t * 5.4;
  const bounce = Math.abs(Math.sin(p));
  character.position.y = 0.12 + bounce * 0.13;
  character.rotation.z = Math.sin(p * 0.5) * 0.045;
  character.rotation.y = Math.sin(p * 0.5) * 0.05;
  armL.rotation.z = -1.92 + Math.sin(p) * 0.10;
  armR.rotation.z = 1.92 - Math.sin(p) * 0.10;
  armL.rotation.x = -0.12 + Math.sin(p) * 0.08;
  armR.rotation.x = 0.12 - Math.sin(p) * 0.08;
  elbowL.rotation.x = -0.58 + Math.sin(p) * 0.05;
  elbowR.rotation.x = -0.58 - Math.sin(p) * 0.05;
  legL.rotation.x = Math.sin(p) * 0.11;
  legR.rotation.x = -Math.sin(p) * 0.11;
  const s = 1 + bounce * 0.020;
  character.scale.set(s, 1 - bounce * 0.008, s);
}

function animateBlink(t) {
  if (!eyeL.visible || !eyeR.visible) return;
  const cycle = t % 4.6;
  let blink = 1;
  if (cycle > 3.82 && cycle < 4.04) {
    const k = (cycle - 3.82) / 0.22;
    blink = 0.12 + Math.abs(k - 0.5) * 1.76;
  }
  eyeL.scale.y *= blink;
  eyeR.scale.y *= blink;
}

const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime();
  const now = performance.now() / 1000;
  const local = now - stateStarted;
  resetPose();
  resetFace();

  if (state === 'run') animateRun(t);
  else if (state === 'stumble') animateStumble(local);
  else if (state === 'victory') animateVictory(t);
  else animateIdle(t);

  animateBlink(t);
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