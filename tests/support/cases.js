// Input generators for the engine parity tests. Cases are plain data so the
// same input can be replayed in the prototype and in the new engine.
import { REG, INDEX, ORDER } from '../../js/engine/registry.js';
import { GRADES, ENDFEEL, ROMDEF, MMTDEF } from '../../js/engine/measures.js';

export const REGIONS = ORDER;

/** Deterministic PRNG (mulberry32). */
export function rng(seed){
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = (r, list) => list[Math.floor(r() * list.length)];
const seedOf = s => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);

function isTri(k, fid){
  const f = INDEX[k].FMAP[fid]; if (!f) return false;
  const s = REG[k].sections.find(s => s.id === f.sec); return !!s && s.kind === 'tri';
}
/** Value a finding takes when "present": true for checkboxes, 'pos' for tri-state. */
const present = (k, fid) => (isTri(k, fid) ? 'pos' : true);

function dxFor(r, keys){
  const conds = keys.flatMap(k => REG[k].conditions.map(c => `${k}:${c.id}`));
  const x = r();
  const raw = x < 0.25 ? '' : x < 0.3 ? 'other' : pick(r, conds);
  const [rk, id] = raw.includes(':') ? raw.split(':') : ['', ''];
  const secondary = [];
  const nSec = Math.floor(r() * 3);
  for (let i = 0; i < nSec; i++){ const s = pick(r, conds); if (s !== raw && !secondary.includes(s)) secondary.push(s); }
  return { raw, rk, id, other: raw === 'other' ? 'Contusion' : '', conf: pick(r, ['', 'Low', 'Moderate', 'High']), secondary };
}
const noDx = () => ({ raw:'', rk:'', id:'', other:'', conf:'', secondary:[] });

function randomState(r, k){
  const st = {};
  for (const f of REG[k].findings){
    const p = f[1] === 'rf' ? 0.03 : 0.12;
    if (r() < p) st[f[0]] = isTri(k, f[0]) ? (r() < 0.6 ? 'pos' : 'neg') : true;
  }
  if (r() < 0.3 && !REG[k].findings.some(f => f[1] === 'rf' && st[f[0]])) st.rf_screened = true;
  return st;
}

/**
 * Scripted case per region: the prototype's own built-in example for that region
 * (history plus exam findings and an impression), entered through the UI.
 */
export function scriptedCase(k){
  const ex = REG[k].example;
  return { region:k, side: ['cervical', 'lumbar'].includes(k) ? 'M' : 'L', primary: ex.primary, conf: ex.conf || 'Moderate', secondary: [], state: ex.state };
}

/** Data-driven cases for one region: gates, clusters, red flags, and seeded random states. */
export function generatedCases(k, fuzzCount = 200){
  const cases = [];
  const one = (state, D = noDx(), side = 'L', referral = false) => cases.push({ regions:[k], states:{ [k]: state }, D, side, referral });
  // Each history gate (AND-group) of every gated, costly-to-miss condition, history only.
  for (const c of REG[k].conditions) for (const g of c.gate || []) one(Object.fromEntries(g.map(f => [f, present(k, f)])));
  // Each cluster: all positive, all negative, first half positive.
  for (const cl of REG[k].clusters){
    one(Object.fromEntries(cl.items.map(f => [f, present(k, f)])));
    one(Object.fromEntries(cl.items.filter(f => isTri(k, f)).map(f => [f, 'neg'])));
    one(Object.fromEntries(cl.items.slice(0, Math.ceil(cl.items.length / 2)).map(f => [f, present(k, f)])));
  }
  // Each red flag alone, and the screened-negative state.
  for (const f of REG[k].findings.filter(f => f[1] === 'rf')) one({ [f[0]]: true }, noDx(), 'L', true);
  one({ rf_screened: true });
  one({});
  // The built-in example with each confidence level.
  for (const conf of ['Low', 'Moderate', 'High']){
    const ex = REG[k].example;
    one({ ...ex.state }, { raw:`${k}:${ex.primary}`, rk:k, id:ex.primary, other:'', conf, secondary:[] });
  }
  // Seeded random states with random impressions and sides.
  const r = rng(seedOf(k));
  for (let i = 0; i < fuzzCount; i++) one(randomState(r, k), dxFor(r, [k]), pick(r, ['', 'L', 'R', 'B', 'M']), r() < 0.3);
  return cases;
}

/** Two-region cases (primary + secondary region), impression in either region. */
export const PAIRS = [['shoulder', 'cervical'], ['knee', 'hip'], ['elbow', 'wrist'], ['lumbar', 'hip'], ['ankle', 'knee']];
export function pairCases(pair, count = 40){
  const r = rng(seedOf(pair.join('+')));
  return Array.from({ length: count }, () => ({
    regions: pair, states: Object.fromEntries(pair.map(k => [k, randomState(r, k)])),
    D: dxFor(r, pair), side: pick(r, ['L', 'R', 'B', 'M']), referral: r() < 0.3
  }));
}

/** Random ROM and MMT rows with random measurement contexts. */
export function measureCases(count = 400){
  const r = rng(seedOf('measures'));
  const deg = () => { const x = r(); return x < 0.2 ? '' : x < 0.23 ? '-' : x < 0.26 ? 'abc' : String(Math.round(r() * 220 - 20)); };
  const out = [];
  for (let i = 0; i < count; i++){
    const k = pick(r, ORDER);
    const def = pick(r, ROMDEF[k]);
    const custom = r() < 0.15;
    const rom = { m: custom ? pick(r, ['', 'Hip IR (seated)']) : def[0], norm: custom ? pick(r, ['', '0', '40']) : String(pick(r, [def[1], def[1], 0, ''])), mid: !custom && !!def[2] && r() < 0.8,
      aL: deg(), aR: deg(), pL: deg(), pR: deg(), ef: pick(r, ENDFEEL), pain: r() < 0.2, prior: deg() };
    if (custom) rom.custom = true;
    const mdef = pick(r, MMTDEF[k]);
    const mmt = { m: mdef[0], mid: !!mdef[1] && r() < 0.8, L: pick(r, GRADES), R: pick(r, GRADES), prior: pick(r, GRADES), pain: r() < 0.2 };
    const ctx = { side: pick(r, ['', 'L', 'R', 'B', 'M']), thrWnl: pick(r, ['10', '10', '5', '20', '', 'x']), thrBil: pick(r, ['10', '10', '15', '0', '']), reeval: r() < 0.5 };
    out.push({ rom, mmt, ctx });
  }
  return out;
}
