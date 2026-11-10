// Generates docs/evidence-table.csv from the engine data (docs/SPEC.md §10) so a
// clinician can audit every coded value. Usage:
//   node scripts/evidence-table.mjs          write docs/evidence-table.csv
//   node scripts/evidence-table.mjs --check  exit 1 if the committed file is stale
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REG, ORDER, INDEX } from '../js/engine/registry.js';
import { SRC } from '../js/engine/sources.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CSV_PATH = path.join(ROOT, 'docs/evidence-table.csv');

const COLUMNS = ['region', 'finding_id', 'finding_label', 'section', 'subgroup', 'condition_id', 'condition_name',
  'condition_prior', 'condition_miss', 'value_type', 'lr_pos', 'lr_neg', 'sensitivity', 'specificity', 'lr_pos_capped',
  'source_key', 'source_text'];

const num = x => (x == null ? '' : String(+Number(x).toFixed(4)));
const cell = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

function valueType(e){
  if (e.s === 'EXP') return 'Expert weight (pseudo-LR)';
  if (e.se != null) return 'Computed from sensitivity/specificity';
  return 'Likelihood ratio as coded';
}

/** Build the CSV text: one row per (region, finding, condition it informs); findings that inform nothing get one row. */
export function buildEvidenceCsv(){
  const rows = [COLUMNS];
  for (const k of ORDER){
    const R = REG[k];
    const secTitle = id => (R.sections.find(s => s.id === id) || {}).title || id;
    for (const f of R.findings){
      const base = [k, f[0], f[3], secTitle(f[1]), f[2] || ''];
      const informs = R.conditions.filter(c => c.ev[f[0]]);
      if (!informs.length){ rows.push([...base, '', '', '', '', 'Not weighted for any condition', '', '', '', '', '', '', '']); continue; }
      for (const c of informs){
        const e = c.ev[f[0]];
        rows.push([...base, c.id, c.name, num(c.prior), c.miss, valueType(e), num(e.p), num(e.n), num(e.se), num(e.sp),
          e.capped ? 'yes' : '', e.s, SRC[e.s] || '']);
      }
    }
    // Evidence keyed to ids that are not findings in this region (should be none).
    for (const c of R.conditions) for (const fid of Object.keys(c.ev)) if (!INDEX[k].FMAP[fid])
      rows.push([k, fid, '(not a finding in this region)', '', '', c.id, c.name, num(c.prior), c.miss, valueType(c.ev[fid]),
        num(c.ev[fid].p), num(c.ev[fid].n), num(c.ev[fid].se), num(c.ev[fid].sp), c.ev[fid].capped ? 'yes' : '', c.ev[fid].s, SRC[c.ev[fid].s] || '']);
  }
  return rows.map(r => r.map(cell).join(',')).join('\n') + '\n';
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
  const csv = buildEvidenceCsv();
  if (process.argv.includes('--check')){
    const current = fs.existsSync(CSV_PATH) ? fs.readFileSync(CSV_PATH, 'utf8') : '';
    if (current !== csv){ console.error('docs/evidence-table.csv is out of date. Run: npm run evidence'); process.exit(1); }
    console.log('docs/evidence-table.csv is up to date.');
  } else {
    fs.writeFileSync(CSV_PATH, csv);
    console.log(`Wrote ${csv.split('\n').length - 2} rows to docs/evidence-table.csv`);
  }
}
