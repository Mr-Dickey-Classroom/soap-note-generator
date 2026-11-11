/**
 * Note screen controller: builds region sections, handles input, and runs the
 * debounced update loop (analyze -> panel, plan prompts, assessment draft).
 * Behavior follows the prototype's event handlers and update().
 */
import { REG, ORDER, impressionOptions } from '../engine/registry.js';
import { getSettings } from '../settings/store.js';
import { evaluatorLine } from '../settings/defaults.js';
import { today, nowTime } from '../output/format.js';
import { draftAssessment } from '../output/assessment-draft.js';
import { $, $$, esc, chipList, checkedIn } from './dom.js';
import { createModel, ensureRegion, resetModel, setFinding, setTri, selectedRegions, collectNote, measureCtx, analyzeNote } from './note.js';
import { engineHTML, noteHTML, evidenceHTML } from './engine-form.js';
import { romHTML, mmtHTML, romRowHTML, mmtRowHTML, refreshRomRow, refreshMmtRow } from './rom-mmt.js';
import { renderPanel } from './panel.js';
import { renderPlanLists, renderReasons, renderPlanPrompts } from './plan.js';

const model = createModel();
let timer = null;
let clearArmed = null;
/** Most recent analyses and note snapshot (for tests and, later, outputs). */
export const last = { AS: [], note: null, errors: [] };

const DRAFT_HINT = 'Drafts automatically from your findings until you edit it.';
const EDITED_HINT = 'Edited by you. "Redraft from findings" replaces your edits.';

function ctxNow(){ return measureCtx(collectNote(model)); }

/** Rebuild the Subjective and Objective engine sections and the impression lists (prototype buildRegions). */
function buildRegions(){
  const rs = selectedRegions();
  rs.forEach(k => ensureRegion(model, k));
  const sHost = $('#s_engine'), oHost = $('#o_engine');
  const ctx = ctxNow();
  if (!rs.length){
    const msg = '<p class="empty">Choose a body region in Encounter to load history items, red flags, special tests, and the ROM and strength tables.</p>';
    sHost.innerHTML = msg; oHost.innerHTML = msg;
  } else {
    sHost.innerHTML = rs.map((k, i) => `<h3 class="rtitle">${esc(REG[k].label)}${i ? ' (secondary)' : ''}</h3>${engineHTML(k, ['h','rf'])}`).join('');
    oHost.innerHTML = rs.map((k, i) => `<h3 class="rtitle">${esc(REG[k].label)}${i ? ' (secondary)' : ''}</h3>
      ${engineHTML(k, ['o'])}${noteHTML(k, 'obs', 'Observation notes', model.notes[k].obs)}
      ${engineHTML(k, ['p'])}${noteHTML(k, 'palp', 'Palpation notes', model.notes[k].palp)}
      ${romHTML(k, model.rom[k], ctx)}${mmtHTML(k, model.mmt[k], ctx)}
      ${engineHTML(k, ['r','t','n'])}${noteHTML(k, 'neuro', 'Special test and neuro notes', model.notes[k].neuro)}`).join('');
  }
  applyState();
  buildImpression();
}

/** Reflect the model's finding state in the checkboxes and radios. */
function applyState(){
  $$('[data-fid]').forEach(i => i.checked = (model.states[i.dataset.reg] || {})[i.dataset.fid] === true);
  $$('[data-tri]').forEach(i => i.checked = ((model.states[i.dataset.reg] || {})[i.dataset.tri] || '') === i.value);
}

/** Impression select and also-considering chips for the selected regions (prototype buildImpression). */
function buildImpression(){
  const rs = selectedRegions(); const sel = $('#a_primary'); const prev = sel.value;
  const prevSec = new Set(checkedIn('a_secondary'));
  const groups = impressionOptions(rs);
  sel.innerHTML = '<option value="">Choose your clinical impression</option>' +
    groups.map(g => `<optgroup label="${esc(g.label)}">` + g.options.map(o => `<option value="${o.value}">${esc(o.name)}</option>`).join('') + '</optgroup>').join('') +
    '<option value="other">Other (not listed)</option>';
  if ([...sel.options].some(op => op.value === prev)) sel.value = prev;
  const host = $('#a_secondary');
  if (!rs.length){ host.innerHTML = '<span class="note-s">Choose a body region first.</span>'; syncSecondary(); return; }
  host.innerHTML = groups.map(g => g.options.map(o => `<label class="chip"><input type="checkbox" value="${o.value}"${prevSec.has(o.value) ? ' checked' : ''}><span>${esc(o.name)}</span></label>`).join('')).join('');
  syncSecondary();
}

