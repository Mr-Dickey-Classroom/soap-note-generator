/** Small DOM helpers (UI only; the engine never imports this). */
export const $ = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];
/** Escape text for HTML (same as the prototype's esc). */
export function esc(s){ return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
/** Trimmed value of an element by id, '' if missing. */
export const val = id => (document.getElementById(id)?.value || '').trim();
/** Value of the checked radio in a group, '' if none. */
export const radio = n => (document.querySelector(`input[name="${n}"]:checked`) || {}).value || '';
/** Values of checked inputs inside a container. */
export const checkedIn = id => $$(`#${id} input:checked`).map(i => i.value);
/** Flag chips for ROM/MMT rows. */
export const chips = fl => fl.map(f => `<span class="tag ${f.t}">${esc(f.x)}</span>`).join('');
/** Checkbox chips for a list of values. */
export const chipList = (values, checked = new Set()) => values.map(q => `<label class="chip"><input type="checkbox" value="${esc(q)}"${checked.has(q) ? ' checked' : ''}><span>${esc(q)}</span></label>`).join('');
