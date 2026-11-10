# Implementation plan

Phase 0 output. Covers the engine port, the module layout, the test strategy, and the risks. Line numbers refer to `reference/soap-note-generator-v8.html`.

## Why this plan exists

Phase 0 of `docs/BUILD_PLAN.md`. Before any code is written, we need an agreed design for porting the clinical engine in `reference/soap-note-generator-v8.html` (one classic `<script>`, ~3,000 lines, lines 445–3495) into DOM-free ES modules under `js/engine/` without changing behavior. We also need a test strategy that proves parity with the prototype. The prototype's engine depends on mutable globals (`state`, `REGION`, `FINDINGS`, …) that `useRegion(k)` swaps around. Its cluster `read()` functions and region `insights()` functions use those globals as free variables (`state.t_ultta`, `isChecked(...)`). The main design problem is removing them without editing the function bodies.

## A. Engine port: the key decision

**Approach: a scoped "evaluation context" with ES-module live bindings.**

- `js/engine/context.js` exports `let state`, `let region` (live bindings) and the helpers `isChecked`, `isAssessed`, `triFinding`, `gateOpen`, which read them. It also exports `withRegion(key, stateObj, fn)`, which sets both bindings, runs `fn` synchronously in `try/finally`, and then resets them to `undefined`.
- Region modules `import { state, isChecked, isAssessed } from '../context.js'`. Every cluster `read()` and every `*Insights(A)` body is then pasted **character-for-character**, because `state.t_ultta === 'neg'` resolves to the live binding.
- Public engine functions take **explicit arguments** (`analyzeRegion(k, dx, {state, side})`). The context is a private implementation detail that only exists during a synchronous call. Nothing persists between calls, and no globals are left on `window`.
- I rejected rewriting the bodies to `S.isChecked(...)`. That touches about 100 functions and breaks the verbatim guarantee, and it would make the function-source check (D.2) impossible.

## B. Every global the engine uses and how it gets passed instead

