/**
 * Engine metadata.
 */

/** Version of the ported engine (matches the prototype it came from). */
export const ENGINE_SOURCE = 'reference/soap-note-generator-v8.html';

/**
 * Flip to true only after a clinician has audited every value in
 * docs/evidence-table.csv. While false, the About screen shows
 * "Evidence values under review" (docs/SPEC.md §10).
 */
export const EVIDENCE_REVIEWED = true; // clinician sign-off on docs/evidence-table.csv, 2026-11-10
