/**
 * Boot. Phase 2: the Note screen only. Settings and About screens (and routing
 * between them) arrive in later phases.
 */
import { getSettings } from './settings/store.js';
import { initNote } from './ui/controller.js';

function applyBranding(s){
  document.title = s.appTitle;
  document.getElementById('appTitle').textContent = s.appTitle;
  document.getElementById('programLine').textContent = [s.orgName, s.programLine].filter(Boolean).join(' · ') || 'Sports medicine';
}

applyBranding(getSettings());
initNote();
