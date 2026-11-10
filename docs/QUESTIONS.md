# Open questions

Claude Code adds clinical or product questions here instead of changing engine behavior.

## Phase 0 (implementation plan): all answered 2026-11-10

Context for each question is in `docs/IMPLEMENTATION_PLAN.md` section F. Decisions below are the clinician's; the SPEC is updated to match.

### Clinical

- **C1. Priors are set for a high school athlete population; the SPEC also targets colleges.**
  Answer: acceptable as is. Priors stay the same for every setting.
- **C2. The Wainner cluster differs between the shoulder and cervical regions** (the shoulder version includes `tos` in `cond`, says "Refer." at 4/4, and gives post-test probabilities; the cervical version gives only the +LR).
  Clinician guidance: in the shoulder region the cluster is there to separate neck-driven pain from true shoulder pathology:

  | Feature | Cervical radiculopathy (neck-driven) | True shoulder pathology (e.g., rotator cuff, labrum) |
  |---|---|---|
  | Wainner cluster results | 3 to 4 positive tests (reproduction or relief with neck/nerve maneuvers) | Negative Wainner cluster |
  | Primary location of pain | Deep in the back/side of the neck, shooting or "electric" pain down the arm, sometimes past the elbow into the hand | Top, front, or lateral side of the shoulder joint; rarely shoots past the elbow |
  | Neurological signs | Numbness, "pins and needles," or weakness in specific dermatomes/myotomes (e.g., thumb, index finger, biceps/triceps) | Mechanical weakness or pain primarily tied to moving the shoulder joint (lifting, reaching overhead, rotating) |
  | Aggravating movements | Neck extension, rotation, or looking to the side | Direct shoulder movements (overhead reach, sleeping on the affected side, internal/external rotation) |

  Answer: keep both as they are. The shoulder version's broader condition list and "Refer." wording fit its job of flagging neck-driven pain; the cervical version stays as coded. No change.
- **C3. The Lowery meniscal composite and the pars screen always show a readout once their condition is a candidate.**
  Answer: intentional. No change.
- **C4. "Screened: no red flags" suppresses the hip non-musculoskeletal groin pain prompt and the elbow olecranon-bursa infection prompt.**
  Answer: intentional. No change.
- **C5. Re-eval ROM declines count as "ROM deficits" in the assessment draft.**
  Answer: intentional. The clinician enters prior ROM values manually.
- **C6. All LRs and priors are AI-assisted drafts and unverified.**
  Answer: continue. The review happens through `docs/evidence-table.csv`; The clinician reviewed the table and signed it off on 2026-11-10; `EVIDENCE_REVIEWED` in `js/engine/meta.js` is now `true`.

### Product

- **P1. Default evaluation time.** Answer: the time defaults to now and prints in the EMR header (e.g., "Date: 11/5/2026 3:15 PM"). Fixture tests clear the time, because the fixtures were captured without one. (SPEC §3, §9.9)
- **P2. Evaluator line.** Answer: "{Name}, {Credentials}" from Settings, editable per note. (SPEC §9.8)
- **P3. Referral label with a physician name.** Answer: yes, "Directing physician (Dr. X)" when a name is set; fixture tests leave the name blank. (SPEC §9.10)
- **P4. Default therapeutic exercise list.** Answer: ships empty. (SPEC §6)
- **P5. Live-panel red-flag alert text.** Answer: reuses the Settings red-flag prompt text. (SPEC §3)
- **P6. Test video links.** Answer: keep them, opening in a new tab with `rel="noopener noreferrer"`, and show a note that watching videos needs an internet connection. (SPEC §3)
- **P7. `pdfjs-dist` as a dev-only test dependency in Phase 5.** Answer: approved.
- **P8. Tiny Node static server instead of `http-server`.** Answer: approved (done in Phase 1).
- **P9. Remove the student grade calculation from `analyzeRegion`.** Answer: approved (done in Phase 1).
- **P10. License.** Answer: MIT (done in Phase 1).

## Phase 2 (note form)

- **P11. The dislocation plan prompt never appears.** The prototype shows "dislocations of the elbow, wrist, knee, ankle, and hip are stabilized and referred..." only when a checked finding's *id* contains "disloc". In those five regions, suspected dislocation is recorded under the red flag `rf_deform` (e.g., "Gross deformity or suspected elbow dislocation"), whose id doesn't match, so the prompt can't fire. The only "disloc" ids are in the shoulder, which isn't in the prompt's region list. Ported unchanged (`js/engine/plan-prompts.js`). Options: (a) leave it; (b) fire the prompt when `rf_deform` is checked in those five regions; (c) add a separate "suspected dislocation" red flag to each region. The red-flag prompt already fires for `rf_deform` either way.
