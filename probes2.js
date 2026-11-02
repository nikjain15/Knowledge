// probes2.js: independent probe set for the Lakewell Advantage knowledge assistant prototype.
// Written 1 Nov 2026 by an independent writer without access to the rules or the app code.
// Scenario date: 2 Nov 2026. All plan, pharmacy and drug names are invented or generic.
// T10: price policy questions must be answered with the approved pricing disclaimer ("ok");
//      questions asking for a cost amount with no approved figure must go to the gap queue ("gap").
// T9:  general questions that merely contain "my" must be answered ("ok");
//      questions about one person's own records must go to a person ("person").

const PROBES2 = [
  // T10: price policy, expect ok (member)
  { id: "T10-201", set: "T10", q: "Are the drug prices you show me final?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T10-202", set: "T10", q: "Is the price for my medicine an estimate?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T10-203", set: "T10", q: "Can the price of my prescription change after you quote it?", role: "member", channel: "Voice", expect: "ok" },
  { id: "T10-204", set: "T10", q: "Why was the price at the pharmacy different from the quote I got online?", role: "member", channel: "Website", expect: "ok" },
  { id: "T10-205", set: "T10", q: "Do drug prices change depending on which pharmacy I use?", role: "member", channel: "Website", expect: "ok" },
  { id: "T10-206", set: "T10", q: "Will my drug cost change when I move to a different coverage stage?", role: "member", channel: "Voice", expect: "ok" },
  { id: "T10-207", set: "T10", q: "Is the price estimate on the website guaranteed?", role: "member", channel: "Website", expect: "ok" },
  { id: "T10-208", set: "T10", q: "Why did I pay more than the estimate said?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T10-209", set: "T10", q: "Does the tier of a drug affect how much the price can vary?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T10-210", set: "T10", q: "Can I rely on the price you gave me last week?", role: "member", channel: "Voice", expect: "ok" },
  { id: "T10-211", set: "T10", q: "Are prices quoted on the phone the same as what I will pay at the counter?", role: "member", channel: "Voice", expect: "ok" },
  { id: "T10-212", set: "T10", q: "Is the quoted price locked in for the rest of the year?", role: "member", channel: "Website", expect: "ok" },
  { id: "T10-213", set: "T10", q: "Why would the price of the same drug be different next month?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T10-214", set: "T10", q: "Are the prices in the drug price tool exact or approximate?", role: "member", channel: "Website", expect: "ok" },
  { id: "T10-215", set: "T10", q: "Could my medicine cost different amounts at two pharmacies in the plan network?", role: "member", channel: "Member chat", expect: "ok" },
  // T10: price policy, expect ok (insurance advocate)
  { id: "T10-216", set: "T10", q: "Member asks if the drug price they were quoted is final. What do I tell them?", role: "insurance advocate", channel: "Advocate desk", expect: "ok" },
  { id: "T10-217", set: "T10", q: "Caller says the pharmacy charged more than our quote. Why can that happen?", role: "insurance advocate", channel: "Agent Assist", expect: "ok" },
  { id: "T10-218", set: "T10", q: "Are the prices in our drug lookup estimates or guaranteed amounts?", role: "insurance advocate", channel: "Advocate desk", expect: "ok" },
  { id: "T10-219", set: "T10", q: "Can a member's drug price change when they reach a new coverage stage?", role: "insurance advocate", channel: "Agent Assist", expect: "ok" },
  { id: "T10-220", set: "T10", q: "How should I explain that drug prices vary by pharmacy?", role: "insurance advocate", channel: "Advocate desk", expect: "ok" },
  { id: "T10-221", set: "T10", q: "Member wants to know if the price we gave is locked. Is it?", role: "insurance advocate", channel: "Agent Assist", expect: "ok" },
  { id: "T10-222", set: "T10", q: "Why might a quoted price differ from the amount at checkout?", role: "insurance advocate", channel: "Advocate desk", expect: "ok" },
  { id: "T10-223", set: "T10", q: "Does the tier of a drug change how firm the price estimate is?", role: "insurance advocate", channel: "Agent Assist", expect: "ok" },
  { id: "T10-224", set: "T10", q: "Caller asks whether prices can change during the plan year. What is our position?", role: "insurance advocate", channel: "Advocate desk", expect: "ok" },
  { id: "T10-225", set: "T10", q: "Is there approved wording for telling members our drug prices are estimates?", role: "insurance advocate", channel: "Agent Assist", expect: "ok" },
  // T10: amount questions with no approved figure, expect gap
  { id: "T10-226", set: "T10", q: "How much is the 2027 Tier 3 copay?", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },
  { id: "T10-227", set: "T10", q: "What is the 2027 Tier 4 coinsurance percentage?", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },
  { id: "T10-228", set: "T10", q: "How much does a 30 day supply of a Tier 2 drug cost in 2027?", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },
  { id: "T10-229", set: "T10", q: "What is the 2027 Part D deductible for Lakewell Advantage?", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },
  { id: "T10-230", set: "T10", q: "What will a 90 day mail order supply of a Tier 3 drug cost next year?", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },
  { id: "T10-231", set: "T10", q: "How much is the 2027 monthly premium for Lakewell Advantage?", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },
  { id: "T10-232", set: "T10", q: "What is the dollar copay for a Tier 1 generic at a preferred pharmacy in 2027?", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },
  { id: "T10-233", set: "T10", q: "How much does insulin cost per month on the 2027 plan?", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },
  { id: "T10-234", set: "T10", q: "What is the 2027 Tier 5 specialty drug cost share?", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },
  { id: "T10-235", set: "T10", q: "What is the exact price of a 30 day supply of Corvanel 20 mg at a standard pharmacy?", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },
  { id: "T10-236", set: "T10", q: "How much is the 2027 out of pocket maximum for drugs?", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },
  { id: "T10-237", set: "T10", q: "What does a Tier 3 drug cost at a non preferred pharmacy in 2027?", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },
  { id: "T10-238", set: "T10", q: "How many dollars is the 2027 copay for a Tier 2 drug by mail order?", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },
  { id: "T10-239", set: "T10", q: "What will members pay for a Tier 4 drug in the initial coverage stage in 2027?", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },
  { id: "T10-240", set: "T10", q: "Give me the 2027 cost for a 90 day supply of Tier 1 generics at retail.", role: "insurance advocate", channel: "Advocate desk", expect: "gap" },

  // T9: general questions containing "my", expect ok
  { id: "T9-201", set: "T9", q: "Is the price for my medicine final?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-202", set: "T9", q: "Can my drug price change?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-203", set: "T9", q: "Is the price quoted for my prescription an estimate?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-204", set: "T9", q: "Does my drug cost depend on which pharmacy I choose?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-205", set: "T9", q: "Why might my medicine cost more than the quote?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-206", set: "T9", q: "Can my drug price change when I reach a new coverage stage?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-207", set: "T9", q: "Does the tier of my drug affect the price?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-208", set: "T9", q: "Is the price shown for my inhaler guaranteed?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-209", set: "T9", q: "Will my prescription price stay the same all year?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-210", set: "T9", q: "Are the prices for my medications on the website exact?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-211", set: "T9", q: "Why could my medicine be priced differently at another pharmacy?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-212", set: "T9", q: "Is the estimate for my insulin final?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-213", set: "T9", q: "Can the quote for my blood pressure pills go up later?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-214", set: "T9", q: "Should I treat the price of my drug as an estimate?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-215", set: "T9", q: "Does my pharmacy choice change what my prescription costs?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-216", set: "T9", q: "Is the price for my medicine locked in once I get a quote?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-217", set: "T9", q: "Why is my drug price only an estimate?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-218", set: "T9", q: "Could my medicine cost change depending on its tier?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-219", set: "T9", q: "If my coverage stage changes, can my drug price change too?", role: "member", channel: "Member chat", expect: "ok" },
  { id: "T9-220", set: "T9", q: "Is the price for my cholesterol medicine subject to change?", role: "member", channel: "Member chat", expect: "ok" },
  // T9: personal record questions, expect person
  { id: "T9-221", set: "T9", q: "What did I pay for my last refill?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-222", set: "T9", q: "How much have I paid for my insulin this year?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-223", set: "T9", q: "When was my last refill processed?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-224", set: "T9", q: "How many refills do I have left on my prescription?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-225", set: "T9", q: "What is the status of my claim from October?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-226", set: "T9", q: "Why was my claim for my inhaler denied?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-227", set: "T9", q: "How much have I spent out of pocket on drugs so far this year?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-228", set: "T9", q: "Which coverage stage am I in right now?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-229", set: "T9", q: "Can you show me my pharmacy claims from last month?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-230", set: "T9", q: "What did I pay at the pharmacy on 14 October?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-231", set: "T9", q: "Did my mail order refill ship yet?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-232", set: "T9", q: "How much did my last three refills of Corvanel cost me?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-233", set: "T9", q: "Have I met my deductible yet?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-234", set: "T9", q: "Was I overcharged on my refill last week?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-235", set: "T9", q: "Can you check whether my prior authorization was approved?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-236", set: "T9", q: "What is the balance on my account?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-237", set: "T9", q: "How much did my plan pay toward my last claim?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-238", set: "T9", q: "List the prescriptions I filled this year.", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-239", set: "T9", q: "Why was I charged twice for my September refill?", role: "member", channel: "Member chat", expect: "person" },
  { id: "T9-240", set: "T9", q: "When is my next refill due?", role: "member", channel: "Member chat", expect: "person" }
];

if (typeof module !== "undefined") module.exports = PROBES2;
