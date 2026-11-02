/* Shared logic: a stand-in for the platform. One store every workspace reads, so hand-offs carry through.
   Replace store, units() and answer() with the real services. Deterministic core; the "model" parts are marked. */
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const QS = new URLSearchParams(typeof location !== "undefined" ? location.search : "");
const KEY = "uc2lakewell1";
/* Reduced motion: JS scrolls jump instead of gliding (audit A-087) */
const SMOOTH = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
const store = {
  get() { try { const v = JSON.parse(localStorage.getItem(KEY) || "{}"); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } },
  set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} },
  up(fn) { const s = this.get(); fn(s); this.set(s); return s; },
  reset() { try { localStorage.removeItem(KEY); } catch (e) {} }
};
if (QS.get("reset") === "1") store.reset(); /* ?reset=1 on any page: start the demo clean (audit A-007) */
const S = () => store.get();
const doc = id => DOCS.find(d => d.id === id);
const clone = o => JSON.parse(JSON.stringify(o));

/* ---------- dates, clocks, hashes ---------- */
const DAYMS = 864e5, asDate = x => new Date(String(x).replace(/^(\d+) (\w+) (\d+)$/, "$2 $1, $3") + " 12:00");
const dayOK = x => x && !isNaN(asDate(x));
/* US federal holidays, observed dates, 2025 to 2027: skipped by service-level clocks (working days, D58) */
const HOLIDAYS = new Set("2025-01-01 2025-01-20 2025-02-17 2025-05-26 2025-06-19 2025-07-04 2025-09-01 2025-10-13 2025-11-11 2025-11-27 2025-12-25 2026-01-01 2026-01-19 2026-02-16 2026-05-25 2026-06-19 2026-07-03 2026-09-07 2026-10-12 2026-11-11 2026-11-26 2026-12-25 2027-01-01 2027-01-18 2027-02-15 2027-05-31 2027-06-18 2027-07-05 2027-09-06 2027-10-11 2027-11-11 2027-11-25 2027-12-24".split(" "));
const isoOf = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const isWorkday = d => d.getDay() % 6 !== 0 && !HOLIDAYS.has(isoOf(d));
function workDays(from, to) { if (!dayOK(from)) return 0; const a = asDate(from), b = isoOf(asDate(to || PLAN.today)); let n = 0; if (asDate(from) >= asDate(to || PLAN.today)) return 0; /* step by calendar date, so daylight-saving changes cannot add a day */
  while (isoOf(a) < b) { a.setDate(a.getDate() + 1); if (isWorkday(a)) n++; } return n; }
