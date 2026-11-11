/**
 * Settings store: load, validate, save, export, import, and reset.
 *
 * Settings live in localStorage under one key. The logo (a PNG data URL of up
 * to 300 KB) goes to IndexedDB so it never crowds the ~5 MB localStorage quota;
 * if IndexedDB is unavailable it falls back to localStorage.
 *
 * Only keys from DEFAULTS are ever stored, each checked for type, so an import
 * can't smuggle in anything else. Settings never contain patient data.
 */
import { DEFAULTS } from './defaults.js';
import { ROMDEF } from '../engine/measures.js';

export const STORAGE_KEY = 'soap-note-generator.settings';
const LOGO_KEY = 'soap-note-generator.logo';
const DB_NAME = 'soap-note-generator';
const DB_STORE = 'settings';
export const EXPORT_KIND = 'soap-note-generator/settings';
export const EXPORT_VERSION = 1;
/** Largest logo accepted, in bytes of PNG data. */
export const LOGO_MAX_BYTES = 300 * 1024;

const clone = o => structuredClone(o);
let current = clone(DEFAULTS);
const listeners = new Set();

/** @returns {import('./defaults.js').Settings} the live settings (treat as read-only) */
export function getSettings(){ return current; }

/** Subscribe to changes. fn(next, prev). Returns an unsubscribe function. */
export function onSettingsChange(fn){ listeners.add(fn); return () => listeners.delete(fn); }

/** Approximate decoded size of a base64 data URL, in bytes. */
export function dataUrlBytes(url){
  const b64 = String(url).split(',')[1] || '';
  return Math.floor(b64.length * 3 / 4) - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0);
}

const isColor = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
const cleanList = v => Array.isArray(v) ? [...new Set(v.filter(x => typeof x === 'string').map(x => x.trim()).filter(Boolean))] : null;
const finite = v => { const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v; return typeof n === 'number' && Number.isFinite(n) ? n : null; };

/** Validators per key: return the cleaned value, or undefined to use the default. */
const ENUMS = { theme:['system','light','dark'], emrFormat:['markdown','plain'], emrLength:['condensed','full'], paperSize:['Letter','A4'] };
function cleanValue(key, v, def){
  if (key in ENUMS) return ENUMS[key].includes(v) ? v : undefined;
  if (key === 'brandColor' || key === 'accentColor') return isColor(v) ? v.toUpperCase() : undefined;
  if (key === 'logo') return v === '' || (typeof v === 'string' && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(v) && dataUrlBytes(v) <= LOGO_MAX_BYTES) ? v : undefined;
  if (key === 'thrWnl' || key === 'thrBil'){ const n = finite(v); return n != null && n >= 0 && n <= 100 ? n : undefined; }
  if (key === 'charLimit'){ const n = finite(v); return n != null && n >= 100 && n <= 1000000 ? Math.round(n) : undefined; }
  if (key === 'romNorms') return cleanNorms(v);
  if (key === 'prompts') return cleanPrompts(v, def);
  if (Array.isArray(def)) return cleanList(v) ?? undefined;
  if (typeof def === 'boolean') return typeof v === 'boolean' ? v : undefined;
  if (typeof def === 'string') return typeof v === 'string' ? v.trim() : undefined;
  return undefined;
}

/** Keep only known regions and motions with a number from 0 to 360. */
function cleanNorms(v){
  const out = {};
  if (!v || typeof v !== 'object') return out;
  for (const [k, rows] of Object.entries(ROMDEF)){
    const src = v[k]; if (!src || typeof src !== 'object') continue;
    for (const [m] of rows){
      const n = finite(src[m]);
      if (n != null && n >= 0 && n <= 360){ (out[k] ||= {})[m] = n; }
    }
  }
  return out;
}

