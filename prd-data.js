/* Lakewell Knowledge PRD: the single source for the PRD page.
   Every row cites the strategy row (S<section>.<row>), the decision (D<n>) or the register key ([XX-nn]) it rests on.
   Wording rule: fictional plan and people only; real-world facts carry a register key and name no company (D52, D128). */
/* Gaps found on 2 Nov 2026 (section 19). Kinds: gate (the strategy misses what a VALUED gate requires), builder (a coding agent is blocked), drift (the live site says less or differs from the strategy). */
const GAPS_ROWS = [
  ["Disclosure of AI use to members is deferred to phase 4 while the demo already shows a phone bot and member chat answering members (S10.5)", "gate U", "Approved disclosure wording per member channel, owner Legal and Compliance, before any member channel ships; a one-line disclosure in the demo bot and chat", "Client (Legal)"],
  ["No row on rights to the source documents, data-processing terms for the production answer model, or whether member queries leave the plan's boundary", "gate L", "Add a data-rights row: documents are the plan's own; a business associate agreement and zero-retention terms with every model vendor; queries stay inside the plan's cloud tenancy (J, proposed)", "Client (Privacy)"],
  ["Fairness is an axis without a bar: member segments apply to chat only and no parity check is set (S8.69)", "gate L, E", "False-refusal and wrong-answer parity across segments at the S8.99 sizes, read from the separate totals table; any segment more than one question's weight worse is investigated", "Nik (J), client confirms"],
  ["The north star has no baseline or target (S9.25)", "gate V", "Baseline one-contact resolution from the first four pilot weeks; target set with the plan after the baseline", "Client"],
  ["Kill switch has no named owner, no test and no restart criteria (S8.110)", "gate D", "Owner: the knowledge owner or the Engineering on-call may pull it per unit, knowledge base, role or channel; exercised in staging each release; restart after the fix ships with a new test and the S10.1 signers agree", "Nik (J), client confirms"],
  ["Build, buy or partner was one call with a flip condition, not an option table (S11.8)", "gate A", "Closed in this PRD, section 15", "Closed"],
  ["Governance was not answered gate by gate in question, answer, status form, with no log of who closes each open row", "governance", "Closed in this PRD, section 13; open governance rows are tracked in the gaps review", "Closed"],
  ["The read contract names fields but no transport, schema, abstention enum, auth or error model (S3.8)", "builder", "M4 delivers an API spec: request and response schema, abstention_reasons enum from S7.13, error codes, service auth per channel, contract version", "Engineering"],
  ["Latency, availability and degraded mode are undefined until after the pilot (S8.22)", "builder", "Proposed values in section 12 (J); on any outage a channel abstains and offers the human path, never an unapproved source", "Client sets after pilot"],
  ["Environments, CI custody of the sealed holdout, shadow mode and feature flags are unspecified", "builder", "M8: dev, staging, production; synthetic data below production; the holdout readable only by the pipeline; a model-version change blocks merge until the paired rerun passes", "Engineering"],
  ["Identity provider, channel system targets and document connectors are unnamed (S12.11, S14.19)", "builder", "Discovery list with owners: the identity provider and its group schema, the agent-assist and chat platforms, the script library and shared drive connectors", "Client (IT)"],
  ["The live site says less than, or differs from, the strategy in 20 places, for example \"664 independent questions\" where only the first set was written blind, merge confirmation routed to one person instead of by content type, and three of five production-only controls named", "drift", "Closed: the probe wording by D197, merge confirmation by D204, the five production-only controls by D199; every fix agreed with Nik before the page changed", "Closed"]
];
const PRD = {
  title: "Lakewell Knowledge",
  subtitle: "Product requirements: the approved source every channel, human or AI, reads from",
  version: "1.0", date: "2 Nov 2026", owner: "Nik Jain, Product. Every decision is recorded in the decision log, with who made it and why", status: "Prototype proven on the sealed holdout; production build not started",
  audience: "Two readers at once: a hiring panel or client judging the depth of the product thinking, and a coding agent or engineering team building the production system. Portfolio sections first (0 to 5, 16 to 19), build sections behind them (6 to 15, 20).",
  sections: [
  { id: "read", n: 0, title: "How to read this document", intro: "Two readers, one document. Each row names where it came from, so a claim can be checked in two minutes.",
    tables: [{ cols: ["Mark", "Meaning"], rows: [
      ["S8.14", "A row of the strategy document (section 8, row 14). The strategy has 18 sections and about 660 rows; the PRD lifts what a builder and a judge need"],
      ["D53", "A row of the decision log (D1 to D234 at this version): what was decided, the alternatives, why, who decided and what would change it"],
      ["[R-25]", "A key in the citations register (865 keyed rows): the quoted sentence, the URL and the date behind a real-world fact. P means the primary document was opened; S means a secondary source"],
      ["(assumed)", "A client fact nobody published. It never appears as a fact in the value case or the demo without this mark (S14.24)"],
      ["J", "A judgment: a design choice or a threshold set by us, defended with anchors where any exist (S8 defend tables)"],
      ["Rule gate", "A code path checked exactly: 0 violations or 100%. Identical in every channel (S8.70)"],
      ["Model metric", "A rate per group, read only with its 95% range and only once the group has enough questions (S8.99); in the prototype, counts, never rates (S15.9)"],
      ["Live", "A number on this page computed in your browser now by the same runner Prove it uses"]
    ] }],
    bullets: ["Everything on the site is fictional: the plan Lakewell Advantage, the people, the documents, the counts and the dates. Real-world facts (regulations, court rulings, agency tests, published benchmarks) carry a register key.", "Nothing here was decided for the client. The system drafts, the client decides; where the client has not yet ruled, the row says so (section 19)."] },

  { id: "summary", n: 1, title: "Summary", intro: "One approved unit of knowledge, approved once by a named person, served the same way to every channel, or an honest \"not yet\" that lands in an author's queue.",
    tables: [{ cols: ["Item", "Answer", "Source"], rows: [
      ["One sentence", "The approved source every channel, human or AI, reads from", "S3.10, D18"],
      ["The problem", "The same legal wording is copied across many documents, drifts over time, and nobody can find every copy. Each channel paraphrases it in its own words. The plan is answerable for what its bot, chat, texts, website and advocates say", "S1.1, S5.2 [L-01]"],
      ["Who it is for", "Advocates and the channels that answer members (main users); authors and approvers; the knowledge owner who reads the gap queue", "S4.1, S4.2, D19"],
      ["What is built", "A governed knowledge layer: ingest, extract to units, dedup that only proposes, a governance store with states and effective windows, scoped retrieval that cites or abstains, a gap log, drift detection, and a read contract every consumer honours", "S7.1 to S7.8, S3.8"],
      ["What AI does", "Extracts, classifies, proposes duplicates, ranks, scopes, declines, clusters gaps, proposes edits. It never approves, publishes, retires a source, resolves authority or grants access", "S3.3 to S3.5"],
      ["How a release is decided", "Rule gates at 0 violations or 100% on the development set and a sealed holdout; model metrics per group on the lower end of their 95% range; one red rule row blocks release", "S8 intro, S8.140, D87"],
      ["North star", "One-contact resolution on knowledge questions; leading indicators override rate and gap-queue age; guardrails scope leaks 0 and verbatim changes 0", "S9.25, D179"],
      ["Status today", "Prototype passes 21 of 21 golden, 11 of 11 holdout (10 of 11 on the original keys), 410 of 410 must-refuse probes; production not started; stand-ins named in the page footnote", "S18.37, D163, D192"]
    ] }] },

  { id: "problem", n: 2, title: "The problem, with evidence", intro: "Current state follows one member, June, across five channels in one day. Each channel breaks in its own way, and each break has happened somewhere real.",
    tables: [{ caption: "June's day today (Current state page)", cols: ["Channel", "What breaks", "Failure mode"], rows: [
      ["Phone bot", "Copies one of three versions of the out-of-network rule, rewords it and drops Legal's conditions; June is turned away at a pharmacy", "2. Verbatim paraphrased (S5.2)"],
      ["Member chat", "Quotes an unapproved $47 for 2027 from a planning file; nothing flags the missing answer, so the next member gets the same guess", "5. Confident answers from unapproved content (S5.5); 1. Gates nobody follows (S5.1)"],
      ["Call with Dana", "Three tools, four wordings of one disclaimer, one of them the website's Quick Guide copy; she reads the 2025 cheat sheet (last plan year) while June waits", "3. Copies that drift (S5.3, S5.6)"],
      ["Text", "The reminder team copies a price from its own spreadsheet, not the approved answer: no pricing words, no sign-off, no STOP", "2 and consent (S8.139, D57)"],
      ["Website", "The page still shows last year's 4 stars after Medicare rated the plan 3.5 for 2027, so it overstates quality during enrollment, and nothing flagged it", "6. Stale and effective-date drift (S5.14)"],
      ["Key takeaway", "Every team keeps its own copy. AI on these documents won't fix this, it will copy it: fix the knowledge first, and AI helps do that", "S3.2, S11.11"]
    ] }, { caption: "It has happened: evidence behind each mode", cols: ["Mode", "Evidence (quoted in the register)", "Key"], rows: [
      ["Approval gates nobody follows", "Two firms fined $200,000 and $250,000 in cases that included publishing with no principal approval; a regulator cited documents with no approver or date", "[R-41] [R-42] [R-43]"],
      ["Legal verbatim paraphrased", "An airline was held liable for its chatbot's restated policy: it makes no difference whether the information comes from a static page or a chatbot; standardized content must be used without alteration", "[L-01] [R-04]"],
      ["Dedup merges things that differ", "Record matching guidance: produce duplicates rather than overlays, because the wrong care could be provided", "[R-49]"],
      ["Role-scope leakage", "A vendor's own documentation: a copilot answers from sites open to some users who are not allowed to see it; a cache leaked content after deletion", "[V-13] [J-08]"],
      ["Confident answers from nothing", "A 2006 government test of drug-plan call centres: 34% of answers accurate and complete (294 of 864); 50% to 90% of LLM medical answers not fully supported by their citations", "[R-25] [TH-14]"],
      ["Drift that fires on everything", "Drug-safety alerts overridden 49% to 96% of the time; 85% to 99% of alarms need no action", "[J-04] [J-06]"],
      ["Machine translation served", "Section 1557: machine translation of text critical to benefits must be reviewed by a qualified human translator", "[FM-10] [R-99]"],
      ["Prompt injection through documents", "Indirect prompt injections occur when an LLM accepts input from external sources such as files; demonstrated against real applications", "[FM-20] [FM-21]"]
    ] }] },

  { id: "users", n: 3, title: "Users, personas and jobs", intro: "Roles come from the brief; names are invented. The main user is the person answering a member, because that is where the pain shows (D19).",
    tables: [{ cols: ["Person", "Role", "Job to be done", "Measured by"], rows: [
      ["June Halvorsen", "Member", "Get one correct answer, in Legal's words, in whichever channel she uses", "Channel metrics (S8.11 to S8.14, chat column)"],
      ["Dana Okafor", "Insurance advocate (main character)", "Find the approved answer in seconds, cite it, or say \"not yet\" with a callback", "Answer evals, Insurance group; override and catch rate (S8.71, S8.72)"],
      ["Luis Ferreira", "Pharmacy advocate", "Same, scoped to Pharmacy and Shared knowledge bases", "Answer evals, Pharmacy group"],
      ["Priya Nandakumar", "Author", "Turn documents into units; close gaps from the queue; revise after send-back", "Draft-to-approval time; gap items closed per week; drift alerts judged useful (S4.8)"],
      ["Tom Bexley", "Legal and Compliance", "Approve CMS-controlled wording and exact wording; decide conflicts of authority", "Approval queue age; units served past review date, must be 0 (S4.8, S8.73)"],
      ["Grace Mbeki", "Clinical pharmacist reviewer", "Approve pharmacy content; first signer on clinical guidance", "Queue age"],
      ["Dr. Ruth Calloway", "Medical director", "Second signer on clinical guidance only (D53)", "Queue age; co-signed units live from her publish date (D62)"],
      ["Renee Caldwell", "Knowledge Operations lead", "Read the gap backlog; write-or-fix-process calls; confirm merges of everyday content (D204), synonyms, pinned answers; sign the release", "Merge confirmations, reversals must be 0, proposal acceptance (S4.8)"],
      ["Security administrator", "Identity provider", "Grant or revoke a knowledge base to a role", "Scope changes at the next query (S6.14)"]
    ] }] },

  { id: "goals", n: 4, title: "Goals, non-goals, north star", intro: "",
    tables: [{ caption: "Goals and how each is measured", cols: ["Goal", "Measure", "Source"], rows: [
      ["Every channel answers only from approved, in-date, in-scope units, with a citation", "Rule gates S8.1 to S8.6 at 0 or 100% in every channel", "S8a"],
      ["Legal's words rendered exactly, everywhere", "Verbatim and render check 0 violations; rendered-clause hash equals stored hash", "S8.4, S8.60"],
      ["Say \"not yet\" instead of guessing, and route the gap", "Abstention when no unit 100%; gap-log recall 100%; near-miss abstention 95% rising to 99%", "S8.2, S8.7, S8.11"],
      ["One approval, every channel updated", "Drift recall 100% on seeded changes; one grouped alert per source change", "S8.18"],
      ["A person owns every approval and can be audited", "Separation of duties enforced; audit trail 0 gaps", "S8.138, S8.10"],
      ["Prove quality group by group before each release", "Per-group readout; sealed holdout run once per release; one red rule row blocks", "S8 intro, S8.140"]
    ] }, { caption: "Non-goals (in this product, now)", cols: ["Not a goal", "Why"], rows: [
      ["Replace the plan's search engine or Agent Assist", "We fix the shelf, not the librarian: buy retrieval, build the approval layer (S11.8, S11.11)"],
      ["Let AI approve, publish, retire or merge", "The never list (S3.5); a wrong merge is the larger risk [R-49]"],
      ["Serve synthesis across units to members", "Only exact wording and single-unit facts are served in member channels; synthesis abstains (S8.13 chat column)"],
      ["Translate automatically", "Machine translation yields a draft a qualified translator reviews; never served (S5.7, S8.6)"],
      ["Price the value as one number", "Three layers, never summed; placeholders labelled (S9, D16)"]
    ] }],
    after: [["North star", "One-contact resolution on knowledge questions: the member's question is settled on the first contact (value line S9.6). Leading: override rate (S8.71), gap-queue age (S4.8). Guardrails: scope leaks 0, verbatim changes 0 (S8.77). Proposed by the audit, chosen by Nik (D179)."]] },

  { id: "ai", n: 5, title: "What AI decides, recommends and never does", intro: "Agentic by design, deterministic where it must be. The never list is enforced in code and in the approval contract, not in a prompt.",
    tables: [{ cols: ["Lane", "Jobs", "Enforced by", "Source"], rows: [
      ["AI decides, inside rules", "Extract units from a document; classify type; propose duplicate pairs; embed approved units; flag drift and expiry; rank; scope to the asker's knowledge bases; decline when no approved unit answers; cluster unanswered questions", "Index built from approved units only; scope as a pre-filter; abstention rule on the retrieval result", "S3.3, S3.6"],
      ["AI recommends, a person confirms", "Wording updates after drift; tags; merge or split; new units from gaps; synonyms learned from logs; a pinned answer", "Every proposal lands in a named person's queue and is logged with both names", "S3.4, S7.3, S7.20"],
      ["Never (AI)", "Approve or publish legal or clinical content; retire the source of record; resolve a conflict of authority; grant a role access; approve a unit written to close a gap; decide whether a top question deserves a unit or a process fix", "Approval contract refuses any non-human signature; access lives in the identity provider", "S3.5, S8.138, S6.14"],
      ["Never (any channel)", "Serve a draft, in-review, retired or translated-draft unit; serve a next-year unit as today's answer; answer a personal-record question; answer a cost question without the exact figure in a unit; serve a member channel a unit not flagged member-facing", "Rule gates S8.6, S8.5, S8.135, S8.137, S8.134", "D59, D60"],
      ["Deterministic by design", "Source lineage; exact-wording string check; approval state change; index build; role scope pre-filter; abstention rule; template rendering of exact wording; drift diff", "Code paths with exact tests", "S3.6"],
      ["Model, measured", "Unit boundaries; classification; similarity scoring; gap clustering; ranking; guidance text around exact wording; proposed edits; query redaction (rules plus a model, measured by recall)", "Model metrics per group (S8b)", "S3.6, S8.8"]
    ] }] },

  { id: "fr", n: 6, title: "Functional requirements", intro: "Grouped by roadmap phase, so each phase shows exactly what it builds. One row per component. Acceptance criteria name the golden question (G) or test (T) that proves the row in the prototype, and the production check behind it.",
    tables: [{ caption: "Phase 2 Foundation: the store, approval and tests", cols: ["ID", "Requirement", "Acceptance criteria", "Source"], rows: [
      ["FR-1 Governance store", "Hold units with canonical_id, version, state, effective window, verbatim flag, knowledge_bases, channels, source_span, owner, approver, approved_at, variables; append-only state history", "State machine as S6.11 to S6.14; no version approved after its effective date (S8.141); audit CSV exports every event", "S7.4, S6"],
      ["FR-2 Approval and send-back", "Route each unit to the approver for its content type; refuse the author's own signature or a repeated signature; send back with a reason and quoted text; second signature on clinical guidance only", "S8.138 0 accepted; Grace sends back the copay table and Priya resubmits (deep dive); clinical unit live from the medical director's publish date (D62)", "S6.19 to S6.26, D53, D74"],
      ["FR-3 Eval runner and readout", "Run the golden set, probe sets and sealed holdout per group in the browser or CI; check the holdout hash before the run; show rule rows exact and model rows as counts; never show Pass while any rule row is red", "Prove it page; holdout SHA-256 recorded and checked every run (S8.47); S8.140 enforced", "S8.10, S18.37, D87"],
    ] }, { caption: "Phase 3 Pilot knowledge base: ingest and structure", cols: ["ID", "Requirement", "Acceptance criteria", "Source"], rows: [
      ["FR-4 Ingestion", "Pull a source document; record its hash, version, owner and the model versions used", "Every unit's lineage resolves to a document id, version and hash (S7.14); T3 audit trail 0 gaps", "S7.1"],
      ["FR-5 Extraction", "Split a source into proposed topics; mark candidate exact wording as exact substrings of a source span; propose type, tags, domain; an author accepts or edits", "Exact wording matches the source, character for character (G1, G3); the span check must pass before draft (S6.11); a planted instruction in a source is logged and never executed (G13)", "S7.2, S5.8"],
      ["FR-6 Dedup", "Compare units across sources; propose merge or \"same clause, drifted text\" with a word diff; never merge alone; the approver for that content confirms a merge (D204); never merge exact wording or a different wording", "The three pricing-disclaimer wordings are found and none merged; a not-duplicate pair is not merged (T1); every confirmed merge logged with proposer and confirmer, reversible (S7.20)", "S7.3, S5.3"],
      ["FR-7 Drift detection", "On a new source version, diff each tracked span, re-find spans by fuzzy anchor, raise one grouped alert per source change naming every affected unit and channel, propose the edit; ignore formatting-only edits", "Seeded edit caught (G10); formatting-only edit raises no alert (T2); drift recall 100% on seeded changes; precision 60% at launch, 80% by month 6", "S7.7, S8.18"],
    ] }, { caption: "Phase 4 Advocate search: serve and close gaps", cols: ["ID", "Requirement", "Acceptance criteria", "Source"], rows: [
      ["FR-8 Retrieval and answer", "Index from approved units only; apply the effective window at read time (as_of_date); apply the asker's scope before ranking; rank paragraphs, return the parent topic; render exact wording by template; abstain when no unit passes; cite unit id and version", "G2, G4 to G9, G11, G14, G18 to G20; next-year unit shown with \"starts 1 Jan 2027\", never as today's answer (S8.5); cross-role question abstains, never cites (G9, G19)", "S7.5, D59"],
      ["FR-9 Read contract", "Every consumer honours: state approved only; effective_from and effective_to; knowledge_bases pre-filter; verbatim template rendering; canonical_id and version as citation; model versions on every answer; query_redacted before any log", "Member chat and Agent Assist render the same unit, exact wording verbatim (G16, G17, G21, T5); an outbound link resolves to the same approved version (S8.139)", "S3.8, S7.8"],
      ["FR-10 Gap log and queue", "Record every abstention, thumbs-down, edit and \"could not find\" with the redacted question, role, scope, origin and reason; cluster; propose a unit title; land content gaps in the author's queue and the backlog view with the knowledge owner", "Gap-log recall 100% (S8.7); the dental-rider question lands in Priya's queue with times asked and a proposed title", "S7.6, S7.15, D42"],
    ] }, { caption: "Phase 5 Agent Assist: the same read contract", cols: ["ID", "Requirement", "Acceptance criteria", "Source"], rows: [
      ["FR-9 Read contract (reused)", "Every consumer honours: state approved only; effective_from and effective_to; knowledge_bases pre-filter; verbatim template rendering; canonical_id and version as citation; model versions on every answer; query_redacted before any log", "Member chat and Agent Assist render the same unit, exact wording verbatim (G16, G17, G21, T5); an outbound link resolves to the same approved version (S8.139)", "S3.8, S7.8"],
    ] }, { caption: "Phase 6 Members and every channel", cols: ["ID", "Requirement", "Acceptance criteria", "Source"], rows: [
      ["FR-11 Member-channel rules", "Member channels serve member-facing units only; personal-record questions go to a person; a question about a year no unit covers abstains; a cost question is answered only when the unit names that exact cost; a question about another person gets a general answer or a person who checks authority", "Probe sets T9 to T13: 100% of must-refuse refused; false refusals at most 10% at launch, goal 2%", "S8.134 to S8.137, D60, D64, D107"],
      ["FR-12 Outbound and consent", "Outbound text is a one-line summary plus a link to the exact approved wording; sent only with prior consent; per-member, per-channel STOP; no consent means the audit logs \"text skipped: opted out\"", "0 link mismatches; every skip logged", "S8.139, S18.11, D57, D71"],
        ] }, { caption: "Edge cases and how each is handled", cols: ["Edge case", "What happens", "Requirement", "Proven by"], rows: [
      ["A misspelled question ('disclamer')", "Still finds the approved answer and its exact wording", "FR-8", "Golden set: misspelt pricing disclaimer"],
      ["A member asks about their own cost or records", "Handed to an authenticated person; nothing is guessed", "FR-11", "Golden set: 'what is my copay?'; red-team personal-records set"],
      ["A question about someone else's coverage", "A general answer only; the other person's records go to a person", "FR-11", "Red-team fix: 'the dental thing my neighbour has'"],
      ["A staff member asks outside their role", "Refused; the answer is never a candidate", "FR-8, FR-9", "Golden set: vision benefit asked by a pharmacy advocate"],
      ["Access revoked mid-session", "Refused from the next question", "FR-9", "Golden set: vision benefit after access was revoked"],
      ["Next year's wording is still a draft", "Today's approved version is served; the draft stays hidden until its start date", "FR-8", "Golden set: new wording awaiting approval"],
      ["A version has expired", "Never served; the version in force answers", "FR-1, FR-8", "Golden set: 2026 Star statement, now expired"],
      ["The asked fact is missing, such as a year left blank", "Says 'not yet', offers a person, logs the question", "FR-8, FR-10", "Golden set: Star statement with the year blank; held-out fix"],
      ["No approved answer at all", "Says 'not yet' and the question lands on the author's list", "FR-10", "Golden set: 2027 Tier 3 copay, dental rider"],
      ["A question in another language", "Routed to a qualified translator; machine drafts are never served", "FR-11", "Golden set: pricing disclaimer in Spanish; red-team language set"],
      ["Crisis words ('I think I am having a stroke')", "911, 988 and a person, before any search", "FR-8", "Crisis rule, checked live on How it works Job 3"],
      ["A document hides an order to the AI", "The line is held back and logged; the answer is unaffected", "FR-5", "Golden set: claims summary with a planted instruction"],
      ["Two official wordings of one clause", "Raised to the one approver with authority; never merged", "FR-6", "Test T1: a not-duplicate pair is never merged"],
      ["A formatting-only edit to a source", "No alert; only a change in words raises one", "FR-7", "Test T2"],
      ["The approver is away", "The review clock escalates, then moves it to a backup reviewer", "FR-2", "How it works Job 2: review clocks"],
      ["An author tries to approve their own work", "Refused by a fixed rule and logged", "FR-2", "How it works Job 2: separation of duties"],
      ["A text to a member who never agreed to texts", "Not sent; the audit trail logs 'text skipped: opted out'", "FR-12", "FR-12 acceptance criteria"]
    ] }] },

  { id: "model", n: 7, title: "Knowledge unit model and read contract", intro: "Three unit types, one field set, five states. The grain is the topic a person signs and a channel cites; exact wording lives inside it (D23). Exact wording is the plain name for what the strategy calls a locked clause: a sentence quoted word for word and never reworded.",
    tables: [{ caption: "Unit types", cols: ["Type", "What it is", "Approved by", "Cited"], rows: [
      ["Topic", "One subject, about a page; the unit Legal signs and channels cite", "The approver for that content type (S6.19)", "By canonical_id and version"],
      ["Exact wording", "A sentence or block inside a topic that renders word for word; an exact substring of a source span; may have several spans across documents", "With its parent topic; flagged separately", "Through the parent; the clause id is shown"],
      ["Document assembly", "The filed document as a map of topics, with its own material identifier", "Knowledge Operations", "No; it is the source, not the answer"]
    ] }, { caption: "Fields", cols: ["Field", "Rule", "Source"], rows: [
      ["canonical_id, version", "Stable id across systems; major version when meaning changes, minor for typos; exact-wording edits always major", "S6.4"],
      ["state", "draft, proposed, in_review, approved, retired; a rejection returns to draft", "S6.5"],
      ["effective_from, effective_to", "Read-time filter against as_of_date; expiry is an alert", "S6.6, S5.14"],
      ["verbatim, trigger, placement", "True for standardized content; triggers such as any reference to out-of-network providers; placement rules such as hours shown at least once", "S6.7"],
      ["domain, knowledge_bases, channels", "Pharmacy, Insurance, both; knowledge_bases over Pharmacy, Insurance, Shared; channels advocate_search, agent_assist, member_chat, voice, outbound, digital", "S6.8"],
      ["source_span", "Document id, document version, start, end; one per document carrying the clause", "S6.9"],
      ["owner, approver, approved_at, variables", "Approver name and date; typed variables for the edits the regulator allows on standardized text; an unfilled variable fails the render check", "S6.10, S5.11"],
      ["member_facing, review_due, injection_flag", "Member channels read only member_facing units; review_due drives the expiry alert; injection_flag set when a source carried an instruction", "S8.134, S7.14, S5.8"]
    ] }, { caption: "State moves", cols: ["Move", "Who", "AI may propose", "Channels see meanwhile"], rows: [
      ["none to draft; draft to proposed", "Author; the extractor creates drafts", "Yes, span check passed", "Nothing; drafts are not indexed"],
      ["proposed to in_review to approved", "The approver for the content type; clinical guidance co-signed; never the author", "No", "Last approved version of the same id; the new version labelled \"starts <date>\" until effective"],
      ["in_review to draft (rejected)", "The same approver, with a reason, logged", "No", "Last approved version"],
      ["approved to retired", "Author proposes, approver confirms", "Yes, on expiry or source change", "Nothing; the serve log keeps history"],
      ["approved to draft (new version)", "Author, or drift proposes", "Yes", "Current approved version until the new one is approved"],
      ["grant or revoke a knowledge base", "Security administrator in the identity provider", "No", "Scope changes at the next query"]
    ] }] },

  { id: "roles", n: 8, title: "Roles, approval and separation of duties", intro: "The regulator makes the plan certify its materials but names no internal approving role, so the split below is industry standard plus our judgment (S6.19).",
    tables: [{ cols: ["Content", "Approver", "Basis", "Source"], rows: [
      ["CMS-controlled wording: exact wording, disclaimers", "Tom (Medicare Compliance) only; the author never edits compliance articles", "Law plus the support standard that reserves compliance articles to designated individuals", "S6.20 [AP-01] [AP-09]"],
      ["Pharmacy and formulary content", "Grace (clinical pharmacist); the policy behind it from the P&T committee", "Law (policy); J (unit)", "S6.21 [AP-05]"],
      ["Medical and prior-authorization guidance", "Grace signs first, Dr. Ruth Calloway second; co-signed units live from her publish date", "Law (policy); J (our control, not a rule)", "S6.22, D53, D62"],
      ["Everyday scripts and procedures", "Renee (knowledge owner)", "Standard: the knowledge domain expert", "S6.23 [AP-08]"],
      ["Release to an AI consumer", "A publisher-level approver, never the author; two qualified individuals", "Standard plus dual authorization", "S6.24 [AP-10]"],
      ["Approve, merge, retire rights", "Named roles only, least privilege; the proposer never confirms; every action logged with who did it", "Law plus standard", "S6.25, S7.18 [AP-11] [AP-12] [N-42]"],
      ["Role at query time", "Read from the identity provider on every query, never cached; role_source logged", "Beyond the per-session floor; J", "S5.10, D31 [N-43]"],
      ["Not covered by any source", "No rule requires a licensed clinician to approve call-centre scripts; no rule covers content read by AI. These rows stay J", "Open", "S6.26"]
    ] }] },

  { id: "logs", n: 9, title: "Logging and audit", intro: "Write once, never edited. Every eval in section 10 is computed from these logs, so the fields are requirements, not nice-to-haves.",
    tables: [{ cols: ["Log", "Fields (abridged; full list in the strategy row)", "Feeds", "Source"], rows: [
      ["Answer serve log", "query_id, query_redacted, answer_text_redacted, role, role_source, channel, session_id, as_of_date, knowledge_bases_in_scope, ranked candidates (unit, version, rank, score), cited units and versions, locked_clause_ids_rendered with rendered hash, grounding_score, abstained, abstention_reasons (no_unit, near_miss, render_fail, out_of_scope, access_refusal, policy_block, other), every model, prompt, rubric, index, embedding, redactor, template, config and app version, provider model id, source snapshot version, change-record id, prompt hash, injection_flag, timings, tokens, cost", "S8.1 to S8.16, S8.22", "S7.13"],
      ["Unit lineage", "canonical_id, version, source document id, version and hash, span, knowledge_bases, type, verbatim, stored clause hash, extractor and classifier versions, author, approver, approved_at, effective window, review_due, injection_flag, append-only state history", "Recompute any leak or verbatim check as of serve time", "S7.14"],
      ["Gap log", "query_id, query_redacted, role, scope, created_at, origin, reason (content gap or access refusal), occurrences, cluster_id, proposed_unit_title, owner, status, closed_at", "S8.7, gap-queue age", "S7.15"],
      ["Merge log", "Both units and versions, similarity score and threshold, proposing model version, exact-wording flag, proposer, decision with confirmer (never the proposer), reason, survivor, reversal (by whom, when, why)", "S8.17, S8.74", "S7.20"],
      ["Drift alert log", "Source document, old and new versions and hashes, changed text before and after, affected units with version and exact-wording flag, one alert id per source change, reviewer decision (useful or not), the edit proposed, times raised, reviewed, resolved", "S8.18, S4.8", "S7.21"],
      ["Leak incident log", "Incident id, query_id, leaked units and knowledge bases, asker's role and scope, severity level and who set it, member health data involved, members affected, how found, times found, stopped, closed, HIPAA risk assessment id and outcome, notices, owner, root cause, fix and test added", "S8.1, S8.102 to S8.112", "S7.22"],
      ["Judge verdict log", "answer_id, query_id, label, reasoning, judge model and version, prompt and rubric versions, human label and reviewer when sampled, time", "S8.63 to S8.68", "S7.23"],
      ["Record and views", "System of record write-once; read views built one way from the record by a copy job; each view shows only the fields its job needs; the record open only to audit and engineering", "Access control", "S7.16 to S7.18"]
    ] }] },

  { id: "evals", n: 10, title: "Evals and release gates", intro: "Two kinds, never mixed in a readout. A rule gate passes or fails exactly. A model metric is a rate per group, gated on the lower end of its 95% range, with the sample size calculated from the bar (S8.99): 59 questions with 0 misses first proves 95%.",
    tables: [{ caption: "Rule gates (identical in every channel)", cols: ["Gate", "Prototype", "Production", "Source"], rows: [
      ["Scope leaks", "0", "0 confirmed, checked on 100% of responses against the governance store, over candidates as well as cited units; monthly tag audit; daily probes; every leak logged and graded", "S8.1"],
      ["Abstention when no unit", "100%", "100%", "S8.2"],
      ["Citation resolves", "100%", "100%", "S8.3"],
      ["Verbatim and render check", "0 violations", "0", "S8.4"],
      ["Effective window", "0 violations; next-year unit labelled with its start date", "0", "S8.5, D59"],
      ["Draft, review, translated draft never served", "0", "0", "S8.6"],
      ["Gap-log recall", "100%", "100%, computed on every abstention", "S8.7"],
      ["Query redaction", "Raw text never logged; 100% on seeded formats", "Recall at least 99.5% on about 600 seeded identifiers with 0 misses; 0 found in 300 per month", "S8.8"],
      ["Injected instruction logged", "Logged (G13)", "Same; count reported", "S8.9"],
      ["Audit trail complete", "0 gaps (T3)", "0 gaps", "S8.10"],
      ["Member-channel rules (member-facing only; records to a person; uncovered year abstains; exact cost only)", "100% of must-refuse probes T9 to T13", "Same, on every probe set", "S8.134 to S8.137"],
      ["Separation of duties; link resolves and consent; no approval after effective date; no Pass with a red row", "0 accepted; 0 mismatches; 0; enforced", "Same", "S8.138 to S8.141"]
    ] }, { caption: "Model metrics (per group; bars are J with anchors where published)", cols: ["Metric", "Advocate channels", "Member chat", "Source"], rows: [
      ["Near-miss abstention", "At least 95% at launch, rising to 99%", "99% at launch", "S8.11"],
      ["False refusals", "Under 5%, shown with the wrong-answer rate; 10% allowed in pilot month one", "Under 15%", "S8.12"],
      ["Claim supported", "At least 95% on the human-labelled sample; answers under the grounding cut blocked, counted and sampled", "At least 98%; only exact wording and single-unit facts served", "S8.13"],
      ["Answer correct", "At least 95%", "At least 98%", "S8.14"],
      ["Unaffected by injected instruction", "100% on the labelled sample", "Same", "S8.15"],
      ["Retrieval", "Recall@5 at least 85% per role on expert-written queries, 90% after one tuning cycle; Recall@1 reported", "Reported only; a smaller member-facing subset", "S8.16"],
      ["Dedup", "Confirmed-merge false-merge rate 0 in a monthly sample; proposal precision 80% at launch, 95% by month 6", "Same", "S8.17"],
      ["Drift", "Precision at least 60%, 80% by month 6; recall 100% on seeded changes", "Same", "S8.18"],
      ["LLM judge", "Replaces no human sample until validated against two reviewers on balanced accuracy and catch rate", "Same", "S8.20, S8.65"],
      ["Latency and cost", "p50 and p95 query to first result, cost per query, per channel; target set after the pilot month", "Same", "S8.22"]
    ] }, { caption: "What the prototype proves (live where marked; dated in the markdown copy)", cols: ["Set", "Result", "Note"], rows: [
      ["Golden set, 21 questions", "{{golden}}", "Labelled by the author, reviewed; per role and channel; the writer's key grades the writer's answers, so this is separated, not independent (S8.47, D186)"],
      ["Independent probes", "{{probes}}", "First set written by a writer who never saw the rules (D65); false-refusal rate shown only once a set has 59 general questions"],
      ["Sealed holdout, 11 questions", "{{holdout}}", "SHA-256 recorded before the first run and checked every run; one ruling accepted an alternate key (H6, D163)"],
      ["Redaction seeds", "{{redact}}", "Independent token check: no identifier-like token survives (D88)"],
      ["Release verdict", "{{release}}", "Never Pass while any rule row is red (D87)"],
      ["Production-only, not in the demo", "Two-reviewer judge validation, real access revocation, daily cross-scope probes, the monthly redaction audit", "Named on Prove it (S8.50, S15.10)"]
    ] }] },

  { id: "hitl", n: 11, title: "Human in the loop, measured", intro: "Rule gates do not relax because a person is watching. The person is part of the system, so the person is measured too.",
    tables: [{ cols: ["Mechanism", "Requirement", "Source"], rows: [
      ["Weekly QA sample", "30 answers per role per week plus 10 per flagged issue; 100% of anything that fired an escalation rule; a labelled sample of refusals and abstentions per group; a 95% bar first provable after 59 answers with 0 misses", "S8.19, S8.99"],
      ["Override rate", "Share of served answers the advocate edits, rejects or searches past; a falling override rate while the sample's error rate holds is the warning sign", "S8.71 [N-05]"],
      ["Catch rate", "Of errors found in the weekly sample, the share the advocate had already flagged; under 50% means feedback misses errors; the random sample is never replaced", "S8.72"],
      ["Approval queue age", "Working days since the item reached the current signer, against service levels and an escalation ladder; search keeps abstaining meanwhile", "S8.73, S8.125 to S8.131"],
      ["Merge reversals", "Every reversal counts against the confirmed-merge rate", "S8.74"],
      ["Feedback rule", "Thumbs-down, edits, \"could not find\" and every abstention enter the gap log; weekly, real queries are promoted into the golden set with labels until each group reaches its calculated size; the holdout is extended in its sealed context", "S8.75"],
      ["Regression on change", "Any change to embedding, answer model, reranker, prompt, rubric, chunking, unit model, index or judge re-runs the full dev set and holdout per group, paired against the last release; the judge re-validated first; any fall larger than one question's weight investigated and signed by name", "S8.76"],
      ["Weekly with no change", "The 30-per-role sample and the daily probes; any confirmed leak or verbatim violation halts that role's serving", "S8.77"],
      ["Judge protocol", "Two human reviewers; minimum labelled sample per group; prevalence-adjusted agreement; the judge triages only until validated; revalidation triggers", "S8.63 to S8.68"]
    ] }] },

  { id: "nfr", n: 12, title: "Non-functional requirements", intro: "Where the strategy sets a target it is cited; where it defers one, the proposed value is marked J and the client sets it after the pilot month.",
    tables: [{ cols: ["Area", "Requirement", "Status", "Source"], rows: [
      ["Latency", "p50 and p95 from query to first result reported per channel; proposed p95 under 2 seconds for advocate search and under 4 seconds for member chat (J, proposed); target fixed after the pilot month", "Proposed", "S8.22"],
      ["Availability and fallback", "If the layer is unavailable a channel abstains and offers the human path; it never falls back to an unapproved source (J, proposed)", "Proposed", "S5.12, S3.5"],
      ["Security and PHI", "The plan is a HIPAA covered entity; query text redacted before any log; identifiers never in URLs; the record open only to audit and engineering; each view to the roles that need it; access removed on role change", "Answered", "S7.16 to S7.19, S8.8"],
      ["Retention", "Logs kept 10 years (J, cautious), against a 6-year HIPAA documentation rule; the 6-year call-recording rule does not name AI logs", "Answered (J)", "S7.19, D183"],
      ["Language access", "A translated unit is a separate unit with its own approval; machine translation produces a draft a qualified human translator reviews; translation required where 5% of the service area speaks the language; language logged with the query", "Answered", "S5.7, S8.69 [R-03] [FM-10]"],
      ["Accessibility", "Member channels meet the plan's accessibility standard; the prototype uses semantic HTML, keyboard-reachable controls and visible focus (J, proposed; not audited)", "Gap", "This review"],
      ["Cost", "Input and output tokens and cost per query logged; per-channel cost reported; target after pilot", "Answered", "S7.13, S8.22"],
      ["Reproducibility", "Every answer carries every model, prompt, rubric, index and config version and a prompt hash, so any eval can be rerun as of serve time", "Answered", "S7.13, S7.14"],
      ["Data residency and environments", "Not set in the strategy; the builder needs dev, staging and production with separate identity providers and the production corpus only in production (J, proposed)", "Gap", "This review"]
    ] }] },

  { id: "gov", n: 13, title: "Governance check", intro: "The six questions every VALUED gate answers. Rows not answered are in the governance log (section 19).",
    tables: [{ cols: ["Question", "Answer", "Status"], rows: [
      ["Regulatory exposure", "Medicare Advantage communications and marketing rules (standardized content used without alteration; translation thresholds); Section 1557 on machine translation; HIPAA on logs and incidents; a court has held a company liable for its chatbot's restated policy; civil money penalties up to $48,833 per determination; the money is in Star Ratings, where one weight-2 measure moves the overall by about 0.025", "Answered: S9.11, S9.15, S5.2, S5.7 [R-04] [R-99] [L-01]"],
      ["Which wrong output reaches a member or a regulator", "Paraphrased exact wording, a draft or expired unit, a cross-scope leak, a personal-record answer, a cost without a figure. Each is a rule gate at 0 in every channel", "Answered: S8.1 to S8.6, S8.134 to S8.137"],
      ["Data rights and privacy", "Documents are the plan's own; member identifiers redacted before any log; member segment joined only as totals from a separate table; no real member data in the prototype", "Answered: S8.8, S8.69, S12.10"],
      ["Human accountability", "A named approver per content type; the proposer never confirms; the author never approves; clinical guidance co-signed; the knowledge owner signs the release; Legal, Knowledge Operations and Engineering sign the monitoring plan", "Answered: S6.19 to S6.26, S8.21, S8.138"],
      ["Signable evidence", "Per-group readout with rule rows exact and model rows as counts or bounded rates; the sealed holdout's hash; the audit CSV; the serve, merge, drift, leak and judge logs", "Answered: S8.10, S8.47, S7.13 to S7.23"],
      ["Sign-off and audit trail", "Phase gates with named signers (S10.1 to S10.6); every state change an append-only event with actor, time and version; which enterprise AI body signs each phase is assumed", "Partly: S10, S5.9; S14.21 client to confirm"],
      ["Kill switch and incident path", "Any confirmed scope leak or verbatim change stops serving for that role at once; leaks graded in four levels with stop, fix and report clocks; health-data incidents notified within 60 days by law", "Answered: S8.77, S8.102 to S8.112, S10.10"],
      ["Facts assumed and who confirms", "Section 14 lists 28 assumptions (U-01 to U-18 and plan rows); the first discovery question is what the plan's Agent Assist reads from today", "Answered as assumptions: S14, S15.6"]
    ] }] },

  { id: "roadmap", n: 14, title: "Roadmap, pilot and stop rule", intro: "From prototype to production in six phases, each building named product jobs and passing measurable success criteria before the next. Phase gates and order follow the strategy (S10.7, D78); discovery, shadow mode and change management are our recommended delivery practice (J). Timings are left out until discovery sizes them.",
    tables: [{ cols: ["Phase", "Builds", "Key work", "Success looks like", "Biggest risk and how we handle it"], rows: [
      ["1. Discovery", "Before any build", "Inventory pharmacy content and owners; measure today's wrong-answer rate and handle time; agree approvers with Legal; security, privacy and vendor review; decide build, buy or partner", "Baseline agreed; every document has an owner; build, buy or partner decided", "No reliable baseline: measure it on a sample of recorded calls (J)"],
      ["2. Foundation", "Job 2 Govern, Job 4 Test", "Knowledge store and approval workflow; sign-in and roles from the identity system; audit trail; test harness with a golden set from real advocate questions", "Every safety rule passes on the golden set and held-out test; every action in the audit trail", "Identity integration slips: start it during discovery (J)"],
      ["3. Pilot knowledge base", "Job 1 Ingest, Job 2 Govern", "Migrate the Pharmacy knowledge base with AI-assisted extraction; Legal clears duplicate wordings; drift alerts on; train authors and approvers", "One approved wording per clause; no wrong merges; drift alerts accurate; monitoring plan signed", "Legal review backlog: word-by-word differences and review clocks (S10.7)"],
      ["4. Advocate search", "Job 3 Serve: advocate search", "Shadow mode beside today's tools, compared with today's answers; then live for one team", "No scope leaks for four weeks; repeat calls and handle time at or better than baseline", "Old habits: shadow comparison, training, old tools kept until trust is earned (J)"],
      ["5. Agent Assist", "Job 3 Serve: Agent Assist", "Reads approved answers through the read contract; tested against today on a share of calls; weekly human review sample", "Claims backed by their source; Legal's words never changed; advocate overrides falling", "Confident wrong answers: cited answers and exact wording only, weekly review (S8)"],
      ["6. Members and every channel", "Job 3 Serve: member chat, texts, website", "Member chat to a small group first with AI use disclosed and stricter rules; then texts, website and more knowledge bases", "Same answer on every channel; complaints about wrong answers fall; weekly checks green", "Regulatory exposure: disclosure, stricter bars, small rollout, stop rule (S10.5)"]
    ] }],
    after: [["First 90 days (D180)", "Pilot is the Pharmacy knowledge base with its authors and approvers, not advocates yet. Day 30: every rule gate green on one corpus slice and the sealed holdout. Day 60: Prove phase signed by the three S10.1 signers. Day 90: monitoring plan signed; first Pharmacy units approved end to end; translated drafts never served."], ["Stop rule", "Any confirmed scope leak or verbatim change stops serving for that role at once (S8.77, S8.110). Resume only after the fix ships with a new test and the signers agree."]] },

  { id: "bbp", n: 15, title: "Build, buy or partner", intro: "No vendor ships the full rule set between approved knowledge and what an AI reads: approval state, role scope, currency and citation at the unit (S11.1). Pieces exist; none splits a document into separately approved units, diffs a changed source against the units derived from it, or cites an approved unit below the article.",
    tables: [{ cols: ["Option", "Trade-off", ""], rows: [
      ["A. Build the governance store, unit model, read contract, drift and gap log; buy retrieval primitives (vector and lexical index, grounding scores) from the cloud already in use; partner with the existing knowledge tool for authoring screens", "Gains the three controls no vendor supplies and keeps search a commodity; costs a team of about 8 for a year (assumed) and the integration to the existing tools", "Preferred"],
      ["B. Buy a knowledge-management suite and configure its publish state as the gate", "Gains speed and a vendor to call; costs article-level approval (no exact wording, no unit citation), permissioned drafts readable, no source-diff drift; the three failure modes the brief names stay", ""],
      ["C. Build everything including retrieval", "Gains full control; costs rebuilding what the cloud already sells well, and the ranking quality those products have tuned for years", ""]
    ] }],
    after: [["Why we prefer A", "The three failure modes in the brief live between approval and retrieval, which is exactly what is not for sale; retrieval is (S11.8, S11.11)."], ["What would change our mind", "A vendor release note documenting per-block approval state, source-diff drift proposals or citation of an approved unit below the article; recheck before any commitment (S11.10)."]] },

  { id: "value", n: 16, title: "Value case, in layers, never summed", intro: "Every unit price comes from a government statistics bureau, the regulator, the eCFR or the plan's own filings; every placeholder says so on the line (S9.24). The logic matters more than the numbers (S1.7).",
    tables: [{ cols: ["Layer", "Driver", "Unit value (derived)", "Placeholder (illustrative)", "Source"], rows: [
      ["A. Capacity", "Handle time: calls × share needing a lookup × minutes saved × $0.535 per advocate minute", "$42.8M of advocate capacity per minute saved per call at the 80M-call ceiling; capacity, not cash", "0.5 minute at a 100% lookup share = $21M (assumed)", "S9.2, S9.5 [B-01] [B-02] [H-01]"],
      ["A. Capacity", "Repeat calls avoided", "$3.4M per 1% of calls avoided at an assumed 8-minute handle time", "1% (assumed)", "S9.6"],
      ["A. Capacity", "Content operations and legal review: approve once, serve every channel", "Not published; 45-day and 10-business-day review clocks are the public analogues", "$3M to $5M per channel of avoided duplicate corpus (assumed)", "S9.8"],
      ["B. Risk", "Wrong or inconsistent answers; complaints; Star Ratings", "One star on one weight-2 measure moves the overall by about 0.025; the quality bonus is about $79 per member per month; about $2.2B a year on the largest contract (derived)", "Share attributable to answer quality: not estimable (assumed)", "S9.10, S9.14, S9.15"],
      ["B. Risk", "Civil money penalties and enrollment sanctions", "Up to $48,833 per determination and $19,535 per week; a fine per member affected is allowed; bounded and small against premium", "Exposure, not a forecast", "S9.11, S9.16"],
      ["C. Enablement", "One approved unit serves voice, chat, advocate assist, outbound and digital", "No published figure for time to launch a channel on governed knowledge", "Analogue: first-contact resolution 51% to 76% in non-payer support (transfer assumed)", "S9.18, S9.19"],
      ["Cover the build", "$4.0M year-one (assumed) ÷ $42.8M per minute", "5.6 seconds of advocate time per call; or 1.2% of calls avoided; or 0.3% of advocate labour", "At $8.0M: 11 seconds, 2.3%, 0.6%", "S9.20, S9.21"]
    ] }] },

  { id: "decisions", n: 17, title: "Key decisions and the trade-offs behind them", intro: "Ten of 233 logged decisions, chosen because a panel or a builder would ask about them. Each shows the alternative rejected and what would reverse it.",
    tables: [{ caption: "The six trade-offs (Trade-offs page)", cols: ["We chose", "Instead of", "The cost today", "How we keep it small now", "How later builds fix it"], rows: [
      ["No approved answer means 'not yet', never a guess", "Letting the AI answer from whatever it finds", "107 of 253 test questions get 'not yet' at launch", "Every one goes on Priya's list, most-asked first; coverage reported weekly", "AI drafts the missing answer from approved sources for Priya to approve (J)"],
      ["Staff first, members last", "Starting with member chat", "Members get the benefit last", "Advocates prove the answers first; members get the same answers with stricter rules", "Member chat widens as each measured gate holds (J)"],
      ["Short topics with Legal's sentences locked inside", "Fixed-size chunks", "Every document must be split and marked before search", "AI splits and marks; Priya accepts; a change re-opens only its topic", "AI learns from Priya's edits; templates for common document types (J)"],
      ["AI never merges duplicates on its own", "Auto-merging near-identical copies", "A person rules on each conflict", "Word-by-word differences; one ruling retires every copy; review clocks", "Proven-safe non-legal duplicates auto-merge with an undo; legal wording always needs a person (J)"],
      ["Strict rules for personal and cost questions", "Letting the AI judge each question", "4 of 253 ordinary questions refused by mistake (3.3%)", "Up to 10% at launch, target 2%; every mistake becomes a test", "Trained classifier; verified sign-in for members' own answers (J)"],
      ["Role checked on every question", "Checking once at sign-in", "One extra check per search", "Delay measured in the pilot", "Short role cache once revocation is instant (J)"]
    ] }, { cols: ["Decision", "Chosen", "Rejected", "What would change it", "Log"], rows: [
      ["Unit of knowledge", "Topic signed, exact wording inside, paragraph ranked, topic cited", "Whole document as unit; fixed-length chunks", "A corpus that is mostly whole standardized documents; a holdout where topic retrieval already meets the bar", "D23, S6.16"],
      ["Positioning", "Under every channel, not inside Agent Assist", "A copilot feature", "The plan already runs a governed store; then the pitch shrinks to search and gap analytics", "D18, S15.6"],
      ["Main user", "The advocate answering a member", "The author; the knowledge owner", "A brief that opens on authoring pain", "D19, S4.2"],
      ["Dedup", "Proposes only; never merges exact wording or different wordings; merges reversible", "Auto-merge above a threshold", "A corpus with no exact wording", "S5.3, S7.3 [R-49]"],
      ["Role check", "Identity provider on every query, never cached", "Per-session check (the published floor)", "A measured latency cost the pilot cannot absorb", "D31, S5.10"],
      ["Next-year units", "Shown beside today's answer labelled with the start date, never as today's answer", "Hide until effective; serve both unlabelled", "A regulator reading the label as marketing", "D59, S8.5"],
      ["Member-channel rules", "Four rules: member-facing only; records to a person; uncovered year abstains; exact cost only", "Model judgment per question", "A probe set showing the rules refuse too many answerable questions", "D60, D64, D66, D107"],
      ["Second sign-off", "Clinical guidance only, medical director second; everything else one approver", "Two signatures on everything", "Queue age breaching service levels", "D53, D62"],
      ["Release verdict", "Never Pass while any rule row is red, dev or holdout", "An overall score", "Nothing; this is the method", "D87, S8.140"],
      ["Design system of the prototype", "The first prototype's look kept for the demo; the PRD page follows the site (this decision)", "The repo's standard PRD stylesheet", "A client brand to adopt", "D40, D194"]
    ] }] },

  { id: "risks", n: 18, title: "Risks and known weaknesses", intro: "Said before the room says them.",
    tables: [{ cols: ["Risk", "Why it matters", "How it is handled", "Source"], rows: [
      ["The holdout is separated, not independent", "One author's model family wrote both sets in days", "Hash recorded before the first run; the words said aloud; one ruling on an alternate key disclosed", "S15.1, D163, D186"],
      ["Prototype metrics cannot carry a rate", "4 to 6 answerable questions per role", "Counts, never percentages; rates only at the S8.99 sizes", "S15.9"],
      ["Stand-ins for production methods", "Text overlap for embeddings; a recorded model run for ingest; FNV-1a for SHA-256", "Named in the page footnote; live model after the interview, owner Nik", "S15.19, D190, D192"],
      ["Several anchors are preprints or vendor evaluations", "A sceptical engineer will check", "Labelled preprint or vendor wherever quoted", "S15.2"],
      ["No payer publishes an eval bar", "Some bars are judgment", "Said as a recorded search with its date; bars carry J and a path", "S15.3, S15.5"],
      ["Positioning rests on what Agent Assist reads from", "If a governed store exists the pitch shrinks", "Stated as the first discovery question", "S15.6"],
      ["Over-reliance by advocates", "A falling override rate with a steady error rate means nobody is checking", "Override and catch rate measured weekly", "S15.13"],
      ["The vendor line was corrected once", "An expert will test each limb", "Three limbs remain; concessions pre-agreed", "S15.14, S11.9"],
      ["Two sample sizes for one bar", "59 to prove 95%, 73 to estimate it within 5 points", "Labelled by purpose; release gated on the exact sizes", "S15.17"],
      ["Production-only controls cannot run in days", "A promise can be heard as a result", "Named production-only on Prove it", "S15.10"]
    ] }] },

  { id: "gaps", n: 19, title: "Open items", intro: "Decisions only the client can make. Each stays open until the named owner rules.",
    tables: [{ caption: "Open items for the client", cols: ["Item", "Why it is the client's", "Where it lands"], rows: [
      ["Any eval bar to move before presenting it as the client's own", "Thresholds are human judgment by design", "S8.1 to S8.22, S17.3"],
      ["Outbound link method", "Medicare Compliance confirms the link method; J until then", "S17.8, S8.139, D57"],
      ["Disputed probe labels", "Neither counted nor dropped until ruled", "S17.9, S8.116, D84"],
      ["Which enterprise AI body signs each phase", "Only the client knows its governance bodies", "S14.21, S10.4"],
      ["What Agent Assist reads from today", "The first discovery question; it sizes the whole pitch", "S15.6 [U-07]"],
      ["Log housekeeping: the pass-1 file still shows every finding as pending though later rows closed them", "Cosmetic, but a reviewer will notice", "S17.5, S15.18"],
      ["Safari check of the five demo pages", "Deferred to Nik at the keyboard", "D193"]
    ] }] },

  { id: "plan", n: 20, title: "Plan for a coding agent", intro: "Build order follows the brief (D17): knowledge before search, search before any AI consumer. Each milestone ends when its gates are green in CI on the development set and the sealed holdout.",
    tables: [{ caption: "Milestones", cols: ["Milestone", "Deliverable", "Done when", "Source"], rows: [
      ["M1 Governance store and unit model", "Schema for units, versions, spans, states, effective windows, knowledge bases, channels; append-only event store; audit export", "State machine tests pass; T3 0 gaps; no approval after effective date refused (S8.141)", "S6, S7.4, FR-1"],
      ["M2 Ingest, extract, dedup", "Document ingestion with hash and version; extraction to proposed topics and exact wording with span check; dedup proposals with diff and merge log", "G1, G3, G13, T1 pass; PD pair found, nothing merged", "S7.1 to S7.3, FR-4 to FR-6"],
      ["M3 Approval and roles", "Role-based approval routing; separation-of-duties contract; send-back; second signature on clinical guidance; identity-provider role lookup per query", "S8.138 0 accepted; G19 revocation; role_source logged", "S6.11 to S6.26, FR-2"],
      ["M4 Retrieval and read contract", "Approved-only index; as_of_date filter; scope pre-filter; paragraph ranking to parent topic; template rendering with hash check; abstention; citation; the consumer SDK that enforces the contract", "G2, G4 to G12, G14 to G21 pass; verbatim 0 violations; leaks 0", "S7.5, S3.8, FR-8, FR-9"],
      ["M5 Gap log and queue", "Abstention and feedback capture; redaction before log; clustering; author queue and owner backlog", "S8.7 100%; T4 0 leaked; dental-rider path end to end", "S7.6, S7.15, FR-10"],
      ["M6 Drift", "Source version diff on tracked spans; fuzzy anchor; one grouped alert; proposed edit; approval once, every channel updated", "G10, T2 pass; drift log complete", "S7.7, FR-7"],
      ["M7 Member channels", "Member-facing flag; the four member-channel rules; chat and voice rendering; outbound with consent and link check", "T9 to T13 100% must-refuse; S8.139 0 mismatches", "S8.134 to S8.139, FR-11, FR-12"],
      ["M8 Eval harness in CI", "Runner over golden, probes and holdout per group; hash check; readout with rule rows exact and model rows as counts; release verdict; regression on any version change", "Prove it reproduced in CI; S8.140 enforced; S8.76 wired to version fields", "S8, FR-3"],
      ["M9 Observability", "Serve, merge, drift, leak and judge logs as specified; dashboards for override, catch, queue age, gap age; alerts on any leak or verbatim violation; kill switch per role", "Every S7.13 field populated; stop rule exercised in staging", "S7.13 to S7.23, S8.77"]
    ] }, { caption: "Working rules for the agent", cols: ["Rule", "Detail"], rows: [
      ["Never edit the sealed holdout or the independent probe set", "Both stay sealed (D82, D90); extend the holdout only in a separate context and re-record the hash"],
      ["Rules in code, models at the edges", "Every row in section 5's deterministic column is a code path with an exact test, never a prompt instruction"],
      ["Counts before rates", "The readout shows counts until a group reaches its S8.99 size; never present a rate on fewer as a pass"],
      ["Every answer carries its versions", "Model, prompt, rubric, index, embedding, redactor, template, config and app versions and a prompt hash on every served answer"],
      ["Fictional data only", "No real member, provider or claims data; invented names; the real-name check runs before anything is published (S12.10)"],
      ["Read the decision log first", "Newest rows win; then the strategy by row id; this PRD is the map, not the territory"]
    ] }] },

  { id: "history", n: 21, title: "Document history", intro: "",
    tables: [{ cols: ["Version", "Date", "Change", "By"], rows: [
      ["1.0", "2 Nov 2026", "First PRD rendered from the strategy (sections 1 to 18), the decision log (D1 to D234) and the citations register; gap review added as section 19; published as a page of Lakewell Knowledge (D194)", "Nik Jain, Product"]
    ] }] }
  ]
};
