// Page helpers shared by the parity specs.
import { expect } from '@playwright/test';

export const PROTOTYPE = '/reference/soap-note-generator-v8.html';
export const HARNESS = '/tests/support/engine-harness.html';

/** Block every request that isn't to the local test server, and collect console errors. */
export async function guard(page){
  const errors = [];
  await page.route(url => !/^http:\/\/127\.0\.0\.1:\d+\//.test(url.href), route => route.abort());
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  return errors;
}

/** Open the prototype with the shared serializers loaded. */
export async function openPrototype(page){
  const errors = await guard(page);
  await page.goto(PROTOTYPE);
  await page.addScriptTag({ url: '/tests/support/serialize.js' });
  await expect(page.locator('#e_region option')).toHaveCount(9);
  return errors;
}

/** Open the new-engine harness (ES modules, no DOM use by the engine). */
export async function openHarness(page){
  const errors = await guard(page);
  await page.goto(HARNESS);
  await page.waitForFunction(() => window.__ready === true);
  return errors;
}
