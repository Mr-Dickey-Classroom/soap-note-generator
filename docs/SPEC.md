# Product spec: SOAP Note Generator

## 1. Purpose and users

**Users:** certified athletic trainers (ATC/LAT), mainly in secondary schools and colleges, who evaluate injuries and need a clean SOAP note fast.

**Jobs to be done:**
1. Document an initial evaluation or re-evaluation in SOAP format, quickly, on a laptop (also tablet or phone).
2. Get a live, evidence-based differential while documenting: likelihood-weighted ranking, cluster and CPR readouts, the next tests that would sharpen the picture, and coaching notes on what might be missed. History and mechanism count as evidence ("horses, not zebras"): the tool must not push testing for conditions nothing in the history points to.
3. Produce a **branded PDF** (the full record) and a **compact EMR paste** (Healthy Roster incident report by default) that fits the EMR's character limit.

**Not in scope:** storing records, accounts, sharing between users, student grading, billing codes.

The app is clinical decision support. It never replaces the clinician's evaluation, and the UI says so on the About screen and in the PDF footer (configurable text).

## 2. Screens

1. **Note** (default): Encounter → S → O → A → P → Output, with a sticky section nav and a sticky live Differential panel on wide screens (it stacks below on narrow screens).
2. **Settings**: branding, clinician, clinical lists, output defaults, import/export.
3. **About**: what the tool does and doesn't do, the privacy statement, evidence sources, the version number, and a "check for update" button.

The header shows the user's logo (if set), the app title (setting), and buttons for **New note**, **Save PDF**, **Copy EMR text**, and **Settings**.

## 3. Note: features carried over from the prototype

Port everything below from `reference/soap-note-generator-v8.html` with the same behavior:

**Encounter**
- Athlete name, DOB (age calculated), grade or class year (free text; was a 6–12 select), sport, date of injury, date and time of evaluation (default now; the time prints in the EMR header and the PDF), encounter type (Initial evaluation / Re-evaluation / Sideline evaluation), ICD-10 (optional), evaluator (default from Settings).
- Primary body region plus optional secondary region (8 regions: cervical, shoulder, elbow, wrist/hand, lumbar, hip, knee, ankle/foot). Involved side: L / R / Bilateral / Midline.

**Subjective**
- Chief complaint, HPI/mechanism, onset (Acute / Insidious / Recurrent / Chronic flare), pain now/best/worst 0–10, pain quality chips, aggravating, easing, prior history, function/goals.
- Engine history checklist and red-flag screen per region, including "Screened: no red flags present", which clears the individual flags (and the reverse).
- **Re-evaluation block** (only when encounter = Re-evaluation): date of last eval, diagnosis at last eval, visit number, overall status (Improving / No change / Worsening / Resolved), home program adherence, response to treatment and interval history.

**Objective**
- Engine observation, palpation (Not done / Tender / Not tender), ROM-and-strength findings, special tests, neuro screen per region, each with an "Evidence" disclosure (Sn/Sp/LR/source) and an optional video link. Video links open in a new tab (`rel="noopener noreferrer"`) and carry a note that watching videos needs an internet connection; nothing is fetched until the user clicks.
- Free-text notes boxes: observation, palpation, special tests/neuro. Plus a gross movement pattern box.
- **ROM table** per region: motion, editable WNL (AAOS defaults), AROM L/R, PROM L/R, end-feel, pain, flags. Spine flexion/extension take a single measurement. **3 blank custom rows** per region plus "Add ROM row".
  - Flags: below WNL by more than X% (default 10), below the uninvolved side by more than Y% (default 10), 0° norms flagged in degrees ("lacks 8°"), PROM exceeds AROM by ≥10°, above WNL by >115% (warn). Thresholds are editable on the form, with defaults from Settings.
  - Re-eval: a **Prior AROM (involved)** column, with the change shown as "+15° since last (was 115)" (green) or a decline (red).
- **MMT table**: 0–5 with +/−, L/R, pain, flags (grade < 5, involved weaker than uninvolved), 2 custom rows plus "Add strength row", and a re-eval Prior column.

**Live differential panel** (updates as you type)
- Red-flag alert (its wording is the red-flag prompt text from Settings), a plan pointer for the chosen impression, a ranked ladder with support bands and tags (Your impression / Also considering / Needs confirmation / Rule out), cluster and CPR readouts, "Tests that would sharpen this" (click to scroll to and flash the test), conditions set aside by history, clinical reasoning notes (rename "Coaching notes"), and measurement flags.
- **Remove** the student-mode star rating and component scores.

