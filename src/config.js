export const HOLIDAY_YEAR = new Date().getFullYear();

/**
 * Brand crest configuration (centralized for easy fork replacement and
 * domestic/international lab deployment overrides).
 */
export const BRAND_CONFIG = {
  name: 'SimpleMkt',
  href: 'https://simplemkt.cn/zh/lab/christmas-tree-3d/',
  ariaLabel: 'SimpleMkt Lab · 在线体验',
  wordmarkSrc: './assets/brand/simplemkt-wordmark-reverse.png',
};

/**
 * Default Polaroid gallery cards.
 * Ships with 12 AI-generated winter/holiday sample photos (no personal portraits,
 * no third-party copyright risk) plus procedural art fallbacks (`art`) so cards
 * render cleanly immediately while images load.
 */
export const DEFAULT_PHOTOS = [
  { src: './assets/photos/photo_01.jpg', art: 'cabin',     caption: 'Alpine Cabin',      wish: '雪夜木屋灯火微暖，愿你这个冬天安稳而明亮。' },
  { src: './assets/photos/photo_02.jpg', art: 'aurora',    caption: 'Nordic Aurora',     wish: '极光掠过雪原，愿所有期待都在新岁如期而至。' },
  { src: './assets/photos/photo_03.jpg', art: 'cocoa',     caption: 'Spiced Cocoa',      wish: '窗外雪落无声，手边热可可刚好，冬日慢煮时光。' },
  { src: './assets/photos/photo_04.jpg', art: 'cabin',     caption: 'Gingerbread House', wish: '烤一屋姜饼甜香，把柔软与惊喜装进冬日礼盒。' },
  { src: './assets/photos/photo_05.jpg', art: 'reindeer',  caption: 'Starlight Deer',    wish: '林间驯鹿踏雪而来，把一整年的好运送到你身边。' },
  { src: './assets/photos/photo_06.jpg', art: 'snowglobe', caption: 'Crystal Globe',     wish: '把细雪与微光藏进水晶球，摇一摇就有好心情。' },
  { src: './assets/photos/photo_07.jpg', art: 'wreath',    caption: 'Holly Wreath',      wish: '冬青常绿，铃铛轻响，岁末将至，敬颂冬绥。' },
  { src: './assets/photos/photo_08.jpg', art: 'lantern',   caption: 'Winter Lantern',    wish: '一盏暖黄提灯照亮雪径，愿所行之处皆有微光。' },
  { src: './assets/photos/photo_09.jpg', art: 'fireplace', caption: 'Hearthside Glow',   wish: '壁炉噼啪作响，毛袜挂满心愿，平安喜乐常伴。' },
  { src: './assets/photos/photo_10.jpg', art: 'ornament',  caption: 'Gilded Bauble',     wish: '鎏金彩球映出温柔星火，愿每个寻常日子都发光。' },
  { src: './assets/photos/photo_11.jpg', art: 'forest',    caption: 'Christmas Market',  wish: '雪夜集市灯火如昼，愿与温暖的人不期而遇。' },
  { src: './assets/photos/photo_12.jpg', art: 'fireworks', caption: 'Midnight Spark',    wish: '零点星火点亮夜空，Merry Christmas & Happy New Year!' },
];

