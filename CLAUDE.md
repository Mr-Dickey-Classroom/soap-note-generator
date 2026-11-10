# CLAUDE.md: SOAP Note Generator (PWA)

Standing instructions for Claude Code. Read this file, then `docs/SPEC.md`, before every task.

## What we are building

A free, installable, offline-capable web app for certified athletic trainers. It documents an injury evaluation or re-evaluation in SOAP format, runs a live evidence-based differential diagnosis alongside the clinician, and produces two outputs:

1. A **branded PDF SOAP note** (the complete record), and
2. A **compact text note for pasting into an EMR** (default: Healthy Roster's incident report), with Markdown formatting and a character counter.

It is hosted on **GitHub Pages** from this repository. There is no server, no account, and no database.

## Source of truth

- `reference/soap-note-generator-v8.html` is the working single-file prototype. **Every clinical behavior in the new app must match it** unless `docs/SPEC.md` says otherwise.
- The clinical engine in the prototype (region data, findings, conditions, likelihood ratios, clusters, gates, insights, `scoreCondition`, `analyzeRegion`) is ported **verbatim**. Do not edit likelihood ratios, priors, thresholds, condition names, or cluster logic. If something looks clinically wrong, list it in `docs/QUESTIONS.md` and keep going; do not "fix" it.
- `tests/fixtures/*` are outputs captured from the prototype. The new app's text output for the same inputs must match them, except for the differences listed in `docs/SPEC.md` ("Changes from the prototype").

## Hard rules

- **No patient data ever leaves the browser or persists.** No analytics, no telemetry, no external requests at runtime, no cookies. Patient fields live only in memory and are gone on reload. Only *settings* (branding, lists, defaults) go to `localStorage` / IndexedDB.
- **Works offline after first load.** Every runtime dependency is vendored into `vendor/` (no CDNs). A service worker precaches the whole app.
- **No build step.** Plain HTML, CSS, and ES modules served as static files, so GitHub Pages can deploy straight from `main`. `npm` is allowed only for dev tooling (tests, lint), and `node_modules/` is never committed.
- **No student mode.** Remove the star rating, scoring components, the student evaluator field, and the co-sign line from the prototype.
- **Nothing program-specific is hard-coded.** No school, clinician, physician, or EMR names in code. Defaults are generic and every name comes from Settings.
- Keep the prototype's "nothing is saved" behavior: warn before leaving a page with an unsaved note.

## Architecture

```
index.html                 app shell (single page)
manifest.webmanifest       PWA manifest
sw.js                      service worker (precache, versioned cache name)
css/app.css                app styles, theme tokens as CSS custom properties
css/print.css              print fallback styles
js/main.js                 boot, routing between Note / Settings / About
js/engine/                 clinical engine, ported verbatim from the prototype
  regions/*.js             one file per region (shoulder, elbow, wrist, hip, knee, ankle, cervical, lumbar)
  engine.js                scoring, analysis, clusters, insights wiring
js/ui/                     form rendering, ROM/MMT tables, live differential panel, re-eval block
js/output/
  emr-text.js              Markdown + plain text, condensed + full, negatives toggle, char counter
  pdf.js                   PDF builder (pdfmake)
js/settings/               settings store, defaults, logo handling, theme, import/export
vendor/                    pdfmake + vfs_fonts (pinned versions, with LICENSE files)
icons/                     PWA icons (192, 512, maskable)
tests/                     Playwright end-to-end + unit tests, fixtures
docs/                      SPEC, BUILD_PLAN, QUESTIONS, evidence table
reference/                 prototype (not linked from the app)
```

Engine modules must not touch the DOM. UI calls the engine with plain data and renders the result.

## Conventions

- Vanilla JS (ES2020+), no framework. Small modules, named exports, JSDoc on public functions.
- Theme: all colors are CSS custom properties set from Settings (`--brand`, `--brand-ink`, `--accent`, plus derived tints). Must pass WCAG AA contrast; compute a readable text color on the brand color automatically.
- Light and dark mode. Laptop is the primary target; must also work on iPad and phone widths (≥ 360px) without horizontal page scroll.
- Accessible: labels on every control, keyboard operable, visible focus, `aria-live` on the differential panel and counters.
- When writing user-facing copy, keep it plain and clinical. Use AT terminology correctly.

## Testing (definition of done for every phase)

- `npm test` runs Playwright against a local static server (`npx http-server` or equivalent) and passes.
- **Engine parity test:** for each region, a scripted set of inputs produces the same ranked differential, cluster readouts, and suggested next tests in the new app as in `reference/soap-note-generator-v8.html`.
- **Text fixture tests:** the scripted shoulder and knee cases reproduce `tests/fixtures/*` (apart from the documented changes, such as the evaluator name coming from Settings).
- **PDF test:** generates a PDF for both cases, checks it is valid, includes the logo when one is set, and has selectable text.
- **Offline test:** after the first load, set the browser context offline, reload, complete a note, export the PDF, and copy the text.
- No console errors during any test.

## Workflow

- Work in the phases in `docs/BUILD_PLAN.md`, one phase per session or branch. At the end of a phase: run the tests, update `docs/CHANGELOG.md`, summarize what changed and what is left, then stop.
- Ask before adding any dependency. Prefer none.
- Never commit secrets, real patient data, or anything from outside this repository.
