/**
 * EMR paste text (SPEC §4): the prototype's fullText()/fullTextMd() and their
 * helpers, built from a note snapshot instead of the DOM. Line wording, the
 * condensed filters, and the Markdown layout are unchanged.
 *
 * Differences from the prototype (SPEC §9): no student evaluator line; the
 * PDF-pointer line comes from Settings; the evaluator comes from the note's
 * Evaluator field (defaulted from Settings).
 *
 * No DOM access: callers pass plain data.
 */
import { REG } from '../engine/registry.js';
import { findingLists, redFlagFindings } from '../engine/engine.js';
import { num, romFlags, mmtFlags } from '../engine/measures.js';
import { draftAssessment } from './assessment-draft.js';
import { fmtDate, fmtTime } from './format.js';

/** Default PDF-pointer line (prototype wording). */
export const DEFAULT_PDF_POINTER = 'Full evaluation (all ROM/MMT values, special tests including negatives, clusters and differential) in the attached PDF.';

/**
 * @typedef {object} EmrOptions
 * @property {'md'|'txt'} [format] Markdown (default) or plain text
 * @property {'cond'|'full'} [length] condensed (default) or full
 * @property {boolean} [includeNeg] include non-tender areas and negative tests
 * @property {string} [pdfPointer] line pointing to the attached PDF (condensed only)
 */

/** Build the text-generation context for one note and option set. */
function makeCtx(note, AS, opts){
  const reeval = note.encounter.type === 'Re-evaluation';
  return {
    note, AS, reeval,
    cond: (opts.length || 'cond') !== 'full',
    md: (opts.format || 'md') !== 'txt',
    incNeg: !!opts.includeNeg,
    pointer: opts.pdfPointer == null ? DEFAULT_PDF_POINTER : String(opts.pdfPointer).trim(),
    mctx: { side: note.encounter.side, thrWnl: note.thr.wnl, thrBil: note.thr.bil, reeval },
  };
}

const findings = (C, k, secIds) => findingLists(k, C.note.states[k] || {}, secIds);
const secTitle = (k, id) => (REG[k].sections.find(s => s.id === id) || {}).title || id;
const notesOf = (C, k) => C.note.notes[k] || {obs:'', palp:'', neuro:''};
const romRows = (C, k) => C.note.rom[k] || [];
const mmtRows = (C, k) => C.note.mmt[k] || [];

/** Short ROM flags for the paste text (prototype shortRomFlags). */
function shortRomFlags(C, r){
  const g = {}; const other = [];
  romFlags(r, C.mctx).flags.forEach(x => {
    if (x.x === 'Painful' || (x.t === 'ok' && !/since last/.test(x.x))) return;
    const m = x.x.match(/^(?:([LR]) )?(AROM|PROM) (\d+)% of (WNL|[LR])/);
    if (m){ const k = (m[1] ? m[1] + ' ' : '') + m[2]; (g[k] ||= {}); g[k][m[4] === 'WNL' ? 'w' : 'b'] = +m[3]; return; }
    other.push(x.x.replace(/PROM exceeds AROM by (\d+)°/, 'PROM>AROM $1°').replace(/ since last \(was [^)]*\)/, ' since last').replace(/ \(above\)/, ' (above WNL)'));
  });
  const parts = Object.entries(g).map(([k, v]) => v.w != null && v.b != null ? (v.w === v.b ? `${k} ${v.w}%` : `${k} ${v.w}% WNL/${v.b}% opp.`) : v.w != null ? `${k} ${v.w}% WNL` : `${k} ${v.b}% opp.`);
  return parts.concat(other);
}

/** Short MMT flags (prototype shortMmtFlags). */
function shortMmtFlags(C, r){
  return mmtFlags(r, C.mctx).flags.filter(x => x.t === 'bad' || x.t === 'up' || /since last/.test(x.x))
    .filter(x => !/^([LR] )?[0-5][+-]?\/5$/.test(x.x))
    .map(x => x.x.replace(/^([LR]) weaker than ([LR])$/, '$1 < $2'));
}
const romAbn = (C, r) => shortRomFlags(C, r).length > 0 || !!r.pain;
const mmtAbn = (C, r) => shortMmtFlags(C, r).length > 0 || !!r.pain;