export const THEMES = {
  classic: {
    name: '经典翡翠金',
    title: 'Merry Christmas',
    fog: 0x03080e,
    snowColor: 0xfffaf0,
    bokehColors: [0xfde68a, 0xf87171, 0x34d399, 0xfbbf24],
    dustColors: ['#fff4c2', '#f5ce70', '#ef4444', '#34d399'],
    keyLight: 0xffd782,
    fillLight: 0x34d399,
    rimLight: 0x93c5fd,
    ribbonA: 0xfff6cc,
    ribbonB: 0xf59e0b,
    pedestalGlow: 0xfbbf24,
    marquee: `Merry Christmas ${HOLIDAY_YEAR} — 经典翡翠金：雪地礼盒、冬青烫金拍立得与暖冬星光 ✨      滑动星尘拖尾 · 悬停卡片微倾 · 点击居中拍立得翻转明信片`,
    fireworkColors: [0xfde047, 0xef4444, 0x34d399, 0xfff7ed, 0xf59e0b],
    particlePalette: [
      { hex: 0x0f8a4b, w: 0.30 },
      { hex: 0x16a34a, w: 0.24 },
      { hex: 0x34d399, w: 0.16 },
      { hex: 0x065f46, w: 0.08 },
      { hex: 0xfef08a, w: 0.12 },
      { hex: 0xffffff, w: 0.06 },
      { hex: 0xf87171, w: 0.04 },
    ],
  },
  aurora: {
    name: '冰雪极光晶',
    title: 'Winter Wonderland',
    fog: 0x030b18,
    snowColor: 0xe0f2fe,
    bokehColors: [0x7dd3fc, 0xc4b5fd, 0x5eead4, 0xe0f2fe],
    dustColors: ['#e0f2fe', '#7dd3fc', '#c4b5fd', '#5eead4'],
    keyLight: 0xbae6fd,
    fillLight: 0x818cf8,
    rimLight: 0x67e8f9,
    ribbonA: 0xe0f2fe,
    ribbonB: 0x818cf8,
    pedestalGlow: 0x38bdf8,
    marquee: 'Winter Wonderland — 冰雪极光晶：六角冰晶、极光光带与雪地星河 ❄️      滑动星尘拖尾 · 悬停卡片微倾 · 点击居中拍立得翻转明信片',
    fireworkColors: [0x7dd3fc, 0xc4b5fd, 0x5eead4, 0xffffff, 0x38bdf8],
    particlePalette: [
      { hex: 0x0ea5e9, w: 0.25 },
      { hex: 0x38bdf8, w: 0.24 },
      { hex: 0x2dd4bf, w: 0.15 },
      { hex: 0x818cf8, w: 0.13 },
      { hex: 0xe0f2fe, w: 0.13 },
      { hex: 0xffffff, w: 0.07 },
      { hex: 0xc084fc, w: 0.03 },
    ],
  },
  candy: {
    name: '糖果游乐园',
    title: 'Sweet Christmas',
    fog: 0x100512,
    snowColor: 0xffe4e6,
    bokehColors: [0xf9a8d4, 0x6ee7b7, 0xfde68a, 0xfb7185],
    dustColors: ['#ffe4f1', '#f472b6', '#6ee7b7', '#fde047'],
    keyLight: 0xffd1e8,
    fillLight: 0x6ee7b7,
    rimLight: 0xfde68a,
    ribbonA: 0xfef08a,
    ribbonB: 0xf472b6,
    pedestalGlow: 0xf472b6,
    marquee: 'Sweet Christmas — 糖果游乐园：甜甜圈、彩虹棒棒糖与马卡龙礼盒 🍬      滑动星尘拖尾 · 悬停卡片微倾 · 点击居中拍立得翻转明信片',
    fireworkColors: [0xf472b6, 0x6ee7b7, 0xfde047, 0xfb7185, 0xc084fc],
    particlePalette: [
      { hex: 0xf472b6, w: 0.27 },
      { hex: 0xfb7185, w: 0.20 },
      { hex: 0x6ee7b7, w: 0.17 },
      { hex: 0xfde68a, w: 0.15 },
      { hex: 0xfff1f2, w: 0.11 },
      { hex: 0xc084fc, w: 0.06 },
      { hex: 0x38bdf8, w: 0.04 },
    ],
  },
  cyber: {
    name: '赛博霓虹星',
    title: 'Cyber Xmas',
    fog: 0x060212,
    snowColor: 0x67e8f9,
    bokehColors: [0x22d3ee, 0xe879f9, 0xa855f7, 0xfacc15],
    dustColors: ['#67e8f9', '#e879f9', '#facc15', '#4ade80'],
    keyLight: 0x22d3ee,
    fillLight: 0xe879f9,
    rimLight: 0xfacc15,
    ribbonA: 0x22d3ee,
    ribbonB: 0xe879f9,
    pedestalGlow: 0x22d3ee,
    marquee: 'Cyber Xmas — 赛博霓虹星：全息线框多面体、双轨光环与霓虹星尘 🌌      滑动星尘拖尾 · 悬停卡片微倾 · 点击居中拍立得翻转明信片',
    fireworkColors: [0x22d3ee, 0xe879f9, 0xfacc15, 0xa855f7, 0x4ade80],
    particlePalette: [
      { hex: 0x06b6d4, w: 0.26 },
      { hex: 0xa855f7, w: 0.24 },
      { hex: 0xec4899, w: 0.18 },
      { hex: 0x22d3ee, w: 0.14 },
      { hex: 0xfacc15, w: 0.08 },
      { hex: 0x4ade80, w: 0.06 },
      { hex: 0xffffff, w: 0.04 },
    ],
  },
};

