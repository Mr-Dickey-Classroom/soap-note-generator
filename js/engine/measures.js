/**
 * ROM and MMT measurement logic: defaults, flag rules, and re-evaluation change.
 *
 * Data (ROMDEF, MMTDEF, GRADES, GVAL, ENDFEEL) and the flag functions are verbatim
 * from reference/soap-note-generator-v8.html. The prototype read the involved
 * side, the WNL thresholds, and the encounter type from the DOM through side(),
 * thr(), and isReeval(); here those read a context object passed by the caller.
 *
 * No DOM access.
 */

/* ROM norms: AAOS adult values (editable per row). [motion, norm, singleMeasure] */
export const ROMDEF = {
  cervical:[['Flexion',45,1],['Extension',45,1],['Lateral flexion',45],['Rotation',60]],
  shoulder:[['Flexion',180],['Extension',60],['Abduction',180],['External rotation (90° abd)',90],['Internal rotation (90° abd)',70],['Horizontal adduction',135]],
  elbow:[['Flexion',150],['Extension',0],['Supination',80],['Pronation',80]],
  wrist:[['Flexion',80],['Extension',70],['Radial deviation',20],['Ulnar deviation',30],['Supination',80],['Pronation',80]],
  lumbar:[['Flexion',60,1],['Extension',25,1],['Lateral flexion',25],['Rotation',30]],
  hip:[['Flexion',120],['Extension',30],['Abduction',45],['Adduction',30],['External rotation',45],['Internal rotation',45]],
  knee:[['Flexion',135],['Extension',0]],
  ankle:[['Dorsiflexion',20],['Plantarflexion',50],['Inversion',35],['Eversion',15]]
};
export const MMTDEF = {
  cervical:[['Neck flexion',1],['Neck extension',1],['Lateral flexion'],['Rotation'],['C5 shoulder abduction'],['C6 elbow flexion / wrist ext'],['C7 elbow ext / wrist flexion'],['C8 thumb ext / finger flexion'],['T1 finger abduction']],
  shoulder:[['Flexion'],['Abduction'],['Scaption (empty can)'],['External rotation'],['Internal rotation'],['Extension']],
  elbow:[['Elbow flexion'],['Elbow extension'],['Supination'],['Pronation'],['Wrist flexion'],['Wrist extension']],
  wrist:[['Wrist flexion'],['Wrist extension'],['Radial deviation'],['Ulnar deviation'],['Finger abduction'],['Thumb opposition']],
  lumbar:[['L2 hip flexion'],['L3 knee extension'],['L4 ankle dorsiflexion'],['L5 great toe extension'],['S1 ankle PF / eversion']],
  hip:[['Flexion'],['Extension'],['Abduction'],['Adduction'],['External rotation'],['Internal rotation']],
  knee:[['Knee flexion'],['Knee extension'],['Hip abduction'],['Hip extension']],
  ankle:[['Dorsiflexion'],['Plantarflexion'],['Inversion'],['Eversion'],['Great toe extension']]
};
export const GRADES = ['','5','4+','4','4-','3+','3','3-','2+','2','2-','1','0'];
export const GVAL = {'5':5,'4+':4.67,'4':4,'4-':3.67,'3+':3.33,'3':3,'3-':2.67,'2+':2.33,'2':2,'2-':1.67,'1':1,'0':0};
export const ENDFEEL = ['','Normal','Capsular','Bony','Springy block','Empty','Muscle spasm','Boggy','Soft tissue approximation'];

/** Parse a measurement as a number, or null when blank or not numeric (verbatim). */
export function num(v){ if (v === '' || v == null) return null; const n = Number(String(v).replace(/[^\d.\-]/g,'')); return Number.isFinite(n) && String(v).trim() !== '-' ? n : null; }

/**
 * @typedef {{side?:string, thrWnl?:number|string|null, thrBil?:number|string|null, reeval?:boolean}} MeasureContext
 *   side: involved side "L" | "R" | "B" | "M"; thrWnl: % below WNL that flags (default 10);
 *   thrBil: % below the uninvolved side that flags (default 10); reeval: encounter is a re-evaluation.
 */
