/**
 * Plan prompts: which standing-order style prompts apply (prototype renderSuggest).
 * Returns prompt keys and data only; the wording comes from Settings so it can
 * match each clinician's standing orders (docs/SPEC.md §3 Plan, §6).
 *
 * Differs from the prototype in one place (docs/SPEC.md §9.12, QUESTIONS P11):
 * the dislocation prompt also fires on the deformity/dislocation red flag
 * (rf_deform). The prototype only matched "disloc" in finding ids, which no
 * finding in these five regions has, so its prompt never fired.
 *
 * No DOM access.
 */

/**
 * @param {object[]} analyses results of analyzeRegion() for each selected region
 * @param {Record<string, Record<string, true|'pos'|'neg'>>} statesByRegion finding state per region
 * @param {{referral?:string}} [plan] current referral destination ('' if none)
 * @returns {{key:'redFlag'|'dislocation'|'notRuledOut'|'referral', tone:'bad'|'warn'|'note', conditions?:string[]}[]}
 */
export function planPrompts(analyses, statesByRegion, plan = {}){
  const AS = analyses, STATES = statesByRegion;
  const out = [];
  const rf = AS.some(A => A.redflags.length);
  if (rf) out.push({key:'redFlag', tone:'bad'});
  const disl = AS.some(A => ['elbow','wrist','knee','ankle','hip'].includes(A.key) && Object.keys(STATES[A.key] || {}).some(f => (/disloc/.test(f) || f === 'rf_deform') && STATES[A.key][f]));
  if (disl) out.push({key:'dislocation', tone:'bad'});
  const ro = AS.flatMap(A => A.ro);
  if (ro.length) out.push({key:'notRuledOut', tone:'warn', conditions:ro});
  if (plan.referral) out.push({key:'referral', tone:'note'});
  return out;
}