**Assessment**
- Clinical impression (grouped by region, plus "Other"), confidence (Low / Moderate / High), also-considering chips.
- An auto-drafted assessment that stays editable. It stops auto-updating after a manual edit, and "Redraft from findings" restores it. Re-eval adds progress and objective-change lines.

**Plan**
- Prompts (red flags, dislocations requiring immediate referral, not-yet-ruled-out conditions, notify the directing physician on referral). Prompt wording comes from Settings so it can match each clinician's standing orders.
- Activity status, restrictions, treatment chips plus details, therapeutic exercise program (list from Settings), referral destination plus urgency plus reasons (lists from Settings), communication checklist (from Settings), follow-up date, plan notes.

**Clear note**: two-click confirm. Plus the warning before closing a page with unsaved input.

## 4. Output A: EMR paste text

Port the prototype's output panel exactly, generalized:

- **Format:** Markdown (default) or Plain text.
- **Length:** Condensed (default) or Full.
  - Condensed keeps the CC, HPI/MOI, onset and pain, the re-eval interval history, the red-flag screen, observation, tender areas, positive tests, **abnormal ROM rows and MMT deficits only**, impression, also-considering, re-eval progress, red flags, not-yet-ruled-out, any lines the user typed, the full plan, and a line pointing to the attached PDF. It drops aggravating and easing factors, function/goals, the history checklist, normal rows, the evidence differential, cluster lines, deficit summary lines, and further-testing lines.
- **Include non-tender areas and negative tests** checkbox (default from Settings: off).
- Markdown uses bold labels (`- **Label:** value`), bold section headers, and pipe tables for ROM and MMT. Values outside WNL are bold. Short flags: "L AROM 50%", "PROM>AROM 65°", "L < R".
- **Character counter** against a limit (default **5,000**, set in Settings and editable inline). Amber at ≥ 90%, red and bold when over.
- **Copy** button (Clipboard API with an `execCommand` fallback) and a confirmation message.
- The heading and button labels use the EMR name from Settings ("Healthy Roster" by default; e.g. "Copy for Healthy Roster").
- Identifiers (name, DOB) are left out of the paste text, because the EMR record is already attached to the athlete. They appear on the PDF.

## 5. Output B: PDF

- Built with **pdfmake** (vendored), so the text is real, selectable, and searchable and files stay small. This replaces html2pdf from the prototype.
- One-click **Save PDF** downloads `SOAP_{Eval|Reeval|Sideline}_{Last}_{First}_{YYYY-MM-DD}.pdf` (pattern configurable). Keep a **Print** fallback that uses `css/print.css`.
- **Layout** (match the prototype's PDF):
  - Header band in the brand color, with an accent-color rule beneath. The **logo** sits on the left (max 0.6 in tall, aspect preserved), then the title ("Injury Evaluation" / "Injury Re-evaluation" / "Sideline Evaluation": SOAP Note) and the organization/program line. The evaluator name and credentials are on the right.
  - Info grid: athlete, DOB/age, grade, sport, date of injury, evaluation date/time, encounter, region/side, ICD-10, evaluator, status. Empty fields are omitted.
  - S / O / A / P sections with large section letters in the brand color. ROM and MMT as tables with flagged values in red and improvements in green. Red flags in a red-bordered box. Special tests show positives *and* negatives (the PDF is the full record).
  - Signature line plus date. Footer: confidentiality text (setting), "Generated {date}", page X of Y.
  - Paper size Letter or A4 (setting). Table rows don't split across pages.
- Font: pdfmake's bundled Roboto (Calibri can't be redistributed).

## 6. Settings (all stored locally; export/import as JSON)

