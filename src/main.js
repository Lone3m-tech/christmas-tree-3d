import { BRAND_CONFIG, DEFAULT_PHOTOS, HOLIDAY_YEAR, THEMES } from './config.js';
import { state } from './state.js';
import { createAudioEngine } from './audio.js';
import { createStardustOverlay } from './stardust.js';
import { createTreeScene, SPIRAL_TURNS, TREE_BASE_RADIUS, TREE_HEIGHT } from './scene.js';
import { createPolaroidManager } from './polaroids.js';
import { createGalleryEditor } from './gallery-editor.js';
import { createGestureController } from './gestures.js';

const THREE = window.THREE;

// DOM References
const container = document.getElementById('scene-container');
const bgWarmEl = document.getElementById('bg-warm');
const bgAuroraEl = document.getElementById('bg-aurora');
const stardustCanvas = document.getElementById('stardust-canvas');
const entryKicker = document.getElementById('entry-kicker');
const entryDesc = document.getElementById('entry-desc');
const entryScreen = document.getElementById('entry-screen');
const btnEnterMagic = document.getElementById('btn-enter-magic');
const titleText = document.getElementById('title-text');
const themeBar = document.getElementById('theme-bar');
const marqueeTrack = document.getElementById('marquee-track');
const statusDot = document.getElementById('status-dot');
const statusLabel = document.getElementById('status-label');
const statusSub = document.getElementById('status-sub');
const camBox = document.getElementById('cam-box');
const camToggleBtn = document.getElementById('cam-toggle-btn');
const camVideo = document.getElementById('cam-video');
const camOverlay = document.getElementById('cam-overlay');
const snowflakeIcon = document.getElementById('snowflake-icon');
const galleryPill = document.getElementById('gallery-pill');
const galleryCounter = document.getElementById('gallery-counter');
const btnFlipCard = document.getElementById('btn-flip-card');
const btnQuickReplace = document.getElementById('btn-quick-replace');
const btnMode = document.getElementById('btn-mode');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnFirework = document.getElementById('btn-firework');
const btnUpload = document.getElementById('btn-upload');
const btnSfx = document.getElementById('btn-sfx');
const btnMusic = document.getElementById('btn-music');
const btnReset = document.getElementById('btn-reset');
const btnGuide = document.getElementById('btn-guide');
const btnTrackNext = document.getElementById('btn-track-next');
const btnUploadAudio = document.getElementById('btn-upload-audio');
const audioInput = document.getElementById('audio-input');
const musicTrackNameEl = document.getElementById('music-track-name');
const photoInput = document.getElementById('photo-input');
const singlePhotoInput = document.getElementById('single-photo-input');
const dropOverlay = document.getElementById('drop-overlay');
const albumDrawer = document.getElementById('album-drawer');
const albumGrid = document.getElementById('album-grid');
const albumStatus = document.getElementById('album-status');
const albumClose = document.getElementById('album-close');
const btnAlbumBatch = document.getElementById('btn-album-batch');
const btnAlbumReset = document.getElementById('btn-album-reset');
const guideModal = document.getElementById('guide-modal');
const guideClose = document.getElementById('guide-close');
const toastEl = document.getElementById('toast');

if (entryKicker) {
  entryKicker.textContent = `✦ ${HOLIDAY_YEAR} WINTER WONDERLAND ✦`;
}
['entry-brand-crest', 'brand-stage-crest'].forEach((id) => {
  const el = document.getElementById(id);
  if (!el || !BRAND_CONFIG) return;
  el.href = BRAND_CONFIG.href;
  el.setAttribute('aria-label', BRAND_CONFIG.ariaLabel);
  const img = el.querySelector('img');
  if (img) {
    img.src = BRAND_CONFIG.wordmarkSrc;
    img.alt = BRAND_CONFIG.name;
  }
});
if (entryDesc) {
  entryDesc.innerHTML =
    `雪夜松枝、温暖木屋与 ${DEFAULT_PHOTOS.length} 张冬日拍立得明信片已就绪<br />` +
    '轻点下方，点亮四款 3D 魔法圣诞树（支持随时换上你的本地照片）';
}

let toastTimer = null;
function showToast(msg, duration = 2600) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
}

function updateStatus(label, sub, isMagic) {
  statusLabel.textContent = label;
  statusSub.textContent = sub;
  statusDot.classList.toggle('magic', !!isMagic);
}

