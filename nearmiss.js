// Near-miss probe set for the Lakewell Advantage knowledge assistant prototype.
// Written on 1 Nov 2026 by an independent writer without access to the rules or the holdout.
// Source of truth: unit text in data.js only. Near-miss: the topic unit exists, the asked fact is not in its text.
// Controls (expect "answer"): the asked fact is stated in the unit text, quoted in `stated`.
const NEARMISS = [
  {id:"T14-001", q:"What is the copay for a 90-day mail order supply through Home Delivery?", role:"pharmacy", channel:"Advocate desk", expect:"nearmiss", unit:"KU-203", absent:"mail-order copay amount"},
  {id:"T14-002", q:"How many days does Lakewell Home Delivery take to ship an order?", role:"pharmacy", channel:"Advocate desk", expect:"nearmiss", unit:"KU-203", absent:"shipping time"},
  {id:"T14-003", q:"What phone number does the prescriber fax or call to file a formulary exception?", role:"pharmacy", channel:"Advocate desk", expect:"nearmiss", unit:"KU-204", absent:"phone or fax number for exception requests"},
  {id:"T14-004", q:"Once a formulary exception is approved, how long does the approval last?", role:"pharmacy", channel:"Advocate desk", expect:"nearmiss", unit:"KU-204", absent:"approval duration"},
  {id:"T14-005", q:"How much is the hearing aid copay per ear after the $1,000 allowance?", role:"insurance", channel:"Advocate desk", expect:"nearmiss", unit:"KU-211", absent:"cost above the hearing aid allowance"},
  {id:"T14-006", q:"Which eye doctors are in network for the routine eye exam?", role:"insurance", channel:"Advocate desk", expect:"nearmiss", unit:"KU-211", absent:"vision provider network names"},
  {id:"T14-007", q:"How many days does the member have to file an appeal after a denial?", role:"insurance", channel:"Advocate desk", expect:"nearmiss", unit:"KU-212", absent:"number of days to appeal (unit points to the notice date only)"},
  {id:"T14-008", q:"How fast do we decide an appeal once it is filed?", role:"insurance", channel:"Advocate desk", expect:"nearmiss", unit:"KU-212", absent:"appeal decision timeframe"},
  {id:"T14-009", q:"What is the Member Services phone number?", role:"insurance", channel:"Advocate desk", expect:"nearmiss", unit:"KU-213", absent:"actual phone number"},
  {id:"T14-010", q:"Is Member Services open on federal holidays?", role:"insurance", channel:"Advocate desk", expect:"nearmiss", unit:"KU-213", absent:"holiday hours"},
  {id:"T14-011", q:"How long does the member have to submit a claim for out-of-pocket care?", role:"insurance", channel:"Advocate desk", expect:"nearmiss", unit:"KU-214", absent:"claim filing deadline"},
  {id:"T14-012", q:"How does a member get a replacement ID card if they lose it?", role:"insurance", channel:"Advocate desk", expect:"nearmiss", unit:"KU-209", absent:"replacement card process"},
  {id:"T14-013", q:"What is the 2027 copay for a Tier 3 drug?", role:"insurance", channel:"Advocate desk", expect:"nearmiss", unit:"KU-210", absent:"2027 tier copay amounts"},
  {id:"T14-014", q:"Can a member get a second transition fill if the first runs out before the exception is decided?", role:"pharmacy", channel:"Advocate desk", expect:"nearmiss", unit:"KU-221", absent:"exception allowing a second transition fill"},
  {id:"T14-015", q:"What is the 2026 standard (non-preferred) retail copay for Tier 2?", role:"pharmacy", channel:"Advocate desk", expect:"nearmiss", unit:"KU-223", absent:"standard retail copay"},
  {id:"T14-016", q:"How long does a step therapy exception request take to decide?", role:"pharmacy", channel:"Advocate desk", expect:"nearmiss", unit:"KU-120", absent:"step therapy exception timeframe"},
  {id:"T14-017", q:"How many weeks must a member try the lower-cost drug before step therapy is met?", role:"pharmacy", channel:"Advocate desk", expect:"nearmiss", unit:"KU-120", absent:"trial duration"},
  {id:"T14-018", q:"What is the quantity limit for a specific drug like a sleep aid?", role:"pharmacy", channel:"Advocate desk", expect:"nearmiss", unit:"KU-121", absent:"drug-specific limit (unit gives one generic example)"},
  {id:"T14-019", q:"What hours is Lakewell Specialty Pharmacy open and what number do members call?", role:"pharmacy", channel:"Advocate desk", expect:"nearmiss", unit:"KU-122", absent:"specialty pharmacy hours and phone number"},
  {id:"T14-020", q:"Does the $2,100 Part D out-of-pocket cap include the premium?", role:"insurance", channel:"Advocate desk", expect:"nearmiss", unit:"KU-123", absent:"whether premiums count toward the cap"},
  {id:"T14-021", q:"What is the copay for a specialist visit after the PCP referral?", role:"insurance", channel:"Advocate desk", expect:"nearmiss", unit:"KU-130", absent:"specialist copay"},
  {id:"T14-022", q:"How many miles can a plan ride travel to an appointment?", role:"pharmacy", channel:"Advocate desk", expect:"nearmiss", unit:"KU-136", absent:"mileage limit for rides"},
  {id:"T14-023", q:"How long does a member have after the move to choose a new plan under the Special Enrollment Period?", role:"insurance", channel:"Advocate desk", expect:"nearmiss", unit:"KU-142", absent:"SEP end date or length"},
  {id:"T14-024", q:"What income limit does a member need to meet for Lakewell Dual Choice?", role:"insurance", channel:"Advocate desk", expect:"nearmiss", unit:"KU-143", absent:"income eligibility threshold"},

  {id:"T14-101", q:"How long is the supply through Lakewell Home Delivery?", role:"pharmacy", channel:"Advocate desk", expect:"answer", unit:"KU-203", stated:"up to a 90-day supply of maintenance drugs"},
  {id:"T14-102", q:"How fast do we decide an urgent formulary exception?", role:"pharmacy", channel:"Advocate desk", expect:"answer", unit:"KU-204", stated:"Urgent request ... we decide within 24 hours"},
  {id:"T14-103", q:"What is the yearly allowance for glasses or contacts?", role:"insurance", channel:"Advocate desk", expect:"answer", unit:"KU-211", stated:"a $150 allowance each year for glasses or contacts"},
  {id:"T14-104", q:"What hours is Member Services open?", role:"insurance", channel:"Advocate desk", expect:"answer", unit:"KU-213", stated:"8 a.m. to 8 p.m., seven days a week"},
  {id:"T14-105", q:"How soon is the transition fill letter mailed?", role:"pharmacy", channel:"Advocate desk", expect:"answer", unit:"KU-222", stated:"we mail a letter within 3 business days"},
  {id:"T14-106", q:"What is the 2026 preferred retail copay for a Tier 3 drug, 30-day supply?", role:"pharmacy", channel:"Advocate desk", expect:"answer", unit:"KU-223", stated:"Tier 3 $42"},
  {id:"T14-107", q:"What is the most supply Lakewell Specialty Pharmacy fills at once?", role:"pharmacy", channel:"Advocate desk", expect:"answer", unit:"KU-122", stated:"up to a 30-day supply"},
  {id:"T14-108", q:"How quickly is a standard prior authorization for an MRI decided?", role:"insurance", channel:"Advocate desk", expect:"answer", unit:"KU-131", stated:"Standard request: we decide within 7 calendar days"},
  {id:"T14-109", q:"Does a member need a referral for urgent care?", role:"insurance", channel:"Advocate desk", expect:"answer", unit:"KU-130", stated:"You do not need one for emergencies, urgent care"},
  {id:"T14-110", q:"How many one-way rides does a member get each year?", role:"insurance", channel:"Advocate desk", expect:"answer", unit:"KU-136", stated:"24 one-way rides a year"},
  {id:"T14-111", q:"When does the Annual Enrollment Period run?", role:"pharmacy", channel:"Advocate desk", expect:"answer", unit:"KU-140", stated:"October 15 to December 7"},
  {id:"T14-112", q:"How long do we take to respond to a grievance about wait times?", role:"insurance", channel:"Advocate desk", expect:"answer", unit:"KU-153", stated:"We respond within 30 days"}
];
if (typeof module !== "undefined") module.exports = NEARMISS;
