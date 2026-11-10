// Phase 2: the Note screen. The same cases are entered in the prototype and in
// the new app through the form; the live differential panel, ROM/MMT flags,
// assessment draft, and plan prompts must match (allowing only the documented
// changes in docs/SPEC.md §9). Then app-only behavior checks.
import { test, expect } from '@playwright/test';
import { guard, openPrototype } from './support/pages.js';
import { fillCase, pressLabel, FIXTURE_CASES } from './support/fill.js';
import { REGIONS, scriptedCase } from './support/cases.js';
import { DEFAULTS } from '../js/settings/defaults.js';

const PROTO_RED_FLAG = 'Follow the EAP. Standing Orders call for notifying the Directing Physician after a potential life-threatening injury.';

/** What the screen shows that the comparison covers. */
function readScreen(page){
  return page.evaluate(() => ({
    live: document.getElementById('live').innerText,
    assessment: document.getElementById('a_text').value,
    romFlags: [...document.querySelectorAll('[data-romflag]')].map(td => td.innerText),
    mmtFlags: [...document.querySelectorAll('[data-mmtflag]')].map(td => td.innerText),
    flaggedCells: [...document.querySelectorAll('[data-rom].bad,[data-rom].warn,[data-mmt].bad')].map(e => `${e.dataset.rom || e.dataset.mmt}:${e.classList.contains('bad') ? 'bad' : 'warn'}`),
    promptTones: [...document.querySelectorAll('#p_suggest .alert')].map(a => a.className),
    impressions: [...document.querySelectorAll('#a_primary option')].map(o => o.value),
    secondary: [...document.querySelectorAll('#a_secondary input')].map(i => i.value),
  }));
}

/** Prototype screen with the documented wording changes applied. */
async function readPrototype(page){
  const s = await page.evaluate(() => { clearTimeout(timer); update(); });
  void s;
  const p = await readScreen(page);
  p.live = p.live.replace(/Coaching notes/g, 'Clinical reasoning notes').replace(PROTO_RED_FLAG, DEFAULTS.prompts.redFlag.text);
  return p;
}

async function openApp(page){
  const errors = await guard(page);
  await page.goto('/');
  await expect(page.locator('#e_region option')).toHaveCount(9);
  return errors;
}

async function compareCase(browser, c){
  const ctx = await browser.newContext();
  const proto = await ctx.newPage();
  await openPrototype(proto);
  await fillCase(proto, c);
  const expected = await readPrototype(proto);
  const app = await ctx.newPage();
  const errors = await openApp(app);
  await fillCase(app, c);
  await expect.poll(() => readScreen(app), { timeout: 5000 }).toEqual(expected);
  expect(errors).toEqual([]);
  await ctx.close();
  return expected;
}

test.describe('matches the prototype for the same entries', () => {
  test('shoulder initial evaluation (fixture case)', async ({ browser }) => {
    const s = await compareCase(browser, FIXTURE_CASES['shoulder-initial']);
    // Spot checks against tests/fixtures/shoulder-initial.full.md
    expect(s.assessment).toContain('Clinical impression (left shoulder): AC joint sprain / separation (clinician confidence moderate).');
    expect(s.assessment).toContain('Not yet ruled out: Brachial plexus neurapraxia (stinger / burner); Clavicle or proximal humerus fracture; Full-thickness rotator cuff tear.');
    expect(s.assessment).toContain('ROM deficits: Flexion, Extension, Abduction, External rotation (90° abd), Internal rotation (90° abd) (see ROM table).');
    expect(s.assessment).toContain('Further testing indicated: External rotation lag sign; Resisted ER weakness; Full can; Pain at end-range elevation, roughly 170–180°.');
    expect(s.romFlags[0]).toContain('L AROM 50% of WNL');
    expect(s.mmtFlags[0]).toContain('L weaker than R');
    expect(s.live).toContain('AC joint combination (Chronopoulos 2004)');
  });

  test('knee re-evaluation (fixture case)', async ({ browser }) => {
    const s = await compareCase(browser, FIXTURE_CASES['knee-reeval']);
    // Spot checks against tests/fixtures/knee-reeval.full.md
    expect(s.assessment).toContain('Progress since last evaluation (10/29/2026): improving.');
    expect(s.assessment).toContain('Objective change: Flexion +15° since last (was 115); Extension +3° since last (was -3); Knee flexion strength up from 4-/5.');
    expect(s.assessment).toContain('Evidence-supported differential: MCL sprain (moderate support).');
    expect(s.assessment).toContain('Strength deficits: Knee flexion (see MMT table).');
    expect(s.romFlags[0]).toContain('+15° since last (was 115)');
    expect(s.mmtFlags[0]).toContain('Up from 4-/5');
  });

  for (const k of REGIONS){
    test(`${k}: built-in example`, async ({ browser }) => {
      const ex = scriptedCase(k);
      await compareCase(browser, { region: k, side: ex.side, states: { [k]: ex.state }, primary: `${k}:${ex.primary}`, conf: ex.conf, doe: '2026-11-05' });
    });
  }

  test('two regions with a red flag, high confidence, and a referral', async ({ browser }) => {
    await compareCase(browser, {
      region: 'knee', region2: 'hip', side: 'R', doe: '2026-11-05',
      states: { knee: { rf_nv: true, h_acute: true, h_pop: true, t_lachman: 'pos', p_patella: 'neg' }, hip: { h_immature: true, h_limp: true, r_drehmann: 'neg' } },
      primary: 'hip:scfe', conf: 'High', secondary: ['knee:acl'],
      plan: { ref: 'Physical therapy' },
    });
  });
});

