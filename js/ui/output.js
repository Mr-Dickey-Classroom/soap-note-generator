/**
 * Output panel: EMR paste text, character counter, and Copy (SPEC §4).
 * The text is regenerated on every update and whenever an output control
 * changes; edits typed into the box are not saved back to the form.
 */
import { buildEmrText, charCount, parseLimit } from '../output/emr-text.js';
import { getSettings, updateSettings } from '../settings/store.js';
import { $, radio } from './dom.js';

/** Labels that carry the EMR name from Settings. */
export function applyOutputLabels(s){
  const emr = (s.emrName || '').trim() || 'EMR';
  $('#OUT_h').textContent = `${emr} text`;
  $('#navOut').textContent = `${emr} text`;
  $('#copyBtn').textContent = `Copy for ${emr}`;
  $('#copyHeadBtn').textContent = `Copy for ${emr}`;
  $('#out_all').setAttribute('aria-label', `Note text for ${emr}`);
  $('#hr_limit').setAttribute('aria-label', `${emr} character limit`);
  $('#out_intro').textContent = `The note formatted for pasting into ${emr}. Condensed keeps the key findings and points to the attached PDF for the full evaluation. Non-tender areas and negative tests are left out unless you check the box. Edits made in this box are not saved back to the form.`;
}

/** Output controls set to the Settings defaults (fresh note). */
export function applyOutputDefaults(s){
  $(s.emrFormat === 'txt' ? '#fm_tx' : '#fm_md').checked = true;
  $(s.emrLength === 'full' ? '#ln_f' : '#ln_c').checked = true;
  $('#inc_neg').checked = !!s.emrIncludeNeg;
  $('#hr_limit').value = String(s.emrCharLimit);
  $('#copyMsg').textContent = '';
}

/** Current output options from the panel. */
export function outputOptions(){
  return {
    format: radio('fmt') === 'txt' ? 'txt' : 'md',
    length: radio('len') === 'full' ? 'full' : 'cond',
    includeNeg: $('#inc_neg').checked,
    pdfPointer: getSettings().pdfPointerText,
  };
}

/**
 * Regenerate the text box from a note snapshot and its analyses.
 * @param {object} note collectNote() snapshot with assess.text current
 * @param {object[]} AS
 */
export function renderOutput(note, AS){
  $('#out_all').value = buildEmrText(note, AS, outputOptions());
  renderCount();
}

/** Update the character counter from the box (it counts what will be pasted). */
export function renderCount(){
  const el = $('#charCount');
  const c = charCount($('#out_all').value.length, parseLimit($('#hr_limit').value, getSettings().emrCharLimit));
  el.textContent = c.text;
  el.classList.toggle('near', c.level === 'near');
  el.classList.toggle('over', c.level === 'over');
}

/** The inline limit is a setting: a valid value updates Settings. */
export function onLimitInput(){
  const raw = $('#hr_limit').value;
  const n = parseLimit(raw, 0);
  if (n) updateSettings({ emrCharLimit: n });
  renderCount();
}

/**
 * Copy the box text: Clipboard API, falling back to select + execCommand,
 * then to asking the user to press Ctrl+C.
 * @returns {Promise<'copied'|'selected'>}
 */
export async function copyOutput(){
  const ta = $('#out_all'); const msg = $('#copyMsg'); const text = ta.value;
  const emr = (getSettings().emrName || '').trim() || 'your EMR';
  const done = `Copied. Paste it into ${emr}.`;
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('no clipboard');
    await navigator.clipboard.writeText(text);
    msg.textContent = done; return 'copied';
  } catch {
    ta.focus(); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
    msg.textContent = ok ? done : 'Text selected. Press Ctrl+C (Cmd+C on a Mac) to copy.';
    return ok ? 'copied' : 'selected';
  }
}
