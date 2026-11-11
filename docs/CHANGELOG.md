# Changelog

## 0.3.0 (Phase 3: Settings, branding, theme)
- Settings screen (`js/settings/screen.js`, opened from the header; the note stays in memory while it is open) with every SPEC §6 group: Branding (app title, organization, program line, logo, brand and accent colors with a live contrast readout, System/Light/Dark theme), Clinician (name, credentials, license number), Clinical (WNL thresholds, ROM norm overrides per region and motion with per-region and global reset, directing physician, editable lists with add/edit/remove/reorder and reset to defaults, and the destination that uses the PT reasons), Plan prompts (on/off and wording, with reset), EMR output (name, character limit, default format and length, include negatives, PDF pointer line), PDF (paper size, file name pattern, footer text, signature line), and Data (export, import, two-click reset all). Changes save immediately. Referral urgency and therex levels are also editable lists.
- Store (`js/settings/store.js`): settings in `localStorage`; the logo in IndexedDB (falls back to `localStorage`). Every value is type-checked on load, save, and import; unknown keys are dropped, so imports can't carry anything else (such as patient data). Export format: `{kind, version, exported, settings}` including the logo.
- Logo (`js/settings/logo.js`): PNG/JPG/SVG converted to a PNG data URL, at most 512 px on the longest side and 300 KB (shrinks further if needed), with preview and remove; shown in the header and as the page favicon.
- Theme (`js/settings/theme.js`): brand and accent colors generate the CSS tokens for light and dark mode, including derived tints, a brand text color darkened (light) or lightened (dark) to reach 4.5:1, and white or near-black text on brand and accent surfaces, whichever contrasts more. The header band now uses the brand color itself (it used a darker shade) so it matches the PDF header.
- Wired into the Note screen: evaluator default, thresholds, ROM norms, referral destinations (with "Directing physician (Dr. X)"), referral reasons, urgency, treatments, therex programs and levels, communication items, and plan prompt wording and toggles. Changing Settings mid-note updates only fields that still hold the previous default, and keeps selections (a chosen directing-physician referral follows a name change). EMR and PDF settings are stored for Phases 4 and 5.
- Tests (65 passing): new `tests/settings.spec.js` covers colors and readable header text, logo upload/resize/favicon/persistence/removal, SVG and bad-file handling, theme, export → reset → import restoring every setting including the logo, import validation, every setting reaching the Note screen, patient data never stored, keyboard list editing, invalid numbers, and the 360px layout.

