/**
 * Client-side photo compression & IndexedDB persistence for user-customized
 * Polaroid slots. All photos remain strictly inside the user's own browser.
 */

const DB_NAME = 'smkt-christmas-tree-gallery';
const DB_VERSION = 1;
const STORE_NAME = 'albums';
const RECORD_KEY = 'default';

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open IndexedDB'));
  });
}

/**
 * Resize & compress an uploaded image File/Blob to max 720px JPEG so IndexedDB
 * storage stays fast and compact (~60-120 KB per photo).
 */
export function compressImageFile(file, maxEdge = 720, quality = 0.84) {
  return new Promise((resolve, reject) => {
    const tempUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(tempUrl);
      const iw = img.naturalWidth || img.width || 1;
      const ih = img.naturalHeight || img.height || 1;
      const scale = Math.min(1, maxEdge / Math.max(iw, ih));
      const tw = Math.max(1, Math.round(iw * scale));
      const th = Math.max(1, Math.round(ih * scale));

      const canvas = document.createElement('canvas');
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, tw, th);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else resolve(file);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      reject(new Error('Invalid image file'));
    };
    img.src = tempUrl;
  });
}

export async function loadSavedAlbum() {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(RECORD_KEY);
      req.onsuccess = () => {
        db.close();
        resolve(req.result && Array.isArray(req.result.items) ? req.result.items : null);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  } catch {
    return null;
  }
}

export async function saveAlbumSlots(slots) {
  try {
    const db = await openDb();
    const payload = slots.map((s) => ({
      customBlob: s.customBlob || null,
      caption: s.caption || '',
      wish: s.wish || '',
      isCustomPhoto: !!s.isCustomPhoto,
      defaultIndex: typeof s.defaultIndex === 'number' ? s.defaultIndex : null,
    }));
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ id: RECORD_KEY, updatedAt: Date.now(), items: payload });
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
    return true;
  } catch {
    return false;
  }
}

export async function clearSavedAlbum() {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(RECORD_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
    return true;
  } catch {
    return false;
  }
}
