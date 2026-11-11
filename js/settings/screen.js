/**
 * Settings screen (SPEC §6). Every change saves immediately to local storage
 * and is broadcast to the Note screen through onSettingsChange().
 */
import { DEFAULTS } from './defaults.js';
import { getSettings, saveSettings, resetSettings, exportSettings, importSettings } from './store.js';
import { processLogo } from './logo.js';
import { contrast, themeTokens } from './theme.js';
import { REG, ORDER } from '../engine/registry.js';
import { ROMDEF } from '../engine/measures.js';
import { esc } from '../ui/dom.js';

/** Editable lists: key, label, help. */
const LISTS = [
  ['referralDestinations', 'Referral destinations', '"Directing physician" shows the physician name above when one is set.'],
  ['referralUrgency', 'Referral urgency'],
  ['referralReasonsPhysician', 'Referral reasons: physician', 'Shown for every destination except the physical therapy one.'],
  ['referralReasonsPT', 'Referral reasons: physical therapy'],
  ['treatments', 'Treatments'],
  ['therexPrograms', 'Therapeutic exercise programs', 'Each program is offered at every level below. Ships empty.'],
  ['therexLevels', 'Therapeutic exercise levels'],
  ['communication', 'Communication checklist'],
];
const PROMPTS = [
  ['redFlag', 'Red flag / emergency action plan', 'Shown in the differential panel and the plan when a red flag is checked.'],
  ['dislocation', 'Immediate referral for dislocations', 'Shown when the deformity or dislocation red flag is checked in the elbow, wrist, knee, ankle, or hip.'],
  ['referral', 'Notify the physician on referral', 'Shown when a referral is chosen.'],
];

let host = null;
let statusTimer = null;
let resetArmed = null;

const field = (key, label, attrs = '', hint = '') => {
  const s = getSettings();
  return `<label class="f">${esc(label)}${hint ? `<span class="hint">${esc(hint)}</span>` : ''}<input data-set="${key}" value="${esc(s[key])}" autocomplete="off" ${attrs}></label>`;
};
const area = (key, label, hint = '') => `<label class="f full">${esc(label)}${hint ? `<span class="hint">${esc(hint)}</span>` : ''}<textarea data-set="${key}" rows="2">${esc(getSettings()[key])}</textarea></label>`;
const check = (key, label) => `<label class="chk"><input type="checkbox" data-set="${key}"${getSettings()[key] ? ' checked' : ''}><span>${esc(label)}</span></label>`;
const seg = (key, legend, options) => {
  const v = getSettings()[key];
  return `<fieldset class="f"><legend>${esc(legend)}</legend><div class="seg" role="radiogroup" aria-label="${esc(legend)}">${options.map(([val, lab]) =>
    `<input type="radio" name="set_${key}" id="set_${key}_${val}" value="${val}" data-set="${key}"${v === val ? ' checked' : ''}><label for="set_${key}_${val}">${esc(lab)}</label>`).join('')}</div></fieldset>`;
};

function listHTML(key){
  const items = getSettings()[key];
  const [, label, help] = LISTS.find(l => l[0] === key);
  const rows = items.map((x, i) => `<li><input data-li="${key}|${i}" value="${esc(x)}" aria-label="${esc(label)}, item ${i + 1}" autocomplete="off">
    <button class="btn small icon" type="button" data-lact="up" data-key="${key}" data-i="${i}" aria-label="Move ${esc(x)} up"${i === 0 ? ' disabled' : ''}>↑</button>
    <button class="btn small icon" type="button" data-lact="down" data-key="${key}" data-i="${i}" aria-label="Move ${esc(x)} down"${i === items.length - 1 ? ' disabled' : ''}>↓</button>
    <button class="btn small icon" type="button" data-lact="remove" data-key="${key}" data-i="${i}" aria-label="Remove ${esc(x)}">✕</button></li>`).join('');
  return `<div class="lst" data-list="${key}"><h4 id="lh_${key}">${esc(label)}</h4>${help ? `<p class="hint">${esc(help)}</p>` : ''}
    ${items.length ? `<ol aria-labelledby="lh_${key}">${rows}</ol>` : '<p class="empty small">No items yet.</p>'}
    <div class="row"><input class="add" data-add="${key}" aria-label="New item for ${esc(label)}" placeholder="Add an item" autocomplete="off">
    <button class="btn small" type="button" data-lact="add" data-key="${key}">Add</button>
    <button class="btn small" type="button" data-lact="reset" data-key="${key}">Reset to defaults</button></div></div>`;
}