function ageDays(d) { return d ? Math.max(0, Math.round((asDate(PLAN.today) - asDate(d)) / DAYMS)) : 0; }
function inWindow(v, asOf) { const t = asDate(asOf || PLAN.today); return (!dayOK(v.effective) || asDate(v.effective) <= t) && (!dayOK(v.expiry) || t <= asDate(v.expiry)); }
function clock() { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
/* FNV-1a, 32 bit: the prototype's verbatim fingerprint. Production uses SHA-256. */
function fp(t) { let h = 0x811c9dc5; for (const c of String(t)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16).padStart(8, "0"); }
/* D58: service levels with an escalation ladder (days illustrative, J). Regulator clocks (CMS 45 days, 5-day File and Use, AP-01) are separate. */
function slaStage(since, kind) { const a = workDays(since), lim = SLA[kind] || 3, late = a - lim; return { a, lim, late, stage: kind === "drift" ? "escalated" : late >= 3 ? "reassign" : late >= 1 ? "escalated" : late === 0 ? "due" : "ok" }; }
function slaPill(since, kind) {
  const x = slaStage(since, kind);
  if (x.stage === "escalated" && kind === "drift") return `<span class="pill bad">live wording affected · escalated day 0</span>`;
  if (x.stage === "reassign") return `<span class="pill bad">${x.late} working days late · reassign</span>`;
  if (x.stage === "escalated") return `<span class="pill bad">${x.late} working day${x.late > 1 ? "s" : ""} late · escalated to Renee</span>`;
  if (x.stage === "due") return `<span class="pill warn">due today · reminder sent</span>`;
  return x.a === 0 ? `<span class="pill design">new today · due in ${x.lim} working days</span>` : `<span class="pill warn">waiting ${x.a} working days · due in ${x.lim - x.a}</span>`;
}

/* Each signer's clock starts when the item reaches them; a two-signer item also has an end-to-end limit (decision 7, J) */
function clockOf(u, s) {
  s = s || S(); const re = (s.reassigned || {})[u.id];
  const sub = (s.submittedOn || {})[u.id] || SUBMITTED[u.id] || (u.seed && u.seed.submitted) || PLAN.today;
  const first = u.latest.state === "awaiting co-sign" ? (u.latest.firstSign || {}).on || PLAN.today : null;
  const since = re ? re.on : first || sub, kind = u.latest.state === "awaiting co-sign" ? secondSigner(u) : u.latest.state === "changes requested" ? "owner" : u.approver;
  const e2e = needsCosign(u) ? { used: workDays(sub), lim: SLA.endToEnd } : null;
  return { since, kind, sub, e2e, e2eMissed: !!(e2e && e2e.used > e2e.lim) };
}
/* ---------- audit trail and notifications ---------- */
function logEv(s, unitId, roleKey, action, note, version) {
  s.events = s.events || [];
  s.events.push({ t: PLAN.today + " " + clock(), unit: unitId, who: roleKey && ROLES[roleKey] ? P(roleKey) : roleKey, action, note: note || "", v: version || "" });
}
function notify(s, to, text, link) { s.notes = s.notes || []; [].concat(to).forEach(r => s.notes.push({ to: r, text, link: link || "", t: clock(), read: false })); }

/* ---------- unit state, derived from the store ---------- */
const ALL_BASE = () => CORE_UNITS.concat(MESSY_UNITS, BREADTH_UNITS, typeof QUEUE_SEED !== "undefined" ? QUEUE_SEED : []);
const STAGE_GATE = { v2: s => (s.ingested || {})["DOC-RXV2"], qg: s => s.dedupLoaded, messy: s => (s.ingested || {})["DOC-SD09"], breadth: () => true };
function approval(s, id, v) { const a = (s.approved || {})[v ? id + "@v" + v : id]; return a && a.by !== "author" ? a : null; }
/* D30 at the data layer: a co-sign counts only from the named second signer, never the author or the first signer */
function cosignOf(s, u, ap) { const c = (s.cosigned || {})[u.id]; return c && c.by === secondSigner(u) && c.by !== "author" && (!ap || c.by !== ap.by) ? c : null; }
function recordCosign(x, u, by, when, v) {
  const ap = approval(x, u.id) || u.seedSign;
  if (by !== secondSigner(u) || by === "author" || (ap && ap.by === by)) { logEv(x, u.id, by, "co-sign refused", by === "author" ? "the author never signs (D30)" : "same person cannot sign twice, or not the named second signer", v); return false; }
  x.cosigned = x.cosigned || {}; x.cosigned[u.id] = { by, when, on: PLAN.today }; logEv(x, u.id, by, "co-signed", "publish " + when, v); return true;
}
function units(st) {
  const s = st || S(), out = [];
  for (const base of ALL_BASE()) {
    if (!STAGE_GATE[base.stage](s)) continue;
    if (base.id === "KU-222" && ((s.messy || {}).M2 === "keep")) continue;
    const u = clone(base);
    if ((s.bases || {})[u.id]) u.kbs = [s.bases[u.id]];
    // version states
    u.versions.forEach((v, i) => {
      if (v.state === "approved") { v.seeded = true; return; }
      const ap = approval(s, u.id, u.versions.length > 1 ? v.v : null) || u.seedSign || null, co = ap && needsCosign(u) ? cosignOf(s, u, ap) : null;
      v.state = ap ? (needsCosign(u) && !co ? "awaiting co-sign" : "approved") : "in review";
      /* decision 1: a co-sign publish date is honoured; a dated co-sign makes the version scheduled until that date */
      if (ap && v.state === "approved") Object.assign(v, { approvedBy: P(ap.by), approvedOn: ap.on, shownFrom: co && dayOK(co.when) ? co.when : (ap.eff || v.effective), effective: co && dayOK(co.when) ? co.when : laterOf(ap.eff || v.effective, ap.on), expiry: ap.exp || v.expiry, publish: co ? co.when : undefined }); /* audit A-023 (B): screens show the version's own start date (shownFrom); serving keeps the approval-bounded window */
      if (ap && v.state === "awaiting co-sign") v.firstSign = ap;
    });
    if (u.id === "KU-202") pdVersions(u, s);
    if (u.id === "KU-207" && !s.dedupLoaded) u.versions = u.versions.slice(0, 1);
    // send back and revise (any unit in review)
    const ch = (s.changes || {})[u.id], rv = (s.revised || {})[u.id];
    const lv = u.versions[u.versions.length - 1];
    if (rv && lv.state !== "approved") { lv.text = rv.text; u.revisedNote = rv.note; }
    if (ch && !rv && lv.state !== "approved") lv.state = "changes requested";
    if ((s.retiredDocs || {})[u.doc]) u.versions.forEach(v => { if (v.state === "approved") { v.state = "retired"; v.retiredWhy = doc(u.doc).short + " retired as source of record"; } });
    if (u.vacated) u.versions.forEach(v => { v.state = "retired"; v.retiredWhy = u.vacated.why; });
    finish(u);
    out.push(u);
  }
  if (s.authored) {
    const g = U(Object.assign(clone(GAP_DRAFT), { stage: "gap", memberFacing: true, channels: ["Advocate desk", "Agent Assist", "Member chat", "Website"], versions: [{ v: 1, text: s.authored.text, effective: "1 Jan 2027", expiry: "31 Dec 2027" }] }));
    const ap = approval(s, g.id);
    g.versions[0].state = ap ? "approved" : ((s.changes || {})[g.id] && !(s.revised || {})[g.id] ? "changes requested" : "in review");
    if ((s.revised || {})[g.id]) g.versions[0].text = s.revised[g.id].text;
    if (ap) Object.assign(g.versions[0], { approvedBy: P(ap.by), approvedOn: ap.on });
    finish(g); out.push(g);
  }
  return out;
}
/* The pricing topic carries PD-A (v1), PD-B (v2, the 2027 wording) and the retired PD-C */
function pdVersions(u, s) {
  const v1 = u.versions[0];
  if (s.dedupLoaded) {
    const text = s.legalEdit ? PD_B_FINAL : PD_WORDINGS[1].text;
    u.versions.push({ v: 2, text: "Your cost depends on the drug's tier, the pharmacy you use, your coverage stage and, if chosen, the 2027 payment plan. Share an estimate for each drug, then read the disclaimer word for word.", clause: { key: "PD", label: "PD-B", text }, effective: "1 Jan 2027", expiry: "31 Dec 2027", from: "Rx Script v3",
      state: s.driftApproved ? "approved" : "in review", approvedBy: s.driftApproved ? P("legal") : null, approvedOn: s.driftApproved ? s.driftApproved.on : null });
  }
  if (s.dedupProposed) u.retiredWording = { label: "PD-C", text: PD_WORDINGS[2].text, state: v1.state === "approved" && s.conflictResolved ? "retired" : "proposed to retire", doc: "DOC-QG27" };
}
/* D53: a second approver only for clinical guidance; Grace signs first, the medical director second (our control, J; not a CMS rule) */
function needsCosign(u) { return !!u.clinical; }
function secondSigner(u) { return "medical"; }
/* Data check (A8): a version approved after its effective date is refused and never served */
const laterOf = (a, b) => dayOK(a) && dayOK(b) && asDate(b) > asDate(a) ? b : a; /* approved today for a window that began earlier: in force from the approval date */
function approvedLate(v) { return v.seeded && v.state === "approved" && dayOK(v.approvedOn) && dayOK(v.effective) && asDate(v.approvedOn) > asDate(v.effective); }
function finish(u) {
  const vs = u.versions;
  vs.forEach(v => { if (approvedLate(v)) { v.state = "refused: approved after its effective date"; if (typeof console !== "undefined") console.error(`${u.id} v${v.v} approved ${v.approvedOn}, after its effective date ${v.effective}: refused`); } });
  u.current = vs.filter(v => v.state === "approved" && inWindow(v)).slice(-1)[0] || null;
  u.next = vs.find(v => v !== u.current && (v.state === "in review" || v.state === "awaiting co-sign" || v.state === "changes requested" || (v.state === "approved" && dayOK(v.effective) && asDate(v.effective) > asDate(PLAN.today)))) || null;
  u.latest = vs[vs.length - 1];
  u.state = u.vacated ? "retired" : u.current ? "approved" : u.latest.state === "approved" ? (dayOK(u.latest.effective) && asDate(u.latest.effective) > asDate(PLAN.today) ? "scheduled" : "expired") : u.latest.state;
  u.version = (u.current || u.latest).v;
  u.text = (u.current || u.latest).text;
  u.clause = (u.current || u.latest).clause || null;
}
const unit = id => units().find(u => u.id === id);
const readsOf = (r, s) => { if (!ROLES[r]) return []; const g = ((s || S()).access || {})[r]; return Array.isArray(g) ? g : (ROLES[r].reads || []); };

/* ---------- search ---------- */
const STOP = new Set("a an the for to of is in on how do does i what can my per and or with we you it be at this that from me will are they there any".split(" "));
const stem = w => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);
function lev(a, b) { const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }
function tokens(q, s) {
  const syn = Object.assign({}, SYNONYMS, Object.fromEntries(SYNONYM_SUGGESTIONS.filter(x => ((s || S()).synonyms || {})[x.from]).map(x => [x.from, x.to])));
  let t = String(q).toLowerCase().replace(/\$/g, "").replace(/[^a-z0-9\- ]/g, " ").split(/\s+/).filter(Boolean);
  t = t.flatMap(w => (syn[w] || w).split(" ")).flatMap(w => w.includes("-") ? [w].concat(w.split("-").filter(Boolean)) : [w]);
  return t.map(stem).filter(w => !STOP.has(w));
}
const VOCAB = () => [...new Set(ALL_BASE().concat([U(Object.assign(clone(GAP_DRAFT), { versions: [] }))]).flatMap(u => u.kw.strong.concat(u.kw.normal)).map(stem))];
function fuzz(tk) { const V = VOCAB(); return tk.map(w => { if (V.includes(w) || w.length < 6) return { w, fixed: null }; const hit = V.find(k => k[0] === w[0] && Math.abs(k.length - w.length) <= 2 && lev(k, w) <= 2); return hit ? { w: hit, fixed: w } : { w, fixed: null }; }); }
function score(u, tk) {
  const st = u.kw.strong.map(stem), no = u.kw.normal.map(stem);
  /* Audit A-010: each distinct keyword counts once, and a one-word question needs two matching keywords; "year year" never reaches the bar */
  let kw = 0, hits = 0; for (const w of new Set(tk)) { if (st.includes(w)) { kw += 2; hits++; } else if (no.includes(w)) { kw += 1; hits++; } }
  if (new Set(tk).size < 2 && hits < 2) kw = Math.min(kw, 1);
  if ((u.kw.not || []).map(stem).some(w => tk.includes(w))) kw = 0;
  const words = new Set(tokens(u.text + " " + u.title + " " + ((u.clause || {}).text || "")));
  const sim = tk.length ? tk.filter(w => words.has(w)).length / tk.length : 0; // stand-in for embedding similarity
  return { u, kw, sim: Math.round(sim * 100) / 100, blend: Math.round((kw + sim) * 100) / 100 };
}
const COST = /copays?|co-pays?|coinsurance|cost[- ]shar\w*|\bcosts?\b|\bcosting\b|\bprices?\b|\bpriced\b|\bpay\b|\bpaying\b|\bcharges?\b|\bcharged\b|\bowe\b|\bfees?\b|\bexpensive\b|\bcheap\w*\b|\$|\bdollars?\b|\bdamage\b|\bwallet\b|\bpricey\b|\bbills?\b|\brates?\b|\bamounts?\b|\bset (me|us) back\b|\bfork (out|over)\b|\bhow much\?|\bhow much (?:is|are|does|do|will|would|for|to|money|it|they|i|we|the)\b(?![^?]*\b(?:supply|supplies|days?|pills?|tablets?|refills?|time|long|many|medicine|drug|quantity)\b)/i;
/* A unit is priced only if its approved text states an amount; a pricing script without a figure is a near-miss (decision 5) */
const priced = u => /\$\d|\d+%/.test((u.current || u.latest || {}).text || "");
/* Member voice (verified writing rules, out/uc2-voice-research.md): warm, plain, answer first, never guess, always offer a person.
   REFUSAL is the one standard member-data refusal, word for word the same everywhere (S8.114), so it hints at nothing. */
