# Open questions

Claude Code adds clinical or product questions here instead of changing engine behavior.

## Phase 0 (implementation plan)

See `docs/IMPLEMENTATION_PLAN.md` section F for context.

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
