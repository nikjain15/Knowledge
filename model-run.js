// Recorded model run, 1 Nov 2026. Produced by a large language model reading each line once; saved and replayed in the demo. Not edited by hand.
const MODEL_RUN = { recordedOn: "1 Nov 2026", lines: {
  june1: {
    intent: "ask if out-of-network pharmacies work",
    topic: "Pharmacy access",
    personal_data: "no: general plan rule question",
    language: "English",
    confidence: "high: clear, single plain question",
    best_unit: "KU-205",
    answerable_from_unit: "yes",
    rationale: "The out-of-network pharmacy topic's exact wording says pharmacies outside the Lakewell network need not serve members except in an emergency and may cost more, which answers 'any pharmacy' directly."
  },
  chat1: {
    intent: "get the 2027 Tier 3 copay",
    topic: "Drug costs (2027 copays)",
    personal_data: "no: plan-wide cost figure",
    language: "English",
    confidence: "high: tier and year are explicit",
    best_unit: "none",
    answerable_from_unit: "no",
    rationale: "The Tier 3 copay topic gives a figure only for 2026 and the 2027 drug list topic covers 2027 without any dollar amounts, so no approved unit states the 2027 Tier 3 copay and quoting the 2026 figure would be wrong."
  },
  chat2: {
    intent: "list member's current medications",
    topic: "Member prescription history",
    personal_data: "yes: needs member's own records",
    language: "English",
    confidence: "high: request is unambiguous",
    best_unit: "none",
    answerable_from_unit: "no",
    rationale: "This asks for the member's own prescription records, which no knowledge unit holds; it needs an identity-verified lookup in member systems, not the knowledge base."
  },
  june4: {
    intent: "ask if quoted drug price is final",
    topic: "Drug costs (pricing disclaimer)",
    personal_data: "no: general pricing rule question",
    language: "English",
    confidence: "high: matches the pricing disclaimer",
    best_unit: "KU-202",
    answerable_from_unit: "yes",
    rationale: "The pricing disclaimer's exact wording says quoted prices are estimates that may change with pharmacy, tier or coverage stage and that the Evidence of Coverage is the final word, so the answer is no, it is not final; the member also signals a failed chat contact first."
  },
  june5: {
    intent: "ask if plan includes a dental benefit",
    topic: "Extra benefits (dental rider)",
    personal_data: "yes: depends on member's enrollment",
    language: "English",
    confidence: "medium: vague 'dental thing' referent",
    best_unit: "none",
    answerable_from_unit: "no",
    rationale: "The likely referent is the optional dental rider, but no approved unit covers dental at all (the dental rider text exists only as an unapproved gap draft), so this is a gap to log, not something to guess."
  },
  dana5: {
    intent: "look up dental rider details",
    topic: "Extra benefits (dental rider)",
    personal_data: "no: keyword search, no member",
    language: "English",
    confidence: "medium: two keywords, goal implied",
    best_unit: "none",
    answerable_from_unit: "no",
    rationale: "No approved core, messy or breadth unit mentions a dental rider; the advocate should get an honest no-approved-answer result and the search should go on Priya's list of answers to write."
  },
  web1: {
    intent: "get the plan's Star Rating",
    topic: "Compliance (Star Ratings)",
    personal_data: "no: public plan rating",
    language: "English",
    confidence: "high: direct factual question",
    best_unit: "KU-207",
    answerable_from_unit: "yes",
    rationale: "The Star Rating topic's current version (effective 8 Oct 2026, website) states Lakewell Advantage was rated 3.5 out of 5 stars for the 2027 plan year; the 2026 4-star version expired 29 Oct 2026 and must not be served, and the Star Ratings disclaimer should precede it."
  }
} };
if (typeof module !== "undefined") module.exports = MODEL_RUN;
