// Phase 3: the Settings screen, branding, theme, persistence, import/export,
// and every setting wired into the Note screen.
import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { guard } from './support/pages.js';
import { DEFAULTS } from '../js/settings/defaults.js';

async function openApp(page){
  const errors = await guard(page);
  await page.goto('/');
  await expect(page.locator('#e_region option')).toHaveCount(9);
  return errors;
}
const openSettings = page => page.click('#settingsBtn');
const backToNote = page => page.locator('#view-settings [data-view="note"]').click();
const settingsNow = page => page.evaluate(() => import('/js/settings/store.js').then(m => m.getSettings()));
const css = (page, sel, prop) => page.locator(sel).evaluate((e, p) => getComputedStyle(e)[p], prop);

/** Set a color through the hex text box. */
async function setColor(page, key, hex){
  const box = page.locator(`[data-hex="${key}"]`);
  await box.fill(hex); await box.press('Tab');
}

/** A PNG made in the page: w×h with noise so it compresses poorly. */
async function makePng(page, w, h){
  const b64 = await page.evaluate(([w, h]) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    const img = g.createImageData(w, h); let x = 12345;
    for (let i = 0; i < img.data.length; i += 4){ x = (x * 1103515245 + 12345) & 0x7fffffff; img.data[i] = x & 255; img.data[i + 1] = (x >> 8) & 255; img.data[i + 2] = (x >> 16) & 255; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0); return c.toDataURL('image/png').split(',')[1];
  }, [w, h]);
  return { name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') };
}

test('brand and accent colors drive the header, with a readable text color', async ({ page }) => {
  const errors = await openApp(page);
  expect(await css(page, '.mast', 'backgroundColor')).toBe('rgb(0, 100, 40)');
  await openSettings(page);
  await setColor(page, 'brandColor', '#1E3A8A');
  await setColor(page, 'accentColor', '#FF8800');
  expect(await css(page, '.mast', 'backgroundColor')).toBe('rgb(30, 58, 138)');
  expect(await css(page, '.mast', 'color')).toBe('rgb(255, 255, 255)');
  expect(await css(page, '.mast', 'borderBottomColor')).toBe('rgb(255, 136, 0)');
  // A light brand color gets near-black text.
  await setColor(page, 'brandColor', '#F0DC3C');
  expect(await css(page, '.mast', 'backgroundColor')).toBe('rgb(240, 220, 60)');
  expect(await css(page, '.mast', 'color')).toBe('rgb(17, 17, 17)');
  await expect(page.locator('#set_contrast')).toContainText('near-black');
  // Brand-colored text on the page stays readable (darkened for contrast on white).
  await backToNote(page);
  const ratio = await page.evaluate(() => import('/js/settings/theme.js').then(t => {
    const rgb = getComputedStyle(document.querySelector('.letter')).color.match(/\d+/g).map(Number);
    return t.contrast(t.toHex(rgb), '#FFFFFF');
  }));
  expect(ratio).toBeGreaterThanOrEqual(4.5);
  // Persists across reload.
  await page.reload();
  expect(await css(page, '.mast', 'backgroundColor')).toBe('rgb(240, 220, 60)');
  expect(errors).toEqual([]);
});

test('logo upload: resized PNG in the header and favicon, persists, and can be removed', async ({ page }) => {
  const errors = await openApp(page);
  await expect(page.locator('#appLogo')).toBeHidden();
  await openSettings(page);
  await page.locator('#set_logo_file').setInputFiles(await makePng(page, 1400, 700));
  await expect(page.locator('#set_status')).toHaveText('Logo saved.');
  await expect(page.locator('#set_logo_preview')).toBeVisible();
  const info = await page.locator('#appLogo').evaluate(img => ({ w: img.naturalWidth, h: img.naturalHeight, src: img.src, visible: !img.hidden, fav: document.querySelector('link[rel="icon"]').href }));
  expect(info.visible).toBe(true);
  expect(Math.max(info.w, info.h)).toBeLessThanOrEqual(512);
  expect(info.w / info.h).toBeCloseTo(2, 1);
  expect(info.src.startsWith('data:image/png;base64,')).toBe(true);
  expect(Math.floor(info.src.split(',')[1].length * 3 / 4)).toBeLessThanOrEqual(300 * 1024);
  expect(info.fav).toBe(info.src);
  // The logo goes to IndexedDB, not localStorage.
  expect(await page.evaluate(() => Object.values(localStorage).some(v => v.includes('data:image')))).toBe(false);
  await page.reload();
  await expect(page.locator('#appLogo')).toBeVisible();
  expect(await page.locator('#appLogo').getAttribute('src')).toBe(info.src);
  await openSettings(page);
  await page.getByRole('button', { name: 'Remove logo' }).click();
  await expect(page.locator('#appLogo')).toBeHidden();
  expect(await page.locator('link[rel="icon"]').getAttribute('href')).toBe('data:,');
  await page.reload();
  await expect(page.locator('#appLogo')).toBeHidden();
  expect(errors).toEqual([]);
});

