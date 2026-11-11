/**
 * Plan section: list-driven controls (from Settings), standing-order prompts,
 * and referral reasons.
 */
import { planPrompts } from '../engine/plan-prompts.js';
import { esc, chipList, checkedIn } from './dom.js';
import { referralLabel } from '../settings/defaults.js';

/** Fill the Plan section's lists from Settings, keeping current selections. */
export function renderPlanLists(settings){
  const keep = id => new Set(checkedIn(id));
  document.getElementById('p_tx').innerHTML = chipList(settings.treatments, keep('p_tx'));
  document.getElementById('p_comm').innerHTML = chipList(settings.communication, keep('p_comm'));
  const therex = document.getElementById('p_therex'); const t0 = therex.value;
  therex.innerHTML = '<option value="">None assigned</option>' + settings.therexPrograms.map(p => `<optgroup label="${esc(p)}">${settings.therexLevels.map(l => `<option>${esc(p)}, ${esc(l)}</option>`).join('')}</optgroup>`).join('') + '<option>Custom (see plan notes)</option>';
  therex.value = [...therex.options].some(o => o.value === t0) ? t0 : '';
  const ref = document.getElementById('p_ref'); const r0 = ref.value;
  ref.innerHTML = '<option value="">No referral</option>' + settings.referralDestinations.map(d => { const l = referralLabel(d, settings); return `<option value="${esc(l)}">${esc(l)}</option>`; }).join('');
  // A chosen "Directing physician (...)" survives a change to the physician name.
  const dp = referralLabel('Directing physician', settings);
  const r1 = /^Directing physician( \(.*\))?$/.test(r0) ? dp : r0;
  ref.value = [...ref.options].some(o => o.value === r1) ? r1 : '';
  const urg = document.getElementById('p_urg'); const u0 = urg.value;
  urg.innerHTML = '<option value=""></option>' + settings.referralUrgency.map(u => `<option>${esc(u)}</option>`).join('');
  urg.value = [...urg.options].some(o => o.value === u0) ? u0 : '';
  renderReasons(settings);
}

/** Referral reasons for the chosen destination (prototype renderReasons). */
export function renderReasons(settings){
  const ref = document.getElementById('p_ref').value; const prev = new Set(checkedIn('p_reasons'));
  const list = ref === settings.ptDestination ? settings.referralReasonsPT : ref ? settings.referralReasonsPhysician : [];
  document.getElementById('p_reasons_wrap').hidden = !list.length;
  document.getElementById('p_reasons').innerHTML = chipList(list, prev);
}

/**
 * Plan prompts (prototype renderSuggest) with wording from Settings.
 * @param {HTMLElement} host
 * @param {object[]} AS
 * @param {Record<string, object>} states finding state per region
 * @param {string} referral current referral destination
 * @param {object} settings
 */
export function renderPlanPrompts(host, AS, states, referral, settings){
  const text = p => {
    if (p.key === 'notRuledOut') return `Not yet ruled out: ${p.conditions.join('; ')}. ${settings.notRuledOutSuffix}`;
    const s = settings.prompts[p.key]; return s && s.on ? s.text : '';
  };
  host.innerHTML = planPrompts(AS, states, { referral }).map(p => [p.tone, text(p)]).filter(([, x]) => x)
    .map(([t, x]) => `<div class="alert ${t}">${esc(x)}</div>`).join('');
}