function romText(C, k){
  const rows = romRows(C, k).filter(r => (['aL','aR','pL','pR'].some(f => num(r[f]) != null) || r.ef || r.pain) && (!C.cond || romAbn(C, r)));
  return rows.map(r => {
    const v = f => num(r[f]) == null ? '-' : num(r[f]);
    const vals = r.mid ? `AROM ${v('aL')}, PROM ${v('pL')}` : `AROM L ${v('aL')} / R ${v('aR')}, PROM L ${v('pL')} / R ${v('pR')}`;
    const fl = shortRomFlags(C, r);
    return `${r.m || 'Custom'}: ${vals}${num(r.norm) != null ? ` (WNL ${r.norm})` : ''}${r.ef ? `; end-feel ${r.ef.toLowerCase()}` : ''}${r.pain ? '; painful' : ''}${fl.length ? ` [${fl.join('; ')}]` : ''}`;
  });
}

function mmtText(C, k){
  return mmtRows(C, k).filter(r => (r.L || r.R || r.pain) && (!C.cond || mmtAbn(C, r))).map(r => {
    const vals = r.mid ? `${r.L || '-'}/5` : `L ${r.L || '-'}/5, R ${r.R || '-'}/5`;
    const fl = shortMmtFlags(C, r);
    return `${r.m || 'Custom'}: ${vals}${r.pain ? ', painful' : ''}${fl.length ? ` [${fl.join('; ')}]` : ''}`;
  });
}

function reevalLines(C){
  if (!C.reeval) return [];
  const R = C.note.reeval; const L = [];
  const head = [R.visit && `Visit ${R.visit}`, R.last && `last evaluated ${fmtDate(R.last)}`, R.dx && `for ${R.dx}`].filter(Boolean).join(', ');
  if (head) L.push(`Re-evaluation: ${head}.`);
  const st = R.status, ad = R.adherence;
  if (st || ad) L.push([st && `Status since last visit: ${st.toLowerCase()}`, ad && `home program adherence: ${ad.toLowerCase()}`].filter(Boolean).join('; ') + '.');
  if (R.resp) L.push(`Interval history: ${R.resp}`);
  return L;
}

/** Subjective lines (prototype textS). */
function textS(C){
  const S = C.note.subj; const L = reevalLines(C);
  if (S.cc) L.push(`Chief complaint: ${S.cc}`);
  if (S.hpi) L.push(`HPI/MOI: ${S.hpi}`);
  const on = S.onset; const doi = C.note.encounter.doi;
  if (on || doi) L.push([on && `Onset: ${on.toLowerCase()}`, doi && `Date of injury: ${fmtDate(doi)}`].filter(Boolean).join('. ') + '.');
  const p = [['now', S.pnow], ['best', S.pbest], ['worst', S.pworst]].filter(([, v]) => v !== '' && v != null).map(([w, v]) => `${v}/10 ${w}`);
  const q = S.quality || [];
  if (p.length || q.length) L.push(`Pain: ${[p.join(', '), q.length && `quality ${q.join(', ').toLowerCase()}`].filter(Boolean).join('; ')}.`);
  if (S.agg && !C.cond) L.push(`Aggravating: ${S.agg}`);
  if (S.ease && !C.cond) L.push(`Easing: ${S.ease}`);
  if (S.prior) L.push(`Prior history: ${S.prior}`);
  if (S.func && !C.cond) L.push(`Function/goals: ${S.func}`);
  C.note.regions.forEach(k => {
    const h = findings(C, k, ['h']);
    if (h.pos.length && !C.cond) L.push(`History findings (${REG[k].noun}): ${h.pos.join('; ')}.`);
    const st = C.note.states[k] || {};
    const rf = redFlagFindings(k, st).map(f => f[3]);
    if (rf.length) L.push(`RED FLAGS (${REG[k].noun}): ${rf.join('; ')}.`);
    else if (st.rf_screened) L.push(`Red flag screen (${REG[k].noun}): negative.`);
  });
  return L.join('\n');
}