function ptSelectHTML(){
  const s = getSettings();
  return `<label class="f" id="ptDestWrap">Destination that uses the physical therapy reasons<select data-set="ptDestination"><option value="">None</option>${s.referralDestinations.map(d => `<option${d === s.ptDestination ? ' selected' : ''}>${esc(d)}</option>`).join('')}</select></label>`;
}

function normsHTML(){
  const norms = getSettings().romNorms;
  return ORDER.map(k => {
    const ov = norms[k] || {}; const n = Object.keys(ov).length;
    return `<details class="norms" data-normreg="${k}"><summary>${esc(REG[k].label)}${n ? ` <span class="tag sec">${n} changed</span>` : ''}</summary>
      <table class="mt"><thead><tr><th scope="col">Motion</th><th scope="col">AAOS default</th><th scope="col">Your norm</th></tr></thead><tbody>
      ${ROMDEF[k].map(([m, d]) => `<tr><th scope="row">${esc(m)}</th><td>${d}°</td><td><input class="num" inputmode="decimal" data-norm="${k}|${esc(m)}" value="${ov[m] ?? ''}" placeholder="${d}" aria-label="${esc(REG[k].label)} ${esc(m)} norm"></td></tr>`).join('')}
      </tbody></table><div class="row"><button class="btn small" type="button" data-sact="resetNorms" data-reg="${k}">Reset ${esc(REG[k].label)} norms</button></div></details>`;
  }).join('');
}

function promptsHTML(){
  const p = getSettings().prompts;
  return PROMPTS.map(([k, label, help]) => `<div class="prompt-set">
    <label class="chk"><input type="checkbox" data-prompt="${k}|on"${p[k].on ? ' checked' : ''}><span>${esc(label)}</span></label>
    <label class="f full"><span class="hint">${esc(help)}</span><textarea rows="2" data-prompt="${k}|text" aria-label="${esc(label)} wording">${esc(p[k].text)}</textarea></label>
    <div class="row"><button class="btn small" type="button" data-sact="resetPrompt" data-key="${k}">Reset wording</button></div></div>`).join('');
}

function contrastHTML(){
  const s = getSettings();
  const t = themeTokens(s.brandColor, s.accentColor, 'light');
  const name = c => c === '#FFFFFF' ? 'white' : 'near-black';
  const r1 = contrast(t['--mast-ink'], t['--mast-bg']), r2 = contrast(t['--accent-ink'], t['--accent']);
  return `Text on the brand color: ${name(t['--mast-ink'])} (contrast ${r1.toFixed(1)}:1${r1 >= 4.5 ? ', passes AA' : ''}). Text on the accent color: ${name(t['--accent-ink'])} (${r2.toFixed(1)}:1${r2 >= 4.5 ? ', passes AA' : ''}).`;
}

function logoHTML(){
  const logo = getSettings().logo;
  return `<div class="logo-box">${logo ? `<img id="set_logo_preview" src="${logo}" alt="Logo preview">` : '<span class="muted">No logo</span>'}</div>
    <div class="row"><label class="btn small filebtn">Upload logo<input type="file" id="set_logo_file" accept="image/png,image/jpeg,image/svg+xml,.svg"></label>
    ${logo ? '<button class="btn small" type="button" data-sact="removeLogo">Remove logo</button>' : ''}</div>
    <p class="hint">PNG, JPG, or SVG. Stored as a PNG up to 512 px and 300 KB. Shown in the header, the PDF, and the browser tab.</p>`;
}

