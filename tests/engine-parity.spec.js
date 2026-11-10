// Engine parity: the same inputs through reference/soap-note-generator-v8.html and
// through js/engine/ must give identical ranked differentials, cluster readouts,
// suggested next tests, insights, and not-yet-ruled-out lists.
// Both sides run in Chromium, so numbers are compared exactly.
import { test, expect } from '@playwright/test';
import { openPrototype, openHarness } from './support/pages.js';
import { REGIONS, scriptedCase, generatedCases, PAIRS, pairCases, measureCases } from './support/cases.js';

/** Enter a scripted case through the prototype's form controls and read its analysis. */
async function runPrototypeUI(page, c){
  const k = c.region;
  await page.selectOption('#e_region', k);
  // Segmented radios hide the input behind its label, so click the label as a user would.
  const pressLabel = async id => { await page.locator(`label[for="${id}"]`).click(); await expect(page.locator(`[id="${id}"]`)).toBeChecked(); };
  await pressLabel(`sd_${c.side}`);
  for (const [fid, v] of Object.entries(c.state)){
    if (v === true) await page.locator(`input[data-reg="${k}"][data-fid="${fid}"]`).check();
    else await pressLabel(`${k}__${fid}_${v === 'pos' ? 'p' : 'n'}`);
  }
  await page.selectOption('#a_primary', `${k}:${c.primary}`);
  await pressLabel({ Low: 'cf_l', Moderate: 'cf_m', High: 'cf_h' }[c.conf]);
  for (const s of c.secondary) await page.locator(`#a_secondary input[value="${s}"]`).check();
  // Flush the prototype's 120 ms debounce, then read what its update loop computed.
  return page.evaluate(k => {
    clearTimeout(timer); update();
    return { A: __serializeAnalysis(lastAS[0]), state: STATES[k], D: getDx(), live: document.getElementById('live').innerText };
  }, k);
}

/** Replay plain-data cases in the prototype by setting its state and calling its engine. */
function runPrototypeBatch(page, cases){
  return page.evaluate(cases => {
    const refOption = [...document.querySelectorAll('#p_ref option')].map(o => o.value).find(Boolean);
    return cases.map(c => {
      for (const [k, st] of Object.entries(c.states)) STATES[k] = JSON.parse(JSON.stringify(st));
      document.querySelectorAll('input[name="side"]').forEach(i => { i.checked = i.value === c.side; });
      const AS = c.regions.map(k => analyzeRegion(k, c.D));
      const lists = c.regions.map(k => ['rf', 'h', 'o', 'p', 'r', 't', 'n'].map(s => findings(k, [s])));
      document.getElementById('p_ref').value = c.referral ? refOption : '';
      renderSuggest(AS);
      const prompts = [...document.querySelectorAll('#p_suggest .alert')].map(a => a.className.replace('alert ', ''));
      return { AS: AS.map(__serializeAnalysis), lists, prompts };
    });
  }, cases);
}

/** Run the same cases through the new engine. */
function runEngineBatch(page, cases){
  return page.evaluate(cases => {
    const { engine, planPrompts } = window.__engine;
    return cases.map(c => {
      const errors = [];
      const AS = c.regions.map(k => engine.analyzeRegion(k, c.D, { state: c.states[k], side: c.side, onError: e => errors.push(String(e)) }));
      const lists = c.regions.map(k => ['rf', 'h', 'o', 'p', 'r', 't', 'n'].map(s => engine.findingLists(k, c.states[k], [s])));
      const prompts = planPrompts(AS, c.states, { referral: c.referral ? 'referral' : '' }).map(p => p.tone);
      return { AS: AS.map(__serializeAnalysis), lists, prompts, errors };
    });
  }, cases);
}

function compareBatches(proto, mine, cases){
  for (let i = 0; i < cases.length; i++){
    const where = `case ${i}: ${JSON.stringify(cases[i]).slice(0, 300)}`;
    expect(mine[i].errors, where).toEqual([]);
    expect(mine[i].AS, where).toEqual(proto[i].AS);
    expect(mine[i].lists, where).toEqual(proto[i].lists);
    expect(mine[i].prompts, where).toEqual(proto[i].prompts);
  }
}

