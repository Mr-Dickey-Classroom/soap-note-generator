// Fill a note through the form. The new app keeps the prototype's element ids
// and data attributes, so the same steps drive both.
import { expect } from '@playwright/test';

/** Click a segmented-control label (the radio itself is visually hidden). */
export async function pressLabel(page, id){
  await page.locator(`label[for="${id}"]`).click();
  await expect(page.locator(`[id="${id}"]`)).toBeChecked();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {object} c case: see FIXTURE_CASES
 */
export async function fillCase(page, c){
  const set = (id, v) => page.locator(`#${id}`).fill(v);
  if (c.type) await page.selectOption('#e_type', c.type);
  await set('e_eval', c.evaluator ?? '');
  await set('e_doe', c.doe ?? '');
  await set('e_time', c.time ?? '');
  if (c.doi) await set('e_doi', c.doi);
  await page.selectOption('#e_region', c.region);
  if (c.region2) await page.selectOption('#e_region2', c.region2);
  if (c.side) await pressLabel(page, `sd_${c.side}`);
  const r = c.reeval;
  if (r){
    await set('r_last', r.last); await set('r_dx', r.dx); await set('r_visit', r.visit);
    await pressLabel(page, { Improving:'rs_i', 'No change':'rs_n', Worsening:'rs_w', Resolved:'rs_r' }[r.status]);
    await pressLabel(page, { Full:'ra_y', Partial:'ra_p', None:'ra_n', 'Not assigned':'ra_x' }[r.adherence]);
    await set('r_resp', r.resp);
  }
  const s = c.subj || {};
  if (s.cc) await set('s_cc', s.cc);
  if (s.hpi) await set('s_hpi', s.hpi);
  if (s.onset) await pressLabel(page, { Acute:'on_a', Insidious:'on_i', Recurrent:'on_r', 'Chronic, flare':'on_c' }[s.onset]);
  for (const [id, v] of Object.entries(s.pain || {})) await page.selectOption(`#${id}`, v);
  for (const q of s.quality || []) await page.locator(`#s_quality input[value="${q}"]`).check();
  if (s.agg) await set('s_agg', s.agg);
  if (s.ease) await set('s_ease', s.ease);
  for (const [k, state] of Object.entries(c.states || {})){
    for (const [fid, v] of Object.entries(state)){
      if (v === true) await page.locator(`input[data-reg="${k}"][data-fid="${fid}"]`).check();
      else await pressLabel(page, `${k}__${fid}_${v === 'pos' ? 'p' : 'n'}`);
    }
  }
  for (const [key, v] of Object.entries(c.rom || {})){
    const sel = `[data-rom="${key}"]`;
    if (v === true) await page.locator(sel).check(); else await page.locator(sel).fill(v);
  }
  for (const [key, v] of Object.entries(c.mmt || {})){
    const sel = `[data-mmt="${key}"]`;
    if (v === true) await page.locator(sel).check(); else await page.selectOption(sel, v);
  }
  if (c.primary) await page.selectOption('#a_primary', c.primary);
  if (c.conf) await pressLabel(page, { Low:'cf_l', Moderate:'cf_m', High:'cf_h' }[c.conf]);
  for (const sec of c.secondary || []) await page.locator(`#a_secondary input[value="${sec}"]`).check();
  const p = c.plan || {};
  if (p.status) await pressLabel(page, { 'Full participation':'st_f', 'Limited participation':'st_l', 'Out of participation':'st_o', 'Out pending physician evaluation':'st_p' }[p.status]);
  if (p.restrict) await set('p_restrict', p.restrict);
  for (const t of p.tx || []) await page.locator(`#p_tx input[value="${t}"]`).check();
  if (p.ref) await page.selectOption('#p_ref', p.ref);
  if (p.urg) await page.selectOption('#p_urg', p.urg);
  if (p.fu) await set('p_fu', p.fu);
}

/** The two fixture cases from tests/fixtures/README.md. */
export const FIXTURE_CASES = {
  'shoulder-initial': {
    evaluator: 'Jane Clinician, MS, LAT, ATC', doe: '2026-11-05', time: '', type: 'Initial evaluation',
    region: 'shoulder', side: 'L', doi: '2026-11-05',
    subj: { cc: 'Left shoulder pain and weakness', hpi: 'Tackled and landed directly on the point of the left shoulder.', onset: 'Acute',
      pain: { s_pnow: '7', s_pbest: '7', s_pworst: '7' }, quality: ['Sharp'], agg: 'Movement', ease: 'Ice' },
    states: { shoulder: {
      h_contact: true, h_acute: true, h_mech_point: true, h_loc_top: true, h_weak: true, rf_screened: true,
      p_ac: 'pos', t_crossbody: 'pos', t_acresist: 'pos', t_obrien_ac: 'pos',
      t_droparm: 'neg', t_appre: 'neg', t_sulcus: 'neg', t_spurling: 'neg', t_ultta: 'neg' } },
    rom: {
      'shoulder|0|aL': '90', 'shoulder|0|aR': '180', 'shoulder|0|pL': '155', 'shoulder|0|pR': '180', 'shoulder|0|pain': true,
      'shoulder|1|aL': '45', 'shoulder|1|aR': '60', 'shoulder|1|pL': '60', 'shoulder|1|pR': '60',
      'shoulder|2|aL': '90', 'shoulder|2|aR': '180', 'shoulder|2|pain': true,
      'shoulder|3|aL': '35', 'shoulder|3|aR': '90', 'shoulder|3|pL': '80', 'shoulder|3|pR': '90',
      'shoulder|4|aL': '35', 'shoulder|4|aR': '70', 'shoulder|4|pL': '65', 'shoulder|4|pR': '70' },
    mmt: {
      'shoulder|0|L': '3-', 'shoulder|1|L': '2+', 'shoulder|2|L': '2+', 'shoulder|3|L': '3+', 'shoulder|4|L': '4+', 'shoulder|5|L': '4+',
      'shoulder|0|R': '5', 'shoulder|1|R': '5', 'shoulder|2|R': '5', 'shoulder|3|R': '5', 'shoulder|4|R': '5', 'shoulder|5|R': '5' },
    primary: 'shoulder:acj', conf: 'Moderate',
    plan: { status: 'Out pending physician evaluation', tx: ['Cryotherapy'], ref: 'Directing physician', urg: 'Within 24–72 hours', fu: '2026-11-12' },
  },
  'knee-reeval': {
    evaluator: 'Jane Clinician, MS, LAT, ATC', doe: '2026-11-05', time: '', type: 'Re-evaluation',
    region: 'knee', side: 'L', doi: '2026-10-28',
    reeval: { last: '2026-10-29', dx: 'L MCL sprain, grade I', visit: '2', status: 'Improving', adherence: 'Partial',
      resp: 'Pain with stairs resolved; still sore after cutting drills.' },
    subj: { cc: 'L medial knee soreness with cutting' },
    states: { knee: { t_valgus30: 'pos' } },
    rom: { 'knee|0|prior': '115', 'knee|0|aL': '130', 'knee|0|aR': '140', 'knee|1|prior': '-3', 'knee|1|aL': '0', 'knee|1|aR': '0' },
    mmt: { 'knee|0|prior': '4-', 'knee|0|L': '4+', 'knee|0|R': '5' },
    primary: 'knee:mcl', conf: 'Moderate',
    plan: { status: 'Limited participation', restrict: 'No full-speed cutting' },
  },
};