const STAFF_REFUSAL = "That one's an internal staff document, so I can't share it.";
const REFUSAL = "Good question! I can't see personal records in this chat, so please keep Member IDs and health details private here. A team member can look this up once they've checked it's you. Want me to connect you?";
const MEMBER_DATA = /\bmy (co[- ]?pays?|claims?|bills?|balance|balence|deductible|costs?|prescriptions?|account|acount|bal|statement|records?|history|diagnos\w*|medications?|drugs?|refills?|dose|dosage|plan details|coverage|medicare (number|id)|member (number|id))\b|\bmember number\b|\bpick up my\b|\b\d[A-Z][A-Z0-9]\d-?[A-Z][A-Z0-9]\d-?[A-Z]{2}\d{2}\b|\b(LW|CW)\d{9}\b|\b(this|the) (member|patient)'?s? (history|diagnos\w*|records?|medical|treatment|condition|claims?)|\bpatient\b|\b(her|his) (diagnos\w*|medical|condition|history|records?|treatment)\b|claim status for|\bssn\b|\d{3}-\d{2}-\d{4}|this member'?s? (diagnos|in a rehab|record|medical|treatment)|\brehab\b|diagnos/i;
/* Decision 3: a grammar, not a word list. A person (me, my, my mom, this member, she) paired with a record word means one person's data */
const PERSON = String.raw`(?:\b(?:i|i'm|im|i've|ive|me|my|mine|myself|am i|do i|did i|have i|will i)\b|\bmy (?:mom|mother|dad|father|husband|wife|spouse|partner|son|daughter|kid|child|parent|grandma|grandmother|grandpa|grandfather|aunt|uncle|brother|sister|friend|neighbor)'?s?\b|\b(?:this|the|that) (?:member|patient|caller|person|beneficiary)'?s?\b|\b(?:she|he|they|her|his|their)\b)`;
const RECORD = String.raw`(?:out[- ]of[- ]pocket (?:total|so far|spending)|explanation of benefits|allowance|remaining|shipped|delivered|arrived|(?:use|used) last|last (?:fill|refill|visit|order)|claims?|spent|spend|spending|paid|owe|owed|owing|balance|bills?|billed|statement|eob|deductible (?:met|left|status)|met (?:my|the|her|his) deductible|meds|medications?|medicines?|prescriptions?|scripts?|rx|refills?|pills|taking|on file|diagnos\w*|conditions?|visits?|appointments?|history|records?|chart|labs?|results?|status|account|enrolled|enrollment|eligib\w*|premium|id card|member id|authorizations? (?:status|approved|denied)|was (?:it|my \w+) (?:approved|denied|paid)|go through|went through|approved|denied|coverage for what)`;
/* Safety net trigger: a possessive person plus a look-up verb, so "can I use any pharmacy" stays a general question */
const LOOKUP = new RegExp(String.raw`(?:\bmy\b|\bmy (?:mom|mother|dad|husband|wife|son|daughter|parent)'?s?\b|\b(?:her|his|their)\b|\bthis member'?s?\b)[^.?!]{0,50}\b(?:check|pull up|look up|show|find|did|was|were|has|went|shipped|total|remaining|left|last|so far|to date|status|approved|denied|paid|on file)\b|\b(?:check|pull up|look up|show me|did|was|has)\b[^.?!]{0,40}(?:\bmy\b|\bher\b|\bhis\b|this member)`, "i");
const PERSONAL = new RegExp(PERSON + String.raw`[^.?!]{0,60}?\b` + RECORD + String.raw`\b|\b` + RECORD + String.raw`\b[^.?!]{0,40}?` + PERSON, "i");
/* "How does a member get a replacement card if they lose it" is about members in general, not one person's records */
const GENERIC_MEMBER = /^(?=.*\b(a|any) members?\b)(?!.*\b(this|that) (member|patient|caller)\b)(?!.*\b(my|me|i|i'm|i've|she|he|her|his)\b)/i;
/* D99: a question about price policy (are prices final, estimates, can they change) is answered by the pricing disclaimer.
   It is not a request for an amount, and "my" in it does not make it a records request, unless it asks what was paid or owed */
