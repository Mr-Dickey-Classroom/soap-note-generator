// Phase 4: EMR paste text and the Output panel (SPEC §4).
// 1. The shoulder-initial and knee-reeval cases reproduce tests/fixtures/* exactly,
//    with the evaluator coming from Settings.
// 2. For the same entries, every format/length/negatives combination matches the
//    prototype's text box (regions' built-in examples, the fixture cases, and a
//    two-region case that uses every free-text field).
// 3. Panel behavior: EMR name labels, counter and inline limit, Copy and its fallback.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { guard, openPrototype } from './support/pages.js';
import { fillCase, pressLabel, FIXTURE_CASES } from './support/fill.js';
import { REGIONS, scriptedCase } from './support/cases.js';

const fixture = name => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

async function openApp(page){
  const errors = await guard(page);
  await page.goto('/');
  await expect(page.locator('#e_region option')).toHaveCount(9);
  return errors;
}

/** Change Settings in the running app (the Settings screen arrives in Phase 3). */
async function setSettings(page, patch){
  await page.evaluate(async p => { const m = await import('/js/settings/store.js'); m.updateSettings(p); }, patch);
}

/** Start a fresh note so it picks up the current Settings (two-click New note). */
async function newNote(page){
  await page.locator('#clearBtn').click();
  await page.locator('#clearBtn').click();
  await expect(page.locator('#clearBtn')).toHaveText('New note');
}

/** Set the output controls the same way in the prototype and the app, then read the box. */
async function readOutput(page, { fmt, len, neg }){
  return page.evaluate(({ fmt, len, neg }) => {
    const fire = el => el.dispatchEvent(new Event('change', { bubbles: true }));
    const f = document.querySelector(`input[name="fmt"][value="${fmt}"]`); f.checked = true; fire(f);
    const l = document.querySelector(`input[name="len"][value="${len}"]`); l.checked = true; fire(l);
    const n = document.getElementById('inc_neg'); n.checked = neg; fire(n);
    return document.getElementById('out_all').value;
  }, { fmt, len, neg });
}

const COMBOS = ['md', 'txt'].flatMap(fmt => ['cond', 'full'].flatMap(len => [false, true].map(neg => ({ fmt, len, neg }))));

test.describe('fixture text', () => {
  for (const name of ['shoulder-initial', 'knee-reeval']){
    test(`${name} reproduces tests/fixtures exactly (evaluator from Settings)`, async ({ page }) => {
      const errors = await openApp(page);
      await setSettings(page, { clinicianName: 'Jane Clinician', clinicianCredentials: 'MS, LAT, ATC' });
      await newNote(page);
      await expect(page.locator('#e_eval')).toHaveValue('Jane Clinician, MS, LAT, ATC');
      const { evaluator, ...c } = FIXTURE_CASES[name];
      expect(evaluator).toBe('Jane Clinician, MS, LAT, ATC');
      await fillCase(page, c);
      // Defaults: Markdown, condensed, negatives off.
      await expect(page.locator('#fm_md')).toBeChecked();
      await expect(page.locator('#ln_c')).toBeChecked();
      await expect(page.locator('#inc_neg')).not.toBeChecked();
      const out = page.locator('#out_all');
      await expect(out).toHaveValue(fixture(`${name}.condensed.md`));
      await pressLabel(page, 'ln_f');
      await expect(out).toHaveValue(fixture(`${name}.full.md`));
      await pressLabel(page, 'ln_c');
      await pressLabel(page, 'fm_tx');
      await expect(out).toHaveValue(fixture(`${name}.condensed.txt`));
      // Identifiers never go into the paste text.
      await page.locator('#e_name').fill('Sample Athlete');
      await page.locator('#e_dob').fill('2010-02-03');
      await page.waitForTimeout(250);
      await expect(out).toHaveValue(fixture(`${name}.condensed.txt`));
      expect(errors).toEqual([]);
    });
  }

  test('shoulder condensed Markdown is within 2,500 characters (SPEC §11)', () => {
    expect(fixture('shoulder-initial.condensed.md').length).toBeLessThanOrEqual(2500);
  });
});