| Prototype global (line) | Kind | New home / how it's passed |
|---|---|---|
| `SRC` (451, plus `Object.assign` at 792, 1086, 1374, 1860, 2277) | data, mutated at load | `engine/sources.js`: one merged frozen object (blocks are cross-referenced across regions, so it can't be split per region) |
| `CAP`, `SS`, `X`, `T` (473–480, 1099) | pure helpers | `engine/evidence.js` (with `power`, `fmt`) |
| `XX_FINDINGS/SECTIONS/GROUPS/CONDITIONS/GATES/CLUSTERS`, `*Insights`, `ottawaRead` | region data | `engine/regions/<region>.js`, verbatim, same identifiers; gate-attachment `for` loops kept in each module |
| `REG`, `ORDER` (1350, 2582) | registry | `engine/registry.js` imports the 8 region modules and builds `REG` with the same shape (label, noun, findings, sections, groups, conditions, clusters, insights, screen, example) |
| `CACHE`, `FMAP`, `CMAP` (2616–2627) | lazy per-region indexes | precomputed once in `registry.js`: `INDEX[k] = {FMAP, CMAP}` |
| `REGION`, `REGION_KEY`, `FINDINGS`, `SECTIONS`, `GROUPS`, `CONDITIONS`, `CLUSTERS` (2616) | "current region" switched by `useRegion` | `context.region` inside `withRegion`; engine code reads `region.findings` etc. Region modules refer only to their own consts |
| `state` (2617) | current region's finding map | explicit arg → `context.state` during a call |
| `STATES` (2618) | all regions' finding maps | owned by the UI note model (`ui/note-state.js`), passed per call; `planPrompts()` receives `statesByRegion` |
| `ROMV`, `MMTV`, `NOTES` (2618) | ROM/MMT rows, notes | note model; passed as `rows` to `measures.js` and as `note` to output functions |
| `VIDEOS` (1855, 2111, 2490–2491) | data | `engine/videos.js` (including the two alias lines) |
| `BANDS`, `band`, `scoreCondition` (2511–2540) | engine | `engine/engine.js`, verbatim body |
| `getDx()` (2835) reads `#a_primary`, `#a_other`, `conf`, `#a_secondary` | DOM | UI builds a plain `dx = {raw, rk, id, other, conf, secondary}` and passes it |
| `sideWord()`/`side()` (2654) reads radio `side` | DOM | `side` passed in the call context |
| `thr('thr_wnl'/'thr_bil')`, `isReeval()` (2658, 2696) | DOM | `measures.js` functions take `{side, thrWnl, thrBil, reeval}` |
| `ROMDEF`, `MMTDEF`, `GRADES`, `GVAL`, `ENDFEEL`, `num` (2585–2640) | data/helpers | `engine/measures.js` (`num` re-exported for the UI) |
| `QUALITY`, `TX`, `THEREX`, `REF_MD`, `REF_PT`, `COMM` (2608–2613) | UI lists | **not engine**: `js/settings/defaults.js` (generic defaults, editable in Settings) |
| `esc`, `$`, `$$`, `val`, `radio`, `checkedIn` | DOM/HTML | `js/ui/dom.js`; the engine never escapes HTML |
| `lastAS`, `aEdited`, `timer`, `dirty` | app state | `ui/note-state.js` / `ui/controller.js` |

Behavior that must survive the move (and gets tests):
- **State-map semantics:** cleared findings are `delete`d, never set to `false`/`''`. `A.any = Object.keys(state).length > 0`, and dislocation detection scans `Object.keys`. `rf_screened` is stored in `state` but is not a FINDING. Checking it deletes all `rf_*` keys, and checking any `rf_*` deletes it (`onField`, 3250–3251) → `note-state.setFinding()`.
- **Ordering:** `cand` is a `Set` whose insertion order drives `ro`, `next` tie-breaks, and cluster filtering; sorts must stay stable; `Object.entries(c.ev)` order is the source order.
- **Silent `try/catch`** around `cl.read()` and `insights()` is kept. `analyzeRegion` takes an optional `onError` hook (default: swallow, as in the prototype), so tests can fail on any thrown error.
- **Student grade removed (SPEC §9.1):** the `comp/total/stars` block (2877–2892) is dropped from `analyzeRegion`. `REGION.screen` stays as region data. This is the only intentional engine diff, and the parity serializer ignores those fields.
- `evidenceText()` returns HTML. It splits into `engine.evidenceFor(k, fid)`, which returns structured rows, and `ui/evidence-box.js`, which formats them into the same text.
- `renderSuggest()` logic moves to `engine/plan-prompts.js`, which returns prompt **keys** (`redFlag`, `dislocation`, `notRuledOut` + list, `referral`). The wording comes from Settings (SPEC §3 Plan, §6).

## C. Module list and responsibilities

**`js/engine/`: pure, no DOM, importable in Node**
- `meta.js`: engine version; `EVIDENCE_REVIEWED = false` (SPEC §10).
- `evidence.js`: `CAP`, `SS`, `X`, `T`, `power`, `fmt`.
- `sources.js`: `SRC`.
- `context.js`: live `state`/`region`, `withRegion`, `isChecked`, `isAssessed`, `triFinding`, `gateOpen`.
- `regions/{shoulder,elbow,wrist,hip,knee,ankle,cervical,lumbar}.js`: each region's data plus its gates, clusters and insights (ankle also holds `ottawaRead`).
- `registry.js`: `ORDER`, `REG`, `INDEX` (FMAP/CMAP), `impressionOptions(regionKeys)` (sorted by prior, as in `buildImpression`).
- `videos.js`: `VIDEOS`.
- `engine.js`: `BANDS`, `band`, `scoreCondition`, `analyzeRegion(k, dx, {state, side, onError})`, `dxName(dx)`, `findingLists(k, state, secIds)` (was `findings()`), `evidenceFor(k, fid)`.
- `measures.js`: ROM/MMT defaults, `newRomRows(k, normOverrides)`, `newMmtRows(k)`, `romFlags`, `mmtFlags`, `romChange`, `mmtChange`, `invKey`, `measureFlags(romRows, mmtRows, ctx)`.
- `plan-prompts.js`: `planPrompts(analyses, statesByRegion, {referral})`.

**`js/ui/`**: `dom.js`; `note-state.js` (in-memory note model, the single source of truth, never persisted); `controller.js` (debounced update loop: analyze → render panel/prompts/draft → output); `encounter.js`; `subjective.js` (including the re-eval block); `engine-form.js` (history/red-flag/tri-state sections, Evidence and Video disclosures); `rom-mmt.js` (tables, custom rows, prior columns, flag chips); `differential-panel.js` (was `renderLive`, minus stars; "Clinical reasoning notes"); `assessment.js` (impression, confidence, also-considering, auto-draft lock/redraft); `plan.js`; `evidence-box.js`.

**`js/output/`**: `format.js` (`fmtDate`, `fmtTime`, `age`, `today`, filename pattern); `assessment-draft.js` (`draftAssessment(note, analyses)`, was `draftA` + `assessText`); `emr-text.js` (`textS/O/P`, `mdO`, `shortRomFlags/shortMmtFlags`, `buildEmrText(note, analyses, {format, length, includeNegatives, settings})`, `countChars`); `pdf.js` (Phase 5).

**`js/settings/`**: `defaults.js`, `store.js` (localStorage/IndexedDB), `theme.js` (contrast-computed ink), `logo.js`, `io.js`.

**Other**: `js/main.js` (boot, routing), `index.html`, `css/`, `sw.js`, `manifest.webmanifest`, `vendor/`, `icons/` per CLAUDE.md.

The output functions take the plain `note` object, not the DOM. That makes them unit-testable and lets the text fixtures be checked without the UI.

## D. Test strategy

**Tooling (dev-only):** `@playwright/test`, pinned to the version whose Chromium is installed. I'll serve files with a ~30-line `node:http` static server (`tests/support/server.mjs`) wired through Playwright's `webServer`, instead of adding `http-server`. `npm test` runs `playwright test`. Two projects: `node` (engine and output unit specs, no browser) and `chromium` (e2e and parity). A shared fixture fails a test on `console.error` or `pageerror` from app pages.

**1. Engine parity: drives both sides in the same Chromium page context**
- `tests/support/prototype.js` opens `/reference/soap-note-generator-v8.html` and aborts every non-localhost request. That blocks the html2pdf CDN, and `window.claude` is already absent. It has two drivers:
  - *UI driver:* selects region and side, clicks `[data-reg][data-fid]` checkboxes and `#${k}__${fid}_p|_n` radios, sets `#a_primary`, secondary chips and `conf`, then waits for the 120 ms debounce, either by polling for a new `lastAS` identity or for a `#live` mutation.
  - *State driver:* writes `STATES`/`ROMV`/`MMTV` through `page.evaluate` string expressions (top-level `let`/`const` are reachable by name) and calls `analyzeRegion(k, D)` directly. This is fast enough for fuzzing.
- The new engine is loaded in a page from the same server with `await import('/js/engine/engine.js')`, so both sides use the same V8 math.
- One `serializeAnalysis(A)` function runs on both outputs. For each region it records:
  - `results` (`id`, `net`, `evidence`, `band.key`, `capped`, `tested`, `keys.length`), in order
  - `cand` (in order) and `mine`
  - `next` (`fid`, `score`, `reasons`, `label`)
  - `clusters` (`id`, `pos`, `tested`, `res`)
  - `setAside`, `redflags` ids, `notes`, `ro`, `sup`, `historyEntered`, `any`

  Numbers are compared for **exact** equality.
- **Cases per region (all 8):**
  - (a) the region's built-in `REG[k].example`, through the UI driver
  - (b) gate cases generated from data, one per AND-group of every gated condition, history only (checks `setAside` and the "horses not zebras" behavior)
  - (c) each cluster with all items positive, all negative, and partial
  - (d) red flag and `rf_screened` toggle, through the UI driver
  - (e) a seeded random fuzz of 200 states with random dx, secondary, confidence and side, through the state driver
  - (f) region pairs (shoulder+cervical, knee+hip, elbow+wrist, lumbar+hip) with the impression in either region
- **Measures parity:** fuzz ROM/MMT rows (including `mid`, norm 0, priors, pain) × side L/R/B/M × thresholds × re-eval, comparing `romFlags/mmtFlags/romChange/mmtChange`. The prototype side sets `#thr_wnl`, `#thr_bil`, the `side` radio and `#e_type` first.

**2. Source verbatim check.** Compare prototype globals and new modules by value: findings, sections, groups, conditions (including `ev` objects and attached `gate`s), `SRC`, `VIDEOS`, `ROMDEF/MMTDEF/GVAL`, and `BANDS`. Compare every cluster `read.toString()` and `*Insights.toString()` as text. A single edited LR, label or insight string fails this test.

**3. Engine purity.** `js/engine/**` is imported in plain Node (no DOM). A static scan rejects `document|window|localStorage|navigator|fetch`. Outside a call, `context.state` is `undefined`. Every parity run passes an `onError` hook that must never fire.

**4. Text fixtures (Phase 4).** The UI is filled per `tests/fixtures/README.md`, with Settings evaluator "Jane Clinician, MS, LAT, ATC", eval time blank, and physician name blank. All 4 fixture files must match exactly. A further cross-check generates `fullText()` in the prototype for extra cases (full/condensed × md/txt × negatives on) and compares after a documented normalization list (`tests/support/allowed-diffs.js`, one entry per SPEC §9 item).

**5. Panel parity (Phase 2).** Compare the `#live` text content of the prototype and the new app for the region examples, normalizing "Coaching notes" → "Clinical reasoning notes", the Settings-driven red-flag wording, and the removed star block.

**6. PDF (Phase 5) and offline (Phase 6)** as in CLAUDE.md. The PDF has a `%PDF-` header and `%%EOF`, the logo appears as an `/Subtype /Image` XObject when set, and the text is extractable (see question P7 on tooling).

**7. Evidence table.** `scripts/evidence-table.mjs` generates `docs/evidence-table.csv` from the registry. A test regenerates it and fails if the committed file is stale.

## E. Risks

1. Hidden global coupling (free `state`, `isChecked`, `isAssessed` in about 100 functions). *Mitigation:* the live-binding context plus `toString()` comparison.
2. State-map semantics (delete vs false, `rf_screened` exclusivity, `Object.keys` counting). *Mitigation:* a `note-state` unit test plus UI-driver parity cases.
3. Swallowed exceptions in `read()`/`insights()` would hide porting errors. *Mitigation:* the `onError` hook in tests.
4. Order sensitivity (Set insertion, stable sort). *Mitigation:* exact ordered comparison.
5. Float drift between Node and Chromium. *Mitigation:* parity always runs both sides in Chromium.
6. Allowed fixture diffs could spread beyond SPEC §9 (time default, physician name in the referral label, evaluator format). *Mitigation:* an explicit allowed-diffs list, with questions below.
7. Program-specific wording sits inside engine-adjacent text ("Standing Orders", "Directing Physician", "EAP", "Healthy Roster" in `renderLive`/`renderSuggest`/PDF). *Mitigation:* prompt keys in the engine, text in Settings.
8. pdfmake vs strict CSP (may need `'unsafe-eval'`) and precache size (~1–2 MB `vfs_fonts`). Verify in Phase 5.
9. Phase 1 is large: 8 region files, ~2,100 lines of data, plus the harness. If it runs long: shoulder + knee + harness first, then the remaining regions.
10. The Playwright version must match the installed Chromium, or `npx playwright install` is needed locally. The README will document this.

## F. Open questions (also added to docs/QUESTIONS.md)

**Clinical** (engine left unchanged; for the clinician to decide):
- C1. Priors are documented as "log-odds offset for a high school athlete population". The SPEC also targets colleges. Is that acceptable, or should priors vary by setting?
- C2. The Wainner cluster differs between regions. The shoulder version has `cond` including `tos`, says "Refer." at 4/4, and gives post-test probabilities. The cervical version gives only the +LR. Intentional?
- C3. The Lowery meniscal composite and the pars screen always return a readout once their condition is a candidate (e.g., "0 of 5 composite findings positive" before anything is tested). Intentional?
- C4. Checking "Screened: no red flags" suppresses the hip "non-musculoskeletal groin pain" prompt and the elbow olecranon-bursa infection prompt. Intentional?
- C5. Re-eval ROM declines (`romChange` 'bad') are counted as "ROM deficits" in the assessment draft. Intentional?
- C6. All LRs and priors are AI-assisted drafts and unverified (SPEC §10). The review happens via `docs/evidence-table.csv`.

**Product:**
- P1. The SPEC says evaluation time defaults to now, but the prototype leaves it blank, and when set it prints in the EMR header ("Date: 11/5/2026 3:15 PM"). Should the default-now time appear in the EMR text?
- P2. Evaluator line format: is it "{Name}, {Credentials}" from Settings, still overridable per note?
- P3. The referral label becomes "Directing physician (Dr. X)" when a physician name is set. That changes the EMR text versus the fixtures. Is that OK, with the fixtures run with the name blank?
- P4. The default therex list in the prototype is program-specific. Should it ship empty or with generic examples?
- P5. Should the live-panel red-flag alert reuse the Settings red-flag prompt text?
- P6. Test video links open YouTube in a new tab when clicked. They're user-initiated with no data sent, but they don't work offline. Keep them, with `rel="noopener noreferrer"`?
- P7. Verifying selectable PDF text needs a parser, since pdfmake's embedded-font text isn't plain in the file. Is it OK to add `pdfjs-dist` as a **dev-only** dependency in Phase 5?
- P8. Is it OK to use a tiny Node static server in place of `http-server`? That means one fewer dev dependency.
- P9. Remove the student grading calculation from `analyzeRegion` entirely (my plan), rather than computing it and not displaying it?
- P10. License: MIT, as suggested in START-HERE?
