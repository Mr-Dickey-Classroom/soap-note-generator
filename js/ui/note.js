/**
 * In-memory note model. Patient data lives only here and in the form; nothing
 * is persisted, and a reload erases it.
 *
 * The model holds what the prototype kept in STATES, ROMV, MMTV, and NOTES.
 * collectNote() takes a plain snapshot of the whole note (form fields + model)
 * for the engine, the assessment draft, and later the outputs.
 */
import { REG, ORDER } from '../engine/registry.js';
import { analyzeRegion } from '../engine/engine.js';
import { newRomRows, newMmtRows } from '../engine/measures.js';
import { val, radio, checkedIn } from './dom.js';

export function createModel(){
  return { states:{}, rom:{}, mmt:{}, notes:{}, assessEdited:false, dirty:false };
}

/** Create a region's state, ROM/MMT rows, and notes if it doesn't have them yet (prototype ensureRegion). */
export function ensureRegion(model, k, normOverrides){
  if (!model.states[k]) model.states[k] = {};
  if (!model.rom[k]) model.rom[k] = newRomRows(k, normOverrides && normOverrides[k]);
  if (!model.mmt[k]) model.mmt[k] = newMmtRows(k);
  if (!model.notes[k]) model.notes[k] = {obs:'', palp:'', neuro:''};
}

/** Forget every region's data (Clear note). */
export function resetModel(model){
  for (const k of ORDER){ delete model.states[k]; delete model.rom[k]; delete model.mmt[k]; delete model.notes[k]; }
  model.assessEdited = false; model.dirty = false;
}

/**
 * Check or uncheck a checkbox finding. Cleared findings are deleted, never stored
 * as false. "Screened: no red flags" clears every red flag, and any red flag
 * clears it (prototype onField).
 * @returns {string[]} other finding ids that were unchecked as a result
 */
export function setFinding(model, k, fid, checked){
  const st = model.states[k]; const cleared = [];
  if (checked) st[fid] = true; else delete st[fid];
  if (fid === 'rf_screened' && checked) REG[k].findings.filter(f => f[1] === 'rf').forEach(f => { if (f[0] in st) cleared.push(f[0]); delete st[f[0]]; });
  if (fid.startsWith('rf_') && fid !== 'rf_screened' && checked && st.rf_screened){ delete st.rf_screened; cleared.push('rf_screened'); }
  return cleared;
}

/** Set a tri-state finding to 'pos', 'neg', or '' (not done, deleted). */
export function setTri(model, k, fid, value){
  const st = model.states[k];
  if (value) st[fid] = value; else delete st[fid];
}

/** Selected regions: primary plus a different secondary (prototype regions()). */
export function selectedRegions(){
  const p = val('e_region'), s = val('e_region2');
  return [p, s && s !== p ? s : ''].filter(Boolean);
}

/** Clinical impression from the form (prototype getDx). */
export function readDx(){
  const raw = document.getElementById('a_primary')?.value || '';
  const [rk, id] = raw.includes(':') ? raw.split(':') : ['', ''];
  return {raw, rk, id, other:val('a_other'), conf:radio('conf'), secondary:checkedIn('a_secondary')};
}

/**
 * Plain snapshot of the whole note.
 * @param {ReturnType<typeof createModel>} model
 */
export function collectNote(model){
  const regions = selectedRegions();
  return {
    encounter: { name:val('e_name'), dob:val('e_dob'), grade:val('e_grade'), sport:val('e_sport'), doi:val('e_doi'), doe:val('e_doe'),
      time:val('e_time'), type:val('e_type'), icd:val('e_icd'), evaluator:val('e_eval'), side:radio('side') },
    regions,
    reeval: { last:val('r_last'), dx:val('r_dx'), visit:val('r_visit'), status:radio('rstat'), adherence:radio('radh'), resp:val('r_resp') },
    subj: { cc:val('s_cc'), hpi:val('s_hpi'), onset:radio('onset'), pnow:val('s_pnow'), pbest:val('s_pbest'), pworst:val('s_pworst'),
      quality:checkedIn('s_quality'), agg:val('s_agg'), ease:val('s_ease'), prior:val('s_prior'), func:val('s_func') },
    thr: { wnl:val('thr_wnl'), bil:val('thr_bil') },
    oMove: val('o_move'),
    dx: readDx(),
    assess: { text:val('a_text'), edited:model.assessEdited },
    plan: { status:radio('status'), restrict:val('p_restrict'), tx:checkedIn('p_tx'), txd:val('p_txd'), therex:val('p_therex'),
      ref:val('p_ref'), urg:val('p_urg'), reasons:checkedIn('p_reasons'), comm:checkedIn('p_comm'), fu:val('p_fu'), notes:val('p_notes') },
    states: model.states, rom: model.rom, mmt: model.mmt, notes: model.notes,
  };
}

/** True when the note is a re-evaluation. */
export const isReeval = note => note.encounter.type === 'Re-evaluation';

/** Measurement context for ROM/MMT flags. */
export function measureCtx(note){
  return { side: note.encounter.side, thrWnl: note.thr.wnl, thrBil: note.thr.bil, reeval: isReeval(note) };
}

/** Run the engine for every selected region. */
export function analyzeNote(note, onError){
  return note.regions.map(k => analyzeRegion(k, note.dx, { state: note.states[k] || {}, side: note.encounter.side, onError }));
}
