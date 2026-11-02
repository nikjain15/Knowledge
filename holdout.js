const HOLDOUT = [
  { id: "H1", role: "pharmacy", channel: "Advocate desk", q: "new mbr drug not on list, transition fill how much", expect: "answer", unit: "KU-221", key: "30-day supply", labelledBy: "holdout writer (separate context)" },
  { id: "H2", role: "pharmacy", channel: "Advocate desk", q: "part d oop cap 2026 amount", expect: "answer", unit: "KU-123", key: "$2,100", labelledBy: "holdout writer (separate context)" },
  { id: "H3", role: "pharmacy", channel: "Advocate desk", q: "hospice meds who pays", expect: "abstain", unit: null, key: null, labelledBy: "holdout writer (separate context)" },
  { id: "H4", role: "pharmacy", channel: "Advocate desk", q: "gym membership included?", expect: "scope", unit: "KU-135", key: null, labelledBy: "holdout writer (separate context)" },
  { id: "H5", role: "pharmacy", channel: "Advocate desk", q: "specialty pharmacy copay tier 5 per fill", expect: "nearmiss", unit: "KU-122", key: null, labelledBy: "holdout writer (separate context)" },
  { id: "H6", role: "insurance", channel: "Advocate desk", q: "MRI prior auth turnaround", expect: "answer", unit: "KU-131", key: "7 days", labelledBy: "holdout writer (separate context)" },
  { id: "H7", role: "insurance", channel: "Advocate desk", q: "how many rides per yr to appts", expect: "answer", unit: "KU-136", key: "24 one-way rides", labelledBy: "holdout writer (separate context)" },
  { id: "H8", role: "insurance", channel: "Advocate desk", q: "part b giveback amount 2027", expect: "abstain", unit: null, key: null, labelledBy: "holdout writer (separate context)" },
  { id: "H9", role: "insurance", channel: "Advocate desk", q: "transition fill letter timing", expect: "scope", unit: "KU-222", key: null, labelledBy: "holdout writer (separate context)" },
  { id: "H10", role: "insurance", channel: "Advocate desk", q: "specialist referral how long is it good for", expect: "nearmiss", unit: "KU-130", key: null, labelledBy: "holdout writer (separate context)" },
  { id: "H11", role: "member", channel: "Member chat", q: "do i need a referal to see a cardiologist", expect: "answer", unit: "KU-130", key: "referral from your primary care provider", labelledBy: "holdout writer (separate context)" }
];