function syncSecondary(){
  const p = $('#a_primary').value;
  $$('#a_secondary input').forEach(i => { i.disabled = i.value === p; if (i.value === p) i.checked = false; });
  $('#a_other_wrap').hidden = p !== 'other';
}

function syncReeval(){
  const on = $('#e_type').value === 'Re-evaluation';
  document.body.classList.toggle('reeval', on); $('#reeval').hidden = !on;
}

function refreshFlagsAll(){
  const ctx = ctxNow();
  $$('[data-romflag]').forEach(td => { const [k, i] = td.dataset.romflag.split('|'); refreshRomRow(k, +i, model.rom[k][+i], ctx); });
  $$('[data-mmtflag]').forEach(td => { const [k, i] = td.dataset.mmtflag.split('|'); refreshMmtRow(k, +i, model.mmt[k][+i], ctx); });
}

function schedule(){ clearTimeout(timer); timer = setTimeout(update, 120); }

/** Analyze and redraw everything that depends on the findings (prototype update). */
export function update(){
  clearTimeout(timer);
  const settings = getSettings();
  const errors = [];
  const note = collectNote(model);
  const AS = analyzeNote(note, e => { errors.push(e); console.error('Engine error:', e); });
  last.AS = AS; last.note = note; last.errors = errors;
  renderPanel($('#live'), AS, note, measureCtx(note), settings);
  renderPlanPrompts($('#p_suggest'), AS, model.states, note.plan.ref, settings);
  if (!model.assessEdited) $('#a_text').value = draftAssessment(note, AS);
}

function onField(e){
  const t = e.target;
  if (t.dataset.fid){
    const k = t.dataset.reg;
    const cleared = setFinding(model, k, t.dataset.fid, t.checked);
    cleared.forEach(fid => { const i = document.querySelector(`[data-reg="${k}"][data-fid="${fid}"]`); if (i) i.checked = false; });
  } else if (t.dataset.tri){
    setTri(model, t.dataset.reg, t.dataset.tri, t.value);
  } else if (t.dataset.rom){
    const [k, i, f] = t.dataset.rom.split('|'); const r = model.rom[k][+i];
    r[f] = t.type === 'checkbox' ? t.checked : t.value;
    refreshRomRow(k, +i, r, ctxNow());
  } else if (t.dataset.mmt){
    const [k, i, f] = t.dataset.mmt.split('|'); const r = model.mmt[k][+i];
    r[f] = t.type === 'checkbox' ? t.checked : t.value;
    refreshMmtRow(k, +i, r, ctxNow());
  } else if (t.dataset.note){
    const [k, f] = t.dataset.note.split('|'); model.notes[k][f] = t.value;
  } else if (t.id === 'e_region' || t.id === 'e_region2'){
    if (e.type === 'change') buildRegions();
  } else if (t.name === 'side' || t.id === 'thr_wnl' || t.id === 'thr_bil'){
    refreshFlagsAll();
  } else if (t.id === 'a_primary'){
    syncSecondary();
  } else if (t.id === 'a_text'){
    if (e.type === 'input'){ model.assessEdited = true; $('#a_status').textContent = EDITED_HINT; }
  } else if (t.id === 'p_ref'){
    renderReasons(getSettings());
  }
  if (t.id === 'e_type'){ syncReeval(); refreshFlagsAll(); }
  model.dirty = true;
  schedule();
}

