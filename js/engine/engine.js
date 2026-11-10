/**
 * Clinical engine: scoring and per-region analysis.
 *
 * scoreCondition, BANDS, and band are verbatim from
 * reference/soap-note-generator-v8.html. analyzeRegion is the prototype's
 * function with three documented changes: inputs are passed in rather than read
 * from the DOM, swallowed errors are reported to an optional onError hook, and
 * the student-mode grade (comp/total/stars) is removed (docs/SPEC.md §9.1).
 *
 * No DOM access. Do not edit thresholds, weights, or text here.
 */
import { REG, INDEX } from './registry.js';
import { SRC } from './sources.js';
import { power } from './evidence.js';
import {
  withRegion, state, isChecked, isAssessed, triFinding, gateOpen,
  REGION, FINDINGS, GROUPS, CONDITIONS, CLUSTERS, CMAP, FMAP
} from './context.js';

/**
 * @typedef {Record<string, true|'pos'|'neg'>} FindingState
 *   Finding id -> true (checked) | 'pos' | 'neg'. Cleared findings are deleted,
 *   never stored as false or ''. "rf_screened" is a key here too.
 * @typedef {{raw:string, rk:string, id:string, other:string, conf:string, secondary:string[]}} Dx
 *   Clinical impression as the prototype's getDx() returned it. raw is "region:conditionId",
 *   "other", or ""; secondary holds "region:conditionId" values.
 */

/**
 * Score one condition against the current region's state (verbatim).
 * Call inside withRegion().
 */
function scoreCondition(c){
  const contribs = [];
  for (const [fid, e] of Object.entries(c.ev)){
    const v = state[fid];
    let w = 0, dir = null;
    if (v === true || v === 'pos'){ w = Math.log(e.p); dir = 'pos'; }
    else if (v === 'neg' && e.n){ w = Math.log(e.n); dir = 'neg'; }
    if (dir) contribs.push({fid, e, w, dir, raw:w});
  }
  // dampen correlated tests
  const byGroup = {};
  contribs.forEach(k => { const g = GROUPS[k.fid]; if (g) (byGroup[g] ||= []).push(k); });
  Object.values(byGroup).forEach(list => { list.sort((a,b) => Math.abs(b.raw) - Math.abs(a.raw)); list.slice(1).forEach(k => k.w = k.raw * 0.5); });
  const evidence = contribs.reduce((s,k) => s + k.w, 0);
  let net = c.prior + evidence;
  let b = band(net);
  let capped = false;
  if (b.key === 'strong' && c.confirm && !c.confirm.some(isChecked)){ b = BANDS.mod; capped = true; }
  const keys = Object.entries(c.ev).filter(([fid,e]) => triFinding(fid) && power(e) >= 0.9).map(([fid,e]) => ({fid, e, pw:power(e)}));
  const tested = keys.filter(k => isAssessed(k.fid)).length;
  return {c, contribs, evidence, net, band:b, capped, keys, tested};
}
const BANDS = {
  strong:{key:'strong', label:'Strong support', color:'var(--band-strong)', pts:100},
  mod:{key:'mod', label:'Moderate support', color:'var(--band-mod)', pts:85},
  pos:{key:'pos', label:'Possible', color:'var(--band-pos)', pts:65},
  ins:{key:'ins', label:'Insufficient evidence', color:'var(--band-ins)', pts:40},
  neg:{key:'neg', label:'Unlikely', color:'var(--band-neg)', pts:10},
};
function band(net){ return net >= 2.3 ? BANDS.strong : net >= 1.1 ? BANDS.mod : net >= 0.4 ? BANDS.pos : net <= -1.1 ? BANDS.neg : BANDS.ins; }

/**
 * Plain-language side used in the impression ("left", "right", "bilateral", "").
 * @param {string} side "L" | "R" | "B" | "M" | ""
 */
export function sideWord(side){ return ({L:'left', R:'right', B:'bilateral', M:''})[side] || ''; }

/**
 * Analyze one region: ranked differential, candidates, clusters, suggested next
 * tests, insights (clinical reasoning notes), not-yet-ruled-out list.
 * @param {string} k region key
 * @param {Dx} D clinical impression
 * @param {{state?:FindingState, side?:string, onError?:(e:unknown)=>void}} [opts]
 *   state: this region's finding map; side: involved side; onError: called with any
 *   error a cluster readout or insight throws (the prototype swallowed these silently).
 * @returns {object} the prototype's analysis object "A" (without the student grade fields)
 */
