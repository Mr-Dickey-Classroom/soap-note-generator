# Changelog

## 0.4.0 (Phase 4: EMR text output)
- `js/output/emr-text.js`: the prototype's EMR paste text (`fullText`/`fullTextMd`, `textS`/`textO`/`mdO`/`textP`, condensed assessment filter, short ROM/MMT flags, Markdown tables) ported to pure functions over the note snapshot. No DOM access. Markdown or plain text, condensed or full, include-negatives toggle. Name and DOB are never included.
- Output panel (`index.html`, `js/ui/output.js`, `css/app.css`): format and length switches, negatives checkbox, character counter (`aria-live`; amber at ≥ 90% of the limit, red and bold when over), inline limit field, Copy (Clipboard API, then `execCommand`, then "Text selected. Press Ctrl+C"), and a confirmation message. Editing the text box recounts but is not saved back and does not mark the note as changed. Added an "EMR text" link to the section nav and a Copy button in the header.
- Labels use the EMR name from Settings ("Healthy Roster text", "Copy for Healthy Roster").
- New settings defaults (`js/settings/defaults.js`): `emrCharLimit` (5000), `emrFormat` (md), `emrLength` (cond), `emrIncludeNeg` (off), `pdfPointerText`. A new note starts from these. Editing the limit inline updates the setting (`updateSettings` in `store.js`); it is kept in memory only until Settings persistence lands in Phase 3.
- Differences from the prototype, as in SPEC §9: no student evaluator line; the PDF-pointer line comes from Settings; the amber counter threshold is ≥ 90% (SPEC §4) instead of > 90%.
- Tests (77 passing; `tests/emr-text.spec.js` adds 21):
  - The shoulder-initial and knee-reeval cases reproduce `tests/fixtures/*.{condensed.md,full.md,condensed.txt}` exactly, with the evaluator set through Settings ("Jane Clinician", "MS, LAT, ATC") and picked up by New note. Adding a name and DOB doesn't change the text.
  - Text parity with the prototype for all 8 format × length × negatives combinations on each region's built-in example, both fixture cases, and a two-region re-evaluation that uses every free-text field, an evaluation time, custom ROM rows, end-feel, pain, referral reasons, and communication.
  - Panel behavior: EMR-name labels, Settings defaults, negatives toggle, counter states and inline limit, box edits not marking the note dirty, Copy via the clipboard and both fallbacks.
  - `tests/support/fill.js` now also fills prior history, function/goals, notes boxes, movement patterns, treatment details, referral reasons, communication, plan notes, select-type ROM fields, and custom MMT names, and leaves the evaluator alone when a case doesn't name one.

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
