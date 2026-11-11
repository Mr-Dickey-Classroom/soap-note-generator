/**
 * Boot: load settings, apply branding and theme, build the Note and Settings
 * screens, and switch between them. (About arrives in Phase 7.)
 */
import { loadSettings, getSettings, onSettingsChange } from './settings/store.js';
import { applyTheme } from './settings/theme.js';
import { applyFavicon } from './settings/logo.js';
import { initSettingsScreen } from './settings/screen.js';
import { initNote, applySettingsToNote } from './ui/controller.js';

/** Title, program line, logo, favicon, colors, and theme. */
function applyBranding(s){
  document.title = s.appTitle || 'SOAP Note Generator';
  document.getElementById('appTitle').textContent = s.appTitle || 'SOAP Note Generator';
  document.getElementById('programLine').textContent = [s.orgName, s.programLine].filter(Boolean).join(' · ') || 'Sports medicine';
  const img = document.getElementById('appLogo');
  if (s.logo){ img.src = s.logo; img.alt = `${s.orgName || s.appTitle} logo`; img.hidden = false; }
  else { img.removeAttribute('src'); img.alt = ''; img.hidden = true; }
  applyFavicon(s.logo);
  applyTheme(s);
}

/** Show one screen. The note stays in memory (and in the hidden form) while Settings is open. */
function showView(name){
  const settings = name === 'settings';
  document.getElementById('view-note').hidden = settings;
  document.getElementById('view-settings').hidden = !settings;
  document.getElementById('clearBtn').hidden = settings;
  const btn = document.getElementById('settingsBtn');
  btn.textContent = settings ? 'Back to note' : 'Settings';
  btn.dataset.view = settings ? 'note' : 'settings';
  window.scrollTo(0, 0);
  (settings ? document.getElementById('settings_h') : btn).focus({ preventScroll: true });
}

await loadSettings();
applyBranding(getSettings());
initNote();
initSettingsScreen();
onSettingsChange((next, prev) => { applyBranding(next); applySettingsToNote(next, prev); });
document.addEventListener('click', e => { const v = e.target.closest('[data-view]'); if (v) showView(v.dataset.view); });
