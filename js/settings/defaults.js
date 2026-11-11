/**
 * Default settings (SPEC §6). Generic on purpose: no school, clinician, physician,
 * or EMR names beyond the generic defaults the SPEC names. Every value is
 * editable on the Settings screen and stored locally (js/settings/store.js).
 * Settings never contain patient data.
 */

/** @typedef {typeof DEFAULTS} Settings */
export const DEFAULTS = {
  /* Branding */
  appTitle: 'SOAP Note Generator',
  orgName: '',
  programLine: 'Sports Medicine',
  /** PNG data URL (≤ 512 px, ≤ 300 KB) or ''. Stored in IndexedDB, not localStorage. */
  logo: '',
  brandColor: '#006428',
  accentColor: '#F0DC3C',
  /** 'system' | 'light' | 'dark' */
  theme: 'system',

  /* Clinician */
  clinicianName: '',
  clinicianCredentials: '',
  licenseNumber: '',

  /* Clinical */
  thrWnl: 10,
  thrBil: 10,
  /** ROM norm overrides: { region: { motion: degrees } }. Empty = AAOS defaults. */
  romNorms: {},
  physicianName: '',

  /* EMR output (used by the Output panel, Phase 4) */
  emrName: 'Healthy Roster',
  charLimit: 5000,
  /** 'markdown' | 'plain' */
  emrFormat: 'markdown',
  /** 'condensed' | 'full' */
  emrLength: 'condensed',
  includeNegatives: false,
  pdfPointer: 'Full evaluation (all ROM/MMT values, special tests including negatives, clusters and differential) in the attached PDF.',

  /* PDF (used by the PDF builder, Phase 5) */
  /** 'Letter' | 'A4' */
  paperSize: 'Letter',
  filenamePattern: 'SOAP_{type}_{last}_{first}_{date}',
  footerText: 'Confidential health record. Do not redisclose without authorization.',
  showSignature: true,

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