/** @type {MeasureContext} */
let CTX = {};
function withCtx(ctx, fn){ const prev = CTX; CTX = ctx || {}; try { return fn(); } finally { CTX = prev; } }
function side(){ return CTX.side || ''; }
function thr(id, d){ const n = num(id === 'thr_wnl' ? CTX.thrWnl : id === 'thr_bil' ? CTX.thrBil : null); return n == null ? d : n; }
function isReeval(){ return !!CTX.reeval; }

/* ---------- verbatim flag logic ---------- */
function romFlags(r){
  const out = []; const T = thr('thr_wnl',10), B = thr('thr_bil',10);
  const norm = num(r.norm); const inv = side(); const oth = inv === 'L' ? 'R' : inv === 'R' ? 'L' : null;
  const sides = r.mid ? [['', 'L']] : [['L','L'],['R','R']];
  const meas = [['AROM','a'],['PROM','p']];
  const cell = {};
  for (const [mt, pre] of meas){
    for (const [lab, key] of sides){
      const v = num(r[pre + key]); if (v == null) continue;
      const who = (lab ? lab + ' ' : '') + mt;
      if (norm != null && norm > 0){
        const p = Math.round(v / norm * 100);
        if (p < 100 - T){ out.push({t:'bad', x:`${who} ${p}% of WNL`}); cell[pre+key] = 'bad'; }
        else if (p > 115){ out.push({t:'warn', x:`${who} ${p}% of WNL (above)`}); cell[pre+key] = 'warn'; }
        else if (pre === 'a' && (!oth || key === inv || r.mid)) out.push({t:'ok', x:`${who} ${p}%`});
      } else if (norm === 0){
        if (v < -5){ out.push({t:'bad', x:`${who} lacks ${-v}°`}); cell[pre+key] = 'bad'; }
        else if (v > 10){ out.push({t:'warn', x:`${who} hyperextends ${v}°`}); cell[pre+key] = 'warn'; }
      }
    }
    if (!r.mid && oth){
      const I = num(r[pre + inv]), U = num(r[pre + oth]);
      if (I != null && U != null){
        if (norm === 0){ if (U - I > 5){ out.push({t:'bad', x:`${inv} ${mt} ${U - I}° less than ${oth}`}); cell[pre+inv] = 'bad'; } }
        else if (U > 0){ const p = Math.round(I / U * 100); if (p < 100 - B){ out.push({t:'bad', x:`${inv} ${mt} ${p}% of ${oth}`}); cell[pre+inv] = 'bad'; } }
      }
    }
  }
  for (const [lab, key] of sides){
    const a = num(r['a'+key]), p = num(r['p'+key]);
    if (a != null && p != null && p - a >= 10) out.push({t:'warn', x:`${lab ? lab + ' ' : ''}PROM exceeds AROM by ${p - a}°`});
  }
  if (r.pain) out.push({t:'warn', x:'Painful'});
  const ch = romChange(r);
  if (ch) out.push(ch);
  return {flags:out, cell};
}
function invKey(r){ return r.mid ? 'L' : side() === 'R' ? 'R' : 'L'; }
function romChange(r){
  if (!isReeval()) return null;
  const pr = num(r.prior), now = num(r['a' + invKey(r)]);
  if (pr == null || now == null) return null;
  const d = now - pr; if (d === 0) return {t:'ok', x:'No change since last'};
  return {t: d > 0 ? 'up' : 'bad', x:`${d > 0 ? '+' : '−'}${Math.abs(d)}° since last (was ${pr})`};
}
function mmtChange(r){
  if (!isReeval() || !r.prior) return null;
  const now = r[invKey(r)]; if (!now) return null;
  const d = GVAL[now] - GVAL[r.prior];
  if (Math.abs(d) < 0.01) return {t:'ok', x:`No change since last (${r.prior}/5)`};
  return {t: d > 0 ? 'up' : 'bad', x:`${d > 0 ? 'Up' : 'Down'} from ${r.prior}/5`};
}
function mmtFlags(r){
  const out = []; const cell = {}; const inv = side(); const oth = inv === 'L' ? 'R' : inv === 'R' ? 'L' : null;
  const sides = r.mid ? [['', 'L']] : [['L','L'],['R','R']];
  for (const [lab, key] of sides){
    const g = r[key]; if (!g) continue;
    if (GVAL[g] < 5){ out.push({t:'bad', x:`${lab ? lab + ' ' : ''}${g}/5`}); cell[key] = 'bad'; }
  }
  if (!r.mid && oth && r[inv] && r[oth] && GVAL[r[inv]] < GVAL[r[oth]]){ out.push({t:'bad', x:`${inv} weaker than ${oth}`}); cell[inv] = 'bad'; }
  if (r.pain) out.push({t:'warn', x:'Pain with resistance'});
  const ch = mmtChange(r); if (ch) out.push(ch);
  return {flags:out, cell};
}

