/**
 * Live differential panel (prototype renderLive), without the student star
 * rating. "Coaching notes" is renamed "Clinical reasoning notes" (SPEC §9.6),
 * and the red-flag alert uses the red-flag prompt text from Settings (P5).
 */
import { REG, INDEX } from '../engine/registry.js';
import { dxName } from '../engine/engine.js';
import { measureFlags } from '../engine/measures.js';
import { esc } from './dom.js';

const DMIN = -3, DMAX = 6;
const pctBar = x => (Math.max(DMIN, Math.min(DMAX, x)) - DMIN) / (DMAX - DMIN) * 100;

function ladder(r, A){
  const id = r.c.id;
  const tags = (id === A.dx.primary ? '<span class="tag you">Your impression</span>' : '') + (A.dx.secondary.includes(id) ? '<span class="tag sec">Also considering</span>' : '') +
    (r.capped ? '<span class="tag warn">Needs confirmation</span>' : '') + (r.c.miss === 'high' && r.tested < Math.min(2, r.keys.length) ? '<span class="tag bad">Rule out</span>' : '');
  const zones = [-1.1, 0.4, 1.1, 2.3].map(z => `<span class="z" style="left:${pctBar(z)}%"></span>`).join('');
  return `<li class="lrow"><div class="ln">${esc(r.c.name)} ${tags}</div>
    <div class="track" role="img" aria-label="${esc(r.c.name)}: ${r.band.label}">${zones}<span class="bar" style="width:${Math.max(pctBar(r.net), 2)}%;background:${r.band.color}"></span></div>
    <div class="lmeta">${r.band.label}. Key findings assessed: ${r.tested} of ${r.keys.length}</div></li>`;
}

/**
 * Render the panel.
 * @param {HTMLElement} host
 * @param {object[]} AS analyses
 * @param {object} note snapshot from collectNote()
 * @param {object} ctx measurement context
 * @param {object} settings
 */
export function renderPanel(host, AS, note, ctx, settings){
  const D = note.dx;
  if (!AS.length){ host.innerHTML = '<div class="live-empty"><h2>Differential</h2><p>Choose a body region, then enter history and findings. The differential, cluster results, and suggested tests update as you go.</p></div>'; return; }
  let h = `<h2 class="live-h">Differential <small>updates as you enter findings</small></h2>`;
  const rf = AS.flatMap(A => A.redflags.map(f => f[3]));
  if (rf.length) h += `<div class="alert bad"><strong>Red flag${rf.length > 1 ? 's' : ''} entered</strong><ul>${rf.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p>${esc(settings.prompts.redFlag.text)}</p></div>`;
  const plan = D.rk && INDEX[D.rk]?.CMAP[D.id]?.plan;
  if (plan) h += `<div class="alert note"><strong>Plan pointer: ${esc(dxName(D))}</strong><p>${esc(plan)}</p></div>`;
  AS.forEach(A => {
    h += `<section class="lreg"><h3>${esc(REG[A.key].label)}</h3>`;
    if (!A.any){ h += '<p class="muted" style="margin:0">No findings entered yet.</p></section>'; return; }
    const rows = A.results.filter(r => A.cand.has(r.c.id)).slice(0, 7);
    h += rows.length ? `<ol class="ladder">${rows.map(r => ladder(r, A)).join('')}</ol>` : '<p class="muted">Nothing has enough support yet. Keep entering findings.</p>';
    const cls = A.clusters.filter(x => x.res || x.tested > 0);
    if (cls.length) h += '<h4>Clusters and prediction rules</h4>' + cls.map(x => `<div class="cl ${x.res ? x.res.tone : ''}"><strong>${esc(x.cl.name)}</strong><br>${x.res ? esc(x.res.text) : `${x.pos} of ${x.cl.items.length} positive, ${x.tested} assessed.`}</div>`).join('');
    if (A.next.length) h += '<h4>Tests that would sharpen this</h4>' + A.next.slice(0, 5).map(n => `<button type="button" class="nt" data-goto="${A.key}__${n.fid}">${esc(n.label)}<span>Informs ${esc([...new Set(n.reasons)].slice(0, 3).join('; '))}</span></button>`).join('');
    if (A.setAside.length) h += `<p class="note-s" style="margin-top:8px">Set aside by history (no supporting mechanism or complaint): ${esc(A.setAside.join('; '))}.</p>`;
    if (A.notes.length) h += `<details class="coach"${A.notes.some(n => n.tone === 'bad') ? ' open' : ''}><summary>Clinical reasoning notes (${A.notes.length})</summary>${A.notes.map(n => `<div class="coach-item ${n.tone}"><strong>${esc(n.h)}</strong>${esc(n.p)}</div>`).join('')}</details>`;
    const M = measureFlags(note.rom[A.key] || [], note.mmt[A.key] || [], ctx);
    if (M.rom.length || M.mmt.length) h += '<h4>Measurement flags</h4>' + [...M.rom, ...M.mmt].map(x => `<div class="cl bad">${esc(x)}</div>`).join('');
    h += '</section>';
  });
  host.innerHTML = h;
}