const PRICE_W = String.raw`(prices?|pricing|priced|costs?|quotes?d?|charged|estimates?)`, POLICY_W = String.raw`(final|estimates?|estimated|change[sd]?|changing|differ\w*|differently|var(y|ies)|guarantee\w*|exact|locked|depends?|affects?|rely|same|stay|go(es)? up|more than|less than|higher|lower)`;
const POLICY = new RegExp(String.raw`\b${PRICE_W}\b[^?.]{0,45}\b${POLICY_W}\b|\b${POLICY_W}\b[^?.]{0,45}\b${PRICE_W}\b|^\s*why\b[^?.]{0,60}\b${PRICE_W}\b`, "i");
const PAST = /\b(paid|pay for my|spent|owed?|last (refill|fill|order|visit)|so far|this year|to date|history|on file|did i|have i|i've)\b/i;
const OWN_RECORD = /\bdid my\b[^?.]{0,30}\b(ship|arrive|go through|get (approved|paid))\b|\b(did|have) i (pay|paid|spend|spent)\b|\bwhat did i pay\b|\b(which|what) (coverage )?stage am i\b|\bam i in\b[^?.]{0,25}\bstage\b/i;
const policyQ = q => POLICY.test(q) && !OWN_RECORD.test(q.replace(/^\s*why did i pay more than\b/i, "")) && (!PAST.test(q) || /^\s*why\b[^?.]*\b(estimate|quote)/i.test(q));
/* D107: a question that mentions another person. If the question itself asks about that person (their pay, claim, coverage, shipment),
   it is a third-party records request and goes to a person, who checks for a personal representative first (45 CFR 164.502(g), 164.510(b)).
   If the person is only background and the question asks how the plan works, it gets a general answer, never their coverage. */
const OTHER = String.raw`\b(?:my|her|his|their|our|a|the)\s+(?:member'?s?\s+|caller'?s?\s+)?(?:mom|mother|dad|father|husband|wife|spouse|partner|son|daughter|brother|sister|sister in law|brother in law|aunt|uncle|cousin|neighbou?r|friend|grandma|grandmother|grandpa|grandfather|grandson|granddaughter|caregiver)s?(?:'s)?\b`;
const OTHER_RE = new RegExp(OTHER, "i"), PLAN_ASK = /\b(on my plan|my plan|this plan|the plan|our plans?|do we|does lakewell|members?|can i|do i|am i)\b/i;
const THIRD_REC = /\b(enrolled|enrollment|paid|pay|pays|paying|owe|owes|claims?|co[- ]?pays?|stage|dose|covered|coverage|shipment|appeal|authorization|auth|recorded|file|status|pending|decided|approved|account|bills?|balance|deductible|spent|total|meds|medications?|prescriptions?|refills?|visits?|diagnos\w*|records?|taking|using|used|getting|allowance|member id|premium|explanation of benefits|eob|ride for|left)\b/i;
/* S8.143 to S8.145: whose information is the question about? The topic never makes a question personal. */
/* Audit A-037: years written in words, 2020 to 2039 */
const ONES = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
function spelledYears(q) { const out = [], re = /\b(?:twenty|two thousand(?: and)?)[ -](twenty|thirty)?(?:[ -]?(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen))?\b/gi; let m;
  while ((m = re.exec(q))) { const tens = m[1] ? (m[1].toLowerCase() === "twenty" ? 20 : 30) : 0, ones = m[2] ? ONES[m[2].toLowerCase()] : 0; if (tens || (m[0].toLowerCase().startsWith("two thousand") && m[2])) out.push(2000 + tens + ones); }
  return out; }
/* The sentence that carries the question, or the last sentence */
/* Audit A-077: split after . ? ! without regex lookbehind, which Safari before 16.4 cannot parse */
const sentences = t => String(t).replace(/([.?!])\s+/g, "$1\u0001").split("\u0001");
function lastAsk(q) { const parts = sentences(q).filter(Boolean); return parts.filter(x => /\?\s*$/.test(x)).slice(-1)[0] || parts.slice(-1)[0] || ""; }
function thirdParty(q) {
  if (!OTHER_RE.test(q)) return null;
  const parts = sentences(q).filter(Boolean), ask = parts.filter(x => /\?\s*$/.test(x)).slice(-1)[0] || parts.slice(-1)[0] || "";
  if (OTHER_RE.test(ask)) { const rest = ask.replace(OTHER_RE, ""); if (THIRD_REC.test(rest)) return "records";
    return PLAN_ASK.test(rest) || /^\s*(can|could|may|does|do|is|are|how|will)\b/i.test(ask) ? "general" : "records"; }
  const before = parts.filter(x => x !== ask).join(" ");
  return OTHER_RE.test(before) && THIRD_REC.test(before) && /\b(confirm|pull|tell (him|her|them)|check|look (it|that) up|cancel|change)\b/i.test(ask) ? "records" : "general";
}
const THIRD_LEAD = "I can't share another member's coverage, but here is how it works on our plans.";
const LEGAL_REQ = /attorney|lawyer|subpoena|court order|legal request/i;
/* Audit A-039: a look-up verb followed by a name or an account word is a records request, whoever it is for */
const LOOKUP_REQ1 = /\b(look up|pull up|pull|bring up|open|find|check)\b[^.?!]{0,40}\b(member|account|claims?|dob|date of birth|record|file|eob)\b/i;
const LOOKUP_REQ2 = /\b(?:[Ll]ook up|[Pp]ull up|[Pp]ull|[Bb]ring up|[Oo]pen|[Ff]ind|[Cc]heck)\b (?:the |a |an )?(?:member |account |file |record )?(?:for |of )?[A-Z][a-z]+(?:,? [A-Z][a-z]+)+/;
const LOOKUP_REQ = { test: q => LOOKUP_REQ1.test(q) || LOOKUP_REQ2.test(q) };
/* MBI-like (11 chars with dashes) and invented member IDs (CW + 9 digits); names and dates of birth are counted */
function redact(q) {
  /* Audit A-012: spaces and hyphens inside an identifier are ignored, so "1EG4 TE5 MK72", "LW 123 456 789" and "123 45 6789" are masked; emails, phones, CW IDs and spelled dates too */
  let n = 0; const r = String(q)
    .replace(/\b\d{1,2}[A-Z][A-Z0-9]\d[ -]?[A-Z][A-Z0-9]\d[ -]?[A-Z]{2}\d{2}\b/gi, () => (n++, "[MBI]"))
    .replace(/\b(LW|CW)[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}\b/gi, () => (n++, "[MEMBER ID]"))
    /* Audit A-078: a bare run of 7 or more digits after "member", "ID", "number" or "account" is an identifier */
    .replace(/(\b(?:member|id|number|no|account|policy)\b[^\d.?!]{0,20})\d(?:[ -]?\d){6,}\b/gi, (m, pre) => (n++, pre + "[MEMBER ID]"))
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, () => (n++, "[EMAIL]"))
    .replace(/\b\d{3}[ -]\d{2}[ -]\d{4}\b/g, () => (n++, "[SSN]"))
    .replace(/(\+?1[ .-]?)?\(?\b\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}\b/g, () => (n++, "[PHONE]"))
    .replace(/\b\d{1,2}[\/ ]\d{1,2}[\/ ]\d{2,4}\b/g, () => (n++, "[DATE]"));
  return { text: r, n };
}
/* T12: language detection. Non-Latin scripts and Vietnamese marks; Spanish and Tagalog by two or more function words, so a borrowed word ("fiesta") stays English */
const ES_W = new Set("puedo cómo como qué que cuál cuánto cuánta cuántos cuántas necesito quiero mi mis por para el la los las un una de del en sobre tengo hablar explícame farmacia farmacias correo días suministro cubre lentes mamá ayuda medicina medicinas pregunta tarda decisión excepción usar cualquier pido es hola".split(" "));
const ES2_W = new Set("como puedo cual cuanto cuantos cuanta cuantas farmacia medicina medicinas espanol alguien hablar necesito quiero tengo pregunta dias explicame".split(" "));
const FR_W = new Set("je vous nous est une des les pour avec pharmacie comment puis pouvez mon mes dans sur ordonnance medicament medicaments combien quel quelle".split(" "));
const HT_W = new Set("mwen ou nou yo pou nan ki kijan kouman eske farmasi medikaman konbyen gen bezwen".split(" "));
const DE_W = new Set("ich kann wie meine mein nicht und mit apotheke medikament medikamente wo wann wieviel welche bitte ist sind haben brauche".split(" "));
const PT_W = new Set("eu posso como minha meu nao com farmacia remedio remedios onde quando quanto qual preciso quero tenho obrigado voce".split(" "));
const TL_W = new Set("ba ako akong paano ilang puwede pwede ang sa ng gumamit anong hihingi kahit botika araw ko mo po".split(" "));
function langOf(q) {
  const t = String(q);
  if (/spanish|espa[nñ]ol|en espa/i.test(t)) return "es";
  if (/chinese|mandarin|vietnamese|tagalog|korean|russian|arabic|french|haitian|portuguese/i.test(t)) return "other";
  if (/[\u0400-\u04ff\u0600-\u06ff\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(t) || /[ăđơư]|[ạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỷỹỵ]/i.test(t)) return "other";
  const w = t.toLowerCase().replace(/[¿¡?.,!:;]/g, " ").split(/\s+/).filter(Boolean);
  if (/[¿¡]/.test(t) || w.filter(x => ES_W.has(x)).length >= 2) return "es";
  if (w.filter(x => TL_W.has(x)).length >= 2) return "other";
  /* Audit A-036: unaccented Spanish and four more Latin-script languages by two or more function words each; one borrowed word stays English */
  const distinct = S => new Set(w.filter(x => S.has(x))).size;
  if (distinct(ES2_W) >= 2) return "es";
  if ([FR_W, HT_W, DE_W, PT_W].some(S => distinct(S) >= 2)) return "other";
  return null;
}
/* Cost rule (Nik, 1 Nov 2026): a cost question is answered only when the unit names that exact cost; "covered at $0" alone does not count */
function costNamed(q, u) {
  const t = String((u.current || u.latest || {}).text || "") + " " + (((u.current || u.latest || {}).clause || {}).text || "");
  if (/coinsurance/i.test(q)) return /coinsurance/i.test(t);
  if (/co-?pays?/i.test(q)) return /co-?pay/i.test(t) && /\$\d/.test(t);
  if (/deductible/i.test(q)) return /deductible/i.test(t) && /\$\d/.test(t);
  return /\b(you|members?) pay\b[^.]{0,40}(\$\d|\d+%)|\b(copay|coinsurance) (is|of) (\$\d|\d+%)|\bcosts? (you )?\$\d/i.test(t);
}
/* D91: near-miss slots. When a question asks for a specific kind of fact (a phone number, opening hours, a duration, miles, premium,
   a second fill, named providers, a specific drug) the retrieved unit must state that kind of fact, or it is a near-miss, not an answer.
   Built against the independent near-miss set T14 (nearmiss.js), never against the sealed holdout. */
const GENERIC = new Set("how long fast soon quickly many day days hour hours week weeks month months take takes member members plan lakewell doe get request once after ha last timeline timeframe deadline time decide decided decision".split(" "));
const DURATION = /\b\d+[- ](calendar |working |business )?(days?|hours?|weeks?|months?)\b/i;
const SLOTS = [
  { name: "a phone or fax number", q: /\b(phone|fax|telephone) (number|line)s?\b|\b(what|which) number\b|\bnumber (do|to|should|can) \w+ call\b|\bfax\b/i, t: /\b1-?8\d\d\b|\(\d{3}\)|\b\d{3}[-. ]\d{3}[-. ]\d{4}\b|\bTTY\b/i },
  { name: "opening hours", q: /\bwhat hours\b|\b(hours|open|opening|closing)\b[^?]{0,20}\b(open|hours|close)\b|\bwhen is [^?]* open\b/i, t: /\b\d{1,2}(:\d\d)? ?(a\.?m|p\.?m)\b|\b24\/7\b/i },
  { name: "a distance", q: /\bmiles?\b|\bmileage\b|\bhow far\b/i, t: /\bmiles?\b/i },
  { name: "whether the premium counts", q: /\bpremiums?\b/i, t: /\bpremiums?\b/i },
  { name: "a second or extra fill", q: /\b(second|another|extra|additional)\b/i, t: /\b(second|another|extra|additional)\b/i },
  { name: "named providers", q: /\bwhich (eye )?(doctors?|providers?|pharmacies|dentists?|specialists?|hospitals?)\b/i, t: /\b(in-network|network) (providers?|doctors?) (include|are)\b/i },
  { name: "how to replace it", q: /\b(replace\w*|lost|lose|losing|new card)\b/i, t: /\b(replace\w*|new card|order (a|another) card|request (a|another) card)\b/i },
  { name: "a drug-specific limit", q: /\b(specific|particular) (drug|medicine|medication)\b/i, t: /$^/ },
  /* Audit A-038: count or frequency, shipping time, a brand or a named vendor, weekends, the plan-year boundary */
  { name: "a count or frequency", q: /\bhow many (times|rides|trips|cleanings|visits|refills|fills|days a|per)\b|\b(per|a|each) (day|week|month|year)\b|\bhow often\b/i, t: /\b(\d+|one|two|three|four|five|six|ten|twelve) (times?|rides?|trips?|cleanings?|visits?|refills?|fills?)\b|\b(per|a|each) (day|week|month|year)\b|\bunlimited\b/i },
  { name: "a shipping time", q: /\b(ship\w*|deliver\w*|arriv\w*)\b[^?]{0,30}\b(fast\w*|soon\w*|quick\w*|how long|days)\b|\bhow (long|fast|soon)\b[^?]{0,30}\b(ship\w*|deliver\w*|arriv\w*)\b|\bships? fastest\b/i, t: /\b(ship\w*|deliver\w*|arriv\w*)\b[^.]{0,30}\b(within|in) \d/i },
  { name: "a brand, vendor or named location", q: /\b(which|what) (brand|make|model|company|vendor|gyms?|clubs?|pharmacy ships|pools?)\b|\bbrand\b/i, t: /\b(brand|model)\b[^.]{0,20}\b[A-Z][a-z]+/ },
  { name: "whether weekends count", q: /\bweekends?\b|\b(saturday|sunday)s?\b/i, t: /\bweekends?\b|\b(calendar|business|working) days\b/i },
  { name: "the days of the week", q: /\b(which|what) days?\b/i, t: /\b(monday|tuesday|wednesday|thursday|friday|weekdays?|every day|daily)\b/i },
  { name: "access to a pool or facility", q: /\b(pool|sauna|spa|classes)\b/i, t: /\b(pool|sauna|spa|classes)\b/i },
  { name: "the plan-year boundary", q: /\bplan year\b[^?]{0,40}\b(change|changes|start|starts|begin|begins|end|ends|run|runs)\b|\b(which|what) plan year\b/i, t: /\bplan year\b[^.]{0,40}\b(january|jan|1 jan|december|dec)\b/i }
];
function slotMiss(q, u) {
  const t = String((u.current || u.latest || {}).text || "") + " " + (((u.current || u.latest || {}).clause || {}).text || "");
  const hit = SLOTS.find(x => x.q.test(q) && !x.t.test(t)); if (hit) return hit.name;
  /* Audit A-038: a count asked per day, week, month or year is stated only if the unit gives that same period */
  const per = q.match(/\b(?:per|a|each|every) (day|week|month|year)\b|\b(daily|weekly|monthly|yearly|annual\w*)\b/i);
  if (per && /\bhow many\b|\bhow often\b|\b(limit|maximum|max)\b/i.test(q)) { const p = (per[1] || per[2]).toLowerCase().replace(/^(daily)$/, "day").replace(/^(weekly)$/, "week").replace(/^(monthly)$/, "month").replace(/^(yearly|annual\w*)$/, "year");
    if (!new RegExp(String.raw`\b(?:per|a|each|every) ${p}\b|\b${p}ly\b|\bannual`, "i").test(t)) return `a limit per ${p}`; }
  if (/\bhow (long|fast|soon|quickly)\b|\bhow many (days|hours|weeks|months)\b|\b(timeframe|time frame|deadline)\b|\bwhen does [^?]* (end|expire)\b/i.test(q)) {
    const CLS = [[/\bsupply\b/i, /\bsupply\b/i], [/\b(ship|shipping|shipped|deliver\w*|arrive)\b/i, /\b(ship\w*|deliver\w*|arriv\w*)\b[^.]{0,30}\b(within|in)\b/i], [/\b(decid\w*|decision|process\w*)\b/i, /\b(decid\w*|decision)\b/i],
      [/\b(last|valid|expire\w*|good for)\b/i, /\b(valid|lasts?|expire\w*|good for)\b/i], [/\b(appeal|file)\b/i, /\bappeal\w*\b[^.]{0,40}\bwithin\b|\bwithin\b[^.]{0,40}\bappeal/i],
      [/\b(late|early)\b/i, /\b(late|early)\b/i], [/\broute\w*\b/i, /\broute\w*\b/i], [/\b(supply|cover|fill)\b/i, /\b(supply|fill)\b/i]];
    const sents = sentences(t).filter(x => DURATION.test(x)), cls = CLS.find(c => c[0].test(q));
    if (!sents.length) return "a time frame";
    if (cls && !sents.some(x => cls[1].test(x))) return "the time frame asked about";
  }
  const others = ALL_BASE().filter(o => o.id !== u.id).flatMap(o => o.kw.strong.map(stem)).filter(k => k.length > 3), mine = new Set(u.kw.strong.concat(u.kw.normal).map(stem)), tw = new Set(tokens(t));
  const foreign = tokens(q).filter(w => others.includes(w) && !mine.has(w) && !tw.has(w));
  if (foreign.length >= 2) return "the topic asked about (" + foreign.join(", ") + ")";
  return null;
}
/* T13: members never see internal staff documents; the public benefit is offered instead */
const STAFF_DOC = /\b(staff[- ]only|internal|advocate[- ]only|employee)\b[^.?!]{0,30}\b(documents?|docs?|policy|policies|procedures?|guides?|notes?|scripts?|manuals?|files?|says)\b|\b(staff|advocate)('s)? (documents?|scripts?|manuals?|notes?|guides?)\b|\b(training|team)('s)? (documents?|scripts?|manuals?|notes?|guides?)\b/i;
/* answer(): the read contract every channel uses. Rules first (scope, state, window, render, language), ranking in the middle (model stand-in). */
function answer(q, ctx) {
  const full = String(q == null ? "" : q); q = full.slice(0, 500);
  const s = ctx.state || S(), role = ROLES[ctx.role] ? ctx.role : null, channel = ctx.channel || (ROLES[role] || {}).channel || "Advocate desk", asOf = ctx.asOf || PLAN.today;
  const trace = [], res = { q, role, channel, asOf, trace, redacted: redact(full).text };
  /* Audit A-009: a message longer than the search limit is never cut and searched; a person reads the whole of it */
  if (role && full.length > 500) { trace.push("Longer than the 500-character search limit: nothing is cut off, the whole message goes to a person (audit A-009)"); return Object.assign(res, { kind: "person", text: REFUSAL, route: "person", tooLong: true }); }
  if (!role) return Object.assign(res, { kind: "abstain", route: "none", unit: null, trace: ["Unknown role: nothing searched"] });
  const reads = ctx.revoked ? readsOf(role, s).filter(k => k === "Shared") : readsOf(role, s);
  trace.push(`Role checked with the identity provider: ${(ROLES[role] || {}).label} reads ${reads.join(", ") || "nothing"}${ctx.revoked ? " (Insurance base revoked)" : ""}`);
  if (!role || !q.trim()) { trace.push(!role ? "Unknown role: nothing searched" : "Empty question"); return Object.assign(res, { kind: "abstain", route: "none", unit: null }); }
  const memberSide = ["Member chat", "Voice", "Outbound", "Website"].includes(channel) || !!ROLES[role].memberOnly;
  const third = thirdParty(q);
  if (third === "records") { trace.push("Asks about another person's records or status: handed to a person, who checks for a personal representative or other authority first (D107; 45 CFR 164.502(g), 164.510(b))"); return Object.assign(res, { kind: "person", text: REFUSAL, route: "person", thirdParty: true }); }
  const lang = langOf(q);
  if (lang && !/\b(in|en) (spanish|espa\w*)\b/i.test(q)) { trace.push(`Written in ${lang === "es" ? "Spanish" : "another language"}: handed to the translator queue (or a bilingual person), never a machine guess`); return Object.assign(res, { kind: "abstain", route: "translator", unit: null, why: "Not in English" }); }
  /* Audit A-009: naming a relative as background never switches off the personal-record check; it runs on the asked sentence */
  if (LOOKUP_REQ.test(q)) { trace.push("A look-up of a named person or an account: records are never in the knowledge layer, so it goes to a person (audit A-039)"); return Object.assign(res, { kind: "person", text: REFUSAL, route: "person", lookup: true }); }
  const askQ = third === "general" ? lastAsk(q) : q, genOK = third !== "general" || !PLAN_ASK.test(askQ);
  /* Audit A-080: a member asking for a staff document gets the staff-document refusal, not the personal-records one */
  if (!(memberSide && STAFF_DOC.test(q)) && (memberSide || !LEGAL_REQ.test(q)) && (genOK && (MEMBER_DATA.test(askQ) || (PERSONAL.test(askQ) && !GENERIC_MEMBER.test(askQ))) && !policyQ(askQ) || OWN_RECORD.test(askQ) && !policyQ(askQ))) { trace.push("Asks for one member's personal data: search cannot verify identity, so it hands to a person (R-83, SD-05; routing J)"); return Object.assign(res, { kind: "person", text: REFUSAL, route: "person" }); }
  const all = units(s);
  const memberOnly = memberSide;
  if (memberSide && STAFF_DOC.test(q)) { res.staffDoc = true; if (!ctx.state) logEv(s, null, role, "ACCESS", "Staff-document request from a member channel, refused: " + res.redacted); trace.push("Asks for an internal staff document: never shown to members; the public benefit is offered instead and the attempt is logged (T13, J)"); }
  const nowY = asDate(asOf).getFullYear(), qYears = (q.match(/\b20\d\d\b/g) || []).map(Number);
  /* Audit A-037: spelled-out years ("twenty twenty-seven", "two thousand twenty-five") and "the new year" */
  spelledYears(q).forEach(y => qYears.push(y));
  if (/\b(after|in|into|from) the new year\b/i.test(q)) qYears.push(nowY + 1);
  /* F7: years in words count the same as digits */
  if (/\b(year after next|two years from now|in two years)\b/i.test(q)) qYears.push(nowY + 2); else if (/\b(next|coming|upcoming) (plan )?year\b/i.test(q)) qYears.push(nowY + 1);
  if (/\b(last|previous|prior) (plan )?year'?s?\b/i.test(q)) qYears.push(nowY - 1);
  if (/\bthis (plan )?year\b/i.test(q)) qYears.push(nowY);
  /* Audit A-037: a past year named only as background ("I joined in 2019. Can I ...?") does not make the question about that year */
  { const askS = lastAsk(q), askY = (askS.match(/\b20\d\d\b/g) || []).map(Number).concat(spelledYears(askS)), bg = qYears.filter(y => y < nowY && !askY.includes(y) && !/\b(last|previous|prior) (plan )?year\b/i.test(askS));
    if (bg.length && /\?\s*$/.test(askS) && !/\b(was|were|did|had)\b/i.test(askS)) { trace.push(`Past year ${bg.join(", ")} named as background only; the question is about now (audit A-037)`); bg.forEach(y => { const i = qYears.indexOf(y); if (i >= 0) qYears.splice(i, 1); }); } }
  /* F6: a year before this one is never answered with another year's wording */
  if (qYears.some(y => y < nowY)) { trace.push(`The question asks about ${qYears.filter(y => y < nowY).join(", ")}. Past-year wording is not served, and another year's wording is never served in its place (D60)`); return Object.assign(res, { kind: "abstain", route: "year", unit: null, why: "Asks about a past plan year" }); }
  const eligible = (u, rd) => u.current && u.kbs.some(k => rd.includes(k)) && (!memberOnly || u.memberFacing) && (u.channels.includes(channel) || channel === "Agent Assist")
    && (!qYears.length || qYears.every(y => u.versions.some(v => (v === u.current || (!u.yearBound && v.state !== "retired")) && dayOK(v.effective) && asDate(v.effective).getFullYear() <= y && y <= asDate(v.expiry).getFullYear())));
  // effective window as of the requested date
  all.forEach(u => { const c = u.versions.filter(v => v.state === "approved" && inWindow(v, asOf)).slice(-1)[0] || null; u.current = c; if (c) { u.text = c.text; u.clause = c.clause || null; u.version = c.v; } });
  const pool = all.filter(u => eligible(u, reads));
  trace.push(`${pool.length} approved, in-window units searched as of ${asOf}; drafts, reviews and expired versions excluded${memberOnly ? "; member channel: member-facing units only (rule J; R-84)" : ""}`);
  const fz = fuzz(tokens(q, s)), tk = fz.map(x => x.w);
  fz.filter(x => x.fixed).forEach(x => trace.push(`Misspelling tolerated: "${x.fixed}" read as "${x.w}"`));
  const pin = (s.pins || {})[q.toLowerCase().trim()];
  let ranked = pool.map(u => score(u, tk)).sort((a, b) => b.blend - a.blend);
  if (pin && pool.find(u => u.id === pin)) { trace.push("Pinned answer for this question (confirmed by Renee)"); ranked = [score(pool.find(u => u.id === pin), tk)].concat(ranked.filter(r => r.u.id !== pin)); ranked[0].pinned = true; }
  res.cands = ranked.filter(r => r.blend > 0).slice(0, 3);
  let top = ranked[0];
  /* Audit A-039: a request from a lawyer, a subpoena or a court order is routed by rule to the records-request procedure, never ranked */
  if (!memberSide && LEGAL_REQ.test(q)) { const lu = pool.find(u => u.id === "KU-154"); if (lu) { top = score(lu, tk); top.kw = Math.max(top.kw, 2); top.legal = true; trace.push("Request on behalf of a lawyer, subpoena or court order: routed by rule to the records-request procedure (KU-154)"); } }
  /* D59: next-year units. A question naming a later year is answered from the unit in force that year, labelled with its start date. */
  const futureOf = u => u.versions.filter(v => v.state === "approved" && dayOK(v.effective) && asDate(v.effective) > asDate(asOf)).slice(-1)[0] || null;
  const futPool = all.filter(u => futureOf(u) && u.kbs.some(k => reads.includes(k)) && (!memberOnly || u.memberFacing));
  const futY = qYears.filter(y => y > asDate(asOf).getFullYear());
  if (futY.length) {
    const fr = futPool.filter(u => futY.every(y => asDate(futureOf(u).effective).getFullYear() <= y && y <= asDate(futureOf(u).expiry).getFullYear())).map(u => score(u, tk)).sort((x, y) => y.blend - x.blend)[0];
    if (fr && fr.kw >= 2 && (!top || fr.kw >= top.kw)) { const v = futureOf(fr.u);
      /* F14: a question naming this year and a later one gets both, each labelled */
      if (qYears.includes(nowY) && fr.u.current && fr.u.current !== v) res.also = { version: fr.u.current, unit: fr.u }; fr.u.current = v; fr.u.text = v.text; fr.u.clause = v.clause || null; fr.u.version = v.v; top = fr; res.upcoming = v.effective;
      trace.push(`The question names ${futY.join(", ")}: answered from the version in force then, labelled "starts ${v.effective}" (D59, R-81)`); }
  }
  if (lang && !(top && top.kw >= 2 && ((top.u.translations || {})[lang] || {}).state === "approved")) { trace.push(`Written in ${lang === "es" ? "Spanish" : "another language"}; no approved translation for it, so it goes to the translator queue, never a machine guess`); return Object.assign(res, { kind: "abstain", route: "translator", unit: null, why: "No approved translation" }); }
  if (top && (top.kw >= 2 || top.pinned)) {
    const u = top.u; res.unit = u; res.version = u.current;
    trace.push(`Top match ${u.id} "${u.title}" (keyword ${top.kw}, similarity ${top.sim}); answers only at keyword 2 or more`);
    if (lang) { const tr = (u.translations || {})[lang]; if (!tr || tr.state !== "approved") { trace.push("Spanish asked; the Spanish version is a machine draft no qualified translator has checked. Never served"); return Object.assign(res, { kind: "abstain", route: "translator", unit: null, why: "Spanish wording not approved" }); } }
    const miss = slotMiss(q, u); if (miss) { trace.push(`${u.id} was retrieved but does not state ${miss}. It does not guess: near-miss abstention (D91)`); return Object.assign(res, { kind: "nearmiss", route: "gap", unit: null, near: u.id, why: `${u.title} does not state ${miss}` }); }
    if (COST.test(q) && !policyQ(q) && !costNamed(q, u)) { trace.push(`${u.id} was retrieved but holds no amount. It does not guess: near-miss abstention (rule J; N-38, R-84)`); return Object.assign(res, { kind: "nearmiss", route: "gap", unit: null, near: u.id, costMiss: true, why: `${u.title} does not state an amount` }); }
    if (u.clause && /\[[A-Z ]+\]/.test(u.clause.text)) { trace.push(`Render check failed: the locked clause has an unfilled field ${u.clause.text.match(/\[[A-Z ]+\]/)[0]}. Abstain; to the author`); return Object.assign(res, { kind: "abstain", route: "author", unit: null, near: u.id, why: "Template field left blank" }); }
    if (u.injection) { if (!ctx.state) logEv(s, u.id, role, "ACCESS", "Planted instruction in the source was found at ingest and never followed: " + res.redacted); trace.push("Source carried a planted instruction; removed at ingest and logged; answer unaffected"); }
    const nx = res.upcoming ? null : nextAt(u, asOf);
    if (nx) trace.push(`Version ${nx.v} is ${nx.state === "approved" ? "approved for " + nx.effective : nx.state}; its text is not served`);
    if (u.versions.some(v => v.state === "approved" && !inWindow(v, asOf) && dayOK(v.expiry) && asDate(v.expiry) < asDate(asOf))) trace.push("An older version expired by its window and is not served");
    if (res.staffDoc) { const pub = u.memberFacing ? render(u, channel) : ""; return Object.assign(res, { kind: "scope", route: "access", unit: null, offered: u.memberFacing ? u : null,
      text: STAFF_REFUSAL + (pub ? " Here's what your plan covers: " + pub : "") + " If you'd like to check your own records, a team member can help once they've confirmed it's you." }); }
    res.kind = "answer"; res.pending = !!nx; res.text = render(u, channel);
    if (third === "general" && memberSide) { res.text = THIRD_LEAD + " " + res.text; trace.push("Mentions another person only as background: general answer, never their coverage (D107)"); }
    if (res.also) { const c = res.also.version; res.text = `For ${asDate(c.effective).getFullYear()}: ${render(Object.assign({}, u, { text: c.text, clause: c.clause || null }), channel)} | Starts ${u.current.effective}: ${res.text}`; trace.push(`Both years asked: ${asDate(c.effective).getFullYear()} and ${asDate(u.current.effective).getFullYear()} served, each labelled`); }
    if (channel === "Outbound") { res.link = { unit: u.id, v: u.current.v, fp: u.clause ? fp(u.clause.text) : null }; trace.push(`Outbound: one-line summary plus a link to ${u.id} v${u.current.v}; the locked clause is on the linked page, word for word (D57)`); }
    return res;
  }
  // nothing in scope: is there an answer the role may not read?
  const coversYears = v => !qYears.length || qYears.every(y => asDate(v.effective).getFullYear() <= y && y <= asDate(v.expiry).getFullYear());
  const up = futPool.filter(u => coversYears(futureOf(u))).map(u => score(u, tk)).sort((x, y) => y.blend - x.blend)[0];
  if (up && up.kw >= 2) { const v = futureOf(up.u); trace.push(`No answer in force today. ${up.u.id} starts ${v.effective}; shown beside, labelled, never as today's answer (D59)`); return Object.assign(res, { kind: "abstain", route: "upcoming", unit: null, upcomingUnit: up.u, upcomingVersion: v }); }
  const outside = all.filter(u => u.current && !u.kbs.some(k => reads.includes(k)) && !(COST.test(q) && !priced(u))).map(u => score(u, tk)).sort((a, b) => b.kw - a.kw)[0];
  if (outside && outside.kw >= 2) { trace.push("A unit outside this role's bases would match. It was never searched or cited; logged as an access refusal, not routed to an author"); return Object.assign(res, { kind: "scope", route: "access", unit: null, base: outside.u.kbs.join(", ") }); }
  if (memberSide && third !== "general" && LOOKUP.test(q)) { trace.push("Member channel, first-person question, no approved unit: handed to a person rather than a general answer (decision 3, safety net)"); return Object.assign(res, { kind: "person", text: REFUSAL, route: "person" }); }
  trace.push(top ? `Best candidate scored keyword ${top.kw}, below the bar. No approved unit answers this` : "No candidate");
  return Object.assign(res, { kind: "abstain", route: "gap", unit: null });
}
/* Channel rendering: the same unit and version; locked clause character-exact (fingerprint checked) */
function render(u, channel) {
  const c = u.clause;
  if (channel === "Outbound") return (String(u.memberLead || u.text).match(/^[^.!?]*[.!?]/) || [u.text])[0] + " Full wording: lakewell.example/k/" + u.id.toLowerCase() + " Reply STOP to opt out.";
  if (channel === "Member chat") return (u.memberLead ? u.memberLead + " " : u.text + " ") + (c ? c.text : "");
  if (channel === "Voice") return (c ? "Here is some important information. " + c.text : u.text);
  return u.text + (c ? " " + c.text : "");
}
/* Outbound carries a link, so the check is that the link resolves to the same approved version and clause fingerprint */
function linkOK(res) { const l = res.link, u = l && unit(l.unit); const v = u && u.versions.find(x => x.v === l.v && x.state === "approved"); return !!v && (!l.fp || fp((v.clause || {}).text) === l.fp); }
function clauseIntact(res) { if (res.channel === "Outbound" && res.unit) return linkOK(res) && !(res.text || "").includes((res.unit.clause || {}).text || "\u0000"); return !res.unit || !res.unit.clause || (res.text || "").includes(res.unit.clause.text); }
/* A1 to A3: the regulation behind a unit, shown on the card */
const ruleTag = u => typeof RULE_KEYS !== "undefined" && RULE_KEYS[u.id] ? `<span class="pill lock" title="Real-world rule, keyed in the citations register">Rule: ${RULE_KEYS[u.id]}</span>` : "";

/* ---------- display helpers ---------- */
function nextAt(u, asOf) { const t = asDate(asOf || PLAN.today), cur = u.versions.filter(v => v.state === "approved" && inWindow(v, asOf)).slice(-1)[0];
  return u.versions.find(v => v !== cur && (["in review", "awaiting co-sign", "changes requested"].includes(v.state) || (v.state === "approved" && dayOK(v.effective) && asDate(v.effective) > t))) || null; }
function statePill(st) {
  const c = { approved: "good", "in review": "warn", proposed: "leaf", draft: "design", retired: "bad", expired: "bad", "changes requested": "bad", "awaiting co-sign": "warn", "proposed to retire": "warn" }[st] || "design";
  return `<span class="pill ${c}">${esc(st)}</span>`;
}
const who = w => `<span class="pill ${w === "AI" ? "leaf" : "lock"}" title="${w === "AI" ? "AI does this" : "A person decides"}">${w}</span>`;
function tagLine(u) { return [u.area, u.kbs.join(" + ") + " base", u.memberFacing ? "Member-facing" : "Advocate only"].join(" · "); }
function citeLine(u, v) {
  v = v || u.current || u.latest; const d = doc(u.doc);
  return `<div class="citeline"><b class="mono">${u.id} v${v.v}</b><span>${esc(u.title)}</span><span>${d ? esc(d.short) : ""} ${esc(u.span)}</span><span>approved by <b>${esc((v.approvedBy || "not yet").split(",")[0])}</b>${v.approvedOn ? " on " + esc(v.approvedOn) : ""}</span><span>in force ${esc(v.effective)} to ${esc(v.expiry)}</span></div>`;
}
function citeHTML(u, v) {
  v = v || u.current || u.latest; const d = doc(u.doc);
  return `<div class="cite"><dl>
    <dt>Unit</dt><dd class="mono">${u.id} v${v.v} · ${esc(u.title)}</dd>
    <dt>Source</dt><dd>${d ? esc(d.title) + ` <span class="srcchip">${d.id} ${esc(v.from || d.version)}</span>` : esc(u.doc)}</dd>
    <dt>Span</dt><dd>${esc(u.span)}</dd>
    ${v.clause ? `<dt>Locked clause</dt><dd>${esc(v.clause.label)} · fingerprint <span class="mono">${fp(v.clause.text)}</span></dd>` : ""}
    <dt>Approved by</dt><dd>${esc(v.approvedBy || "not approved")}</dd>
    <dt>On</dt><dd>${esc(v.approvedOn || "")}</dd>
    <dt>In force</dt><dd>${esc(v.shownFrom || v.effective)} to ${esc(v.expiry)}</dd>
    <dt>Base</dt><dd>${u.kbs.join(", ")}</dd>
    <dt>Channels</dt><dd>${u.channels.join(", ")}</dd>
    <dt>Tags</dt><dd>${esc(tagLine(u))}</dd>${typeof RULE_KEYS !== "undefined" && RULE_KEYS[u.id] ? `<dt>Real-world rule</dt><dd>${RULE_KEYS[u.id]}</dd>` : ""}</dl></div>`;
}
function rankHTML(r) {
  if (!r.cands || !r.cands.length) return '<p class="small">No unit scored above zero.</p>';
  return `<table style="margin-top:6px"><thead><tr><th>Candidate</th><th>Keyword</th><th>Similarity</th><th>Blend</th></tr></thead><tbody>${r.cands.map(c => `<tr><td class="mono">${c.u.id}</td><td>${c.kw}</td><td>${c.sim}</td><td><b>${c.blend}</b></td></tr>`).join("")}</tbody></table>`;
}
function traceHTML(r) { return `<ol class="trace">${r.trace.map(t => `<li>${esc(t)}</li>`).join("")}</ol>`; }
function wdiff(a, b) {
  const A = a.split(" "), B = b.split(" "), n = A.length, m = B.length, L = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < n && j < m) { if (A[i] === B[j]) { out.push(esc(A[i])); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) out.push(`<del>${esc(A[i++])}</del>`); else out.push(`<ins>${esc(B[j++])}</ins>`); }
  while (i < n) out.push(`<del>${esc(A[i++])}</del>`); while (j < m) out.push(`<ins>${esc(B[j++])}</ins>`);
  return out.join(" ");
}
const norm = t => String(t).replace(/\s+/g, " ").replace(/[‘’]/g, "'").trim();
const jacc = (a, b) => { const A = new Set(tokens(a)), Bs = new Set(tokens(b)); const i = [...A].filter(x => Bs.has(x)).length; return i / (A.size + Bs.size - i || 1); };
const nums = t => (String(t).match(/\d+/g) || []).join(",");
/* Dedup rule (AI decides; never merges): locked clauses alike at 0.5 or more are one clause; other text must also share every number */
function dupCheck(a, b, locked) { const j = jacc(a, b); return { j: Math.round(j * 100) / 100, dup: locked ? j >= 0.5 : j >= 0.5 && nums(a) === nums(b) }; }

/* ---------- gaps ---------- */
function gaps(st) {
  const s = st || S(), flags = s.flags || [];
  const log = SEARCH_LOG.filter(l => l.expect === null).map(l => ({ q: l.q, n: l.n, role: l.role, cluster: l.cluster, process: l.process }));
  flags.forEach(f => { const g = log.find(x => x.q.toLowerCase() === f.q.toLowerCase()); if (g) g.flagged = f; else log.push({ q: f.q, n: 1, role: f.role, cluster: f.cluster || "Flagged today", flagged: f }); });
  const byC = {};
  log.forEach(g => { (byC[g.cluster] = byC[g.cluster] || { name: g.cluster, items: [], n: 0 }).items.push(g); byC[g.cluster].n += g.n; });
  return Object.values(byC).map(c => Object.assign(c, CLUSTERS[c.name] || {}, { decision: (s.gapDecision || {})[c.name], written: c.name === "Supplemental benefits" && !!s.authored, since: FIRST_SEEN[c.name] || PLAN.today })).sort((a, b) => b.n - a.n);
}

/* ---------- seed what a skipped story step needs ---------- */
function approveSeed(s, id, by, note, v) { s.approved = s.approved || {}; const k = v ? id + "@v" + v : id; if (!s.approved[k]) { s.approved[k] = { by, on: PLAN.today }; logEv(s, id, by, "approved v" + (v || 1), note || "checklist complete", v || 1); } }
const ENSURE = {
  ingestAll: s => { s.ingested = Object.assign({ "DOC-RXV2": true, "DOC-SD09": true }, s.ingested); s.messy = s.messy || { M2: "split", M5: "merge" }; s.dedupLoaded = true; if (!s.dedupProposed) { s.dedupProposed = true; logEv(s, "KU-202", "author", "proposed", "keep PD-A, PD-B as 2027 version, retire PD-C"); } },
  tomDone: s => { ENSURE.ingestAll(s); approveSeed(s, "KU-202", "legal"); if (!s.conflictResolved) { s.conflictResolved = { by: "legal", on: PLAN.today, choice: "legal" }; logEv(s, "KU-202", "legal", "resolved conflict of authority", "Legal-approved PD-A wins; PD-C retired"); } },
  gateDone: s => { ENSURE.tomDone(s);
    [["KU-201", "owner"], ["KU-203", "clinical"], ["KU-204", "clinical"], ["KU-205", "legal"], ["KU-206", "owner"], ["KU-208", "legal"], ["KU-209", "owner"], ["KU-210", "clinical"], ["KU-211", "owner"], ["KU-212", "legal"], ["KU-213", "owner"], ["KU-214", "owner"], ["KU-221", "clinical"], ["KU-222", "clinical"], ["KU-224", "clinical"]]
      .forEach(([id, by]) => approveSeed(s, id, by, "approved at the gate (seeded for the demo path)"));
    approveSeed(s, "KU-207", "legal", "2027 statement approved (seeded for the demo path)", 2);
    if (s.approved["KU-207@v2"] && s.approved["KU-207@v2"].on === PLAN.today) s.approved["KU-207@v2"].on = "8 Oct 2026"; /* approved on the CMS release date [ST-01], so in force from 8 Oct */
    s.cosigned = s.cosigned || {}; [].forEach(id => { if (!s.cosigned[id]) { const u = ALL_BASE().find(x => x.id === id); s.cosigned[id] = { by: secondSigner(u), when: "now" }; logEv(s, id, secondSigner(u), "co-signed", "second sign-off, publish now", 1); } }); },
  driftDone: s => { ENSURE.gateDone(s); s.fmtEdit = s.fmtEdit || true; s.legalEdit = s.legalEdit || true; if (!s.driftApproved) { s.driftApproved = { on: PLAN.today }; logEv(s, "KU-202", "legal", "approved v2 (PD-B)", "effective 1 Jan 2027; one approval, every channel", 2); } }
};

/* ---------- top bar, role switch, bell, stepper ---------- */
function nav(current, roleKey, opt) {
  opt = opt || {};
  const opts = Object.entries(ROLES).map(([k, r]) => `<option value="${k}"${k === roleKey ? " selected" : ""}>${r.person}, ${r.label}</option>`).join("");
  const links = [["product.html", "Product"], ["day.html?mode=today", "Current state"], ["day.html?mode=approach", "Solution architecture"], ["how1.html", "How it works"], ["day.html?mode=new", "Future state"], ["journey.html", "Journey"], ["channels.html", "Channels"], ["evals.html", "Evals"], ["prd.html", "PRD"]]
    .map(([h, l]) => `<a href="${h}"${h === current ? ' aria-current="page"' : ""}>${l}</a>`).join("");
  const unread = roleKey ? (S().notes || []).filter(n => n.to === roleKey && !n.read).length : 0;
  document.body.insertAdjacentHTML("afterbegin",
    `<header class="top"><a class="logo" href="${opt.demo ? "day.html?mode=today" : "product.html"}"><i></i>Lakewell Knowledge</a>
     ${opt.demo ? "" : `<label class="small rolesw">You are <select id="rolesel"><option value="">choose a person</option>${opts}</select></label>`}
     ${opt.demo ? "" : `<nav class="links">${links}${roleKey && ROLES[roleKey] ? `<button class="bell" id="bell">Notifications${unread ? `<i>${unread}</i>` : ""}</button>` : ""}<label class="idtog small" title="Show internal IDs (the audit CSV always keeps them)"><input type="checkbox" id="idtog"${showIds() ? " checked" : ""}> IDs</label><a href="day.html?mode=today" class="demo">Start demo</a></nav>`}</header>`);
  /* Each tab is one person: the tab title and a chip say who this tab is signed in as */
  if (roleKey && ROLES[roleKey] && !opt.demo) { const f = FIRST(roleKey); if (!document.title.startsWith(f)) document.title = f + " · " + document.title; }
  /* UX 2: plain names first; internal IDs behind a toggle */
  document.body.classList.toggle("ids", showIds());
  const idt = document.getElementById("idtog"); if (idt) idt.onchange = e => { try { localStorage.setItem("uc2ids", e.target.checked ? "1" : ""); } catch (x) {} document.body.classList.toggle("ids", e.target.checked); };
  const bell = document.getElementById("bell");
  if (bell) bell.onclick = () => { const ex = document.querySelector(".notes"); if (ex) { ex.remove(); return; }
    const mine = (S().notes || []).filter(n => n.to === roleKey).slice().reverse();
    document.body.insertAdjacentHTML("beforeend", `<div class="notes"><p class="eyebrow" style="margin:4px 8px 6px">For ${esc(ROLES[roleKey].person)}</p>${mine.length ? mine.map(n => `<a href="${n.link || "#"}" class="${n.read ? "" : "unread"}">${esc(n.text)}<br><span class="small">today ${n.t}</span></a>`).join("") : '<div class="quiet">Nothing yet.</div>'}</div>`);
    store.up(s => (s.notes || []).forEach(n => { if (n.to === roleKey) n.read = true; })); const i = bell.querySelector("i"); if (i) i.remove(); };
  const rsel = document.getElementById("rolesel"); if (rsel) rsel.onchange = e => { if (e.target.value) location.href = ROLES[e.target.value].home; };
  storyBar();
}
function showIds() { try { return localStorage.getItem("uc2ids") === "1"; } catch (e) { return false; } }
/* The old 13-step guided story is retired: the demo is the five-step story bar (story-shared.js). Clears any story left on from before. */
function storyBar() { if (S().storyOn) store.up(x => { x.storyOn = false; }); }
/* full timeline of one unit */
function timeline(u) {
  const base = [];
  const d = doc(u.doc);
  if (u.stage === "breadth") base.push({ t: "18 Sep 2026", who: "AI extractor", action: "extracted", note: `from ${d.short} ${u.span}` }, { t: u.versions[0].approvedOn, who: u.versions[0].approvedBy, action: "approved v1", note: "" });
  if (u.id === "KU-207") base.push({ t: "15 Dec 2025", who: P("legal"), action: "approved v1 (STAR-26)", note: "from Quick Guide 2026; window ends 29 Oct 2026" });
  return base.concat((S().events || []).filter(e => e.unit === u.id));
}
function timelineHTML(u) { const tl = timeline(u); return tl.length ? `<ul class="log">${tl.map(e => `<li><span class="t">${esc(e.t)}</span><span><b>${esc(e.who)}</b> ${esc(e.action)}${e.note ? `<br><span class="small">${esc(e.note)}</span>` : ""}</span></li>`).join("")}</ul>` : '<p class="small">No events yet.</p>'; }
function auditCSV() {
  const rows = [["time", "unit", "version", "who", "action", "note"]].concat((S().events || []).map(e => [e.t, e.unit, e.v, e.who, e.action, e.note]));
  const csv = rows.map(r => r.map(x => '"' + String(x == null ? "" : x).replace(/"/g, '""') + '"').join(",")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "lakewell-audit.csv"; a.click();
}

/* ---------- simple, consistent page framing ---------- */
/* One strip per screen: what you are looking at, the one thing to notice, and what to try. */
function intro(el, what, notice, tries) {
  let box = typeof el === "string" ? document.getElementById(el) : el;
  if (!box) { box = document.createElement("div"); box.id = "intro"; const ph = document.querySelector(".phead"); if (ph) ph.after(box); else document.querySelector("main").prepend(box); }
  /* UX 1: the explainer sits behind a small info button instead of a strip above every screen */
  box.innerHTML = `<details class="intro"><summary><span class="ii">i</span> About this screen</summary><div><b>On this screen:</b> ${what}</div>${notice ? `<div><b>Notice:</b> ${notice}</div>` : ""}${tries && tries.length ? `<div class="tries">${tries.map(t => `<a class="chip" href="${t[1]}">${t[0]}</a>`).join("")}</div>` : ""}</details>`;
}
/* An empty state that says why it is empty and how to fill it */
function emptyState(msg, actionLabel, onAction) {
  const id = "es" + Math.random().toString(36).slice(2, 7);
  setTimeout(() => { const b = document.getElementById(id); if (b) b.onclick = onAction; }, 0);
  return `<div class="empty"><p>${msg}</p>${actionLabel ? `<button class="btn sm" id="${id}">${actionLabel}</button>` : ""}</div>`;
}

/* ---------- live across tabs ---------- */
/* Open each person in their own tab. A change in one tab (Tom approves, Priya submits) shows in the others within a second: the browser
   fires "storage" in every other tab of this site. The prototype's stand-in for a shared service; production uses the platform's events. */
function liveSay(e) {
  try { const o = JSON.parse(e.oldValue || "{}"), n = JSON.parse(e.newValue || "{}"), oe = (o.events || []).length, ne = n.events || [];
    if (ne.length > oe) { const x = ne[ne.length - 1]; return `${String(x.who || "Someone").split(",")[0]} ${x.action}${x.unit && !/^(GAP|SEARCH|ACCESS)$/.test(x.unit) ? " · " + ((ALL_BASE().find(u => u.id === x.unit) || {}).title || x.unit) : ""}`; }
    return !e.newValue ? "The demo was reset" : "Updated in another tab"; } catch (x) { return "Updated in another tab"; }
}
if (typeof window !== "undefined" && typeof document !== "undefined") {
  window.addEventListener("storage", e => {
    if (e.key !== KEY) return;
    const msg = liveSay(e), t = document.createElement("div"); t.className = "livetoast"; t.textContent = msg + ". Updating this view…"; document.body.appendChild(t);
    const busy = () => { const a = document.activeElement; return a && /^(INPUT|TEXTAREA)$/.test(a.tagName) && a.type !== "checkbox" && a.value && a.defaultValue !== a.value; };
    const go = () => { if (busy()) { t.textContent = msg + ". Finish typing; this view updates after."; setTimeout(go, 1500); return; } try { sessionStorage.setItem("uc2scroll", String(scrollY)); } catch (x) {} location.reload(); };
    setTimeout(go, 1200);
  });
  window.addEventListener("load", () => { try { const y = sessionStorage.getItem("uc2scroll"); if (y) { sessionStorage.removeItem("uc2scroll"); scrollTo(0, +y); } } catch (x) {} });
}