// Core Modules
const audio = createAudioEngine({
  btnMusic,
  btnSfx,
  btnTrackNext,
  btnUploadAudio,
  audioInput,
  musicTrackNameEl,
  showToast,
});

const stardust = createStardustOverlay(stardustCanvas);
const treeScene = createTreeScene(container);
const polaroidMgr = createPolaroidManager({
  photoGroup: treeScene.photoGroup,
  renderer: treeScene.renderer,
  TREE_HEIGHT,
  TREE_BASE_RADIUS,
  SPIRAL_TURNS,
  galleryCounter,
});

function triggerCelebrationFireworks() {
  audio.playSfx('firework');
  treeScene.spawnFirework((Math.random() - 0.5) * 11, 3.6 + Math.random() * 4.4, (Math.random() - 0.5) * 5 - 2);
  setTimeout(() => {
    treeScene.spawnFirework((Math.random() - 0.5) * 12, 2.6 + Math.random() * 4.8, (Math.random() - 0.5) * 5 - 3);
  }, 230);
}

// Theme Switcher
function applyTheme(themeKey, silent) {
  if (!THEMES[themeKey]) return;
  state.theme = themeKey;
  const cfg = THEMES[themeKey];

  document.body.setAttribute('data-theme', themeKey);
  titleText.textContent = cfg.title;
  marqueeTrack.textContent = cfg.marquee;

  treeScene.applyThemeToScene(themeKey);

  themeBar.querySelectorAll('.theme-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === themeKey);
  });

  if (!silent) {
    audio.playSfx('theme');
    showToast('已切换主题：' + cfg.name + ' ✨');
    treeScene.spawnFirework((Math.random() - 0.5) * 6, 5.0, -1);
  }
}

themeBar.addEventListener('click', (e) => {
  const btn = e.target.closest('.theme-pill');
  if (!btn) return;
  applyTheme(btn.dataset.theme, false);
});

applyTheme('classic', true);

const galleryEditor = createGalleryEditor({
  polaroidMgr,
  audio,
  showToast,
  drawerEl: albumDrawer,
  drawerGridEl: albumGrid,
  drawerStatusEl: albumStatus,
  drawerCloseBtn: albumClose,
  btnBatchUpload: btnAlbumBatch,
  btnResetAlbum: btnAlbumReset,
  batchInput: photoInput,
  singleInput: singlePhotoInput,
  dropOverlayEl: dropOverlay,
  btnQuickReplaceCurrent: btnQuickReplace,
});
galleryEditor.init();

// Mode & Carousel Controls
function setMode(newMode, reasonLabel, reasonSub) {
  const changed = state.mode !== newMode;
  state.mode = newMode;
  if (newMode === 'exploded') {
    state.targetExplode = 1;
    btnMode.textContent = '✊ 握拳收起';
    btnMode.classList.add('active');
    galleryPill.classList.add('visible');
    polaroidMgr.updateGalleryCounter();
    if (changed) audio.playSfx('explode');
    updateStatus(reasonLabel || '状态: ✋ 五指张开', reasonSub || '点击居中卡片可翻转明信片背面', true);
  } else {
    state.targetExplode = 0;
    state.flippedCardIndex = -1;
    btnMode.textContent = '✨ 五指炸裂';
    btnMode.classList.remove('active');
    galleryPill.classList.remove('visible');
    if (changed) audio.playSfx('gather');
    updateStatus(reasonLabel || '状态: ✊ 握拳收起', reasonSub || '悬停卡片微倾 · 拖拽丝滑旋转', false);
  }
}

function stepCarousel(delta) {
  if (state.mode !== 'exploded') {
    setMode('exploded', '状态: ✋ 照片墙展开', '点击居中卡片翻转明信片背面');
  }
  if (!polaroidMgr.polaroids.length) return;
  state.flippedCardIndex = -1;
  state.carouselIndex = Math.round(state.carouselIndex + delta);
  audio.playSfx('flip');
  polaroidMgr.updateGalleryCounter();
}

function flipCurrentCenterCard() {
  if (state.mode !== 'exploded' || !polaroidMgr.polaroids.length) return;
  const n = polaroidMgr.polaroids.length;
  const centerIdx = ((Math.round(state.carouselIndex) % n) + n) % n;
  state.flippedCardIndex = state.flippedCardIndex === centerIdx ? -1 : centerIdx;
  polaroidMgr.polaroids[centerIdx].flipVel += state.flippedCardIndex === centerIdx ? 2.6 : -2.6;
  polaroidMgr.polaroids[centerIdx].focusPop = 0.14;
  stardust.spawn(window.innerWidth * 0.5, window.innerHeight * 0.5, 16);
  audio.playSfx('flip');
}