const KITCHEN_SINK = {
  evaluator: 'Jane Clinician, MS, LAT, ATC', doe: '2026-11-05', time: '15:05', type: 'Re-evaluation',
  region: 'shoulder', region2: 'cervical', side: 'R', doi: '2026-10-30',
  reeval: { last: '2026-10-31', dx: 'R shoulder strain | possible stinger', visit: '3', status: 'No change', adherence: 'Full', resp: 'Still tingling\nafter contact.' },
  subj: { cc: 'R shoulder pain', hpi: 'Hit while blocking: arm pulled back.', onset: 'Recurrent', pain: { s_pnow: '3', s_pworst: '6' }, quality: ['Burning', 'Shooting or radiating'],
    agg: 'Overhead reach', ease: 'Rest', prior: 'Two stingers last season', func: 'Return to blocking drills' },
  states: {
    shoulder: { h_contact: true, h_acute: true, rf_nv: true, p_ac: 'neg', t_crossbody: 'pos', t_spurling: 'neg', t_ultta: 'pos', t_droparm: 'neg' },
    cervical: { h_contact: true, rf_screened: true },
  },
  rom: { 'shoulder|0|prior': '150', 'shoulder|0|aL': '170', 'shoulder|0|aR': '160', 'shoulder|0|pR': '175', 'shoulder|0|ef': 'Capsular',
    'shoulder|6|m': 'Horizontal adduction', 'shoulder|6|norm': '130', 'shoulder|6|aR': '100', 'shoulder|6|pain': true,
    'cervical|0|aL': '30', 'cervical|0|pL': '45' },
  mmt: { 'shoulder|0|prior': '4', 'shoulder|0|L': '5', 'shoulder|0|R': '4-', 'shoulder|1|R': '5', 'shoulder|1|L': '5', 'shoulder|1|pain': true,
    'cervical|0|L': '4' },
  notes: { 'shoulder|obs': 'Mild swelling', 'shoulder|palp': 'Diffuse upper trap tenderness', 'shoulder|neuro': 'C5 dermatome diminished', 'cervical|obs': 'Guarded posture.' },
  oMove: 'Guarded overhead reach',
  primary: 'shoulder:acj', conf: 'Low', secondary: ['cervical:radic'],
  plan: { status: 'Out of participation', restrict: 'No contact', tx: ['Cryotherapy', 'Education and home care'], txd: 'Ice 20 min',
    ref: 'Directing physician', urg: 'Routine', reasons: ['Unclear diagnosis'], comm: ['Parent/guardian notified'], fu: '2026-11-08', notes: 'Recheck neuro before practice.' },
};

test.describe('matches the prototype text for the same entries', () => {
  const cases = [
    ...REGIONS.map(k => { const ex = scriptedCase(k); return [`${k}: built-in example`, { evaluator: 'Jane Clinician, MS, LAT, ATC', region: k, side: ex.side, states: { [k]: ex.state }, primary: `${k}:${ex.primary}`, conf: ex.conf, doe: '2026-11-05', time: '' }]; }),
    ['shoulder-initial', FIXTURE_CASES['shoulder-initial']],
    ['knee-reeval', FIXTURE_CASES['knee-reeval']],
    ['two regions, every free-text field, evaluation time', KITCHEN_SINK],
  ];
  for (const [title, c] of cases){
    test(title, async ({ browser }) => {
      const ctx = await browser.newContext();
      const proto = await ctx.newPage();
      await openPrototype(proto);
      await fillCase(proto, c);
      await proto.evaluate(() => { clearTimeout(timer); update(); });
      const app = await ctx.newPage();
      const errors = await openApp(app);
      await fillCase(app, c);
      await app.evaluate(async () => { const m = await import('/js/ui/controller.js'); m.update(); });
      for (const combo of COMBOS){
        const expected = await readOutput(proto, combo);
        expect(await readOutput(app, combo), JSON.stringify(combo)).toBe(expected);
      }
      expect(errors).toEqual([]);
      await ctx.close();
    });
  }
});

