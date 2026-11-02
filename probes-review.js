/* Nik's rulings on the 12 probe labels the review disputed (1 Nov 2026). The probe file itself is never edited.
   Cost (10): every label stands as written: a cost question goes to the gap queue unless the unit names that exact cost.
   T13-020: relabelled to "ok": the vision benefit is general plan information members must be told (42 CFR 422.111).
   T13-021: stands as "scope": staff documents are refused; the public benefit is offered; own records go to a person after an identity check. */
const PROBE_DISPUTES = { "T14-106": "Control assumes the 2026 retail copay unit (KU-223) is approved; in this demo state it is still in review, so not answering is correct" };
const PROBE_RELABEL = { "T13-020": { expect: "ok", why: "Benefit disclosure to members, 42 CFR 422.111; ruled by Nik 1 Nov 2026" } };
/* Rulings on sealed holdout labels. holdout.js is never edited; a ruling is applied here by the runner and shown beside the row. */
const HOLDOUT_RULINGS = { H6: { pass: true, note: "label ruling D90: \"7 days\" read as \"7 calendar days, for prior-auth items\" (42 CFR 422.568, R-78)" } };
/* D90: any future test label that states a deadline must say calendar or working days. */