function render(){
  host.innerHTML = `
  <section class="sgroup" aria-labelledby="sg_brand"><h3 id="sg_brand">Branding</h3>
    <div class="fields">${field('appTitle', 'App title')}${field('orgName', 'Organization name')}${field('programLine', 'Program or department')}</div>
    <div class="fields two">
      <div class="f"><span>Logo</span><div id="set_logo">${logoHTML()}</div></div>
      <div class="f"><span>Colors</span>
        <div class="colors">
          <label class="color">Brand<input type="color" data-set="brandColor" value="${getSettings().brandColor.toLowerCase()}"><input class="hex" data-hex="brandColor" value="${getSettings().brandColor}" aria-label="Brand color hex" maxlength="7" autocomplete="off"></label>
          <label class="color">Accent<input type="color" data-set="accentColor" value="${getSettings().accentColor.toLowerCase()}"><input class="hex" data-hex="accentColor" value="${getSettings().accentColor}" aria-label="Accent color hex" maxlength="7" autocomplete="off"></label>
        </div>
        <p class="hint" id="set_contrast" aria-live="polite">${contrastHTML()}</p>
        <div class="row"><button class="btn small" type="button" data-sact="resetColors">Reset colors</button></div>
      </div>
    </div>
    ${seg('theme', 'Theme', [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']])}
  </section>

  <section class="sgroup" aria-labelledby="sg_clin"><h3 id="sg_clin">Clinician</h3>
    <div class="fields">${field('clinicianName', 'Name')}${field('clinicianCredentials', 'Credentials', '', 'For example: MS, LAT, ATC')}${field('licenseNumber', 'License number (optional)', '', 'Prints under the signature')}</div>
  </section>

  <section class="sgroup" aria-labelledby="sg_cl"><h3 id="sg_cl">Clinical</h3>
    <div class="fields">
      ${field('thrWnl', 'Flag ROM below WNL by more than (%)', 'inputmode="decimal"')}
      ${field('thrBil', 'Flag ROM below the uninvolved side by more than (%)', 'inputmode="decimal"')}
      ${field('physicianName', 'Directing or team physician', '', 'For example: Dr. Lee')}
    </div>
    <h4>ROM norms</h4><p class="hint">Leave blank to use the AAOS adult default. Applies to regions loaded after the change, and to rows whose WNL you haven't edited.</p>
    <div id="set_norms">${normsHTML()}</div>
    <div class="row"><button class="btn small" type="button" data-sact="resetNorms" data-reg="">Reset all ROM norms</button></div>
    <div class="lists">${LISTS.map(([k]) => listHTML(k)).join('')}</div>
    <div class="fields">${ptSelectHTML()}</div>
  </section>

  <section class="sgroup" aria-labelledby="sg_pp"><h3 id="sg_pp">Plan prompts</h3>
    <p class="hint">Match the wording to your standing orders. Turn a prompt off to hide it.</p>
    <div id="set_prompts">${promptsHTML()}</div>
  </section>

  <section class="sgroup" aria-labelledby="sg_emr"><h3 id="sg_emr">EMR output</h3>
    <div class="fields">${field('emrName', 'EMR name')}${field('charLimit', 'Character limit', 'inputmode="numeric"')}</div>
    <div class="fields">${seg('emrFormat', 'Default format', [['markdown', 'Markdown'], ['plain', 'Plain text']])}${seg('emrLength', 'Default length', [['condensed', 'Condensed'], ['full', 'Full']])}</div>
    ${check('includeNegatives', 'Include non-tender areas and negative tests by default')}
    ${area('pdfPointer', 'PDF pointer line', 'Ends the condensed note.')}
  </section>

  <section class="sgroup" aria-labelledby="sg_pdf"><h3 id="sg_pdf">PDF</h3>
    <div class="fields">${seg('paperSize', 'Paper size', [['Letter', 'Letter'], ['A4', 'A4']])}${field('filenamePattern', 'File name pattern', '', 'Uses {type} {last} {first} {date}')}</div>
    ${area('footerText', 'Footer text')}
    ${check('showSignature', 'Show the signature line')}
  </section>

  <section class="sgroup" aria-labelledby="sg_data"><h3 id="sg_data">Data</h3>
    <p class="hint">Settings never contain patient data. Export them to back up or copy them to another device.</p>
    <div class="row">
      <button class="btn small" type="button" data-sact="export">Export settings</button>
      <label class="btn small filebtn">Import settings<input type="file" id="set_import" accept="application/json,.json"></label>
      <button class="btn small danger" type="button" data-sact="resetAll">Reset all settings</button>
    </div>
  </section>`;
}

