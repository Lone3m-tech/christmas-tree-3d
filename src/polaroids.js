import { HOLIDAY_YEAR } from './config.js';
import { state } from './state.js';
import { drawProceduralHolidayArt } from './polaroid-art.js';

const THREE = window.THREE;

export function createPolaroidManager({ photoGroup, renderer, TREE_HEIGHT, TREE_BASE_RADIUS, SPIRAL_TURNS, galleryCounter }) {
  const polaroids = [];
  let uploadedBlobUrls = [];

  // Shared immutable geometries & base materials
  const cardGeo = new THREE.BoxGeometry(1.78, 2.16, 0.058);
  const sheenGeo = new THREE.PlaneGeometry(1.74, 2.12);
  const auraGeo = new THREE.PlaneGeometry(1.94, 2.34);
  const clipGeo = new THREE.BoxGeometry(0.22, 0.16, 0.06);

  const cardEdgeMat = new THREE.MeshStandardMaterial({
    color: 0xf4d27a,
    metalness: 0.92,
    roughness: 0.16,
    emissive: 0xb45309,
    emissiveIntensity: 0.28,
  });

  const clipMat = new THREE.MeshStandardMaterial({
    color: 0xf5d073,
    metalness: 0.9,
    roughness: 0.18,
    emissive: 0xb45309,
    emissiveIntensity: 0.2,
  });

  function createSheenTexture() {
    const sc = document.createElement('canvas');
    sc.width = 256;
    sc.height = 256;
    const sctx = sc.getContext('2d');
    const g = sctx.createLinearGradient(0, 0, 256, 256);
    g.addColorStop(0.0, 'rgba(255,255,255,0)');
    g.addColorStop(0.38, 'rgba(255,250,235,0)');
    g.addColorStop(0.49, 'rgba(255,248,225,0.42)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.16)');
    g.addColorStop(0.65, 'rgba(255,255,255,0)');
    g.addColorStop(1.0, 'rgba(255,255,255,0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(sc);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function createPaperGrainCanvas() {
    const g = document.createElement('canvas');
    g.width = 128;
    g.height = 128;
    const gctx = g.getContext('2d');
    const imgData = gctx.createImageData(128, 128);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = 232 + Math.floor((Math.random() - 0.5) * 26);
      imgData.data[i] = v;
      imgData.data[i + 1] = v - 4;
      imgData.data[i + 2] = v - 11;
      imgData.data[i + 3] = 28;
    }
    gctx.putImageData(imgData, 0, 0);
    return g;
  }

  const sheenTex = createSheenTexture();
  const paperGrainTile = createPaperGrainCanvas();

  function createLuxuryPolaroidFront({ img, art, caption, idx }) {
    const c = document.createElement('canvas');
    c.width = 660;
    c.height = 804;
    const ctx = c.getContext('2d');

    // 1. Warm ivory archival cotton paper base
    const paperGrad = ctx.createLinearGradient(0, 0, c.width, c.height);
    paperGrad.addColorStop(0, '#f1ece0');
    paperGrad.addColorStop(0.5, '#eae3d3');
    paperGrad.addColorStop(1, '#e4dcc9');
    ctx.fillStyle = paperGrad;
    ctx.fillRect(0, 0, c.width, c.height);

    // 2. Cotton linen grain overlay
    const pat = ctx.createPattern(paperGrainTile, 'repeat');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, c.width, c.height);
    }

    // 3. Delicate gold-foil outer hairlines
    ctx.strokeStyle = 'rgba(196, 152, 68, 0.58)';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, c.width - 20, c.height - 20);
    ctx.strokeStyle = 'rgba(120, 96, 60, 0.16)';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, c.width - 36, c.height - 36);

    // 4. Photo well with subtle recessed bevel shadow
    const pad = 42;
    const size = 576;
    ctx.save();
    ctx.fillStyle = 'rgba(40, 32, 22, 0.22)';
    ctx.fillRect(pad - 3, pad - 3, size + 6, size + 6);
    ctx.beginPath();
    ctx.rect(pad, pad, size, size);
    ctx.clip();

    if (img) {
      const iw = img.naturalWidth || img.width || 1;
      const ih = img.naturalHeight || img.height || 1;
      const scale = Math.max(size / iw, size / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const offsetY = dh > size ? (size - dh) * 0.28 : (size - dh) / 2;
      ctx.filter = 'brightness(0.97) contrast(1.06) saturate(1.1)';
      ctx.drawImage(img, pad + (size - dw) / 2, pad + offsetY, dw, dh);
      ctx.filter = 'none';
    } else if (art) {
      drawProceduralHolidayArt(ctx, art, pad, pad, size, idx);
    } else {
      const grad = ctx.createLinearGradient(pad, pad, pad + size, pad + size);
      grad.addColorStop(0, '#1e3a5f');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(pad, pad, size, size);
    }

    const innerShadow = ctx.createLinearGradient(pad, pad, pad, pad + 26);
    innerShadow.addColorStop(0, 'rgba(0,0,0,0.22)');
    innerShadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = innerShadow;
    ctx.fillRect(pad, pad, size, 26);
    ctx.restore();

    ctx.strokeStyle = 'rgba(182, 142, 72, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(pad, pad, size, size);

    // 5. Gold-foil bottom corner accents
    ctx.fillStyle = '#b98932';
    ctx.font = '600 22px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('✦', 44, pad + size + 104);
    ctx.textAlign = 'right';
    ctx.fillText('NO.' + String(idx + 1).padStart(2, '0'), c.width - 44, pad + size + 104);

    // 6. Editorial italic caption
    ctx.fillStyle = '#3d342a';
    ctx.font = 'italic 500 35px Baskerville, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(caption || 'Merry Christmas', c.width / 2, pad + size + 78);

    ctx.strokeStyle = 'rgba(185, 137, 50, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.width / 2 - 48, pad + size + 114);
    ctx.lineTo(c.width / 2 + 48, pad + size + 114);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 4);
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }

  function createChristmasPostcardBack(caption, wish, idx) {
    const c = document.createElement('canvas');
    c.width = 660;
    c.height = 804;
    const ctx = c.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, c.width, c.height);
    bg.addColorStop(0, '#efe8d8');
    bg.addColorStop(1, '#e1d6be');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, c.width, c.height);

    const pat = ctx.createPattern(paperGrainTile, 'repeat');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, c.width, c.height);
    }

    ctx.strokeStyle = '#b98932';
    ctx.lineWidth = 5;
    ctx.strokeRect(22, 22, c.width - 44, c.height - 44);
    ctx.strokeStyle = 'rgba(185, 137, 50, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(34, 34, c.width - 68, c.height - 68);

    // Festive postage stamp
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(c.width - 160, 56, 102, 118);
    ctx.strokeStyle = '#f5d073';
    ctx.lineWidth = 3;
    ctx.strokeRect(c.width - 152, 64, 86, 102);
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('❄', c.width - 109, 122);
    ctx.font = '600 16px -apple-system, sans-serif';
    ctx.fillText('DEC 25', c.width - 109, 152);

    // Postmark seal
    ctx.strokeStyle = 'rgba(130, 96, 56, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(c.width - 210, 115, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(120, 88, 48, 0.65)';
    ctx.font = '600 14px -apple-system, sans-serif';
    ctx.fillText('NORTH POLE', c.width - 210, 110);
    ctx.fillText(String(HOLIDAY_YEAR), c.width - 210, 130);

    // Header
    ctx.fillStyle = '#9b2226';
    ctx.font = 'italic 600 44px Baskerville, Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('Merry Christmas', 62, 118);

    ctx.fillStyle = '#7c6a52';
    ctx.font = '500 20px Georgia, serif';
    ctx.fillText('MEMORY CARD  #' + String(idx + 1).padStart(2, '0') + '  ·  ' + (caption || ''), 64, 166);

    ctx.strokeStyle = 'rgba(185, 137, 50, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(62, 212);
    ctx.lineTo(c.width - 62, 212);
    ctx.stroke();

    // Blessing message
    const text = wish || '愿圣诞的星光与温暖，陪伴你度过每一个闪耀的日子。';
    ctx.fillStyle = '#3a3026';
    ctx.font = '500 32px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    const maxPerLine = 13;
    const lines = [];
    for (let i = 0; i < text.length; i += maxPerLine) {
      lines.push(text.slice(i, i + maxPerLine));
    }
    const startY = 390 - (lines.length - 1) * 28;
    lines.forEach((line, li) => {
      ctx.fillText(line, c.width / 2, startY + li * 58);
    });

    ctx.strokeStyle = 'rgba(140, 116, 86, 0.22)';
    ctx.lineWidth = 1.5;
    for (let l = 0; l < 3; l++) {
      const ly = 540 + l * 48;
      ctx.beginPath();
      ctx.moveTo(90, ly);
      ctx.lineTo(c.width - 90, ly);
      ctx.stroke();
    }

    // Crimson Wax Seal Emblem
    const wx = c.width / 2;
    const wy = c.height - 148;
    const waxGrad = ctx.createRadialGradient(wx - 10, wy - 10, 4, wx, wy, 42);
    waxGrad.addColorStop(0, '#dc2626');
    waxGrad.addColorStop(0.68, '#991b1b');
    waxGrad.addColorStop(1, '#640f0f');
    ctx.fillStyle = waxGrad;
    ctx.beginPath();
    ctx.arc(wx, wy, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(253, 224, 130, 0.72)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(wx, wy, 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❄', wx, wy + 1);

    ctx.fillStyle = '#9a6f22';
    ctx.font = 'italic 500 24px Georgia, serif';
    ctx.fillText('With Warmest Holiday Wishes', c.width / 2, c.height - 70);

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 4);
    tex.needsUpdate = true;
    return tex;
  }

  function clearUploadedBlobUrls() {
    uploadedBlobUrls.forEach((u) => URL.revokeObjectURL(u));
    uploadedBlobUrls = [];
  }

  function disposeCurrentCards() {
    while (polaroids.length) {
      const p = polaroids.pop();
      photoGroup.remove(p.holder);
      if (p.frontMat.map) p.frontMat.map.dispose();
      if (p.backMat.map) p.backMat.map.dispose();
      if (p.sheenMat.map) p.sheenMat.map.dispose();
      p.frontMat.dispose();
      p.backMat.dispose();
      p.sheenMat.dispose();
      p.auraMat.dispose();
    }
  }

  function updateGalleryCounter() {
    const n = polaroids.length;
    if (!n) return;
    const idx = ((Math.round(state.carouselIndex) % n) + n) % n;
    galleryCounter.textContent = idx + 1 + ' / ' + n + ' · ' + polaroids[idx].caption;
  }

  function buildPolaroidCards(photoList, blobUrlsToTrack = []) {
    disposeCurrentCards();
    clearUploadedBlobUrls();
    uploadedBlobUrls = blobUrlsToTrack;

    const count = photoList.length;
    for (let i = 0; i < count; i++) {
      const item = photoList[i];
      const holder = new THREE.Group();

      const frontMat = new THREE.MeshBasicMaterial({
        map: createLuxuryPolaroidFront({ img: null, art: item.art, caption: item.caption, idx: i }),
        toneMapped: false,
      });
      const backMat = new THREE.MeshBasicMaterial({
        map: createChristmasPostcardBack(item.caption, item.wish, i),
        toneMapped: false,
      });

      const cardMaterials = [cardEdgeMat, cardEdgeMat, cardEdgeMat, cardEdgeMat, frontMat, backMat];
      const frontMesh = new THREE.Mesh(cardGeo, cardMaterials);
      frontMesh.userData.polaroidIndex = i;

      const clonedSheen = sheenTex.clone();
      clonedSheen.needsUpdate = true;
      const sheenMat = new THREE.MeshBasicMaterial({
        map: clonedSheen,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sheenMesh = new THREE.Mesh(sheenGeo, sheenMat);
      sheenMesh.position.z = 0.032;

      const auraMat = new THREE.MeshBasicMaterial({
        color: 0xfde68a,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const auraMesh = new THREE.Mesh(auraGeo, auraMat);
      auraMesh.position.z = -0.04;

      const clipMesh = new THREE.Mesh(clipGeo, clipMat);
      clipMesh.position.set(0, 1.1, 0.0);

      holder.add(frontMesh, sheenMesh, auraMesh, clipMesh);

      if (item.src) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!polaroids.some((entry) => entry.frontMat === frontMat)) return;
          const oldMap = frontMat.map;
          frontMat.map = createLuxuryPolaroidFront({ img, art: item.art, caption: item.caption, idx: i });
          frontMat.needsUpdate = true;
          if (oldMap) oldMap.dispose();
        };
        img.src = item.src;
      }

      const t = 0.13 + (i / Math.max(count - 1, 1)) * 0.77;
      const treeY = (0.48 - t * 0.96) * TREE_HEIGHT - 0.7;
      const treeR = t * TREE_BASE_RADIUS + 0.84;
      const treeAngle = t * Math.PI * 2 * SPIRAL_TURNS + 0.45;
      const tiltZ = (i % 2 === 0 ? 1 : -1) * (0.06 + (i % 3) * 0.025);

      photoGroup.add(holder);
      polaroids.push({
        index: i,
        caption: item.caption || 'Memory #' + (i + 1),
        holder,
        frontMesh,
        frontMat,
        backMat,
        auraMat,
        clipMesh,
        treeY,
        treeR,
        treeAngle,
        tiltZ,
        swayPhase: Math.random() * Math.PI * 2,
        sheenMat,
        hoverLerp: 0,
        tiltX: 0,
        tiltY: 0,
        flipAngle: 0,
        flipVel: 0,
        focusPop: 0,
        waveDelay: (i / Math.max(count, 1)) * 0.24,
      });
    }

    state.carouselIndex = 0;
    state.currentCarousel = 0;
    state.flippedCardIndex = -1;
    updateGalleryCounter();
  }

  function updateSingleCard(idx, item) {
    const p = polaroids[idx];
    if (!p) return;

    p.caption = item.caption || 'Memory #' + (idx + 1);

    // Update postcard back immediately
    const oldBack = p.backMat.map;
    p.backMat.map = createChristmasPostcardBack(item.caption, item.wish, idx);
    p.backMat.needsUpdate = true;
    if (oldBack) oldBack.dispose();

    // Update front (load image if src provided, otherwise procedural fallback)
    if (item.src) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (polaroids[idx] !== p) return;
        const oldFront = p.frontMat.map;
        p.frontMat.map = createLuxuryPolaroidFront({ img, art: item.art, caption: item.caption, idx });
        p.frontMat.needsUpdate = true;
        if (oldFront) oldFront.dispose();
      };
      img.src = item.src;
    } else {
      const oldFront = p.frontMat.map;
      p.frontMat.map = createLuxuryPolaroidFront({ img: null, art: item.art, caption: item.caption, idx });
      p.frontMat.needsUpdate = true;
      if (oldFront) oldFront.dispose();
    }

    updateGalleryCounter();
  }

  function updatePolaroids(dt, elapsed, ef) {
    const cForce = (state.carouselIndex - state.currentCarousel) * 28.0;
    state.carouselVel = (state.carouselVel + cForce * dt) * Math.pow(0.04, dt);
    state.currentCarousel += state.carouselVel * dt;

    const n = polaroids.length;
    for (let i = 0; i < n; i++) {
      const p = polaroids[i];
      const isHovered = state.hoverCardIndex === i;
      p.hoverLerp += ((isHovered ? 1 : 0) - p.hoverLerp) * 0.14;

      const targetFlip = state.mode === 'exploded' && state.flippedCardIndex === i ? Math.PI : 0;
      const flipForce = (targetFlip - p.flipAngle) * 34.0;
      p.flipVel = (p.flipVel + flipForce * dt) * Math.exp(-6.2 * dt);
      p.flipAngle += p.flipVel * dt;
      p.focusPop *= Math.exp(-7.5 * dt);

      const rawCardEf = Math.max(0, Math.min(1, (ef - p.waveDelay * 0.65) / (1 - p.waveDelay * 0.65)));
      const cef = rawCardEf * rawCardEf * (3 - 2 * rawCardEf);

      const ang = p.treeAngle + state.treeRotY;
      const treeX = Math.cos(ang) * (p.treeR + p.hoverLerp * 0.48);
      const treeZ = Math.sin(ang) * (p.treeR + p.hoverLerp * 0.48);
      const treeY = p.treeY + Math.sin(elapsed * 1.8 + p.swayPhase) * 0.07;

      let rel = i - state.currentCarousel;
      while (rel > n / 2) rel -= n;
      while (rel < -n / 2) rel += n;

      const galX = rel * 2.95;
      const absRel = Math.abs(rel);
      const centerFocus = Math.max(0, 1 - absRel * 0.46);
      const flipArcLift = Math.sin(Math.min(Math.PI, Math.max(0, p.flipAngle))) * 1.45;
      const galZ =
        9.95 - Math.min(absRel, 4.5) * 1.72 - absRel * absRel * 0.15 + p.hoverLerp * 0.6 + flipArcLift;
      const galY = -0.12 + Math.sin(elapsed * 1.5 + p.swayPhase) * 0.08 + p.hoverLerp * 0.2 + flipArcLift * 0.12;

      const arcBoost = Math.sin(cef * Math.PI) * 1.1;
      p.holder.position.set(
        treeX + (galX - treeX) * cef,
        treeY + (galY - treeY) * cef + arcBoost * 0.35,
        treeZ + (galZ - treeZ) * cef + arcBoost * 0.6
      );

      const treeScale = 0.54 + p.hoverLerp * 0.14;
      const galScale = 1.02 + centerFocus * 0.86 + p.hoverLerp * 0.09 + p.focusPop;
      p.holder.scale.setScalar(treeScale + (galScale - treeScale) * cef);

      const treeRotYCard = -ang + Math.PI / 2;
      const galRotYCard = -rel * 0.21;
      let diffY = ((galRotYCard - treeRotYCard + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (diffY < -Math.PI) diffY += Math.PI * 2;

      const targetTiltY = isHovered ? state.hoverNormX * 0.26 : 0;
      const targetTiltX = isHovered ? -state.hoverNormY * 0.18 : 0;
      p.tiltY += (targetTiltY - p.tiltY) * 0.12;
      p.tiltX += (targetTiltX - p.tiltX) * 0.12;

      const flipPitch = Math.sin(p.flipAngle) * 0.12 + p.flipVel * 0.025;

      p.holder.rotation.y = treeRotYCard + diffY * cef + p.flipAngle + p.tiltY;
      p.holder.rotation.x = p.tiltX + flipPitch;
      p.holder.rotation.z = p.tiltZ * (1 - cef) - p.flipVel * 0.018;

      const autoShimmer = cef > 0.8 && centerFocus > 0.7 ? (elapsed * 0.35 + i * 0.2) % 2.4 : 0;
      const sheenOffset = isHovered ? state.hoverNormX * 0.45 : autoShimmer - 0.6;
      p.sheenMat.map.offset.set(sheenOffset, sheenOffset * 0.5);
      const sheenAlpha = isHovered
        ? 0.48 * p.hoverLerp
        : cef > 0.8 && centerFocus > 0.7 && autoShimmer < 1.1
          ? Math.sin((autoShimmer / 1.1) * Math.PI) * 0.34
          : 0;
      p.sheenMat.opacity = Math.max(0, sheenAlpha * (Math.cos(p.flipAngle) > 0 ? 1 : 0));

      const auraTarget = Math.max(p.hoverLerp * 0.38, cef * centerFocus * 0.22 + flipArcLift * 0.14);
      p.auraMat.opacity += (auraTarget - p.auraMat.opacity) * 0.14;
      p.clipMesh.visible = cef < 0.65;

      const targetOpacity = cef > 0.4 ? Math.max(0.12, 1 - Math.max(0, absRel - 2.6) * 0.36) : 1;
      p.frontMat.transparent = targetOpacity < 0.99;
      p.frontMat.opacity = targetOpacity;
      p.backMat.transparent = targetOpacity < 0.99;
      p.backMat.opacity = targetOpacity;
    }
  }

  window.addEventListener('beforeunload', clearUploadedBlobUrls);

  return {
    polaroids,
    buildPolaroidCards,
    updateSingleCard,
    updateGalleryCounter,
    updatePolaroids,
  };
}
