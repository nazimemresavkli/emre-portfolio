// Client-side image preparation: every upload is resized and re-encoded as WebP before it leaves the browser.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export function checkFile(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Desteklenmeyen dosya türü (PNG, JPG, WebP veya GIF olmalı).';
  if (file.size > MAX_UPLOAD_BYTES) return 'Dosya 10 MB sınırını aşıyor.';
  return '';
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Görsel okunamadı.')); };
    img.src = url;
  });
}

/** Scales the longest side down to `max` px and encodes WebP. Resolves { blob, width, height }. */
export async function toWebp(file, max = 2200, quality = 0.86) {
  const img = await loadImage(file);
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.round(img.naturalWidth * scale), height = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height);
  const blob = await new Promise(res => canvas.toBlob(res, 'image/webp', quality));
  if (!blob) throw new Error('Görsel dönüştürülemedi.');
  return { blob, width, height };
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}