btnFlipCard.addEventListener('click', flipCurrentCenterCard);

// Webcam Hand Gestures (on-demand)
createGestureController({
  camBox,
  camToggleBtn,
  camVideo,
  camOverlay,
  snowflakeIcon,
  setMode,
  updateGalleryCounter: polaroidMgr.updateGalleryCounter,
  updateStatus,
  showToast,
});

// Pointer, Raycasting, Hover & Touch
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let parallaxX = 0;
let parallaxY = 0;
let targetParallaxX = 0;
let targetParallaxY = 0;

function updateHoverCard(clientX, clientY) {
  const rect = treeScene.renderer.domElement.getBoundingClientRect();
  pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, treeScene.camera);
  const meshes = polaroidMgr.polaroids.map((p) => p.frontMesh);
  const hits = raycaster.intersectObjects(meshes, false);
  if (hits.length > 0) {
    state.hoverCardIndex = hits[0].object.userData.polaroidIndex;
    if (hits[0].uv) {
      state.hoverNormX = (hits[0].uv.x - 0.5) * 2;
      state.hoverNormY = (hits[0].uv.y - 0.5) * 2;
    }
    container.classList.add('card-hover');
  } else {
    state.hoverCardIndex = -1;
    container.classList.remove('card-hover');
  }
}

function handleTapPolaroid(clientX, clientY) {
  const rect = treeScene.renderer.domElement.getBoundingClientRect();
  pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, treeScene.camera);
  const meshes = polaroidMgr.polaroids.map((p) => p.frontMesh);
  const hits = raycaster.intersectObjects(meshes, false);
  if (hits.length > 0) {
    const idx = hits[0].object.userData.polaroidIndex;
    if (state.mode === 'tree') {
      state.carouselIndex = idx;
      state.flippedCardIndex = -1;
      setMode('exploded', '状态: ✨ 拍立得特写', '再点居中卡片可翻转圣诞明信片');
    } else {
      const n = polaroidMgr.polaroids.length;
      const curMod = ((Math.round(state.carouselIndex) % n) + n) % n;
      if (idx === curMod) {
        flipCurrentCenterCard();
      } else {
        let diff = idx - curMod;
        if (diff > n / 2) diff -= n;
        if (diff < -n / 2) diff += n;
        state.flippedCardIndex = -1;
        state.carouselIndex = Math.round(state.carouselIndex) + diff;
        audio.playSfx('flip');
        polaroidMgr.updateGalleryCounter();
      }
    }
  }
}

container.addEventListener('pointerdown', (e) => {
  state.isDragging = true;
  state.dragMoved = false;
  state.pointerStartX = e.clientX;
  state.pointerStartY = e.clientY;
  state.lastPointerX = e.clientX;
  state.lastPointerY = e.clientY;
  stardust.spawn(e.clientX, e.clientY, 5);
});

window.addEventListener('pointermove', (e) => {
  if (Math.random() < 0.45) stardust.spawn(e.clientX, e.clientY, state.isDragging ? 2 : 1);
  targetParallaxX = (e.clientX / window.innerWidth - 0.5) * -28;
  targetParallaxY = (e.clientY / window.innerHeight - 0.5) * -18;

  if (!state.isDragging) {
    updateHoverCard(e.clientX, e.clientY);
    return;
  }
  const dx = e.clientX - state.lastPointerX;
  const dy = e.clientY - state.lastPointerY;
  if (Math.hypot(e.clientX - state.pointerStartX, e.clientY - state.pointerStartY) > 6) {
    state.dragMoved = true;
  }
  state.lastPointerX = e.clientX;
  state.lastPointerY = e.clientY;

  if (state.mode === 'exploded') {
    state.carouselIndex -= dx * 0.008;
    state.flippedCardIndex = -1;
    polaroidMgr.updateGalleryCounter();
  } else {
    state.targetRotY += dx * 0.008;
    state.targetRotX = Math.max(-0.42, Math.min(0.52, state.targetRotX + dy * 0.0045));
  }
});