export function analyzeRegion(k, D, opts = {}){
  const onError = opts.onError || (() => {});
  return withRegion(k, REG[k], INDEX[k], opts.state || {}, () => {
  const dx = {primary: D.rk === k ? D.id : '', secondary: D.secondary.filter(s => s.startsWith(k + ':')).map(s => s.split(':')[1]), other:D.other, conf:D.conf, side:sideWord(opts.side)};
  const results = CONDITIONS.map(scoreCondition).sort((a, b) => b.net - a.net);
  const R = Object.fromEntries(results.map(r => [r.c.id, r]));
  const mine = new Set([dx.primary, ...dx.secondary].filter(x => x && CMAP[x]));
  const cand = new Set();
  const historyEntered = FINDINGS.some(f => f[1] === 'h' && state[f[0]]);
  results.forEach(r => {
    if (r.net >= 0.4) cand.add(r.c.id);
    if (r.c.miss === 'high' && (historyEntered ? gateOpen(r.c) : r.evidence >= 0.4)) cand.add(r.c.id);
  });
  CONDITIONS.forEach(c => { if (c.link && (mine.has(c.link) || cand.has(c.link))) cand.add(c.id); });
  mine.forEach(id => cand.add(id));
  const redflags = FINDINGS.filter(f => f[1] === 'rf' && state[f[0]]);
  const agg = {};
  cand.forEach(id => {
    const r = R[id];
    r.keys.filter(x => !isAssessed(x.fid)).sort((a, b) => b.pw - a.pw).slice(0, 3).forEach(x => {
      const a = (agg[x.fid] ||= {fid:x.fid, score:0, reasons:[]});
      a.score += x.pw * (mine.has(id) ? 1.2 : 1) * (r.c.miss === 'high' ? 1.2 : 1);
      a.reasons.push(r.c.name);
    });
  });
  const next = Object.values(agg).sort((a, b) => b.score - a.score).slice(0, 6).map(n => ({...n, label:FMAP[n.fid] ? FMAP[n.fid].label : n.fid}));
  const clusters = CLUSTERS.filter(cl => cl.cond.some(id => cand.has(id))).map(cl => {
    const pos = cl.items.filter(isChecked).length;
    const done = i => triFinding(i) ? isAssessed(i) : true;
    const tested = cl.items.filter(done).length;
    let res = null; try { res = cl.read(pos, tested, cl.items.length); } catch(e){ onError(e); }
    return {cl, pos, tested, res};
  });
  // student grade removed (docs/SPEC.md §9.1)
  const setAside = historyEntered ? CONDITIONS.filter(c => c.miss === 'high' && c.gate && !cand.has(c.id)).map(c => c.name) : [];
  const A = {key:k, dx, results, R, cand, mine, redflags, next, clusters, setAside, historyEntered, any:Object.keys(state).length > 0};
  let notes = [];
  try { notes = REGION.insights(A) || []; } catch(e){ onError(e); notes = []; }
  if (dx.conf === 'High' && dx.primary && R[dx.primary].band.pts <= 40)
    notes.push({tone:'bad', h:'High confidence, thin evidence', p:'You rated confidence high, but the findings entered don\u2019t yet support this diagnosis. Either the findings that convinced you are missing here, or the confidence came from pattern recognition that needs a test behind it.'});
  A.notes = notes;
  A.ro = [...cand].filter(id => R[id].c.miss === 'high' && (R[id].band.pts < 85 || R[id].capped)).map(id => R[id].c.name);
  A.sup = results.filter(r => r.net >= 1.1).map(r => `${r.c.name} (${r.band.label.toLowerCase()})`);
  return A;
  });
}

/**
 * Name of the chosen impression (prototype dxName).
 * @param {Dx} D
 */
export function dxName(D){
  if (D.raw === 'other') return D.other || 'Other';
  if (!D.rk) return '';
  return INDEX[D.rk]?.CMAP[D.id]?.name || '';
}

/**
 * Positive and negative finding labels for the given sections (prototype findings()).
 * @param {string} k region key
 * @param {FindingState} st
 * @param {string[]} secIds section ids, e.g. ['t'] or ['h']
 * @returns {{pos:string[], neg:string[]}}
 */
export function findingLists(k, st, secIds){
  return withRegion(k, REG[k], INDEX[k], st || {}, () => {
    const pos = [], neg = [];
    FINDINGS.filter(f => secIds.includes(f[1])).forEach(f => { if (isChecked(f[0])) pos.push(f[3]); else if (state[f[0]] === 'neg') neg.push(f[3]); });
    return {pos, neg};
  });
}

/**
 * Red-flag findings present in a region's state, as [id, section, subgroup, label] rows.
 * @param {string} k
 * @param {FindingState} st
 */
export function redFlagFindings(k, st){
  return REG[k].findings.filter(f => f[1] === 'rf' && (st || {})[f[0]]);
}

/**
 * Structured evidence for one finding across the region's conditions (the data
 * behind the prototype's evidenceText(); formatting lives in the UI).
 * @param {string} k region key
 * @param {string} fid finding id
 * @returns {{condition:string, se:number|undefined, sp:number|undefined, p:number, n:number|null, capped:boolean, source:string, sourceText:string}[]}
 */
export function evidenceFor(k, fid){
  const rows = [];
  for (const c of REG[k].conditions){
    const e = c.ev[fid]; if (!e) continue;
    rows.push({condition:c.name, se:e.se, sp:e.sp, p:e.p, n:e.n, capped:!!e.capped, source:e.s, sourceText:SRC[e.s]});
  }
  return rows;
}
export { scoreCondition, BANDS, band };
