// --- CONFIGURACIÓN DE LA ESCENA 3D ---
const container = document.getElementById('canvas-container');
const labelsContainer = document.getElementById('labels-container');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x010105, 0.007);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 18, 45);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.maxDistance = 130;
controls.minDistance = 8;

// --- GENERACIÓN DE TEXTURAS ---
function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,238,0,0.9)');
  gradient.addColorStop(0.6, 'rgba(255,140,0,0.3)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function createYellowBouquetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Hojas verdes
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath(); ctx.ellipse(64, 85, 30, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(40, 75, 20, 10, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(88, 75, 20, 10, 0.5, 0, Math.PI * 2); ctx.fill();

  // Flores amarillas
  function drawFlower(cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#ffea00';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.rotate((Math.PI * 2) / 12);
      ctx.ellipse(0, -18, 5, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffb703';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.rotate((Math.PI * 2) / 12);
      ctx.ellipse(0, -12, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#5c2c06';
    ctx.fill();
    ctx.restore();
  }

  drawFlower(64, 45, 1.1);
  drawFlower(42, 60, 0.85);
  drawFlower(86, 60, 0.85);

  ctx.fillStyle = '#ffb703';
  ctx.fillRect(56, 86, 16, 12);

  return new THREE.CanvasTexture(canvas);
}

const particleTexture = createGlowTexture();
const yellowBouquetTexture = createYellowBouquetTexture();

// --- 1. CAMPO DE ESTRELLAS ---
const starCount = 20000;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const radius = 30 + Math.random() * 220;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);

  starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  starPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  starPos[i * 3 + 2] = radius * Math.cos(phi);

  const c = new THREE.Color();
  const rand = Math.random();
  if (rand > 0.8) c.setHSL(0.14, 1, 0.85);
  else if (rand > 0.5) c.setHSL(0.08, 1, 0.75);
  else c.setHSL(0.6, 0.25, 0.92);

  starColors[i * 3] = c.r;
  starColors[i * 3 + 1] = c.g;
  starColors[i * 3 + 2] = c.b;
}

starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

const starMat = new THREE.PointsMaterial({
  size: 0.65,
  transparent: true,
  vertexColors: true,
  map: particleTexture,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const starfield = new THREE.Points(starGeo, starMat);
scene.add(starfield);

// --- 2. GALAXIA ESPIRAL DORADA ---
const galaxyParams = { count: 40000, arms: 4, radius: 36, spin: 1.15 };
const galaxyGeo = new THREE.BufferGeometry();
const galaxyPos = new Float32Array(galaxyParams.count * 3);
const galaxyColors = new Float32Array(galaxyParams.count * 3);

for (let i = 0; i < galaxyParams.count; i++) {
  const r = Math.pow(Math.random(), 2.2) * galaxyParams.radius;
  const armAngle = ((i % galaxyParams.arms) * (2 * Math.PI)) / galaxyParams.arms;
  const spinAngle = r * galaxyParams.spin;

  const randomX = (Math.random() - 0.5) * (0.35 * r);
  const randomY = (Math.random() - 0.5) * (2.2 * Math.exp(-r * 0.08));
  const randomZ = (Math.random() - 0.5) * (0.35 * r);

  galaxyPos[i * 3] = Math.cos(armAngle + spinAngle) * r + randomX;
  galaxyPos[i * 3 + 1] = randomY - 4;
  galaxyPos[i * 3 + 2] = Math.sin(armAngle + spinAngle) * r + randomZ;

  const mix = r / galaxyParams.radius;
  const c1 = new THREE.Color(0xffffff);
  const c2 = new THREE.Color(0xffaa00);
  const c3 = new THREE.Color(0xff4400);

  let finalC = c1.clone().lerp(c2, mix * 1.4);
  if (mix > 0.55) finalC.lerp(c3, (mix - 0.55) * 2.3);

  galaxyColors[i * 3] = finalC.r;
  galaxyColors[i * 3 + 1] = finalC.g;
  galaxyColors[i * 3 + 2] = finalC.b;
}

galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPos, 3));
galaxyGeo.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));

