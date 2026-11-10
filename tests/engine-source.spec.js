// Verbatim check: region data, sources, video links, ROM/MMT defaults, bands, and
// the source text of every cluster readout, insight, and scoring function must be
// identical to reference/soap-note-generator-v8.html.
import { test, expect } from '@playwright/test';
import { openPrototype, openHarness } from './support/pages.js';

test('engine data and function sources are identical to the prototype', async ({ page, context }) => {
  await openPrototype(page);
  const proto = await page.evaluate(() => __dumpEngine({
    REG, SRC, VIDEOS, ORDER, ROMDEF, MMTDEF, GRADES, GVAL, ENDFEEL, BANDS, CAP,
    fns: { scoreCondition, band, isChecked, isAssessed, triFinding, gateOpen, power, SS, X, T, fmt, num,
      romFlags, mmtFlags, romChange, mmtChange, invKey }
  }));
  const h = await context.newPage();
  await openHarness(h);
  const mine = await h.evaluate(() => {
    const { engine, registry, measures, evidence, context, SRC, VIDEOS } = window.__engine;
    return __dumpEngine({
      REG: registry.REG, SRC, VIDEOS, ORDER: registry.ORDER,
      ROMDEF: measures.ROMDEF, MMTDEF: measures.MMTDEF, GRADES: measures.GRADES, GVAL: measures.GVAL, ENDFEEL: measures.ENDFEEL,
      BANDS: engine.BANDS, CAP: evidence.CAP,
      fns: { scoreCondition: engine.scoreCondition, band: engine.band, isChecked: context.isChecked, isAssessed: context.isAssessed,
        triFinding: context.triFinding, gateOpen: context.gateOpen, power: evidence.power, SS: evidence.SS, X: evidence.X, T: evidence.T,
        fmt: evidence.fmt, num: measures.num, ...measures._verbatim }
    });
  });
  expect(mine.regionKeys).toEqual(proto.regionKeys);
  for (const k of proto.regionKeys){
    const a = mine.regions[k], b = proto.regions[k];
    for (const field of Object.keys(b)) expect(a[field], `${k}.${field}`).toEqual(b[field]);
  }
  for (const key of ['SRC', 'VIDEOS', 'ORDER', 'ROMDEF', 'MMTDEF', 'GRADES', 'GVAL', 'ENDFEEL', 'BANDS', 'CAP']) expect(mine[key], key).toEqual(proto[key]);
  for (const name of Object.keys(proto.fns)) expect(mine.fns[name], `function ${name}`).toBe(proto.fns[name]);
});