for (const k of REGIONS){
  test.describe(`${k}`, () => {
    test('scripted history and exam entered in the prototype UI matches the new engine', async ({ page, context }) => {
      const c = scriptedCase(k);
      const protoErrors = await openPrototype(page);
      const proto = await runPrototypeUI(page, c);
      // The UI produced exactly the scripted inputs.
      expect(proto.state).toEqual(c.state);
      expect(proto.D).toEqual({ raw: `${k}:${c.primary}`, rk: k, id: c.primary, other: '', conf: c.conf, secondary: [] });
      // The prototype panel shows what we compare.
      expect(proto.A.results.length).toBeGreaterThan(0);
      expect(proto.live).toContain('Differential');

      const h = await context.newPage();
      const harnessErrors = await openHarness(h);
      const mine = await h.evaluate(({ k, state, D, side }) => {
        const errors = [];
        const A = window.__engine.engine.analyzeRegion(k, D, { state, side, onError: e => errors.push(String(e)) });
        return { A: __serializeAnalysis(A), errors };
      }, { k, state: c.state, D: proto.D, side: c.side });

      expect(mine.errors).toEqual([]);
      // Ranked differential, then everything else.
      expect(mine.A.results.map(r => [r.id, r.band])).toEqual(proto.A.results.map(r => [r.id, r.band]));
      expect(mine.A.clusters).toEqual(proto.A.clusters);
      expect(mine.A.next).toEqual(proto.A.next);
      expect(mine.A).toEqual(proto.A);
      expect(protoErrors).toEqual([]);
      expect(harnessErrors).toEqual([]);
    });

    test('gates, clusters, red flags, and 200 seeded random states match', async ({ page, context }) => {
      const cases = generatedCases(k);
      const protoErrors = await openPrototype(page);
      const proto = await runPrototypeBatch(page, cases);
      const h = await context.newPage();
      const harnessErrors = await openHarness(h);
      const mine = await runEngineBatch(h, cases);
      compareBatches(proto, mine, cases);
      expect(protoErrors).toEqual([]);
      expect(harnessErrors).toEqual([]);
    });
  });
}

test.describe('two regions', () => {
  for (const pair of PAIRS){
    test(`${pair.join(' + ')}: random states with the impression in either region match`, async ({ page, context }) => {
      const cases = pairCases(pair);
      await openPrototype(page);
      const proto = await runPrototypeBatch(page, cases);
      const h = await context.newPage();
      await openHarness(h);
      const mine = await runEngineBatch(h, cases);
      compareBatches(proto, mine, cases);
    });
  }
});

test('ROM and MMT flags, re-eval change, and measurement flags match', async ({ page, context }) => {
  const cases = measureCases();
  await openPrototype(page);
  const proto = await page.evaluate(cases => cases.map(c => {
    document.getElementById('thr_wnl').value = c.ctx.thrWnl;
    document.getElementById('thr_bil').value = c.ctx.thrBil;
    document.querySelectorAll('input[name="side"]').forEach(i => { i.checked = i.value === c.ctx.side; });
    document.getElementById('e_type').value = c.ctx.reeval ? 'Re-evaluation' : 'Initial evaluation';
    ROMV.__t = [c.rom]; MMTV.__t = [c.mmt];
    return { rf: romFlags(c.rom), rc: romChange(c.rom), mf: mmtFlags(c.mmt), mc: mmtChange(c.mmt), ms: measureFlags('__t') };
  }), cases);
  const h = await context.newPage();
  await openHarness(h);
  const mine = await h.evaluate(cases => {
    const M = window.__engine.measures;
    return cases.map(c => ({ rf: M.romFlags(c.rom, c.ctx), rc: M.romChange(c.rom, c.ctx), mf: M.mmtFlags(c.mmt, c.ctx), mc: M.mmtChange(c.mmt, c.ctx), ms: M.measureFlags([c.rom], [c.mmt], c.ctx) }));
  }, cases);
  for (let i = 0; i < cases.length; i++) expect(mine[i], JSON.stringify(cases[i])).toEqual(proto[i]);
});

test('default ROM and MMT rows match the prototype', async ({ page, context }) => {
  await openPrototype(page);
  const proto = await page.evaluate(regions => regions.map(k => { ensureRegion(k); return { rom: ROMV[k], mmt: MMTV[k] }; }), REGIONS);
  const h = await context.newPage();
  await openHarness(h);
  const mine = await h.evaluate(regions => regions.map(k => ({ rom: window.__engine.measures.newRomRows(k), mmt: window.__engine.measures.newMmtRows(k) })), REGIONS);
  expect(mine).toEqual(proto);
});