function status(msg, bad = false){
  const el = document.getElementById('set_status');
  el.textContent = msg; el.classList.toggle('bad', bad);
  clearTimeout(statusTimer);
  if (!bad) statusTimer = setTimeout(() => { el.textContent = ''; }, 4000);
}

const NUMERIC = { thrWnl:[0, 100], thrBil:[0, 100], charLimit:[100, 1000000] };

/** Save one simple field; numeric fields must be valid first. */
function saveField(el){
  const key = el.dataset.set;
  let v = el.type === 'checkbox' ? el.checked : el.value;
  if (el.type === 'radio' && !el.checked) return;
  if (key in NUMERIC){
    const n = v.trim() === '' ? NaN : Number(v); const [lo, hi] = NUMERIC[key];
    const ok = Number.isFinite(n) && n >= lo && n <= hi;
    el.setAttribute('aria-invalid', String(!ok));
    if (!ok){ status(`Enter a number from ${lo} to ${hi}.`, true); return; }
    v = n;
  }
  if (key === 'brandColor' || key === 'accentColor'){
    v = v.toUpperCase();
    const hex = host.querySelector(`[data-hex="${key}"]`); if (hex) hex.value = v;
  }
  saveSettings({ [key]: v }).then(() => status('Saved.'));
  if (key === 'brandColor' || key === 'accentColor') document.getElementById('set_contrast').innerHTML = contrastHTML();
}

function rerenderList(key, focusSel){
  const el = host.querySelector(`[data-list="${key}"]`);
  el.outerHTML = listHTML(key);
  if (key === 'referralDestinations') document.getElementById('ptDestWrap').outerHTML = ptSelectHTML();
  if (focusSel){ const f = host.querySelector(focusSel); if (f) f.focus(); }
}

function setList(key, items, focusSel){
  saveSettings({ [key]: items }).then(() => status('Saved.'));
  rerenderList(key, focusSel);
}

function onInput(e){
  const t = e.target;
  if (t.dataset.set && t.type !== 'file'){
    if (e.type === 'input' && (t.type === 'checkbox' || t.type === 'radio' || t.tagName === 'SELECT')) return;
    saveField(t);
  } else if (t.dataset.hex && e.type === 'change'){
    const v = t.value.trim().startsWith('#') ? t.value.trim() : '#' + t.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(v)){
      t.setAttribute('aria-invalid', 'false');
      const picker = host.querySelector(`input[type=color][data-set="${t.dataset.hex}"]`); picker.value = v.toLowerCase(); saveField(picker);
    } else { t.setAttribute('aria-invalid', 'true'); status('Enter a color as #RRGGBB.', true); }
  } else if (t.dataset.li && e.type === 'change'){
    const [key, i] = t.dataset.li.split('|'); const items = [...getSettings()[key]];
    const v = t.value.trim();
    if (v) items[+i] = v; else items.splice(+i, 1);
    setList(key, items);
  } else if (t.dataset.prompt){
    const [k, f] = t.dataset.prompt.split('|');
    if (f === 'text' && !t.value.trim()) return;
    const prompts = structuredClone(getSettings().prompts);
    prompts[k][f] = f === 'on' ? t.checked : t.value;
    saveSettings({ prompts }).then(() => status('Saved.'));
  } else if (t.dataset.norm && e.type === 'change'){
    const [k, m] = t.dataset.norm.split('|');
    const norms = structuredClone(getSettings().romNorms); const v = t.value.trim();
    if (v === ''){ if (norms[k]) delete norms[k][m]; }
    else {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0 || n > 360){ t.setAttribute('aria-invalid', 'true'); status('Enter a norm from 0 to 360 degrees.', true); return; }
      (norms[k] ||= {})[m] = n;
    }
    t.setAttribute('aria-invalid', 'false');
    if (norms[k] && !Object.keys(norms[k]).length) delete norms[k];
    saveSettings({ romNorms: norms }).then(() => status('Saved.'));
  } else if (t.id === 'set_logo_file' && e.type === 'change'){
    const file = t.files[0]; if (!file) return;
    status('Processing logo…');
    processLogo(file).then(logo => saveSettings({ logo })).then(() => {
      document.getElementById('set_logo').innerHTML = logoHTML(); status('Logo saved.');
    }).catch(err => { status(err.message, true); t.value = ''; });
  } else if (t.id === 'set_import' && e.type === 'change'){
    const file = t.files[0]; if (!file) return;
    file.text().then(txt => importSettings(JSON.parse(txt))).then(() => { render(); status('Settings imported.'); })
      .catch(() => status("That file isn't a settings export from this app. Nothing was changed.", true))
      .finally(() => { t.value = ''; });
  }
}

