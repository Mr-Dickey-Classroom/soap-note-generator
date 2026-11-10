/**
 * Evaluation context.
 *
 * The prototype kept the "current region" in mutable globals that useRegion(k)
 * swapped (REGION, FINDINGS, SECTIONS, GROUPS, CONDITIONS, CLUSTERS, FMAP, CMAP,
 * state). Its cluster read() functions and region insights reference `state`,
 * `isChecked`, and `isAssessed` as free variables. To port those functions
 * verbatim, this module exposes the same names as ES-module live bindings.
 *
 * The bindings are set only for the duration of a synchronous withRegion()
 * call and restored afterwards. Public engine functions take explicit
 * arguments; nothing here persists between calls.
 */

/** @type {Record<string, true|'pos'|'neg'>|undefined} current region's finding map */
export let state;
export let REGION_KEY;
export let REGION;
export let FINDINGS;
export let SECTIONS;
export let GROUPS;
export let CONDITIONS;
export let CLUSTERS;
export let FMAP;
export let CMAP;

/**
 * Run fn with the region context set, then restore the previous context.
 * @template T
 * @param {string} key region key
 * @param {object} def region definition (REG[key])
 * @param {{FMAP:object, CMAP:object}} index precomputed lookups for the region
 * @param {object} st finding state for the region (read only by the engine)
 * @param {() => T} fn
 * @returns {T}
 */
export function withRegion(key, def, index, st, fn){
  const prev = [state, REGION_KEY, REGION, FINDINGS, SECTIONS, GROUPS, CONDITIONS, CLUSTERS, FMAP, CMAP];
  REGION_KEY = key; REGION = def;
  FINDINGS = def.findings; SECTIONS = def.sections; GROUPS = def.groups; CONDITIONS = def.conditions; CLUSTERS = def.clusters;
  FMAP = index.FMAP; CMAP = index.CMAP;
  state = st;
  try { return fn(); }
  finally { [state, REGION_KEY, REGION, FINDINGS, SECTIONS, GROUPS, CONDITIONS, CLUSTERS, FMAP, CMAP] = prev; }
}

/* Verbatim from the prototype (reads the live bindings above). */
export function isChecked(fid){ return state[fid] === true || state[fid] === 'pos'; }
export function isAssessed(fid){ return state[fid] === 'pos' || state[fid] === 'neg' || state[fid] === true; }
export function triFinding(fid){ const f = FMAP[fid]; if (!f) return false; const s = SECTIONS.find(s => s.id === f.sec); return !!s && s.kind === 'tri'; }
export function gateOpen(c){ return !!(c.gate && c.gate.some(g => g.every(isChecked))); }