window.addEventListener('pointerup', (e) => {
  if (!state.isDragging) return;
  state.isDragging = false;
  if (!state.dragMoved) {
    handleTapPolaroid(e.clientX, e.clientY);
  } else if (state.mode === 'exploded') {
    state.carouselIndex = Math.round(state.carouselIndex);
    polaroidMgr.updateGalleryCounter();
  }
});

container.addEventListener('dblclick', triggerCelebrationFireworks);

container.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    state.targetCameraZ = Math.max(12.0, Math.min(35, state.targetCameraZ + e.deltaY * 0.015));
  },
  { passive: false }
);

container.addEventListener(
  'touchstart',
  (e) => {
    if (e.touches.length === 2) {
      state.pinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  },
  { passive: true }
);

container.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches.length === 2 && state.pinchDist > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      state.targetCameraZ = Math.max(12.0, Math.min(35, state.targetCameraZ + (state.pinchDist - dist) * 0.04));
      state.pinchDist = dist;
    }
  },
  { passive: true }
);

// Dock & Modal Button Handlers
btnMode.addEventListener('click', () => setMode(state.mode === 'tree' ? 'exploded' : 'tree'));
btnPrev.addEventListener('click', () => stepCarousel(-1));
btnNext.addEventListener('click', () => stepCarousel(1));
btnFirework.addEventListener('click', triggerCelebrationFireworks);

btnUpload.addEventListener('click', () => {
  const focusIdx =
    state.mode === 'exploded' && polaroidMgr.polaroids.length
      ? ((Math.round(state.carouselIndex) % polaroidMgr.polaroids.length) + polaroidMgr.polaroids.length) %
        polaroidMgr.polaroids.length
      : null;
  galleryEditor.openDrawer(focusIdx);
});

btnReset.addEventListener('click', () => {
  state.targetRotX = 0.05;
  state.targetCameraZ = 24.5;
  state.pokeVelocity = 0;
  setMode('tree', '状态: 圣诞魔法已就绪', '视角已复位 · 悬停卡片微倾');
});

if (btnEnterMagic && entryScreen) {
  btnEnterMagic.addEventListener('click', () => {
    entryScreen.classList.add('hidden');
    audio.ensureAudio();
    audio.startMusicPlayback();
    audio.playSfx('explode');
    triggerCelebrationFireworks();
    setTimeout(() => {
      entryScreen.style.display = 'none';
    }, 900);
  });
}

btnGuide.addEventListener('click', () => guideModal.classList.add('open'));
guideClose.addEventListener('click', () => guideModal.classList.remove('open'));
guideModal.addEventListener('click', (e) => {
  if (e.target === guideModal) guideModal.classList.remove('open');
});

window.addEventListener('keydown', (e) => {
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';
  if (e.key === 'Escape') {
    guideModal.classList.remove('open');
    galleryEditor.closeDrawer();
    return;
  }
  if (isTyping || galleryEditor.isDrawerOpen()) return;
  if (e.key === ' ') {
    e.preventDefault();
    setMode(state.mode === 'tree' ? 'exploded' : 'tree');
  } else if (e.key === 'ArrowLeft') stepCarousel(-1);
  else if (e.key === 'ArrowRight') stepCarousel(1);
  else if (e.key === 'Enter' && state.mode === 'exploded') flipCurrentCenterCard();
});

// Main Spring-Physics Animation Loop (starts immediately without waiting on window.load)
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();

  const force = (state.targetExplode - state.explodeFactor) * 18.0;
  state.explodeVel = (state.explodeVel + force * dt) * Math.pow(0.08, dt);
  state.explodeFactor = Math.max(0, Math.min(1.06, state.explodeFactor + state.explodeVel * dt));
  const ef = Math.min(1, Math.max(0, state.explodeFactor));

  parallaxX += (targetParallaxX - parallaxX) * 0.06;
  parallaxY += (targetParallaxY - parallaxY) * 0.06;
  const pTransform = 'translate3d(' + parallaxX.toFixed(1) + 'px,' + parallaxY.toFixed(1) + 'px,0)';
  bgWarmEl.style.transform = pTransform;
  bgAuroraEl.style.transform = pTransform;

  treeScene.updateScene(dt, elapsed, ef);
  polaroidMgr.updatePolaroids(dt, elapsed, ef);
  stardust.render();
  treeScene.render();
}

window.addEventListener('resize', () => {
  treeScene.resize();
  stardust.resize();
});

animate();