/** Plain-text Objective (prototype textO). */
function textO(C){
  const L = []; const rs = C.note.regions;
  rs.forEach(k => {
    const pre = rs.length > 1 ? `[${REG[k].label}] ` : ''; const N = notesOf(C, k);
    const o = findings(C, k, ['o']);
    if (o.pos.length || N.obs) L.push(`${pre}Observation: ${[o.pos.join('; '), N.obs].filter(Boolean).join('. ')}.`.replace(/\.\.$/, '.'));
    const p = findings(C, k, ['p']);
    if (p.pos.length || (C.incNeg && p.neg.length) || N.palp) L.push(`${pre}Palpation: ${[p.pos.length && `TTP ${p.pos.join('; ')}`, C.incNeg && p.neg.length && `non-tender ${p.neg.join('; ')}`, N.palp].filter(Boolean).join('. ')}.`.replace(/\.\.$/, '.'));
    const rom = romText(C, k); if (rom.length) L.push(`${pre}ROM (degrees):\n  ${rom.join('\n  ')}`);
    const mmt = mmtText(C, k); if (mmt.length) L.push(`${pre}MMT:\n  ${mmt.join('\n  ')}`);
    ['r','t','n'].forEach(id => {
      const f = findings(C, k, [id]);
      if (f.pos.length || (C.incNeg && f.neg.length)) L.push(`${pre}${secTitle(k, id)}: ${[f.pos.length && `Positive: ${f.pos.join('; ')}`, C.incNeg && f.neg.length && `Negative: ${f.neg.join('; ')}`].filter(Boolean).join('. ')}.`);
    });
    if (N.neuro) L.push(`${pre}Notes: ${N.neuro}`);
  });
  if (C.note.oMove) L.push(`Movement patterns: ${C.note.oMove}`);
  return L.join('\n');
}

/** Plan lines (prototype textP). */
function textP(C){
  const P = C.note.plan; const L = [];
  const st = P.status; if (st) L.push(`Activity status: ${st}${P.restrict ? ` (${P.restrict})` : ''}.`);
  else if (P.restrict) L.push(`Restrictions: ${P.restrict}.`);
  const tx = P.tx || []; if (tx.length) L.push(`Treatment provided: ${tx.join(', ').toLowerCase()}.`);
  if (P.txd) L.push(`Treatment details: ${P.txd}`);
  if (P.therex) L.push(`Therapeutic exercise: ${P.therex} program.`);
  if (P.ref){
    const rs = P.reasons || [];
    L.push(`Referral: ${P.ref}${P.urg ? `, ${P.urg.toLowerCase()}` : ''}.${rs.length ? ` Reason: ${rs.join('; ').toLowerCase()}.` : ''}`);
  }
  const cm = P.comm || []; if (cm.length) L.push(`Communication: ${cm.join('; ')}.`);
  if (P.fu) L.push(`Follow-up: ${fmtDate(P.fu)}.`);
  if (P.notes) L.push(P.notes);
  return L.join('\n');
}

/**
 * Assessment text: the (possibly edited) assessment box; condensed drops the
 * draft's evidence differential, cluster, deficit, and further-testing lines
 * (prototype assessText).
 */
function assessText(C){
  const a = C.note.assess.text || '';
  if (!C.cond) return a;
  const draft = draftAssessment(C.note, C.AS).split('\n');
  const clusterNames = C.AS.flatMap(A => A.clusters.filter(x => x.res).map(x => x.cl.name + ':'));
  const drop = new Set(draft.filter(l => /^(Evidence-supported differential|ROM deficits|Strength deficits|Further testing indicated)/.test(l) || clusterNames.some(n => l.startsWith(n))));
  return a.split('\n').filter(l => !drop.has(l)).join('\n');
}

const pdfPointer = C => (C.cond ? C.pointer : '');

function encTitle(type){
  return ({'Initial evaluation':'INJURY EVALUATION','Re-evaluation':'INJURY RE-EVALUATION','Sideline evaluation':'SIDELINE EVALUATION'})[type] || 'INJURY EVALUATION';
}