function onClick(e){
  const ev = e.target.closest('[data-ev]');
  if (ev){
    const row = ev.closest('.tri'); let box = row.querySelector('.evbox');
    if (box){ box.remove(); ev.setAttribute('aria-expanded', 'false'); }
    else { box = document.createElement('div'); box.className = 'evbox'; box.innerHTML = evidenceHTML(ev.dataset.reg, ev.dataset.ev); row.appendChild(box); ev.setAttribute('aria-expanded', 'true'); }
    return;
  }
  const g = e.target.closest('[data-goto]');
  if (g){
    const row = document.querySelector(`[data-row="${g.dataset.goto}"]`);
    if (row){ row.scrollIntoView({block:'center'}); row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash'); const r0 = row.querySelector('input[value="pos"]'); if (r0) r0.focus({preventScroll:true}); }
    return;
  }
  const a = e.target.closest('[data-action]');
  if (!a) return;
  const act = a.dataset.action;
  if (act === 'addrom'){ const k = a.dataset.reg; model.rom[k].push({m:'', norm:'', custom:true}); const i = model.rom[k].length - 1; document.querySelector(`[data-romtable="${k}"]`).insertAdjacentHTML('beforeend', romRowHTML(k, model.rom[k][i], i, ctxNow())); document.querySelector(`[data-rom="${k}|${i}|m"]`).focus(); }
  if (act === 'addmmt'){ const k = a.dataset.reg; model.mmt[k].push({m:'', custom:true}); const i = model.mmt[k].length - 1; document.querySelector(`[data-mmttable="${k}"]`).insertAdjacentHTML('beforeend', mmtRowHTML(k, model.mmt[k][i], i, ctxNow())); document.querySelector(`[data-mmt="${k}|${i}|m"]`).focus(); }
  if (act === 'regen'){ model.assessEdited = false; $('#a_status').textContent = DRAFT_HINT; update(); }
  if (act === 'clear'){
    if (!clearArmed){ a.textContent = 'Click again to clear'; clearArmed = setTimeout(() => { a.textContent = 'New note'; clearArmed = null; }, 3500); return; }
    clearTimeout(clearArmed); clearArmed = null; clearAll(); a.textContent = 'New note';
  }
}

/** Defaults for a fresh note: evaluation date and time now, evaluator and thresholds from Settings. */
function applyNoteDefaults(){
  const s = getSettings();
  $('#e_doe').value = today();
  $('#e_time').value = nowTime();
  $('#e_eval').value = evaluatorLine(s);
  $('#thr_wnl').value = String(s.thrWnl);
  $('#thr_bil').value = String(s.thrBil);
  $('#cf_m').checked = true;
}

/** Erase the note (two-click confirm in the header). */
export function clearAll(){
  resetModel(model);
  $$('main input, main textarea, main select').forEach(i => {
    if (i.type === 'checkbox' || i.type === 'radio') i.checked = false; else if (i.tagName === 'SELECT') i.selectedIndex = 0; else i.value = '';
  });
  applyNoteDefaults();
  $('#a_status').textContent = DRAFT_HINT;
  syncReeval();
  buildRegions(); renderReasons(getSettings()); update();
  window.scrollTo(0, 0);
}

/** Boot the Note screen. */
export function initNote(){
  const s = getSettings();
  const opts = ORDER.map(k => `<option value="${k}">${esc(REG[k].label)}</option>`).join('');
  $('#e_region').innerHTML = '<option value="">Choose region</option>' + opts;
  $('#e_region2').innerHTML = '<option value="">None</option>' + opts;
  $$('select.pain').forEach(x => x.innerHTML = '<option value=""></option>' + Array.from({length:11}, (_, i) => `<option>${i}</option>`).join(''));
  $('#s_quality').innerHTML = chipList(s.painQuality);
  renderPlanLists(s);
  applyNoteDefaults();
  syncReeval();
  buildRegions(); update();

  document.addEventListener('change', onField);
  document.addEventListener('input', e => { if (e.target.matches('input[type=text], input:not([type]), textarea, input[inputmode]')) onField(e); });
  document.addEventListener('click', onClick);
  window.addEventListener('beforeunload', e => { if (model.dirty){ e.preventDefault(); e.returnValue = ''; } });
}
