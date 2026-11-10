/**
 * Region registry: the prototype's REG and ORDER, plus the FMAP/CMAP lookups the
 * prototype built lazily in CACHE (precomputed here once).
 */
import { SHOULDER } from './regions/shoulder.js';
import { ANKLE } from './regions/ankle.js';
import { KNEE } from './regions/knee.js';
import { ELBOW } from './regions/elbow.js';
import { CERVICAL } from './regions/cervical.js';
import { LUMBAR } from './regions/lumbar.js';
import { HIP } from './regions/hip.js';
import { WRIST } from './regions/wrist.js';

/** Region definitions keyed by region key (same insertion order as the prototype). */
export const REG = {
  shoulder: SHOULDER,
  ankle: ANKLE,
  knee: KNEE,
  elbow: ELBOW,
  cervical: CERVICAL,
  lumbar: LUMBAR,
  hip: HIP,
  wrist: WRIST,
};

/** Display order of regions (verbatim). */
export const ORDER = ['cervical','shoulder','elbow','wrist','lumbar','hip','knee','ankle'];

/**
 * Per-region lookups: FMAP (finding id -> {id, sec, sub, label, hint}) and
 * CMAP (condition id -> condition). Same construction as the prototype's useRegion().
 * @type {Record<string, {FMAP: Record<string, {id:string, sec:string, sub:string|null, label:string, hint?:string}>, CMAP: Record<string, object>}>}
 */
export const INDEX = Object.fromEntries(Object.entries(REG).map(([k, R]) => [k, {
  FMAP:Object.fromEntries(R.findings.map(f => [f[0], {id:f[0], sec:f[1], sub:f[2], label:f[3], hint:f[4]}])),
  CMAP:Object.fromEntries(R.conditions.map(c => [c.id, c]))
}]));

/**
 * Impression choices for the given regions: conditions sorted by prior, highest
 * first (stable), as the prototype's buildImpression() lists them.
 * @param {string[]} regionKeys
 * @returns {{region:string, label:string, options:{value:string, name:string}[]}[]}
 */
export function impressionOptions(regionKeys){
  return regionKeys.filter(k => REG[k]).map(k => ({
    region:k, label:REG[k].label,
    options:REG[k].conditions.slice().sort((a, b) => b.prior - a.prior).map(c => ({value:`${k}:${c.id}`, name:c.name}))
  }));
}
