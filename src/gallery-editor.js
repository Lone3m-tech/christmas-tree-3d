import { DEFAULT_PHOTOS } from './config.js';
import { state } from './state.js';
import { clearSavedAlbum, compressImageFile, loadSavedAlbum, saveAlbumSlots } from './gallery-store.js';

const MAX_SLOTS = 18;

function cleanCaptionFromFile(file, fallbackIndex) {
  const raw = (file.name || '').replace(/\.[^.]+$/, '').trim();
  if (!raw || /^(img|dsc|pxl|screenshot|image|photo)[-_ ]?\d+/i.test(raw)) {
    return DEFAULT_PHOTOS[fallbackIndex % DEFAULT_PHOTOS.length]?.caption || `Memory #${fallbackIndex + 1}`;
  }
  return raw.slice(0, 22);
}

export function createGalleryEditor({
  polaroidMgr,
  audio,
  showToast,
  drawerEl,
  drawerGridEl,
  drawerStatusEl,
  drawerCloseBtn,
  btnBatchUpload,
  btnResetAlbum,
  batchInput,
  singleInput,
  dropOverlayEl,
  btnQuickReplaceCurrent,
}) {
  const slots = [];
  let activeSingleTarget = 0;
  let saveDebounceTimer = null;
  let dragDepth = 0;

  function makeDefaultSlot(idx) {
    const base = DEFAULT_PHOTOS[idx % DEFAULT_PHOTOS.length];
    return {
      defaultIndex: idx,
      src: base.src,
      art: base.art,
      caption: base.caption,
      wish: base.wish,
      isCustomPhoto: false,
      customBlob: null,
      blobUrl: null,
    };
  }

  function revokeSlotBlob(slot) {
    if (slot && slot.blobUrl) {
      URL.revokeObjectURL(slot.blobUrl);
      slot.blobUrl = null;
    }
  }

  function setStatus(text) {
    if (drawerStatusEl) drawerStatusEl.textContent = text;
  }

  function countCustomPhotos() {
    return slots.filter((s) => s.isCustomPhoto).length;
  }

  function schedulePersist() {
    clearTimeout(saveDebounceTimer);
    setStatus('正在保存至本机浏览器...');
    saveDebounceTimer = setTimeout(async () => {
      const ok = await saveAlbumSlots(slots);
      const customN = countCustomPhotos();
      if (ok) {
        setStatus(
          customN > 0
            ? `已自动保存至本机（${customN} / ${slots.length} 张自定义 · 刷新不丢失）`
            : '当前为默认示例相册（全部修改仅存本机）'
        );
      } else {
        setStatus('当前浏览器隐私模式不支持持久保存（本页内仍可正常预览）');
      }
    }, 240);
  }

  function rebuildAllCards() {
    polaroidMgr.buildPolaroidCards(slots);
  }

  function renderDrawerGrid() {
    if (!drawerGridEl) return;
    drawerGridEl.innerHTML = '';

    slots.forEach((slot, idx) => {
      const card = document.createElement('div');
      card.className = 'album-slot' + (slot.isCustomPhoto ? ' is-custom' : '');

      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'album-thumb-wrap';

      const img = document.createElement('img');
      img.className = 'album-thumb';
      img.src = slot.src;
      img.alt = slot.caption || `Card #${idx + 1}`;
      img.loading = 'lazy';

      const badge = document.createElement('span');
      badge.className = 'album-index-badge';
      badge.textContent = '#' + String(idx + 1).padStart(2, '0');

      const actions = document.createElement('div');
      actions.className = 'album-thumb-actions';

      const replaceBtn = document.createElement('button');
      replaceBtn.type = 'button';
      replaceBtn.className = 'album-mini-btn primary';
      replaceBtn.textContent = '换图';
      replaceBtn.addEventListener('click', () => {
        activeSingleTarget = idx;
        singleInput.click();
      });
      actions.appendChild(replaceBtn);

      if (slot.isCustomPhoto) {
        const revertBtn = document.createElement('button');
        revertBtn.type = 'button';
        revertBtn.className = 'album-mini-btn';
        revertBtn.textContent = '还原';
        revertBtn.title = '恢复此卡为默认圣诞示例照';
        revertBtn.addEventListener('click', () => revertSingleSlot(idx));
        actions.appendChild(revertBtn);
      }

      thumbWrap.append(img, badge, actions);

      const fields = document.createElement('div');
      fields.className = 'album-fields';

      const captionInput = document.createElement('input');
      captionInput.type = 'text';
      captionInput.className = 'album-input caption';
      captionInput.maxLength = 24;
      captionInput.placeholder = '拍立得正面标题';
      captionInput.value = slot.caption || '';
      captionInput.addEventListener('input', () => {
        slot.caption = captionInput.value;
        polaroidMgr.updateSingleCard(idx, slot);
        schedulePersist();
      });

      const wishInput = document.createElement('input');
      wishInput.type = 'text';
      wishInput.className = 'album-input wish';
      wishInput.maxLength = 44;
      wishInput.placeholder = '明信片背面寄语';
      wishInput.value = slot.wish || '';
      wishInput.addEventListener('input', () => {
        slot.wish = wishInput.value;
        polaroidMgr.updateSingleCard(idx, slot);
        schedulePersist();
      });

      fields.append(captionInput, wishInput);
      card.append(thumbWrap, fields);
      drawerGridEl.appendChild(card);
    });
  }

  async function applyFileToSlot(idx, file, keepExistingCaption = true) {
    const compressed = await compressImageFile(file);
    const slot = slots[idx];
    if (!slot) return;
    revokeSlotBlob(slot);
    const url = URL.createObjectURL(compressed);
    slot.customBlob = compressed;
    slot.blobUrl = url;
    slot.src = url;
    slot.isCustomPhoto = true;
    if (!keepExistingCaption) {
      slot.caption = cleanCaptionFromFile(file, idx);
    }
    polaroidMgr.updateSingleCard(idx, slot);
  }

  function revertSingleSlot(idx) {
    const slot = slots[idx];
    if (!slot) return;
    revokeSlotBlob(slot);
    const def = DEFAULT_PHOTOS[(slot.defaultIndex ?? idx) % DEFAULT_PHOTOS.length];
    slot.src = def.src;
    slot.art = def.art;
    slot.caption = def.caption;
    slot.wish = def.wish;
    slot.isCustomPhoto = false;
    slot.customBlob = null;
    polaroidMgr.updateSingleCard(idx, slot);
    renderDrawerGrid();
    schedulePersist();
    audio.playSfx('flip');
    showToast(`第 ${idx + 1} 张已恢复默认示例照`);
  }

  async function importFiles(fileList, { targetSlot = null } = {}) {
    const imageFiles = Array.from(fileList || [])
      .filter((f) => f && f.type && f.type.startsWith('image/'))
      .slice(0, MAX_SLOTS);
    if (!imageFiles.length) {
      showToast('未检测到图片文件（支持 JPG / PNG / WebP）');
      return;
    }

    setStatus(`正在本地压缩处理 ${imageFiles.length} 张照片...`);

    if (imageFiles.length === 1 && targetSlot !== null && slots[targetSlot]) {
      try {
        await applyFileToSlot(targetSlot, imageFiles[0], true);
        renderDrawerGrid();
        schedulePersist();
        audio.playSfx('flip');
        showToast(`已替换第 ${targetSlot + 1} 张拍立得（仅存本机）`);
      } catch {
        showToast('图片读取失败，请换一张 JPG/PNG 照片重试');
      }
      return;
    }

    // Multi-file smart replacement: replace from slot 0 sequentially, keeping untouched defaults
    const neededLen = Math.min(MAX_SLOTS, Math.max(slots.length, imageFiles.length));
    const countChanged = neededLen !== slots.length;
    while (slots.length < neededLen) {
      slots.push(makeDefaultSlot(slots.length));
    }

    let okCount = 0;
    for (let i = 0; i < imageFiles.length; i++) {
      try {
        const compressed = await compressImageFile(imageFiles[i]);
        const slot = slots[i];
        revokeSlotBlob(slot);
        const url = URL.createObjectURL(compressed);
        slot.customBlob = compressed;
        slot.blobUrl = url;
        slot.src = url;
        slot.isCustomPhoto = true;
        slot.caption = cleanCaptionFromFile(imageFiles[i], i);
        okCount++;
        if (!countChanged) {
          polaroidMgr.updateSingleCard(i, slot);
        }
      } catch {
        // Skip unreadable image file
      }
    }

    if (countChanged) {
      rebuildAllCards();
    }
    renderDrawerGrid();
    schedulePersist();
    if (okCount > 0) {
      audio.playSfx('theme');
      const restNote = okCount < slots.length ? `，其余 ${slots.length - okCount} 张保留圣诞美图` : '';
      showToast(`已替换前 ${okCount} 张拍立得${restNote}（已存本机）`, 3200);
    }
  }

  function getSmartSingleDropIndex() {
    if (state.mode === 'exploded' && slots.length) {
      const n = slots.length;
      return ((Math.round(state.carouselIndex) % n) + n) % n;
    }
    const firstDefault = slots.findIndex((s) => !s.isCustomPhoto);
    return firstDefault >= 0 ? firstDefault : 0;
  }

  function openDrawer(focusIdx = null) {
    renderDrawerGrid();
    drawerEl.classList.add('open');
    if (typeof focusIdx === 'number' && drawerGridEl && drawerGridEl.children[focusIdx]) {
      drawerGridEl.children[focusIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function closeDrawer() {
    drawerEl.classList.remove('open');
  }

  function isDrawerOpen() {
    return drawerEl.classList.contains('open');
  }

  async function resetAllToDefaults() {
    slots.forEach(revokeSlotBlob);
    slots.length = 0;
    DEFAULT_PHOTOS.forEach((_, i) => slots.push(makeDefaultSlot(i)));
    await clearSavedAlbum();
    rebuildAllCards();
    renderDrawerGrid();
    setStatus('已恢复 12 张默认圣诞示例照');
    audio.playSfx('theme');
    showToast('已恢复默认圣诞示例照，本地缓存已清空');
  }

  async function init() {
    DEFAULT_PHOTOS.forEach((_, i) => slots.push(makeDefaultSlot(i)));

    const saved = await loadSavedAlbum();
    if (saved && saved.length) {
      slots.length = 0;
      saved.slice(0, MAX_SLOTS).forEach((item, i) => {
        const def = makeDefaultSlot(typeof item.defaultIndex === 'number' ? item.defaultIndex : i);
        if (item.isCustomPhoto && item.customBlob instanceof Blob) {
          const url = URL.createObjectURL(item.customBlob);
          def.customBlob = item.customBlob;
          def.blobUrl = url;
          def.src = url;
          def.isCustomPhoto = true;
        }
        if (typeof item.caption === 'string') def.caption = item.caption;
        if (typeof item.wish === 'string') def.wish = item.wish;
        slots.push(def);
      });
      const customN = countCustomPhotos();
      if (customN > 0) {
        setStatus(`已恢复上次本机保存的 ${customN} 张自定义照片`);
      }
    } else {
      setStatus('支持批量导入、单张换图、改寄语，或直接把照片拖进页面');
    }

    rebuildAllCards();
    renderDrawerGrid();
  }

  // Drawer & File Input Wiring
  drawerCloseBtn?.addEventListener('click', closeDrawer);
  drawerEl?.addEventListener('click', (e) => {
    if (e.target === drawerEl) closeDrawer();
  });

  btnBatchUpload?.addEventListener('click', () => batchInput.click());
  batchInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length) {
      importFiles(e.target.files);
    }
    batchInput.value = '';
  });

  singleInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      importFiles([e.target.files[0]], { targetSlot: activeSingleTarget });
    }
    singleInput.value = '';
  });

  btnResetAlbum?.addEventListener('click', resetAllToDefaults);

  btnQuickReplaceCurrent?.addEventListener('click', () => {
    if (!slots.length) return;
    const n = slots.length;
    activeSingleTarget = ((Math.round(state.carouselIndex) % n) + n) % n;
    singleInput.click();
  });

  // Global Drag & Drop Photo Replacement
  function hasImageFiles(dt) {
    if (!dt) return false;
    if (dt.types && Array.from(dt.types).includes('Files')) return true;
    return false;
  }

  window.addEventListener('dragenter', (e) => {
    if (!hasImageFiles(e.dataTransfer)) return;
    e.preventDefault();
    dragDepth++;
    dropOverlayEl?.classList.add('active');
  });

  window.addEventListener('dragover', (e) => {
    if (!hasImageFiles(e.dataTransfer)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  window.addEventListener('dragleave', (e) => {
    if (!hasImageFiles(e.dataTransfer)) return;
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) {
      dropOverlayEl?.classList.remove('active');
    }
  });

  window.addEventListener('drop', (e) => {
    if (!hasImageFiles(e.dataTransfer)) return;
    e.preventDefault();
    dragDepth = 0;
    dropOverlayEl?.classList.remove('active');
    const files = e.dataTransfer.files;
    if (!files || !files.length) return;
    if (files.length === 1) {
      importFiles(files, { targetSlot: getSmartSingleDropIndex() });
    } else {
      importFiles(files);
    }
  });

  // Clipboard Paste (Cmd+V / Ctrl+V)
  window.addEventListener('paste', (e) => {
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    const pastedImages = [];
    for (const it of items) {
      if (it.kind === 'file' && it.type.startsWith('image/')) {
        const f = it.getAsFile();
        if (f) pastedImages.push(f);
      }
    }
    if (!pastedImages.length) return;
    e.preventDefault();
    if (pastedImages.length === 1) {
      importFiles(pastedImages, { targetSlot: getSmartSingleDropIndex() });
    } else {
      importFiles(pastedImages);
    }
  });

  window.addEventListener('beforeunload', () => {
    slots.forEach(revokeSlotBlob);
  });

  return {
    init,
    openDrawer,
    closeDrawer,
    isDrawerOpen,
  };
}
