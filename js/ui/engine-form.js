/**
 * Engine-driven form sections: red flags, history, observation, palpation,
 * ROM/strength findings, special tests, and neuro screen (prototype engineHTML),
 * plus the per-region notes boxes and the Evidence disclosure.
 */
import { REG } from '../engine/registry.js';
import { VIDEOS } from '../engine/videos.js';
import { SRC } from '../engine/sources.js';
import { fmt } from '../engine/evidence.js';
import { evidenceFor } from '../engine/engine.js';
import { EVIDENCE_REVIEWED } from '../engine/meta.js';
import { esc } from './dom.js';

/**
 * HTML for the given sections of a region.
 * @param {string} k region key
 * @param {string[]} ids section ids, e.g. ['h','rf']
 */
export function engineHTML(k, ids){
  const R = REG[k];
  let h = '';
  R.sections.filter(s => ids.includes(s.id)).forEach(s => {
    h += `<div class="esec"><h4>${esc(s.title)}</h4><p class="intro">${esc(s.intro)}</p>`;
    const items = R.findings.filter(f => f[1] === s.id);
    const subs = [...new Set(items.map(f => f[2]))];
    subs.forEach(sub => {
      if (sub) h += `<h5 class="sub">${esc(sub)}</h5>`;
      const group = items.filter(f => f[2] === sub);
      if (s.kind === 'check'){
        h += '<div class="checks">';
        if (s.id === 'rf' && sub === subs[0]) h += `<label class="chk clear"><input type="checkbox" data-reg="${k}" data-fid="rf_screened"> Screened: no red flags present</label>`;
        group.forEach(f => h += `<label class="chk${s.id === 'rf' ? ' flag' : ''}"><input type="checkbox" data-reg="${k}" data-fid="${f[0]}"> <span>${esc(f[3])}</span></label>`);
        h += '</div>';
      } else {
        group.forEach(f => {
          const n = `${k}__${f[0]}`;
          const vid = VIDEOS[k + ':' + f[0]];
          const video = vid ? ` <a class="info" href="${esc(vid)}" target="_blank" rel="noopener noreferrer" title="Opens YouTube in a new tab. Needs an internet connection." aria-label="Video: ${esc(f[3])} (opens in a new tab; needs an internet connection)">Video</a>` : '';
          h += `<div class="tri" data-row="${n}"><div class="lbl"><span id="${n}_l">${esc(f[3])}</span> <button type="button" class="info" data-reg="${k}" data-ev="${f[0]}" aria-expanded="false" aria-label="Evidence for ${esc(f[3])}">Evidence</button>${video}${f[4] ? `<span class="hint">${esc(f[4])}</span>` : ''}</div>
            <div class="seg" role="radiogroup" aria-labelledby="${n}_l">
              <input type="radio" id="${n}_0" name="${n}" value="" checked data-reg="${k}" data-tri="${f[0]}"><label for="${n}_0">Not done</label>
              <input type="radio" id="${n}_p" name="${n}" value="pos" data-reg="${k}" data-tri="${f[0]}"><label for="${n}_p">${esc(s.pos)}</label>
              <input type="radio" id="${n}_n" name="${n}" value="neg" data-reg="${k}" data-tri="${f[0]}"><label for="${n}_n">${esc(s.neg)}</label>
            </div></div>`;
        });
      }
    });
    h += '</div>';
  });
  return h;
}

/** A per-region notes box (observation, palpation, or special test/neuro notes). */
export function noteHTML(k, field, label, value){
  return `<label class="f full note-box">${esc(label)}<textarea rows="2" data-note="${k}|${field}">${esc(value)}</textarea></label>`;
}

/** Evidence disclosure contents for one finding (same text as the prototype's evidenceText). */
export function evidenceHTML(k, fid){
  const lines = evidenceFor(k, fid).map(e => {
    let t = `<strong>${esc(e.condition)}</strong>: `;
    if (e.se != null) t += `sens ${Math.round(e.se*100)}%, spec ${Math.round(e.sp*100)}%, `;
    t += `+LR ${fmt(e.p)}${e.capped ? ' (capped)' : ''}`;
    if (e.n) t += `, −LR ${fmt(e.n)}`;
    t += ` <span class="src">${esc(SRC[e.source].split('(')[0].trim())}</span>`;
    return `<p>${t}</p>`;
  });
  if (!lines.length) lines.push('<p>Not weighted for any condition yet.</p>');
  const foot = EVIDENCE_REVIEWED ? 'Values from the cited literature, reviewed by the maintainer. Expert weights are reasoning weights, not published likelihood ratios.' : 'Values are drafts from the cited literature; verify before teaching use.';
  return lines.join('') + `<p class="src">${foot}</p>`;
}