test('logo upload accepts SVG and rejects other files', async ({ page }) => {
  const errors = await openApp(page);
  await openSettings(page);
  await page.locator('#set_logo_file').setInputFiles({ name: 'x.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') });
  await expect(page.locator('#set_status')).toHaveText('Choose a PNG, JPG, or SVG image.');
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="300"><rect width="900" height="300" fill="#036"/><circle cx="150" cy="150" r="100" fill="#fc0"/></svg>';
  await page.locator('#set_logo_file').setInputFiles({ name: 'logo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) });
  await expect(page.locator('#set_status')).toHaveText('Logo saved.');
  const w = await page.locator('#appLogo').evaluate(i => [i.naturalWidth, i.naturalHeight]);
  expect(w).toEqual([512, 171]);
  expect(errors).toEqual([]);
});

test('theme: light, dark, and system', async ({ page }) => {
  const errors = await openApp(page);
  await openSettings(page);
  await page.locator('label[for="set_theme_dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await css(page, 'body', 'backgroundColor')).toBe('rgb(15, 22, 18)');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await openSettings(page);
  await page.locator('label[for="set_theme_light"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('label[for="set_theme_system"]').click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /./);
  expect(errors).toEqual([]);
});

test('export → reset → import restores everything, including the logo', async ({ page }) => {
  const errors = await openApp(page);
  await openSettings(page);
  // Change something in every group.
  await page.fill('[data-set="appTitle"]', 'Injury Notes');
  await page.fill('[data-set="orgName"]', 'Example High School');
  await page.fill('[data-set="programLine"]', 'Athletic Training');
  await page.locator('#set_logo_file').setInputFiles(await makePng(page, 300, 120));
  await expect(page.locator('#set_status')).toHaveText('Logo saved.');
  await setColor(page, 'brandColor', '#7A1F2B');
  await setColor(page, 'accentColor', '#C9A227');
  await page.locator('label[for="set_theme_light"]').click();
  await page.fill('[data-set="clinicianName"]', 'Jane Clinician');
  await page.fill('[data-set="clinicianCredentials"]', 'MS, LAT, ATC');
  await page.fill('[data-set="licenseNumber"]', 'AT-1234');
  await page.fill('[data-set="thrWnl"]', '15');
  await page.fill('[data-set="thrBil"]', '20');
  await page.fill('[data-set="physicianName"]', 'Dr. Lee');
  await page.locator('details[data-normreg="shoulder"] summary').click();
  await page.fill('[data-norm="shoulder|Flexion"]', '170'); await page.press('[data-norm="shoulder|Flexion"]', 'Tab');
  await page.fill('[data-add="therexPrograms"]', 'Shoulder stability'); await page.press('[data-add="therexPrograms"]', 'Enter');
  await page.getByRole('button', { name: 'Remove Ultrasound' }).click();
  await page.getByRole('button', { name: 'Move Crutches up' }).click();
  await page.locator('[data-prompt="referral|on"]').uncheck();
  await page.fill('[data-prompt="redFlag|text"]', 'Follow the EAP and call the team physician.');
  await page.fill('[data-set="emrName"]', 'Example EMR');
  await page.fill('[data-set="charLimit"]', '3000');
  await page.locator('label[for="set_emrFormat_plain"]').click();
  await page.locator('label[for="set_emrLength_full"]').click();
  await page.locator('[data-set="includeNegatives"]').check();
  await page.fill('[data-set="pdfPointer"]', 'See the attached PDF.');
  await page.locator('label[for="set_paperSize_A4"]').click();
  await page.fill('[data-set="filenamePattern"]', 'Eval_{last}_{date}');
  await page.fill('[data-set="footerText"]', 'Confidential.');
  await page.locator('[data-set="showSignature"]').uncheck();
  const changed = await settingsNow(page);
  for (const k of Object.keys(DEFAULTS)) if (k !== 'ptDestination' && k !== 'painQuality' && k !== 'notRuledOutSuffix' && !['referralDestinations', 'referralUrgency', 'referralReasonsPhysician', 'referralReasonsPT', 'therexLevels', 'communication'].includes(k)) expect.soft(changed[k], k).not.toEqual(DEFAULTS[k]);

  // Export.
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export settings' }).click()]);
  expect(dl.suggestedFilename()).toMatch(/^soap-settings-\d{4}-\d{2}-\d{2}\.json$/);
  const file = await dl.path();
  const exported = JSON.parse(fs.readFileSync(file, 'utf8'));
  expect(exported.kind).toBe('soap-note-generator/settings');
  expect(exported.settings).toEqual(changed);

  // Reset (two clicks).
  const reset = page.locator('[data-sact="resetAll"]');
  await reset.click();
  await expect(reset).toHaveText('Click again to reset everything');
  await reset.click();
  await expect(page.locator('#set_status')).toHaveText('All settings reset to defaults.');
  expect(await settingsNow(page)).toEqual(DEFAULTS);
  await expect(page.locator('#appTitle')).toHaveText(DEFAULTS.appTitle);
  await expect(page.locator('#appLogo')).toBeHidden();
  expect(await css(page, '.mast', 'backgroundColor')).toBe('rgb(0, 100, 40)');
  await page.reload();
  expect(await settingsNow(page)).toEqual(DEFAULTS);

  // Import.
  await openSettings(page);
  await page.locator('#set_import').setInputFiles(file);
  await expect(page.locator('#set_status')).toHaveText('Settings imported.');
  expect(await settingsNow(page)).toEqual(changed);
  await expect(page.locator('[data-set="appTitle"]')).toHaveValue('Injury Notes');
  await expect(page.locator('#appLogo')).toBeVisible();
  expect(await css(page, '.mast', 'backgroundColor')).toBe('rgb(122, 31, 43)');
  await page.reload();
  expect(await settingsNow(page)).toEqual(changed);
  await expect(page.locator('#appTitle')).toHaveText('Injury Notes');
  await expect(page.locator('#appLogo')).toBeVisible();
  expect(errors).toEqual([]);
});

test('import ignores unknown keys and rejects files that are not settings', async ({ page }) => {
  const errors = await openApp(page);
  await openSettings(page);
  await page.locator('#set_import').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"athlete":"Sam"}') });
  await expect(page.locator('#set_status')).toContainText("isn't a settings export");
  await page.locator('#set_import').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('not json') });
  await expect(page.locator('#set_status')).toContainText("isn't a settings export");
  expect(await settingsNow(page)).toEqual(DEFAULTS);
  const partial = { appTitle: 'Partial', athleteName: 'Sam Smith', thrWnl: 'abc', brandColor: 'red', treatments: ['Ice', '', 'Ice', 7] };
  await page.locator('#set_import').setInputFiles({ name: 'p.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(partial)) });
  await expect(page.locator('#set_status')).toHaveText('Settings imported.');
  const s = await settingsNow(page);
  expect(s).toEqual({ ...DEFAULTS, appTitle: 'Partial', treatments: ['Ice'] });
  expect(JSON.stringify(await page.evaluate(() => ({ ...localStorage })))).not.toContain('Sam');
  expect(errors).toEqual([]);
});

test('every setting reaches the Note screen', async ({ page }) => {
  const errors = await openApp(page);
  await openSettings(page);
  await page.fill('[data-set="clinicianName"]', 'Jane Clinician');
  await page.fill('[data-set="clinicianCredentials"]', 'MS, LAT, ATC');
  await page.fill('[data-set="physicianName"]', 'Dr. Lee');
  await page.fill('[data-set="thrWnl"]', '20');
  await page.fill('[data-set="thrBil"]', '5');
  await page.fill('[data-add="treatments"]', 'Dry needling'); await page.click('[data-lact="add"][data-key="treatments"]');
  await page.fill('[data-add="therexPrograms"]', 'Ankle program'); await page.press('[data-add="therexPrograms"]', 'Enter');
  await page.fill('[data-add="communication"]', 'Team physician emailed'); await page.press('[data-add="communication"]', 'Enter');
  await page.fill('[data-add="referralReasonsPhysician"]', 'Suspected fracture'); await page.press('[data-add="referralReasonsPhysician"]', 'Enter');
  await page.getByRole('button', { name: 'Remove EMS transport' }).click();
  await page.locator('details[data-normreg="shoulder"] summary').click();
  await page.fill('[data-norm="shoulder|Flexion"]', '170'); await page.press('[data-norm="shoulder|Flexion"]', 'Tab');
  await page.fill('[data-prompt="redFlag|text"]', 'Activate the EAP now.');
  await page.locator('[data-prompt="referral|on"]').uncheck();
  await page.fill('[data-set="appTitle"]', 'My Notes');
  await expect(page.locator('#appTitle')).toHaveText('My Notes');
  await expect(page).toHaveTitle('My Notes');
  await backToNote(page);

  await expect(page.locator('#e_eval')).toHaveValue('Jane Clinician, MS, LAT, ATC');
  await expect(page.locator('#thr_wnl')).toHaveValue('20');
  await expect(page.locator('#thr_bil')).toHaveValue('5');
  await expect(page.locator('#p_tx input[value="Dry needling"]')).toHaveCount(1);
  await expect(page.locator('#p_therex option', { hasText: 'Ankle program, Beginner' })).toHaveCount(1);
  await expect(page.locator('#p_comm input[value="Team physician emailed"]')).toHaveCount(1);
  await expect(page.locator('#p_ref option[value="Directing physician (Dr. Lee)"]')).toHaveCount(1);
  await expect(page.locator('#p_ref option[value="EMS transport"]')).toHaveCount(0);
  await page.selectOption('#p_ref', 'Directing physician (Dr. Lee)');
  await expect(page.locator('#p_reasons input[value="Suspected fracture"]')).toHaveCount(1);
  // The referral prompt is off.
  await expect(page.locator('#p_suggest')).not.toContainText('Make the directing physician aware');

  await page.selectOption('#e_region', 'shoulder');
  await expect(page.locator('[data-rom="shoulder|0|norm"]')).toHaveValue('170');
  await page.locator('[data-reg="shoulder"][data-fid^="rf_"]:not([data-fid="rf_screened"])').first().check();
  await expect(page.locator('#live')).toContainText('Activate the EAP now.');
  await expect(page.locator('#p_suggest')).toContainText('Activate the EAP now.');

  // Changing settings mid-note keeps what the clinician typed and the referral choice.
  await page.fill('#thr_wnl', '12');
  await openSettings(page);
  await page.fill('[data-set="physicianName"]', 'Dr. Kim');
  await page.fill('[data-set="thrWnl"]', '25');
  await page.fill('[data-set="thrBil"]', '8');
  await page.fill('[data-norm="shoulder|Flexion"]', '175'); await page.press('[data-norm="shoulder|Flexion"]', 'Tab');
  await backToNote(page);
  await expect(page.locator('#thr_wnl')).toHaveValue('12');
  await expect(page.locator('#thr_bil')).toHaveValue('8');
  await expect(page.locator('#p_ref')).toHaveValue('Directing physician (Dr. Kim)');
  await expect(page.locator('[data-rom="shoulder|0|norm"]')).toHaveValue('175');
  await expect(page.locator('[data-reg="shoulder"][data-fid^="rf_"]:checked')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('patient data never persists; settings do', async ({ page }) => {
  const errors = await openApp(page);
  await page.fill('#e_name', 'Sam Athlete');
  await page.fill('#s_cc', 'Right shoulder pain');
  await openSettings(page);
  await page.fill('[data-set="orgName"]', 'Example Program');
  await backToNote(page);
  await expect(page.locator('#e_name')).toHaveValue('Sam Athlete');
  const stored = await page.evaluate(async () => {
    const ls = JSON.stringify({ ...localStorage });
    const idb = await new Promise(res => { const r = indexedDB.open('soap-note-generator', 1); r.onsuccess = () => { const db = r.result; const q = db.transaction('settings').objectStore('settings').getAll(); q.onsuccess = () => { db.close(); res(JSON.stringify(q.result)); }; }; });
    return ls + idb + document.cookie;
  });
  expect(stored).toContain('Example Program');
  expect(stored).not.toContain('Sam Athlete');
  expect(stored).not.toContain('Right shoulder pain');
  page.on('dialog', d => d.accept());
  await page.reload();
  await expect(page.locator('#e_name')).toHaveValue('');
  await expect(page.locator('#programLine')).toContainText('Example Program');
  expect(errors).toEqual([]);
});

test('settings screen: keyboard list editing, invalid numbers, 360px layout', async ({ page }) => {
  const errors = await openApp(page);
  await openSettings(page);
  await expect(page.locator('#settings_h')).toBeFocused();
  await page.fill('[data-set="thrWnl"]', 'abc');
  await expect(page.locator('[data-set="thrWnl"]')).toHaveAttribute('aria-invalid', 'true');
  expect((await settingsNow(page)).thrWnl).toBe(10);
  await page.getByRole('button', { name: 'Move Personal physician up' }).focus();
  await page.keyboard.press('Enter');
  expect((await settingsNow(page)).referralDestinations.slice(0, 2)).toEqual(['Personal physician', 'Directing physician']);
  await expect(page.getByRole('button', { name: 'Move Personal physician up' })).toBeDisabled();
  await page.click('[data-lact="reset"][data-key="referralDestinations"]');
  expect((await settingsNow(page)).referralDestinations).toEqual(DEFAULTS.referralDestinations);
  // Editing an item in place.
  await page.fill('[data-li="treatments|0"]', 'Ice'); await page.press('[data-li="treatments|0"]', 'Tab');
  expect((await settingsNow(page)).treatments[0]).toBe('Ice');
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  expect(errors).toEqual([]);
});