/* ---------- public API: same functions, context passed explicitly ---------- */
const withContext = fn => (r, ctx) => withCtx(ctx, () => fn(r));
const romFlagsAPI = withContext(romFlags);
const mmtFlagsAPI = withContext(mmtFlags);
const romChangeAPI = withContext(romChange);
const mmtChangeAPI = withContext(mmtChange);
const invKeyAPI = withContext(invKey);
export {
  /** @type {(row:object, ctx:MeasureContext) => {flags:{t:string,x:string}[], cell:Record<string,string>}} */
  romFlagsAPI as romFlags,
  /** @type {(row:object, ctx:MeasureContext) => {flags:{t:string,x:string}[], cell:Record<string,string>}} */
  mmtFlagsAPI as mmtFlags,
  /** @type {(row:object, ctx:MeasureContext) => {t:string,x:string}|null} */
  romChangeAPI as romChange,
  /** @type {(row:object, ctx:MeasureContext) => {t:string,x:string}|null} */
  mmtChangeAPI as mmtChange,
  invKeyAPI as invKey,
};
/** Verbatim internals, exported for the source-parity test only. */
export const _verbatim = { romFlags, mmtFlags, romChange, mmtChange, invKey };

/**
 * Default ROM rows for a region: the AAOS rows plus 3 blank custom rows
 * (prototype ensureRegion). normOverrides maps motion name -> norm (Settings).
 * @param {string} k region key
 * @param {Record<string, number|string>} [normOverrides]
 */
export function newRomRows(k, normOverrides = {}){
  return ROMDEF[k].map(([m, norm, mid]) => ({m, norm:String(normOverrides[m] ?? norm), mid:!!mid}))
    .concat([0,1,2].map(() => ({m:'', norm:'', custom:true})));
}

/**
 * Default MMT rows for a region plus 2 blank custom rows (prototype ensureRegion).
 * @param {string} k region key
 */
export function newMmtRows(k){
  return MMTDEF[k].map(([m, mid]) => ({m, mid:!!mid})).concat([0,1].map(() => ({m:'', custom:true})));
}

/**
 * Rows with "bad" flags, as "Motion: flag, flag" strings (prototype measureFlags).
 * @param {object[]} romRows
 * @param {object[]} mmtRows
 * @param {MeasureContext} ctx
 * @returns {{rom:string[], mmt:string[]}}
 */
export function measureFlags(romRows, mmtRows, ctx){
  return withCtx(ctx, () => {
    const rom = [], mmt = [];
    romRows.forEach(r => { const f = romFlags(r).flags.filter(x => x.t === 'bad'); if (f.length) rom.push(`${r.m || 'Custom'}: ${f.map(x => x.x).join(', ')}`); });
    mmtRows.forEach(r => { const f = mmtFlags(r).flags.filter(x => x.t === 'bad'); if (f.length) mmt.push(`${r.m || 'Custom'}: ${f.map(x => x.x).join(', ')}`); });
    return {rom, mmt};
  });
}