function onKey(e){
  if (e.key === 'Enter' && e.target.dataset.add){ e.preventDefault(); addItem(e.target.dataset.add); }
}

function addItem(key){
  const inp = host.querySelector(`[data-add="${key}"]`); const v = inp.value.trim();
  if (!v) { inp.focus(); return; }
  const items = getSettings()[key];
  if (items.includes(v)){ status(`"${v}" is already in the list.`, true); return; }
  setList(key, [...items, v], `[data-add="${key}"]`);
}

function download(name, text){
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function onClick(e){
  const l = e.target.closest('[data-lact]');
  if (l){
    const key = l.dataset.key, i = +l.dataset.i, act = l.dataset.lact; const items = [...getSettings()[key]];
    if (act === 'add') return addItem(key);
    if (act === 'reset') return setList(key, structuredClone(DEFAULTS[key]), `[data-lact="reset"][data-key="${key}"]`);
    if (act === 'remove'){ items.splice(i, 1); return setList(key, items, `[data-add="${key}"]`); }
    const j = act === 'up' ? i - 1 : i + 1; if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    return setList(key, items, `[data-lact="${act}"][data-key="${key}"][data-i="${j}"]`);
  }
  const a = e.target.closest('[data-sact]'); if (!a) return;
  const act = a.dataset.sact;
  if (act === 'removeLogo'){ saveSettings({ logo: '' }).then(() => status('Logo removed.')); document.getElementById('set_logo').innerHTML = logoHTML(); host.querySelector('#set_logo_file')?.focus(); }
  if (act === 'resetColors'){ saveSettings({ brandColor: DEFAULTS.brandColor, accentColor: DEFAULTS.accentColor }).then(() => status('Colors reset.')); render(); }
  if (act === 'resetPrompt'){
    const k = a.dataset.key; const prompts = structuredClone(getSettings().prompts); prompts[k].text = DEFAULTS.prompts[k].text;
    saveSettings({ prompts }).then(() => status('Wording reset.'));
    host.querySelector(`[data-prompt="${k}|text"]`).value = prompts[k].text;
  }
  if (act === 'resetNorms'){
    const k = a.dataset.reg; const norms = structuredClone(getSettings().romNorms);
    if (k) delete norms[k]; else Object.keys(norms).forEach(r => delete norms[r]);
    saveSettings({ romNorms: norms }).then(() => status('ROM norms reset.'));
    const open = [...host.querySelectorAll('details.norms[open]')].map(d => d.dataset.normreg);
    document.getElementById('set_norms').innerHTML = normsHTML();
    open.forEach(r => host.querySelector(`details[data-normreg="${r}"]`).open = true);
  }
  if (act === 'export'){
    const d = new Date(); const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    download(`soap-settings-${stamp}.json`, JSON.stringify(exportSettings(), null, 2)); status('Settings exported.');
  }
  if (act === 'resetAll'){
    if (!resetArmed){ a.textContent = 'Click again to reset everything'; resetArmed = setTimeout(() => { a.textContent = 'Reset all settings'; resetArmed = null; }, 3500); return; }
    clearTimeout(resetArmed); resetArmed = null;
    resetSettings().then(() => { render(); status('All settings reset to defaults.'); });
  }
}

/** Build the Settings screen into its container. */
export function initSettingsScreen(){
  host = document.getElementById('settingsForm');
  render();
  host.addEventListener('input', onInput);
  host.addEventListener('change', onInput);
  host.addEventListener('click', onClick);
  host.addEventListener('keydown', onKey);
}