const galaxyMat = new THREE.PointsMaterial({
  size: 0.4,
  map: particleTexture,
  transparent: true,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const galaxyMesh = new THREE.Points(galaxyGeo, galaxyMat);
scene.add(galaxyMesh);

// --- 3. CORAZÓN EN EL CENTRO ---
const heartCount = 4500;
const heartGeo = new THREE.BufferGeometry();
const heartPos = new Float32Array(heartCount * 3);

for (let i = 0; i < heartCount; i++) {
  const t = Math.PI * 2 * Math.random();
  let x = 16 * Math.pow(Math.sin(t), 3) * 0.45;
  let y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.45;
  let z = (Math.random() - 0.5) * 3.5;

  heartPos[i * 3] = x;
  heartPos[i * 3 + 1] = y + 4.5;
  heartPos[i * 3 + 2] = z;
}

heartGeo.setAttribute('position', new THREE.BufferAttribute(heartPos, 3));
const heartMat = new THREE.PointsMaterial({
  size: 0.55,
  map: particleTexture,
  color: 0xffea00,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const heartMesh = new THREE.Points(heartGeo, heartMat);
scene.add(heartMesh);

// --- 4. FRASES ROMÁNTICAS Y RAMOS DE FLORES AMARILLAS ---
const romanticData = [
  {
    label: "TE AMO", pos: [0, 4.5, 0], isCenterHeart: true
  },
  {
    label: "Mi Princesa 👑", pos: [-15, 9, 3],
    title: "Luz de mi Vida",
    text: "Eres mi princesa hermosa. Cada día a tu lado es un regalo maravilloso que atesoro con toda mi alma."
  },
  {
    label: "Mi Corazón 💓", pos: [15, 8, 4],
    title: "El Dueño de mi Latir",
    text: "En la inmensidad de este universo, mi corazón solo late por ti. Eres la razón de todas mis alegrías."
  },
  {
    label: "Mi Niña 🌻", pos: [-11, -1, 13],
    title: "Mi Refugio Dulce",
    text: "Mi niña consentida, tu dulzura e inocencia iluminan mi mundo entero. Gracias por existir."
  },
  {
    label: "Mi Vida ✨", pos: [11, -1, 13],
    title: "Nuestro Destino",
    text: "Eres mi vida entera. Prometo caminar a tu lado siempre, construyendo un futuro lleno de amor."
  },
  {
    label: "Mi Sol ☀️", pos: [16, 2, -9],
    title: "Brillo Infinito",
    text: "Como el sol ilumina cada mañana, tu sonrisa ilumina hasta mis días más oscuros."
  },
  {
    label: "Mi Universo 🌌", pos: [-16, 3, -9],
    title: "Belleza Infinita",
    text: "Eres mi universo completo. Todas las estrellas de la galaxia palidecen ante la luz de tu mirada."
  },
  {
    label: "Hermosa 🌸", pos: [-6, 13, -7],
    title: "Agradecimiento Puro",
    text: "Cada detalle tuyo es perfecto para mí. Gracias por ser la persona más hermosa del mundo."
  },
  {
    label: "Mi Cielo ☁️", pos: [7, 13, -7],
    title: "Paz y Felicidad",
    text: "Contigo siento que vuelo en lo más alto del cielo. Eres mi paz, mi felicidad y mi lugar seguro."
  },
  {
    label: "Amor Mío 💕", pos: [0, -7, 18],
    title: "Promesa Eterna",
    text: "Ni contando cada flor ni cada estrella podría medir todo lo que siento por ti. Te amo infinitamente."
  }
];

const labelsElements = [];

romanticData.forEach((item, index) => {
  if (!item.isCenterHeart) {
    const spriteMat = new THREE.SpriteMaterial({ map: yellowBouquetTexture, transparent: true, blending: THREE.AdditiveBlending });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(item.pos[0], item.pos[1] + 1.5, item.pos[2]);
    sprite.scale.set(4.2, 4.2, 1);
    scene.add(sprite);
  }

  const div = document.createElement('div');
  div.className = item.isCenterHeart ? 'floating-label heart-center-label' : 'floating-label';
  div.innerText = item.label;

  if (!item.isCenterHeart) {
    div.onclick = () => openLetter(index);
  }

  labelsContainer.appendChild(div);
  labelsElements.push({ element: div, pos: new THREE.Vector3(...item.pos) });
});

// --- PÉTALOS AMARILLOS CAYENDO ---
const petalCount = 500;
const petalGeo = new THREE.BufferGeometry();
const petalPos = new Float32Array(petalCount * 3);
const petalVel = [];

for (let i = 0; i < petalCount; i++) {
  petalPos[i * 3] = (Math.random() - 0.5) * 55;
  petalPos[i * 3 + 1] = (Math.random() - 0.5) * 45;
  petalPos[i * 3 + 2] = (Math.random() - 0.5) * 55;

  petalVel.push({
    y: Math.random() * 0.025 + 0.01,
    x: (Math.random() - 0.5) * 0.01
  });
}

petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPos, 3));
const petalMat = new THREE.PointsMaterial({ size: 0.7, map: yellowBouquetTexture, transparent: true, opacity: 0.88, depthWrite: false });
const petalMesh = new THREE.Points(petalGeo, petalMat);
scene.add(petalMesh);

// --- CARTAS ---
function openLetter(index) {
  const data = romanticData[index];
  document.getElementById('letter-title').innerText = data.title;
  document.getElementById('letter-body').innerText = data.text;
  
  document.getElementById('letter-modal').classList.remove('hidden');
  playChimeSound();
}

function closeLetter() {
  document.getElementById('letter-modal').classList.add('hidden');
}

// --- ANIMACIÓN Y PROYECCIÓN 3D EXACTA ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  starfield.rotation.y = t * 0.006;
  galaxyMesh.rotation.y = t * 0.035;

  const pulse = 1 + Math.sin(t * 2.8) * 0.07;
  heartMesh.scale.set(pulse, pulse, pulse);

  const positions = petalGeo.attributes.position.array;
  for (let i = 0; i < petalCount; i++) {
    positions[i * 3 + 1] += petalVel[i].y;
    positions[i * 3] += Math.sin(t + i) * 0.006;

    if (positions[i * 3 + 1] > 28) positions[i * 3 + 1] = -22;
  }
  petalGeo.attributes.position.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);

  // Proyección corregida de coordenadas 3D a la pantalla
  labelsElements.forEach((item) => {
    const tempV = item.pos.clone();
    tempV.project(camera);

    if (tempV.z < 1) {
      const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;
      
      item.element.style.left = `${x}px`;
      item.element.style.top = `${y}px`;
      item.element.style.display = 'block';
    } else {
      item.element.style.display = 'none';
    }
  });
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- MÚSICA AMBIENTAL ---
let audioCtx = null;
let isAudioPlaying = false;

function toggleAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  if (!isAudioPlaying) {
    isAudioPlaying = true;
    document.getElementById('music-btn').innerText = "🔊 Sonido Galáctico 🌻";
    playMelody();
  } else {
    isAudioPlaying = false;
    document.getElementById('music-btn').innerText = "🎵 Activar Música Galáctica 💛";
  }
}

function playChimeSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.6);
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + 0.8);
}

function playMelody() {
  if (!isAudioPlaying || !audioCtx) return;

  const notes = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25];
  const note = notes[Math.floor(Math.random() * notes.length)];

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(note, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.07, audioCtx.currentTime + 1.2);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.2);

  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + 3.3);

  setTimeout(playMelody, 850);
}