test.describe('note screen behavior', () => {
  let errors;
  test.beforeEach(async ({ page }) => { errors = await openApp(page); });
  test.afterEach(() => { expect(errors).toEqual([]); });

  test('starts with today, the current time, moderate confidence, and no student mode', async ({ page }) => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    await expect(page.locator('#e_doe')).toHaveValue(today);
    await expect(page.locator('#e_time')).toHaveValue(/^\d\d:\d\d$/);
    await expect(page.locator('#cf_m')).toBeChecked();
    await expect(page.locator('#e_grade')).toHaveJSProperty('tagName', 'INPUT');
    await expect(page.locator('#studentMode, #e_student')).toHaveCount(0);
    await expect(page.getByText(/student/i)).toHaveCount(0);
    await expect(page.locator('#live')).toContainText('Choose a body region');
    // Therapeutic exercise list ships empty.
    await expect(page.locator('#p_therex option')).toHaveText(['None assigned', 'Custom (see plan notes)']);
  });

  test('"Screened: no red flags" and individual red flags clear each other', async ({ page }) => {
    await page.selectOption('#e_region', 'knee');
    const screened = page.locator('input[data-reg="knee"][data-fid="rf_screened"]');
    const flag = page.locator('input[data-reg="knee"][data-fid="rf_locked"]');
    await flag.check();
    await expect(page.locator('#live .alert.bad')).toContainText(DEFAULTS.prompts.redFlag.text);
    await expect(page.locator('#p_suggest .alert.bad')).toHaveText(DEFAULTS.prompts.redFlag.text);
    await screened.check();
    await expect(flag).not.toBeChecked();
    await expect(page.locator('#live .alert.bad')).toHaveCount(0);
    await flag.check();
    await expect(screened).not.toBeChecked();
  });

  test('re-evaluation shows the interval block and prior columns', async ({ page }) => {
    await page.selectOption('#e_region', 'shoulder');
    await expect(page.locator('#reeval')).toBeHidden();
    await expect(page.locator('[data-rom="shoulder|0|prior"]')).toBeHidden();
    await page.selectOption('#e_type', 'Re-evaluation');
    await expect(page.locator('#reeval')).toBeVisible();
    await expect(page.locator('[data-rom="shoulder|0|prior"]')).toBeVisible();
    await expect(page.locator('[data-mmt="shoulder|0|prior"]')).toBeVisible();
  });

  test('ROM flags follow side and thresholds; custom rows can be added', async ({ page }) => {
    await page.selectOption('#e_region', 'knee');
    await pressLabel(page, 'sd_L');
    await page.locator('[data-rom="knee|0|aL"]').fill('125');
    await page.locator('[data-rom="knee|0|aR"]').fill('135');
    await expect(page.locator('[data-romflag="knee|0"]')).toHaveText('L AROM 93%');
    await page.locator('#thr_wnl').fill('5');
    await expect(page.locator('[data-romflag="knee|0"]')).toContainText('L AROM 93% of WNL');
    await expect(page.locator('[data-rom="knee|0|aL"]')).toHaveClass(/bad/);
    const rows = page.locator('[data-romtable="knee"] tr');
    const n = await rows.count();
    await page.getByRole('button', { name: 'Add ROM row' }).click();
    await expect(rows).toHaveCount(n + 1);
    await expect(page.locator(`[data-rom="knee|${n}|m"]`)).toBeFocused();
    const mmtRows = page.locator('[data-mmttable="knee"] tr');
    const m = await mmtRows.count();
    await page.getByRole('button', { name: 'Add strength row' }).click();
    await expect(mmtRows).toHaveCount(m + 1);
    await expect(page.locator(`[data-mmt="knee|${m}|m"]`)).toBeFocused();
  });

  test('assessment stops drafting after an edit; Redraft restores it', async ({ page }) => {
    await page.selectOption('#e_region', 'shoulder');
    await page.selectOption('#a_primary', 'shoulder:acj');
    const a = page.locator('#a_text');
    await expect(a).toHaveValue(/^Clinical impression \(shoulder\): AC joint/);
    await a.fill('My own assessment.');
    await expect(page.locator('#a_status')).toContainText('Edited by you');
    await pressLabel(page, 'sd_L');
    await page.waitForTimeout(300);
    await expect(a).toHaveValue('My own assessment.');
    await page.getByRole('button', { name: 'Redraft from findings' }).click();
    await expect(a).toHaveValue(/^Clinical impression \(left shoulder\): AC joint/);
  });

  test('impression excludes itself from also-considering; Other asks for a name', async ({ page }) => {
    await page.selectOption('#e_region', 'ankle');
    await page.selectOption('#a_primary', 'ankle:latsprain');
    await expect(page.locator('#a_secondary input[value="ankle:latsprain"]')).toBeDisabled();
    await expect(page.locator('#a_other_wrap')).toBeHidden();
    await page.selectOption('#a_primary', 'other');
    await expect(page.locator('#a_other_wrap')).toBeVisible();
    await page.locator('#a_other').fill('Heel contusion');
    await expect(page.locator('#a_text')).toHaveValue(/^Clinical impression: Heel contusion \(clinician confidence moderate\)\./);
  });

  test('evidence disclosure, video links, and "tests that would sharpen this"', async ({ page }) => {
    await page.selectOption('#e_region', 'knee');
    const ev = page.getByRole('button', { name: 'Evidence for Lachman' });
    await ev.click();
    await expect(ev).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-row="knee__t_lachman"] .evbox')).toContainText('sens 85%, spec 94%');
    const video = page.locator('[data-row="knee__t_lachman"] a', { hasText: 'Video' });
    await expect(video).toHaveAttribute('target', '_blank');
    await expect(video).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(video).toHaveAttribute('title', /internet connection/);
    await page.locator('input[data-reg="knee"][data-fid="h_mech_pivot"]').check();
    const next = page.locator('#live .nt').first();
    await expect(next).toBeVisible();
    const target = await next.getAttribute('data-goto');
    await next.click();
    await expect(page.locator(`[data-row="${target}"]`)).toHaveClass(/flash/);
  });

  test('referral reasons follow the destination and add the plan prompt', async ({ page }) => {
    await page.selectOption('#e_region', 'ankle');
    await expect(page.locator('#p_reasons_wrap')).toBeHidden();
    await page.selectOption('#p_ref', 'Physical therapy');
    await expect(page.locator('#p_reasons')).toContainText('Post-operative rehabilitation');
    await page.selectOption('#p_ref', 'Directing physician');
    await expect(page.locator('#p_reasons')).toContainText('Unclear diagnosis');
    await expect(page.locator('#p_suggest .alert.note')).toHaveText(DEFAULTS.prompts.referral.text);
  });

  test('New note needs two clicks and resets the form', async ({ page }) => {
    await page.selectOption('#e_region', 'shoulder');
    await page.locator('#e_name').fill('Test Athlete');
    await page.locator('#e_doe').fill('2020-01-01');
    await page.locator('input[data-reg="shoulder"][data-fid="h_contact"]').check();
    const btn = page.locator('#clearBtn');
    await btn.click();
    await expect(btn).toHaveText('Click again to clear');
    await expect(page.locator('#e_name')).toHaveValue('Test Athlete');
    await btn.click();
    await expect(btn).toHaveText('New note');
    await expect(page.locator('#e_name')).toHaveValue('');
    await expect(page.locator('#e_region')).toHaveValue('');
    await expect(page.locator('#e_doe')).not.toHaveValue('2020-01-01');
    await expect(page.locator('#cf_m')).toBeChecked();
    await expect(page.locator('#s_engine .empty')).toBeVisible();
    // The region's findings were forgotten too.
    await page.selectOption('#e_region', 'shoulder');
    await expect(page.locator('input[data-reg="shoulder"][data-fid="h_contact"]')).not.toBeChecked();
  });

  test('warns before leaving a note with input', async ({ page }) => {
    await page.locator('#s_cc').fill('Ankle pain');
    let dialog = null;
    page.on('dialog', async d => { dialog = d.type(); await d.dismiss(); });
    await page.close({ runBeforeUnload: true });
    await expect.poll(() => dialog).toBe('beforeunload');
  });

  test('no horizontal page scroll at 360px with a region loaded', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.selectOption('#e_region', 'shoulder');
    await page.selectOption('#e_type', 'Re-evaluation');
    const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(scroll).toBeLessThanOrEqual(width);
  });
});
