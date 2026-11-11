/**
 * Auto-drafted assessment text (the prototype's draftA), built from a note
 * snapshot and its analyses instead of the DOM. Line wording is unchanged.
 */
import { REG, INDEX } from '../engine/registry.js';
import { dxName, sideWord } from '../engine/engine.js';
import { romChange, mmtChange, measureFlags } from '../engine/measures.js';
import { fmtDate } from './format.js';

const isReeval = note => note.encounter.type === 'Re-evaluation';
const measureCtx = note => ({ side: note.encounter.side, thrWnl: note.thr.wnl, thrBil: note.thr.bil, reeval: isReeval(note) });

/**
 * @param {object} note snapshot from collectNote()
 * @param {object[]} AS analyses for note.regions
 * @returns {string}
 */
export function draftAssessment(note, AS){
  const D = note.dx; const ctx = measureCtx(note);
  const L = []; const name = dxName(D);
  if (name){
    const where = [sideWord(note.encounter.side), D.rk ? REG[D.rk].noun : ''].filter(Boolean).join(' ');
    L.push(`Clinical impression${where ? ` (${where})` : ''}: ${name}${D.conf ? ` (clinician confidence ${D.conf.toLowerCase()})` : ''}.`);
  }
  const sec = D.secondary.map(s => { const [k, id] = s.split(':'); return INDEX[k]?.CMAP[id]?.name; }).filter(Boolean);
  if (sec.length) L.push(`Also considered: ${sec.join('; ')}.`);
  if (isReeval(note)){
    if (note.reeval.status) L.push(`Progress since last evaluation${note.reeval.last ? ` (${fmtDate(note.reeval.last)})` : ''}: ${note.reeval.status.toLowerCase()}.`);
    const prog = [];
    note.regions.forEach(k => {
      (note.rom[k] || []).forEach(r => { const c = romChange(r, ctx); if (c) prog.push(`${r.m || 'Custom'} ${c.x}`); });
      (note.mmt[k] || []).forEach(r => { const c = mmtChange(r, ctx); if (c) prog.push(`${r.m || 'Custom'} strength ${c.x.charAt(0).toLowerCase() + c.x.slice(1)}`); });
    });
    if (prog.length) L.push(`Objective change: ${prog.join('; ')}.`);
  }
  AS.forEach(A => {
    if (!A.any) return;
    const tag = AS.length > 1 ? ` (${REG[A.key].noun})` : '';
    if (A.redflags.length) L.push(`Red flags${tag}: ${A.redflags.map(f => f[3]).join('; ')}.`);
    if (A.sup.length) L.push(`Evidence-supported differential${tag}: ${A.sup.join('; ')}.`);
    if (A.ro.length) L.push(`Not yet ruled out${tag}: ${A.ro.join('; ')}.`);
    A.clusters.filter(x => x.res).forEach(x => L.push(`${x.cl.name}: ${x.res.text}`));
    const M = measureFlags(note.rom[A.key] || [], note.mmt[A.key] || [], ctx);
    if (M.rom.length) L.push(`ROM deficits: ${M.rom.map(x => x.split(':')[0]).join(', ')} (see ROM table).`);
    if (M.mmt.length) L.push(`Strength deficits: ${M.mmt.map(x => x.split(':')[0]).join(', ')} (see MMT table).`);
    if (A.next.length) L.push(`Further testing indicated${tag}: ${A.next.slice(0, 4).map(n => n.label).join('; ')}.`);
  });
  return L.join('\n');
}