const N = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50,
  C3: 130.81, F3: 174.61, G3: 196.00, A3: 220.00, D3: 146.83,
};

export const CHRISTMAS_TRACKS = [
  {
    name: '🔔 铃儿响叮当 Pop',
    tempoMs: 250,
    sleighBell: true,
    melody: [
      N.E5, 0, N.E5, 0, N.E5, 0, 0, 0, N.E5, 0, N.E5, 0, N.E5, 0, 0, 0,
      N.E5, 0, N.G5, 0, N.C5, 0, N.D5, 0, N.E5, 0, 0, 0, 0, 0, 0, 0,
      N.F5, 0, N.F5, 0, N.F5, 0, N.F5, 0, N.F5, 0, N.E5, 0, N.E5, 0, N.E5, 0,
      N.E5, 0, N.D5, 0, N.D5, 0, N.E5, 0, N.D5, 0, 0, 0, N.G5, 0, 0, 0,
    ],
    chords: [
      [N.C4, N.E4, N.G4], [N.C4, N.E4, N.G4], [N.F4, N.A4, N.C5], [N.G4, N.B4, N.D5],
    ],
    bass: [N.C3, N.C3, N.F3, N.G3],
  },
  {
    name: '✨ 平安夜星光曲',
    tempoMs: 360,
    sleighBell: false,
    melody: [
      N.G5, 0, N.A5, N.G5, N.E5, 0, 0, 0, N.G5, 0, N.A5, N.G5, N.E5, 0, 0, 0,
      N.D5, 0, 0, N.D5, N.B4, 0, 0, 0, N.C5, 0, 0, N.C5, N.G4, 0, 0, 0,
      N.A4, 0, N.A4, 0, N.C5, 0, N.B4, N.A4, N.G4, 0, N.A4, N.G4, N.E4, 0, 0, 0,
    ],
    chords: [
      [N.C4, N.E4, N.G4], [N.G4, N.B4, N.D5], [N.C4, N.E4, N.G4], [N.F4, N.A4, N.C5],
    ],
    bass: [N.C3, N.G3, N.C3, N.F3],
  },
  {
    name: '🎄 圣诞快乐 Swing',
    tempoMs: 265,
    sleighBell: true,
    melody: [
      N.G4, 0, N.C5, 0, N.C5, N.D5, N.C5, N.B4, N.A4, 0, N.A4, 0, N.A4, 0,
      N.D5, 0, N.D5, N.E5, N.D5, N.C5, N.B4, 0, N.G4, 0, N.G4, 0,
      N.E5, 0, N.E5, N.F5, N.E5, N.D5, N.C5, 0, N.A4, 0, N.G4, N.G4,
      N.A4, 0, N.D5, 0, N.B4, 0, N.C5, 0, 0, 0,
    ],
    chords: [
      [N.C4, N.E4, N.G4], [N.F4, N.A4, N.C5], [N.D4, N.F4, N.A4], [N.G4, N.B4, N.D5],
    ],
    bass: [N.C3, N.F3, N.D3, N.G3],
  },
];

/**
 * Optional on-demand CDN bases for MediaPipe Hands (only requested if user clicks OPEN).
 * Deployers in mainland China can prepend their own self-hosted mirror here.
 */
export const MEDIAPIPE_CDN_BASES = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/',
  'https://unpkg.com/@mediapipe/hands@0.4.1675469240/',
];