| Group | Settings (defaults) |
|---|---|
| Branding | App title ("SOAP Note Generator"); organization name (blank); program/department line ("Sports Medicine"); **logo upload** (PNG/JPG/SVG → stored as a PNG data URL, resized to ≤ 512 px longest side, ≤ 300 KB, with preview and remove); **brand color** (#006428); **accent color** (#F0DC3C); light/dark/system theme |
| Clinician | Name, credentials ("MS, LAT, ATC" style, free text), license number (optional, prints under the signature) |
| Clinical | WNL thresholds (10% / 10%); ROM norm overrides per region/motion (optional, with reset); directing/team physician name (used in the referral list as "Directing physician (Dr. X)"); referral destinations, referral reasons (physician and PT), treatments, therapeutic exercise programs (ships empty), and communication checklist items, each an editable list with add/remove/reorder and reset to defaults |
| Plan prompts | Toggle plus editable text for: red-flag/EAP prompt; immediate-referral prompt for dislocations; notify-physician-on-referral prompt |
| EMR output | EMR name ("Healthy Roster"); character limit (5000); default format (Markdown); default length (Condensed); include negatives by default (off); PDF-pointer line text |
| PDF | Paper size (Letter); filename pattern; footer confidentiality text ("Confidential health record. Do not redisclose without authorization."); show signature line (on) |
| Data | Export settings (.json), import settings, reset all settings. Note: settings never contain patient data. |

**Logo behavior:** shown in the app header and the PDF header, and also set as the page favicon at runtime. The installed home-screen icon comes from `icons/` (static PWA files); the README explains how a deployer replaces those with their own icons.

**Theme behavior:** brand and accent colors drive the app's CSS custom properties and the PDF. Text color on brand surfaces is computed for contrast (white or near-black).

## 7. Offline / PWA

- `manifest.webmanifest` (name, short_name, start_url `./`, scope `./`, display `standalone`, theme_color, icons 192/512/maskable). All paths are relative so the app works from `https://<user>.github.io/<repo>/`.
- `sw.js`: precaches every app file and vendor file on install, cache-first at runtime, with a versioned cache name (`soap-v{version}`) and old caches cleaned on activate. When a new version is waiting, show a small "Update available: Reload" banner (no forced reload mid-note).
- Installable on Chrome/Edge desktop, Android, and iOS/iPadOS ("Add to Home Screen").
- Fully functional offline: note entry, differential, PDF export, copy.

## 8. Privacy and security

- No network requests at runtime besides loading the app's own files. Add a strict Content-Security-Policy `<meta>` (`default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'`), and adjust only if pdfmake needs it.
- Patient data is in memory only. No autosave of note content.
- About screen statement: "Notes are never stored or sent anywhere. Closing or reloading the page erases the note. You are responsible for saving the PDF and entering the note into your EMR."

## 9. Changes from the prototype (intentional)

1. Student mode removed (star rating, component scores, student evaluator, co-sign line).
2. All program-specific names (school, clinician, physician, standing-orders wording, therex programs) come from Settings.
3. "Follow-up" encounter type stays removed. Encounter types: Initial evaluation, Re-evaluation, Sideline evaluation.
4. PDF engine changes from html2pdf (raster) to pdfmake (vector text). Logo and colors come from Settings.
5. Grade becomes free text.
6. "Coaching notes" is renamed "Clinical reasoning notes".
7. The CDN script is removed; all dependencies are vendored for offline use.
8. Evaluator name in the text output comes from Settings as "{Name}, {Credentials}", editable per note (fixtures use "Jane Clinician, MS, LAT, ATC").
9. Evaluation time defaults to now and prints in the EMR header ("Date: 11/5/2026 3:15 PM"). The fixtures were captured without a time, so fixture tests clear it.
10. When a directing physician name is set, the referral destination reads "Directing physician (Dr. X)". Fixture tests leave the name blank.
11. The student grade calculation is removed from the engine, not just hidden.
12. The dislocation plan prompt fires when the deformity/dislocation red flag is checked in the elbow, wrist, knee, ankle, or hip. (The prototype's prompt looked for "disloc" in finding ids and never fired.)

## 10. Evidence review deliverable

Generate `docs/evidence-table.csv` from the engine data: region, finding id, finding label, section, conditions it informs, LR+ / LR− (or weights) as coded, and source text as coded. **The likelihood ratios in the prototype were drafted from the literature with AI assistance and have not been independently verified.** The table exists so a clinician can audit every value before public release. Show "Evidence values under review" on the About screen until the maintainer flips a setting in `js/engine/meta.js`.

## 11. Acceptance checklist (release)

- [ ] Shoulder and knee fixture cases reproduce the expected text (condensed/full, Markdown/plain).
- [ ] Engine parity across all 8 regions.
- [ ] PDF: logo, colors, header, tables, flags, signature, footer, page numbers; Letter and A4.
- [ ] Shoulder condensed Markdown ≤ 2,500 characters; counter accurate; limit editable.
- [ ] Offline after first load (tested), installable, update banner works.
- [ ] Settings export → reset → import restores everything, including the logo.
- [ ] No console errors; Lighthouse PWA/Accessibility/Best Practices ≥ 90.
- [ ] Works at 360px, 768px, 1280px, and 1440px widths; light and dark.
- [ ] README: deploy steps, how to customize icons, privacy, disclaimer, license.
