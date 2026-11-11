/**
 * Date, time, and age formatting shared by the form and the outputs
 * (verbatim behavior from the prototype).
 */

/** "2026-11-05" -> "11/5/2026". */
export function fmtDate(d){ if (!d) return ''; const [y, m, dd] = d.split('-'); return `${+m}/${+dd}/${y}`; }

/** "15:05" -> "3:05 PM". */
export function fmtTime(t){ const [h, m] = t.split(':').map(Number); if (isNaN(h)) return t; return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; }

/** Today's date as YYYY-MM-DD in local time. */
export function today(d = new Date()){ return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }

/** Current local time as HH:MM. */
export function nowTime(d = new Date()){ return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }

/**
 * Age in whole years on the evaluation date (or today), '' if unknown.
 * @param {string} dob YYYY-MM-DD
 * @param {string} [doe] YYYY-MM-DD
 */
export function age(dob, doe){
  if (!dob) return '';
  const ref = doe ? new Date(doe + 'T12:00') : new Date();
  const bd = new Date(dob + 'T12:00'); let a = ref.getFullYear() - bd.getFullYear();
  if (ref.getMonth() < bd.getMonth() || (ref.getMonth() === bd.getMonth() && ref.getDate() < bd.getDate())) a--;
  return a >= 0 && a < 100 ? String(a) : '';
}