function where(C){
  const rs = C.note.regions;
  return [({L:'Left', R:'Right', B:'Bilateral', M:''})[C.note.encounter.side], rs.map(k => REG[k].noun).join(' and ')].filter(Boolean).join(' ');
}
function dateTime(C){
  const E = C.note.encounter;
  return E.doe ? `${fmtDate(E.doe)}${E.time ? ' ' + fmtTime(E.time) : ''}` : '';
}

/* ---------- Markdown ---------- */
function mdEsc(t){ return String(t ?? '').replace(/\|/g, '/').replace(/\n+/g, ' ').trim(); }
function mdLine(line){
  const t = line.trim(); if (!t) return '';
  const m = t.match(/^([^:]{1,70}):\s*(.*)$/);
  return m ? `- **${m[1]}:** ${m[2]}` : `- ${t}`;
}
function mdList(text){ return String(text || '').split('\n').map(mdLine).filter(Boolean).join('\n'); }
function mdTable(head, rows){
  return [`| ${head.join(' | ')} |`, `|${head.map(() => ' --- ').join('|')}|`, ...rows.map(r => `| ${r.map(c => mdEsc(c) || ' ').join(' | ')} |`)].join('\n');
}

/** Markdown Objective (prototype mdO). */
function mdO(C){
  const out = []; const rs = C.note.regions; const re = C.reeval;
  rs.forEach(k => {
    const blk = []; const items = []; const N = notesOf(C, k);
    const o = findings(C, k, ['o']);
    if (o.pos.length || N.obs) items.push(`- **Observation:** ${[o.pos.join('; '), N.obs].filter(Boolean).join('. ')}`);
    const p = findings(C, k, ['p']);
    if (p.pos.length) items.push(`- **Tender:** ${p.pos.join('; ')}`);
    if (C.incNeg && p.neg.length) items.push(`- **Non-tender:** ${p.neg.join('; ')}`);
    if (N.palp) items.push(`- **Palpation notes:** ${N.palp}`);
    if (items.length) blk.push(items.join('\n'));
    const romT = romRows(C, k).filter(r => (['aL','aR','pL','pR','prior'].some(f => num(r[f]) != null) || r.ef || r.pain) && (!C.cond || romAbn(C, r))).map(r => {
      const cell = romFlags(r, C.mctx).cell;
      const v = f => { const n = num(r[f]); if (n == null) return '-'; return cell[f] === 'bad' ? `**${n}**` : String(n); };
      const fl = shortRomFlags(C, r).join('; ');
      const base = [r.m || 'Custom', r.norm || '-'];
      const pr = re ? [num(r.prior) == null ? '-' : String(num(r.prior))] : [];
      const vals = r.mid ? [v('aL'), '', v('pL'), ''] : [v('aL'), v('aR'), v('pL'), v('pR')];
      return [...base, ...pr, ...vals, r.ef || '-', r.pain ? 'Yes' : 'No', fl || '-'];
    });
    if (romT.length) blk.push(`**Range of motion (degrees)** (% = of WNL and opposite side${C.cond ? '; abnormal motions only' : ''})\n\n` + mdTable(['Motion','WNL', ...(re ? ['Prior (inv.)'] : []), 'AROM L','AROM R','PROM L','PROM R','End-feel','Pain','Flags'], romT));
    const mmtT = mmtRows(C, k).filter(r => (r.L || r.R || r.pain || r.prior) && (!C.cond || mmtAbn(C, r))).map(r => {
      const F = mmtFlags(r, C.mctx); const g = f => r[f] ? (F.cell[f] ? `**${r[f]}/5**` : `${r[f]}/5`) : '-';
      const fl = shortMmtFlags(C, r).join('; ');
      return [r.m || 'Custom', ...(re ? [r.prior ? r.prior + '/5' : '-'] : []), g('L'), r.mid ? '' : g('R'), r.pain ? 'Yes' : 'No', fl || '-'];
    });
    if (mmtT.length) blk.push(`**Manual muscle testing**${C.cond ? ' (deficits only)' : ''}\n\n` + mdTable(['Motion', ...(re ? ['Prior (inv.)'] : []), 'L','R','Pain','Flags'], mmtT));
    const tests = [];
    ['r','t','n'].forEach(id => {
      const f = findings(C, k, [id]);
      if (f.pos.length || (C.incNeg && f.neg.length)){
        tests.push(`**${secTitle(k, id)}**\n\n` + [f.pos.length && `- **Positive:** ${f.pos.join('; ')}`, C.incNeg && f.neg.length && `- **Negative:** ${f.neg.join('; ')}`].filter(Boolean).join('\n'));
      }
    });
    if (tests.length) blk.push(tests.join('\n\n'));
    if (N.neuro) blk.push(`- **Notes:** ${N.neuro}`);
    if (blk.length) out.push((rs.length > 1 ? `***${REG[k].label}***\n\n` : '') + blk.join('\n\n'));
  });
  if (C.note.oMove) out.push(`- **Movement patterns:** ${C.note.oMove}`);
  return out.join('\n\n');
}

