/**
 * ROM and MMT tables (prototype romHTML/mmtHTML and row refresh). Flags come
 * from js/engine/measures.js with the note's side, thresholds, and encounter type.
 */
import { romFlags, mmtFlags, ENDFEEL, GRADES } from '../engine/measures.js';
import { esc, chips } from './dom.js';

/** One ROM row. */
export function romRowHTML(k, r, i, ctx){
  const id = `${k}|${i}`; const F = romFlags(r, ctx);
  const label = r.m || 'Custom motion';
  const names = {norm:'WNL', prior:'prior AROM', aL:'AROM left', aR:'AROM right', pL:'PROM left', pR:'PROM right'};
  const inp = f => `<input class="num ${F.cell[f] || ''}" inputmode="decimal" data-rom="${id}|${f}" value="${esc(r[f] ?? '')}" aria-label="${esc(label + ' ' + (r.mid && f === 'aL' ? 'AROM' : r.mid && f === 'pL' ? 'PROM' : names[f]))}">`;
  const motion = r.custom ? `<input class="txt" data-rom="${id}|m" value="${esc(r.m)}" placeholder="Motion or movement" aria-label="Custom motion name">` : esc(r.m);
  const cells = r.mid ? `<td colspan="2">${inp('aL')}</td><td colspan="2">${inp('pL')}</td>` : `<td>${inp('aL')}</td><td>${inp('aR')}</td><td>${inp('pL')}</td><td>${inp('pR')}</td>`;
  const ef = `<select data-rom="${id}|ef" aria-label="${esc(label)} end-feel">${ENDFEEL.map(e => `<option${r.ef === e ? ' selected' : ''}>${e}</option>`).join('')}</select>`;
  return `<tr class="${r.custom ? 'custom' : ''}" data-romrow="${id}"><th scope="row">${motion}</th><td>${inp('norm')}</td><td class="prior">${inp('prior')}</td>${cells}<td>${ef}</td><td class="c"><input type="checkbox" data-rom="${id}|pain"${r.pain ? ' checked' : ''} aria-label="${esc(label)} painful"></td><td class="fl" data-romflag="${id}">${chips(F.flags)}</td></tr>`;
}

/** ROM table for a region. */
export function romHTML(k, rows, ctx){
  return `<div class="esec"><h4>Range of motion (degrees)</h4><p class="intro">WNL defaults are AAOS adult norms; edit any value. Spine flexion and extension take a single measurement. Shaded rows are for any other motion; enter a WNL to get a percentage.</p>
  <div class="tscroll"><table class="mt"><thead><tr><th scope="col">Motion</th><th scope="col">WNL</th><th scope="col" class="prior">Prior AROM (inv.)</th><th scope="col">AROM L</th><th scope="col">AROM R</th><th scope="col">PROM L</th><th scope="col">PROM R</th><th scope="col">End-feel</th><th scope="col">Pain</th><th scope="col">Flags</th></tr></thead>
  <tbody data-romtable="${k}">${rows.map((r, i) => romRowHTML(k, r, i, ctx)).join('')}</tbody></table></div>
  <div class="row"><button class="btn small" type="button" data-action="addrom" data-reg="${k}">Add ROM row</button></div></div>`;
}

/** One MMT row. */
export function mmtRowHTML(k, r, i, ctx){
  const id = `${k}|${i}`; const F = mmtFlags(r, ctx);
  const label = r.m || 'Custom';
  const names = {prior:'prior grade', L:r.mid ? 'grade' : 'left', R:'right'};
  const sel = f => `<select class="${F.cell[f] || ''}" data-mmt="${id}|${f}" aria-label="${esc(label + ' ' + names[f])}">${GRADES.map(g => `<option${r[f] === g ? ' selected' : ''}>${g}</option>`).join('')}</select>`;
  const motion = r.custom ? `<input class="txt" data-mmt="${id}|m" value="${esc(r.m)}" placeholder="Muscle or motion" aria-label="Custom muscle">` : esc(r.m);
  const cells = `<td class="prior">${sel('prior')}</td>` + (r.mid ? `<td colspan="2">${sel('L')}</td>` : `<td>${sel('L')}</td><td>${sel('R')}</td>`);
  return `<tr class="${r.custom ? 'custom' : ''}"><th scope="row">${motion}</th>${cells}<td class="c"><input type="checkbox" data-mmt="${id}|pain"${r.pain ? ' checked' : ''} aria-label="${esc(label)} pain with resistance"></td><td class="fl" data-mmtflag="${id}">${chips(F.flags)}</td></tr>`;
}

/** MMT table for a region. */
export function mmtHTML(k, rows, ctx){
  return `<div class="esec"><h4>Manual muscle testing (0–5)</h4>
  <div class="tscroll"><table class="mt"><thead><tr><th scope="col">Motion</th><th scope="col" class="prior">Prior (inv.)</th><th scope="col">L</th><th scope="col">R</th><th scope="col">Pain</th><th scope="col">Flags</th></tr></thead>
  <tbody data-mmttable="${k}">${rows.map((r, i) => mmtRowHTML(k, r, i, ctx)).join('')}</tbody></table></div>
  <div class="row"><button class="btn small" type="button" data-action="addmmt" data-reg="${k}">Add strength row</button></div></div>`;
}

/** Update a ROM row's flag chips and cell highlighting in place. */
export function refreshRomRow(k, i, r, ctx){
  const F = romFlags(r, ctx);
  const td = document.querySelector(`[data-romflag="${k}|${i}"]`); if (td) td.innerHTML = chips(F.flags);
  ['aL','aR','pL','pR'].forEach(f => { const inp = document.querySelector(`[data-rom="${k}|${i}|${f}"]`); if (inp){ inp.classList.remove('bad','warn'); if (F.cell[f]) inp.classList.add(F.cell[f]); } });
}

/** Update an MMT row's flag chips and cell highlighting in place. */
export function refreshMmtRow(k, i, r, ctx){
  const F = mmtFlags(r, ctx);
  const td = document.querySelector(`[data-mmtflag="${k}|${i}"]`); if (td) td.innerHTML = chips(F.flags);
  ['L','R'].forEach(f => { const s = document.querySelector(`[data-mmt="${k}|${i}|${f}"]`); if (s){ s.classList.remove('bad'); if (F.cell[f]) s.classList.add(F.cell[f]); } });
}