## 0.2.0 (Phase 2: note form and live differential)
- Note screen (`index.html`, `css/app.css`, `js/ui/*`, `js/main.js`): Encounter, Subjective (with the re-evaluation block), Objective (engine sections, notes boxes, ROM and MMT tables with flags, custom rows, prior columns, editable thresholds), live differential panel, Assessment (impression, confidence, also-considering, auto-draft with edit lock and Redraft), and Plan (prompts, status, restrictions, treatment, therex, referral with reasons, communication, follow-up). Two-click New note and a warning before leaving a page with input.
- Same element ids and behavior as the prototype; the note lives only in memory (`js/ui/note.js`). Student mode removed. Grade is free text. "Coaching notes" renamed "Clinical reasoning notes". The live red-flag alert and plan prompts use Settings wording. Evaluation date and time default to now. Video links open in a new tab (`noopener noreferrer`) with an internet-connection note.
- Placeholder Settings (`js/settings/defaults.js`, `store.js`): generic default lists (therex ships empty) until Phase 3.
- `js/output/assessment-draft.js` (the prototype's draftA on a note snapshot) and `js/output/format.js`.
- Fixed a prototype display bug: the `hidden` attribute didn't hide form fields, so "Name the diagnosis" and referral reasons were always visible.
- Evidence sign-off: `EVIDENCE_REVIEWED` set to `true` after clinician review of `docs/evidence-table.csv`.
- Tests (54 passing): the two fixture cases, each region's example, and a two-region red-flag case are entered in both the prototype and the new app; the differential panel, ROM/MMT flags and highlighted cells, assessment draft, plan prompts, and impression lists must match. Plus behavior tests (red-flag screen exclusivity, re-eval columns, thresholds, custom rows, draft lock and Redraft, Other impression, evidence and video links, next-test jump, referral reasons, New note, leave warning, 360px layout).
- P11 (clinician decision): the dislocation plan prompt now fires when the deformity/dislocation red flag is checked in the elbow, wrist, knee, ankle, or hip. The prototype's version never fired. Parity tests allow exactly this difference.

## Unreleased (between Phases 1 and 2)
- Recorded the clinician's answers to the Phase 0 questions in docs/QUESTIONS.md. C2 (Wainner cluster wording): keep both versions as coded. No engine changes.
- SPEC updated to match: evaluation time defaults to now and prints in the EMR header; evaluator line is "{Name}, {Credentials}"; referral label includes the physician name when set; therex list ships empty; the live red-flag alert uses the Settings prompt text; video links carry an internet-connection note; student grade calculation removed from the engine.
- `pdfjs-dist` approved as a dev-only dependency for the Phase 5 PDF test.

## 0.1.0 (Phase 1: scaffold, engine port, parity tests)
- Scaffold: folder layout from CLAUDE.md, `package.json` (dev-only `@playwright/test` 1.63.0), `.gitignore`, MIT `LICENSE`, placeholder `index.html` with the SPEC §8 CSP, minimal `css/app.css`.
- Static server: `tests/support/server.mjs` (Node built-ins only) instead of `http-server`; `npm run serve` previews at http://127.0.0.1:4173/.
- Clinical engine ported to `js/engine/` (no DOM access):
  - `regions/*.js`: the 8 regions' findings, sections, groups, conditions, gates, clusters, and insights, copied verbatim by line range from the prototype.
  - `context.js`: the prototype's "current region" globals as ES-module live bindings, set only during a synchronous call, so cluster readouts and insights stay character-for-character identical.
  - `engine.js` (scoring, `analyzeRegion`, `dxName`, `findingLists`, `evidenceFor`), `registry.js`, `measures.js` (ROM/MMT defaults and flags), `plan-prompts.js` (prompt keys only), `evidence.js`, `sources.js`, `videos.js`, `meta.js` (`EVIDENCE_REVIEWED = false`).
  - Intentional differences: inputs are passed as arguments; errors in cluster readouts and insights go to an optional `onError` hook (still swallowed by default); the student grade (`comp`/`total`/`stars`) is removed (SPEC §9.1).
- Tests (`npm test`, 32 passing):
  - `engine-source.spec.js`: region data, sources, video links, ROM/MMT defaults, bands, and the source text of every cluster readout, insight, and scoring/flag function match the prototype.
  - `engine-parity.spec.js`: per region, the prototype's built-in example is entered through the prototype's own form controls and the ranked differential, cluster readouts, next tests, notes, and rule-outs must equal the new engine's; 1,936 generated single-region cases (every history gate, every cluster all-positive/all-negative/partial, every red flag, 200 seeded random states per region), 200 two-region cases, and 400 ROM/MMT cases also match exactly.
  - `engine.unit.spec.js` (Node, no browser): engine purity scan, context reset, input not mutated, shoulder fixture rule-out list, evidence table freshness.
  - `app-shell.spec.js`: placeholder page loads with no console errors or outside requests.
- `docs/evidence-table.csv` (1,026 rows) generated by `npm run evidence` from the engine data: one row per finding × condition it informs, with prior, value type, LR+/LR−, sensitivity/specificity, cap, and source.

## 0.0.1 (Phase 0: implementation plan)
- Added docs/IMPLEMENTATION_PLAN.md: engine module split, global-to-argument mapping, module list, test strategy, risks.
- Added Phase 0 clinical and product questions to docs/QUESTIONS.md.

## 0.0.0 (starter kit)
- Spec, build plan, reference prototype (v8), fixtures.
