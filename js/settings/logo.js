/**
 * Logo handling: turn an uploaded PNG/JPG/SVG into a PNG data URL no larger than
 * 512 px on its longest side and 300 KB, and show it as the page favicon.
 */
import { dataUrlBytes, LOGO_MAX_BYTES } from './store.js';

export const LOGO_MAX_SIDE = 512;
export const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

function readAsDataURL(file){
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result); r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function loadImage(src){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img); img.onerror = () => reject(new Error('unreadable image'));
    img.src = src;
  });
}

/**
 * Convert an image file to a PNG data URL (≤ 512 px longest side, ≤ 300 KB).
 * Shrinks further if the PNG is still too large.
 * @param {File} file
 * @returns {Promise<string>}
 * @throws {Error} with a user-facing message
 */
export async function processLogo(file){
  if (!file) throw new Error('No file chosen.');
  const type = file.type || (/\.svg$/i.test(file.name) ? 'image/svg+xml' : '');
  if (!LOGO_TYPES.includes(type)) throw new Error('Choose a PNG, JPG, or SVG image.');
  if (file.size > 20 * 1024 * 1024) throw new Error('That image is too large. Choose one under 20 MB.');
  let img;
  try { img = await loadImage(await readAsDataURL(file)); } catch { throw new Error("That image couldn't be read. Try a PNG or JPG."); }
  let w = img.naturalWidth || LOGO_MAX_SIDE, h = img.naturalHeight || LOGO_MAX_SIDE;
  let scale = Math.min(1, LOGO_MAX_SIDE / Math.max(w, h));
  for (let i = 0; i < 12; i++){
    const cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement('canvas'); canvas.width = cw; canvas.height = ch;
    canvas.getContext('2d').drawImage(img, 0, 0, cw, ch);
    const url = canvas.toDataURL('image/png');
    if (dataUrlBytes(url) <= LOGO_MAX_BYTES) return url;
    scale *= 0.8;
    if (Math.max(cw, ch) < 48) break;
  }
  throw new Error("That image couldn't be made small enough. Try a simpler logo.");
}

/** Use the logo as the page favicon (or clear it). */
export function applyFavicon(logo){
  let link = document.querySelector('link[rel="icon"]');
  if (!link){ link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
  if (logo){ link.type = 'image/png'; link.href = logo; }
  else { link.removeAttribute('type'); link.href = 'data:,'; }
}
