# Fixtures

Captured from `reference/soap-note-generator-v8.html` on 2026-11-05. The new app must reproduce them for the same inputs (SPEC section 9 lists the allowed differences).

Naming: `{case}.{full|condensed}.{md|txt}`. Markdown = "Formatted (Markdown)"; txt = "Plain text". Negatives toggle off.

## shoulder-initial
- Evaluator: Jane Clinician, MS, LAT, ATC. Evaluation date 2026-11-05. Encounter: Initial evaluation. Region: shoulder, side L.
- DOI 2026-11-05, onset Acute. CC "Left shoulder pain and weakness". HPI "Tackled and landed directly on the point of the left shoulder." Pain 7/7/7, quality Sharp, aggravating "Movement", easing "Ice".
- History: h_contact, h_acute, h_mech_point, h_loc_top, h_weak. Red flags: "Screened: no red flags present".
- Positive: p_ac, t_crossbody, t_acresist, t_obrien_ac. Negative: the first 5 of t_droparm, t_appre, t_sulcus, t_spurling, t_ultta (in engine order).
- ROM (aL, aR, pL, pR): Flexion 90/180/155/180 (pain); Extension 45/60/60/60; Abduction 90/180/–/– (pain); ER 35/90/80/90; IR 35/70/65/70.
- MMT L (R all 5): Flexion 3-, Abduction 2+, Scaption 2+, ER 3+, IR 4+, Extension 4+.
- Impression: shoulder:acj, confidence Moderate. Status: Out pending physician evaluation. Treatment: Cryotherapy. Referral: Directing physician, Within 24–72 hours. Follow-up 2026-11-12.

## knee-reeval
- Evaluator as above. Evaluation date 2026-11-05. Encounter: Re-evaluation. Region: knee, side L. DOI 2026-10-28.
- Last eval 2026-10-29, dx "L MCL sprain, grade I", visit 2, status Improving, adherence Partial, interval "Pain with stairs resolved; still sore after cutting drills."
- CC "L medial knee soreness with cutting". Positive: t_valgus30.
- ROM: Flexion prior 115, aL 130, aR 140. Extension prior -3, aL 0, aR 0.
- MMT knee flexion: prior 4-, L 4+, R 5.
- Impression: first knee condition whose id contains "mcl". Status: Limited participation, restriction "No full-speed cutting".