function fullTextMd(C){
  const w = where(C); const dt = dateTime(C);
  const meta = [dt && `**Date:** ${dt}`, w && `**Region:** ${w}`].filter(Boolean).join(' | ');
  const sec = (t, body) => `**${t}**\n\n${body && body.trim() ? body.trim() : 'Not documented.'}`;
  const ev = C.note.encounter.evaluator;
  const sig = ev ? `**Evaluator:** ${ev}` : '';
  const ptr = pdfPointer(C);
  return [`**${encTitle(C.note.encounter.type)} (SOAP)**` + (meta ? '  \n' + meta : ''), sec('SUBJECTIVE', mdList(textS(C))), sec('OBJECTIVE', mdO(C)), sec('ASSESSMENT', mdList(assessText(C))), sec('PLAN', mdList(textP(C))), ptr && `*${ptr}*`, sig].filter(Boolean).join('\n\n');
}

function fullTextPlain(C){
  const w = where(C); const dt = dateTime(C);
  const head = [`${encTitle(C.note.encounter.type)} (SOAP)`, [dt && `Date: ${dt}`, w && `Region: ${w}`].filter(Boolean).join(' | ')];
  const sec = (t, body) => `${t}\n${body && body.trim() ? body.trim() : 'Not documented.'}`;
  const ev = C.note.encounter.evaluator;
  const sig = ev ? `Evaluator: ${ev}` : '';
  return [head.filter(Boolean).join('\n'), sec('SUBJECTIVE', textS(C)), sec('OBJECTIVE', textO(C)), sec('ASSESSMENT', assessText(C)), sec('PLAN', textP(C)), pdfPointer(C), sig].filter(Boolean).join('\n\n');
}

/**
 * EMR paste text for a note.
 * Identifiers (name, DOB) are never included (SPEC §4).
 * @param {object} note snapshot from collectNote(), with assess.text set to the current assessment box
 * @param {object[]} AS analyses for note.regions
 * @param {EmrOptions} [opts]
 * @returns {string}
 */
export function buildEmrText(note, AS, opts = {}){
  const C = makeCtx(note, AS, opts);
  return C.md ? fullTextMd(C) : fullTextPlain(C);
}

/**
 * Character count against a limit (prototype countChars; amber at ≥ 90% per SPEC §4).
 * @param {number} n characters
 * @param {number} limit
 * @returns {{text:string, level:''|'near'|'over'}}
 */
export function charCount(n, limit){
  const L = limit.toLocaleString('en-US'); const over = n - limit;
  return {
    text: over > 0 ? `${n.toLocaleString('en-US')} characters: ${over.toLocaleString('en-US')} over the ${L} limit` : `${n.toLocaleString('en-US')} / ${L} characters`,
    level: over > 0 ? 'over' : n >= limit * 0.9 ? 'near' : '',
  };
}

/** Parse a character limit, falling back when blank or not positive (prototype hrLimit). */
export function parseLimit(v, fallback = 5000){ const n = num(v); return n && n > 0 ? n : fallback; }