test.describe('output panel', () => {
  let errors;
  test.beforeEach(async ({ page }) => { errors = await openApp(page); });
  test.afterEach(() => { expect(errors).toEqual([]); });

  test('labels use the EMR name from Settings', async ({ page }) => {
    await expect(page.locator('#OUT_h')).toHaveText('Healthy Roster text');
    await expect(page.locator('#copyBtn')).toHaveText('Copy for Healthy Roster');
    await expect(page.locator('#copyHeadBtn')).toHaveText('Copy for Healthy Roster');
    await expect(page.locator('#navOut')).toHaveText('Healthy Roster text');
    await expect(page.locator('#hr_limit')).toHaveValue('5000');
    // Renaming in Settings relabels (applied at boot; re-run here as the Settings screen would).
    await page.evaluate(async () => {
      const s = await import('/js/settings/store.js'); s.updateSettings({ emrName: 'Clinic EMR' });
      const o = await import('/js/ui/output.js'); o.applyOutputLabels(s.getSettings());
    });
    await expect(page.locator('#OUT_h')).toHaveText('Clinic EMR text');
    await expect(page.locator('#copyBtn')).toHaveText('Copy for Clinic EMR');
    await expect(page.getByRole('textbox', { name: 'Note text for Clinic EMR' })).toBeVisible();
  });

  test('defaults for format, length, negatives, and limit come from Settings', async ({ page }) => {
    await setSettings(page, { emrFormat: 'txt', emrLength: 'full', emrIncludeNeg: true, emrCharLimit: 3000 });
    await newNote(page);
    await expect(page.locator('#fm_tx')).toBeChecked();
    await expect(page.locator('#ln_f')).toBeChecked();
    await expect(page.locator('#inc_neg')).toBeChecked();
    await expect(page.locator('#hr_limit')).toHaveValue('3000');
    await page.selectOption('#e_region', 'ankle');
    await pressLabel(page, 'ankle__t_antdrawer_n');
    await expect(page.locator('#out_all')).toHaveValue(/Negative: Anterior drawer/);
  });

  test('negatives toggle adds non-tender areas and negative tests', async ({ page }) => {
    await page.selectOption('#e_region', 'shoulder');
    await pressLabel(page, 'shoulder__p_ac_n');
    await pressLabel(page, 'shoulder__t_crossbody_p');
    await pressLabel(page, 'shoulder__t_droparm_n');
    const out = page.locator('#out_all');
    await expect(out).toHaveValue(/- \*\*Positive:\*\* Cross-body adduction/);
    await expect(out).not.toHaveValue(/Non-tender|Negative/);
    await page.locator('#inc_neg').check();
    await expect(out).toHaveValue(/- \*\*Non-tender:\*\* AC joint/);
    await expect(out).toHaveValue(/- \*\*Negative:\*\* Drop arm/);
  });

  test('counter tracks the box, turns amber near the limit and red over it; limit is editable inline', async ({ page }) => {
    const out = page.locator('#out_all'); const count = page.locator('#charCount');
    await expect(count).toHaveAttribute('aria-live', 'polite');
    await page.selectOption('#e_region', 'knee');
    const n = (await out.inputValue()).length;
    await expect(count).toHaveText(`${n.toLocaleString('en-US')} / 5,000 characters`);
    await expect(count).not.toHaveClass(/near|over/);
    await page.locator('#hr_limit').fill(String(n));
    await expect(count).toHaveText(`${n.toLocaleString('en-US')} / ${n.toLocaleString('en-US')} characters`);
    await expect(count).toHaveClass(/near/);
    await page.locator('#hr_limit').fill(String(n - 5));
    await expect(count).toHaveText(`${n.toLocaleString('en-US')} characters: 5 over the ${(n - 5).toLocaleString('en-US')} limit`);
    await expect(count).toHaveClass(/over/);
    await expect(count).toHaveCSS('font-weight', '700');
    // The inline limit is a setting: it survives New note.
    expect(await page.evaluate(async () => (await import('/js/settings/store.js')).getSettings().emrCharLimit)).toBe(n - 5);
    await newNote(page);
    await expect(page.locator('#hr_limit')).toHaveValue(String(n - 5));
    // Blank or invalid limits fall back to the setting; typing in the box recounts without regenerating.
    await page.locator('#hr_limit').fill('');
    await expect(count).toContainText(`${(n - 5).toLocaleString('en-US')}`);
    await out.fill('abc');
    await expect(count).toHaveText(`3 / ${(n - 5).toLocaleString('en-US')} characters`);
    await page.waitForTimeout(300);
    await expect(out).toHaveValue('abc');
  });

  test('editing the box does not mark the note as changed', async ({ page }) => {
    await page.locator('#out_all').fill('x');
    await pressLabel(page, 'fm_tx');
    let dialog = null;
    page.on('dialog', async d => { dialog = d.type(); await d.dismiss(); });
    const closed = page.waitForEvent('close').then(() => 'closed');
    await page.close({ runBeforeUnload: true });
    expect(await Promise.race([closed, new Promise(r => setTimeout(() => r('still open'), 3000))])).toBe('closed');
    expect(dialog).toBeNull();
  });

  test('Copy writes the text to the clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(page.url()).origin });
    await page.selectOption('#e_region', 'knee');
    await page.locator('#s_cc').fill('Knee pain');
    await page.locator('#copyBtn').click();
    await expect(page.locator('#copyMsg')).toHaveText('Copied. Paste it into Healthy Roster.');
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toBe(await page.locator('#out_all').inputValue());
    expect(clip).toContain('- **Chief complaint:** Knee pain');
    await page.locator('#copyHeadBtn').click();
    await expect(page.locator('#copyHeadBtn')).toHaveText('Copied');
    await expect(page.locator('#copyHeadBtn')).toHaveText('Copy for Healthy Roster', { timeout: 5000 });
  });

  test('Copy falls back to execCommand, then to selecting the text', async ({ page }) => {
    await page.selectOption('#e_region', 'knee');
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) }, configurable: true });
      window.__copied = null;
      document.execCommand = cmd => { window.__copied = cmd === 'copy' ? window.getSelection().toString() || document.activeElement.value.slice(document.activeElement.selectionStart, document.activeElement.selectionEnd) : null; return true; };
    });
    await page.locator('#copyBtn').click();
    await expect(page.locator('#copyMsg')).toHaveText('Copied. Paste it into Healthy Roster.');
    expect(await page.evaluate(() => window.__copied)).toBe(await page.locator('#out_all').inputValue());
    await page.evaluate(() => { document.execCommand = () => false; });
    await page.locator('#copyBtn').click();
    await expect(page.locator('#copyMsg')).toHaveText('Text selected. Press Ctrl+C (Cmd+C on a Mac) to copy.');
    await expect(page.locator('#out_all')).toBeFocused();
  });
});
