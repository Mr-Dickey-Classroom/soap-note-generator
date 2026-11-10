/**
 * Evidence helpers: likelihood ratios from sensitivity/specificity, expert weights, and evidence power.
 * Ported verbatim from reference/soap-note-generator-v8.html. Do not edit
 * likelihood ratios, priors, thresholds, labels, clusters, gates, or insight
 * text here: list concerns in docs/QUESTIONS.md instead.
 * tests/engine-source.spec.js compares this data and every function's source
 * text against the prototype.
 */

export const CAP = 10;
// From sensitivity/specificity
export function SS(se, sp, s){
  const rawP = sp >= 1 ? Infinity : se/(1-sp);
  return {p:Math.min(rawP,CAP), n:(1-se)/sp, s, se, sp, capped: rawP > CAP};
}
// Expert weight (pseudo-LR)
export function X(p, n){ return {p, n:n ?? null, s:"EXP"}; }
export function T(p, n, s){ return {p, n, s}; }
export function power(e){ return Math.max(Math.log(e.p), e.n ? -Math.log(e.n) : 0); }
export function fmt(x){ return x >= 10 ? x.toFixed(0) : x >= 1 ? x.toFixed(1) : x.toFixed(2); }
