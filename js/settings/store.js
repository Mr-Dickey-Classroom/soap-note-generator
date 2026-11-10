/**
 * Settings store. Phase 3 adds persistence (localStorage/IndexedDB), the Settings
 * screen, and import/export. For now it serves the defaults.
 * Settings never contain patient data.
 */
import { DEFAULTS } from './defaults.js';

let current = structuredClone(DEFAULTS);

/** @returns {import('./defaults.js').Settings} */
export function getSettings(){ return current; }

/** Replace settings (used by tests and, later, the Settings screen). */
export function setSettings(next){ current = { ...structuredClone(DEFAULTS), ...next }; }
