// The placeholder app shell loads with no console errors and no outside requests.
import { test, expect } from '@playwright/test';
import { guard } from './support/pages.js';

test('placeholder index.html loads cleanly', async ({ page }) => {
  const errors = await guard(page);
  const outside = [];
  page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1')) outside.push(r.url()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('SOAP Note Generator');
  expect(errors).toEqual([]);
  expect(outside).toEqual([]);
});
