# Build plan: prompts to paste into Claude Code

Run **one phase per Claude Code session**. Paste the prompt, let it work, review the summary and the diff, create the PR, and merge it on GitHub before starting the next phase. Each prompt is self-contained.

> Tip: start Phase 0 in **Plan** mode so Claude proposes before it builds. Phases 1 to 7 can run in **Accept edits** (or **Auto**) mode.

---

## Phase 0: Plan (no code)

```
Read CLAUDE.md, docs/SPEC.md, and the prototype at reference/soap-note-generator-v8.html.
Then write docs/IMPLEMENTATION_PLAN.md covering:
- how you will split the prototype's engine into js/engine/ modules without changing behavior
  (list every global the engine uses and how you'll pass it instead)
- the module list with responsibilities
- the test strategy, including how the parity test will drive both the prototype and the new app
- risks and open questions (also add them to docs/QUESTIONS.md)
Do not write app code yet. Stop when the plan is written.
```

## Phase 1: Scaffold + engine port + parity tests

```
Follow docs/IMPLEMENTATION_PLAN.md, Phase 1.
1. Scaffold the folder structure from CLAUDE.md, package.json (dev-only: Playwright and a static server),
   .gitignore (node_modules, test-results, playwright-report), a placeholder index.html, and an MIT LICENSE.
2. Port the clinical engine from reference/soap-note-generator-v8.html into js/engine/ verbatim:
   region data in js/engine/regions/*.js, scoring/analysis in js/engine/engine.js. No DOM access in the engine.
   Do not change any LR, prior, threshold, label, cluster, gate, or insight text.
3. Write tests/engine-parity.spec.js: for each of the 8 regions, load the prototype in Playwright, enter a scripted
   set of history + test findings, read its ranked differential, cluster readouts, and next tests; then run the
   same inputs through the new engine and assert identical results.
4. Generate docs/evidence-table.csv (SPEC section 10).
Run npm test. Update docs/CHANGELOG.md. Summarize and stop.
```

## Phase 2: Note form and live differential

```
Build the Note screen per docs/SPEC.md sections 2 and 3, matching the prototype's layout and behavior:
encounter, S (including the re-evaluation block), O (engine sections, notes, ROM and MMT tables with flags,
custom rows, prior columns), live differential panel, A (impression, confidence, also-considering, auto-draft with
edit lock and redraft), and P (prompts, status, treatment, therex, referral, communication, follow-up).
Remove student mode entirely. Use placeholder default lists for now (Settings comes in Phase 3).
Add Playwright tests that fill the shoulder-initial and knee-reeval cases (see tests/fixtures/*.md for the expected
content) and assert the differential panel, flags, and assessment draft.
Run npm test, update the CHANGELOG, summarize, and stop.
```

## Phase 3: Settings, branding, theme

```
Build the Settings screen per docs/SPEC.md section 6: all groups and fields, editable lists with reset, logo upload
(resize to ≤512px PNG data URL, ≤300 KB, preview/remove, also set as favicon), brand/accent colors with automatic
readable text color, light/dark/system theme, and export/import/reset settings as JSON.
Wire every setting into the Note screen (evaluator default, referral/treatment/therex/communication lists,
physician name, plan prompt text, thresholds, ROM norm overrides).
Settings persist in localStorage (use IndexedDB for the logo if it is near the localStorage limit). Patient data never persists.
Tests: change colors and logo → verify the header; export → reset → import restores everything.
Run npm test, update the CHANGELOG, summarize, and stop.
```

## Phase 4: EMR text output

```
Build js/output/emr-text.js and the Output panel per docs/SPEC.md section 4: Markdown/plain, condensed/full,
the include-negatives toggle, the character counter with the limit from Settings (editable inline), and Copy with fallback.
Labels use the EMR name from Settings.
Tests: the shoulder-initial and knee-reeval cases must reproduce tests/fixtures/*.{full.md,condensed.md,condensed.txt}
exactly (the evaluator comes from Settings: set it to "Jane Clinician, MS, LAT, ATC" in the test).
Run npm test, update the CHANGELOG, summarize, and stop.
```

## Phase 5: PDF

```
Vendor pdfmake (pinned version, with its LICENSE) into vendor/ and build js/output/pdf.js per docs/SPEC.md section 5:
branded header with logo and colors, info grid, S/O/A/P, ROM/MMT tables with flag colors, the red-flag box,
negatives included, signature line, footer with page X of Y, Letter/A4, the filename pattern, and a Print fallback via css/print.css.
Tests: generate PDFs for both fixture cases (with and without a logo); assert a valid PDF, extractable text containing
key findings, and the logo image object when set. Save sample PDFs to docs/samples/ for review.
Run npm test, update the CHANGELOG, summarize, and stop.
```

## Phase 6: Offline PWA

```
Add manifest.webmanifest, icons/ (generate placeholder 192/512/maskable icons from a simple monogram),
and sw.js per docs/SPEC.md section 7: precache everything, cache-first, versioned cache, cleanup, and an
"Update available: Reload" banner. All paths relative for GitHub Pages project sites.
Add the CSP meta tag from SPEC section 8.
Tests: first load online → context.setOffline(true) → reload → complete the shoulder case → Save PDF → Copy text.
Run npm test, update the CHANGELOG, summarize, and stop.
```

## Phase 7: Polish, docs, release

```
Work through the docs/SPEC.md section 11 acceptance checklist and fix anything failing:
responsive layouts (360/768/1280/1440), dark mode, keyboard and screen-reader pass, and Lighthouse ≥ 90.
Write the About screen (purpose, privacy statement, disclaimer, "Evidence values under review" banner, version, update check).
Write README.md: what it is, live link placeholder, how to deploy your own copy on GitHub Pages, how to replace the icons,
privacy, the clinical disclaimer, and the license. Bump the version to 1.0.0.
Run npm test, update the CHANGELOG, summarize, and stop.
```

---

## After each phase (you, on GitHub)

1. In Claude Code, open the diff and select **Create PR**.
2. On GitHub, open the PR, then **Merge pull request** → **Confirm merge**.
3. After the merge, GitHub Pages republishes in about a minute (once Pages is turned on; see START-HERE.md, Step 5).
4. If something's off, tell Claude in the same session: describe what you saw, or paste the error.
