// Node-only checks of the engine (no browser, no DOM).
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { analyzeRegion, dxName, findingLists, evidenceFor, sideWord } from '../js/engine/engine.js';
import * as context from '../js/engine/context.js';
import { REG, ORDER, impressionOptions } from '../js/engine/registry.js';
import { romFlags, newRomRows } from '../js/engine/measures.js';
import { planPrompts } from '../js/engine/plan-prompts.js';
import { buildEvidenceCsv, CSV_PATH } from '../scripts/evidence-table.mjs';

const listJs = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? listJs(path.join(dir, e.name)) : e.name.endsWith('.js') ? [path.join(dir, e.name)] : []);

test('engine modules never touch the DOM, storage, or network', () => {
  const files = listJs('js/engine');
  expect(files.length).toBeGreaterThanOrEqual(16);
  for (const f of files){
    const src = fs.readFileSync(f, 'utf8');
    expect(src, f).not.toMatch(/\b(document|window|localStorage|sessionStorage|indexedDB|navigator)\s*\.|\bfetch\s*\(|XMLHttpRequest|import\s*\(/);
  }
});

test('all 8 regions are registered in display order', () => {
  expect(ORDER).toEqual(['cervical', 'shoulder', 'elbow', 'wrist', 'lumbar', 'hip', 'knee', 'ankle']);
  expect(Object.keys(REG).sort()).toEqual([...ORDER].sort());
});

test('the region context exists only during a call', () => {
  expect(context.state).toBeUndefined();
  analyzeRegion('knee', { raw:'', rk:'', id:'', other:'', conf:'', secondary:[] }, { state:{ h_acute:true } });
  expect(context.state).toBeUndefined();
  expect(context.FINDINGS).toBeUndefined();
});

test('analysis does not modify the state it is given', () => {
  const state = { h_contact:true, p_ac:'pos', t_crossbody:'neg' };
  const copy = JSON.parse(JSON.stringify(state));
  analyzeRegion('shoulder', { raw:'shoulder:acj', rk:'shoulder', id:'acj', other:'', conf:'High', secondary:[] }, { state, side:'L' });
  expect(state).toEqual(copy);
});

test('shoulder fixture case: impression, not-yet-ruled-out list, and AC cluster', () => {
  const state = { rf_screened:true, h_contact:true, h_acute:true, h_mech_point:true, h_loc_top:true, h_weak:true,
    p_ac:'pos', t_crossbody:'pos', t_acresist:'pos', t_obrien_ac:'pos' };
  const D = { raw:'shoulder:acj', rk:'shoulder', id:'acj', other:'', conf:'Moderate', secondary:[] };
  const errors = [];
  const A = analyzeRegion('shoulder', D, { state, side:'L', onError: e => errors.push(e) });
  expect(errors).toEqual([]);
  expect(A.results[0].c.id).toBe('acj');
  expect(A.dx.side).toBe('left');
  expect(dxName(D)).toBe('AC joint sprain / separation');
  // Matches "Not yet ruled out" in tests/fixtures/shoulder-initial.condensed.md
  expect(A.ro).toEqual(['Brachial plexus neurapraxia (stinger / burner)', 'Clavicle or proximal humerus fracture', 'Full-thickness rotator cuff tear']);
  expect(A.clusters.find(x => x.cl.id === 'chron').res.tone).toBe('good');
  expect(findingLists('shoulder', state, ['p']).pos).toEqual(['AC joint']);
  expect(A).not.toHaveProperty('stars');
  expect(planPrompts([A], { shoulder: state }, { referral:'Directing physician' }).map(p => p.key)).toEqual(['notRuledOut', 'referral']);
});

test('measure flags and helpers take their context as arguments', () => {
  const r = { m:'Flexion', norm:'180', aL:'90', aR:'180', pL:'155', pR:'180', pain:true };
  expect(romFlags(r, { side:'L' }).flags.map(f => f.x)).toContain('L PROM exceeds AROM by 65°');
  expect(romFlags({ ...r, prior:'80' }, { side:'L', reeval:true }).flags.at(-1)).toEqual({ t:'up', x:'+10° since last (was 80)' });
  expect(newRomRows('knee', { Flexion:140 })[0]).toEqual({ m:'Flexion', norm:'140', mid:false });
  expect(sideWord('B')).toBe('bilateral');
  expect(impressionOptions(['knee'])[0].options.length).toBe(REG.knee.conditions.length);
  expect(evidenceFor('knee', 't_lachman')[0]).toMatchObject({ source:'BENJ06', se:0.85, sp:0.94 });
});

test('dislocation prompt fires on the deformity red flag in the five listed regions only (P11)', () => {
  const D = { raw:'', rk:'', id:'', other:'', conf:'', secondary:[] };
  const keys = (k, state) => planPrompts([analyzeRegion(k, D, { state })], { [k]: state }).map(p => p.key);
  for (const k of ['elbow', 'wrist', 'knee', 'ankle', 'hip']) expect(keys(k, { rf_deform:true }).slice(0, 2), k).toEqual(['redFlag', 'dislocation']);
  expect(keys('shoulder', { rf_deform:true })).not.toContain('dislocation');
  expect(keys('knee', { rf_nv:true })).not.toContain('dislocation');
});

test('docs/evidence-table.csv is up to date with the engine data', () => {
  expect(fs.readFileSync(CSV_PATH, 'utf8')).toBe(buildEvidenceCsv());
});