function cleanPrompts(v, def){
  const out = clone(def);
  if (!v || typeof v !== 'object') return out;
  for (const k of Object.keys(def)){
    const p = v[k]; if (!p || typeof p !== 'object') continue;
    if (typeof p.on === 'boolean') out[k].on = p.on;
    if (typeof p.text === 'string' && p.text.trim()) out[k].text = p.text.trim();
  }
  return out;
}

/**
 * Build a complete, valid settings object from any input: defaults for missing
 * or invalid values, unknown keys dropped.
 * @param {object} input
 * @returns {import('./defaults.js').Settings}
 */
export function normalizeSettings(input){
  const src = input && typeof input === 'object' ? input : {};
  const out = clone(DEFAULTS);
  for (const key of Object.keys(DEFAULTS)){
    if (!(key in src)) continue;
    const v = cleanValue(key, src[key], DEFAULTS[key]);
    if (v !== undefined) out[key] = v;
  }
  if (!out.referralDestinations.includes(out.ptDestination)) out.ptDestination = out.referralDestinations.includes(DEFAULTS.ptDestination) ? DEFAULTS.ptDestination : '';
  return out;
}

/* ---------- IndexedDB (logo) ---------- */
function openDb(){
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) return reject(new Error('IndexedDB unavailable'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idb(mode, fn){
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, mode); const req = fn(tx.objectStore(DB_STORE));
      tx.oncomplete = () => resolve(req.result); tx.onerror = tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
async function readLogo(){
  try { const v = await idb('readonly', s => s.get('logo')); if (typeof v === 'string') return v; } catch { /* fall back */ }
  try { return localStorage.getItem(LOGO_KEY) || ''; } catch { return ''; }
}
async function writeLogo(logo){
  try {
    await idb('readwrite', s => logo ? s.put(logo, 'logo') : s.delete('logo'));
    try { localStorage.removeItem(LOGO_KEY); } catch { /* ignore */ }
    return;
  } catch { /* fall back */ }
  try { if (logo) localStorage.setItem(LOGO_KEY, logo); else localStorage.removeItem(LOGO_KEY); } catch { /* quota: logo kept for this session only */ }
}

/* ---------- load / save ---------- */
let lastLogo = '';

/** Load saved settings (call once at boot, before rendering). */
export async function loadSettings(){
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch { saved = {}; }
  saved.logo = await readLogo();
  current = normalizeSettings(saved);
  lastLogo = current.logo;
  return current;
}

let pending = Promise.resolve();
/**
 * Validate, store, and broadcast new settings.
 * @param {object} next full or partial settings (merged over the current ones)
 * @returns {Promise<import('./defaults.js').Settings>}
 */
export function saveSettings(next){
  const prev = current;
  current = normalizeSettings({ ...prev, ...next });
  const { logo, ...rest } = current;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rest)); } catch (e) { console.warn('Settings could not be saved:', e); }
  if (logo !== lastLogo){ lastLogo = logo; pending = pending.then(() => writeLogo(logo)); }
  listeners.forEach(fn => fn(current, prev));
  return pending.then(() => current);
}

/** Replace settings without storing them (tests). */
export function setSettings(next){ const prev = current; current = normalizeSettings(next); listeners.forEach(fn => fn(current, prev)); }

/** Reset everything to the defaults and clear stored settings and logo. */
export function resetSettings(){
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  return saveSettings(clone(DEFAULTS));
}

/** Settings as an export object (includes the logo). */
export function exportSettings(){
  return { kind: EXPORT_KIND, version: EXPORT_VERSION, exported: new Date().toISOString(), settings: clone(current) };
}

/**
 * Import settings from parsed JSON (an export file, or a bare settings object).
 * Anything not a known setting is ignored; missing settings take defaults.
 * @throws {Error} when the input isn't a settings object
 */
export function importSettings(data){
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('not settings');
  const src = data.kind === EXPORT_KIND ? data.settings : data;
  if (!src || typeof src !== 'object' || !Object.keys(src).some(k => k in DEFAULTS)) throw new Error('not settings');
  return saveSettings(normalizeSettings(src));
}
