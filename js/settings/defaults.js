/**
 * Default settings. Generic on purpose: no school, clinician, physician, or EMR
 * names beyond the generic defaults the SPEC names. Phase 3 makes every value
 * editable in Settings and persists it locally; until then these are used as-is.
 */

/** @typedef {typeof DEFAULTS} Settings */
export const DEFAULTS = {
  appTitle: 'SOAP Note Generator',
  orgName: '',
  programLine: 'Sports Medicine',
  clinicianName: '',
  clinicianCredentials: '',
  physicianName: '',
  emrName: 'Healthy Roster',
  /** EMR output (SPEC §4, §6). */
  emrCharLimit: 5000,
  emrFormat: 'md',
  emrLength: 'cond',
  emrIncludeNeg: false,
  pdfPointerText: 'Full evaluation (all ROM/MMT values, special tests including negatives, clusters and differential) in the attached PDF.',
  thrWnl: 10,
  thrBil: 10,

  /** Pain quality chips (clinical vocabulary, same as the prototype). */
  painQuality: ['Sharp','Dull or aching','Burning','Throbbing','Shooting or radiating','Numbness or tingling','Stiffness','Catching or locking','Instability or giving way'],
  treatments: ['Cryotherapy','Compression','Elevation','Taping','Bracing or splinting','Crutches','Moist heat','Electrical stimulation','Ultrasound','Manual therapy','Therapeutic exercise','Education and home care'],
  /** Therapeutic exercise programs: ships empty (each clinician adds their own). */
  therexPrograms: [],
  therexLevels: ['Beginner','Intermediate','Advanced'],
  referralDestinations: ['Directing physician','Personal physician','Orthopedic physician','Physical therapy','Emergency department','EMS transport'],
  referralUrgency: ['Immediate','Within 24–72 hours','Routine'],
  referralReasonsPhysician: ['Unclear diagnosis','Further diagnostic testing (imaging)','Brace or DME required and not available','Not responding to care within 7–10 days','Parent or patient preference','At the discretion of the AT'],
  referralReasonsPT: ['Needs a more individualized plan than the AT can provide','Needs a higher level of treatment','Referred by physician after evaluation','Post-operative rehabilitation','Parent or patient preference','At the discretion of the AT'],
  /** Destination whose reasons list is the PT list. */
  ptDestination: 'Physical therapy',
  communication: ['Parent/guardian notified','Coach notified (body part and status only)','Directing Physician notified','Athletic director notified','Home care instructions given'],

  /** Plan prompts: wording matches the clinician's standing orders (SPEC §3 Plan, §6). */
  prompts: {
    redFlag: { on: true, text: 'Red flag entered. Activate the emergency action plan (EAP) as indicated and notify the directing physician.' },
    dislocation: { on: true, text: 'Dislocations of the elbow, wrist, knee (tibiofemoral), ankle, and hip are stabilized and referred to a physician or the emergency department immediately.' },
    referral: { on: true, text: 'Make the directing physician aware of any significant injury or physician referral.' },
  },
  /** Suffix for the "not yet ruled out" plan prompt. */
  notRuledOutSuffix: "If testing can't settle it, physician referral criteria include an unclear diagnosis and the need for further diagnostic testing.",
};

/** Evaluator line for a note: "{Name}, {Credentials}" (SPEC §9.8). */
export function evaluatorLine(s){
  return [s.clinicianName, s.clinicianCredentials].map(x => (x || '').trim()).filter(Boolean).join(', ');
}

/** Referral destination label: the directing physician gets the name when set (SPEC §9.10). */
export function referralLabel(dest, s){
  return dest === 'Directing physician' && (s.physicianName || '').trim() ? `Directing physician (${s.physicianName.trim()})` : dest;
}
