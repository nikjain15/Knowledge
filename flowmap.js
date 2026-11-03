/* Solution architecture as a flow map (replaces the four cards, 2 Nov 2026).
   Top to bottom: named sources, three jobs, the test gate as a bar, six channels. One topic travels the map;
   each beat moves it one stop or lights one row of "how it runs". Content from strategy S3, S6, S7; the AI
   levels are the brief's three: AI decides (inside rules), AI recommends (a person confirms), only a person. */
const FM_SOURCES = [["Plan policies", "Renee Caldwell, Knowledge Operations lead"], ["Knowledge articles", "desk content, Priya"], ["Legal wording", "Tom Bexley, Legal and Compliance"], ["Clinical guidance", "Grace Mbeki, then Dr. Ruth Calloway"], ["Priya's drafts", "Priya Nandakumar, author"]];
const FM_CHANNELS = [["Phone bot", "June Halvorsen, calling at night"], ["Member chat", "member website chat, June"], ["Agent Assist", "beside Dana and Luis"], ["Advocate search", "Dana Okafor and Luis Ferreira"], ["Texts and calls", "outbound to June"], ["Member website", "plan pages June reads"]];
const FM_JOBS = [
  { n: "Ingest and structure", line: "documents become topics", take: "Every document is split into topics. Legal's sentences are marked as exact wording, to be quoted word for word and never reworded, and nothing is readable until a person approves it.",
    w: "Pulls each document, splits it into topics, marks the exact wording, and finds the same wording in other documents", y: "Every channel starts from the same approved topics instead of its own copy of the document", h: "Exact wording matches its source, character for character; a different wording is never merged; a planted instruction never gets through",
    inp: "Source documents: plan policies, knowledge articles, Tom's legal wording, Grace's clinical guidance, Priya's drafts", out: "Proposed topics, with exact wording marked, waiting for approval in Job 2",
    run: [["rule", "System", "Pulls the source document; records its hash, version and owner"], ["ai", "AI decides", "Splits it into proposed topics and marks the candidate exact wording"], ["rec", "AI recommends", "Proposes type and tags; proposes a merge where another document has the same clause; never merges on its own"], ["person", "Priya, author", "Accepts or edits each topic; proposes the merges"], ["person", "Tom, Grace or Renee", "Confirms a merge; the person who proposed it never confirms it"]],
    checks: [["Exact wording matches the source, character for character", "golden set"], ["Two different wordings are never merged", "release test"], ["A planted instruction inside a document never changes an answer", "golden set"], ["Member identifiers are removed before anything is stored", "release test"]],
    tags: ["LLM-based extraction", "Semantic deduplication", "Prompt-injection filtering", "PII redaction"] },
  { n: "Govern and approve", line: "one approved version, dated, scoped", take: "One approved version of every topic, with its approver, its start and end dates and who may read it; when a source changes, one alert finds every copy.",
    w: "Holds each topic with its state, version, dates, scope, approver and date; watches every source for change", y: "There is one signed original, and every channel points at it instead of holding a copy", h: "Only approved, in-date topics are ever served; a formatting-only edit raises no alert",
    inp: "Proposed topics from Job 1; an approval from Tom, Grace or Renee; a new version of any source document", out: "Approved topics, in date and in scope, for Job 3; one grouped drift alert per source change",
    run: [["person", "Tom · Grace · Renee", "Approves by content type: Tom legal, Grace then Ruth clinical, Renee operational; never the author"], ["rule", "System", "Stores the topic with its state, version, start and end dates, scope, approver and date"], ["rule", "System", "Clocks every review in working days: a reminder, then an escalation, then a backup reviewer"], ["rule", "System", "On a new source version, diffs every tracked clause; raises one grouped alert per source change"], ["rec", "AI recommends", "Proposes the edit the change implies"], ["person", "Same approver", "Approves the edit; the new version replaces the old one everywhere"]],
    checks: [["A draft or an expired topic is never served, in any channel", "golden set"], ["A topic switches on its start date, in every channel", "golden set"], ["A formatting-only edit raises no alert", "release test"], ["A changed source sends its translation back to a qualified translator; a machine draft is never served", "golden set, release test"], ["Every answer cites its topic id and version", "golden set"]],
    tags: ["Knowledge graph", "Temporal versioning", "Drift detection"],
    loop: { t: "The drift loop: why a source change cannot leave a stale copy anywhere", s: [["1 · A source changes", "Tom files a new version of the legal wording; one clause has changed"], ["2 · One alert", "The system diffs every tracked clause and raises one alert listing every topic built from it"], ["3 · One decision", "AI proposes the edit; Tom, as the approver for legal wording, approves it once"], ["4 · Everywhere at once", "Job 3 serves the new version to every channel from its start date; no drawer keeps a copy"]] } },
  { n: "Serve every channel", line: "the same answer, or none", take: "Every channel reads the same approved topic, scoped to the asker, quoting Legal's exact wording in every channel, or says it has none and logs the gap.",
    w: "Keeps only approved, in-date topics the asker's role may read, ranks them, renders exact wording by template, and abstains when none answers", y: "June gets one answer whether she calls, chats, texts or reads the website, and Dana sees the same one", h: "Never a topic outside the role; never a guess; the exact wording identical in every channel",
    inp: "Approved topics from Job 2; a question from one of the six channels, with the asker's role and today's date", out: "One cited answer per channel, or none; every unanswered question in the gap log, redacted",
    run: [["rule", "System", "Searches approved topics only, in force on today's date"], ["rule", "System", "Applies the asker's role as a filter before the search, not after"], ["ai", "AI decides", "Ranks the candidates and picks the topic that answers, or finds none"], ["rule", "System", "Renders all exact wording by template and cites the topic id and version"], ["rule", "System", "When no approved topic answers: abstains, and logs the redacted question in the gap log"], ["rec", "AI recommends", "Clusters the unanswered questions; proposes synonyms from the search log and a pinned answer for the top question, for Renee to confirm"], ["person", "Priya, then Renee", "Each gap lands in Priya's queue; Renee decides: write a topic, or fix the process"]],
    checks: [["A member never receives staff-only content", "golden set, every role"], ["No guess when nothing approved answers", "golden set"], ["The exact wording identical in chat, voice, text and web", "golden set, every channel"], ["Every abstention appears in the gap log", "release test"]],
    tags: ["Knowledge graph retrieval", "Hybrid retrieval", "Role-based pre-filter", "Grounded generation with abstention", "Constrained rendering", "Gap clustering"],
    loop: { t: "The gap loop: how a missing answer becomes a written one", s: [["1 · No approved topic", "June asks about a vaccine the plan has no topic for; the channel says it has none"], ["2 · Logged, grouped", "The system records the redacted question and groups it with others like it"], ["3 · Priya's queue", "The gap goes on Priya's list of answers to write; she drafts the topic"], ["4 · Renee decides", "Write it, or fix the process behind the question; a written topic goes through Jobs 1 and 2 as usual"]] } },
  { n: "Test every release", line: "the gate every change passes before it reaches a channel", take: "Independent tests on every role and channel decide each release, and one red row blocks it.",
    w: "Runs the golden set, the probe questions and a sealed holdout before every release", y: "Quality is proven group by group, not assumed from an average", h: "Any red rule row blocks release; the holdout is never used for tuning",
    inp: "Every change to the system, before release", out: "A release that reaches the channels, or a red row that stops it",
    run: [["rule", "System", "Runs the golden set: 21 questions with known answers, per role and channel"], ["rule", "System", "Runs the adversarial probes: personal data, cost, dates, languages, roles"], ["rule", "System", "Runs the sealed holdout once; its hash proves nobody tuned on it"], ["rule", "System", "Any red rule row, on any group, blocks the release"], ["person", "Renee signs", "Renee signs the release; Tom and Engineering co-sign the monitoring plan"]],
    checks: [["Every question about personal data is handed to a person", "100% required"], ["False refusals stay under the bar", "at most 10%, goal 2%"], ["The holdout hash matches the one recorded before the first run", "every release"], ["Each role and channel passes on its own, not on the average", "every release"]],
    tags: ["Golden set", "Adversarial probe suites", "Sealed holdout", "Per-group release gates", "LLM-as-judge"] }
];

/* geometry, viewBox 1340 x 840 */
const FM = (() => {
  const W = 1340, H = 840, SY = 46, SH = 68, SW = 232, sX = i => 40 + i * 262, JY = 310, JH = 124, JW = 280, jX = i => 120 + i * 410, GY = 550, GH = 66, GX = 120, GW = 1100, CY = 740, CH = 68, CW = 196, cX = i => 40 + i * 214;
  const sc = i => [sX(i) + SW / 2, SY + SH], entry = i => [jX(0) + 36 + i * 57, JY];
  const vcurve = (a, b) => `M${a[0]} ${a[1]} C ${a[0]} ${(a[1] + b[1]) / 2}, ${b[0]} ${(a[1] + b[1]) / 2}, ${b[0]} ${b[1]}`;
  const seg = pts => pts.map((q, k) => (k ? "L" : "M") + q[0] + " " + q[1]).join(" ");
  const T = i => [jX(i) + JW / 2, JY], R = i => [jX(i) + JW, JY], RB = i => [jX(i) + JW, JY + JH], B = i => [jX(i) + JW / 2, JY + JH];
  return { W, H, SY, SH, SW, sX, JY, JH, JW, jX, GY, GH, GX, GW, CY, CH, CW, cX, sc, entry, vcurve, seg,
    srcPaths: FM_SOURCES.map((_, i) => vcurve(sc(i), entry(i))),
    j12: `M${jX(0) + JW} ${JY + JH / 2} L${jX(1)} ${JY + JH / 2}`, j23: `M${jX(1) + JW} ${JY + JH / 2} L${jX(2)} ${JY + JH / 2}`, j3g: `M${jX(2) + JW / 2} ${JY + JH} L${jX(2) + JW / 2} ${GY}`,
    chPaths: FM_CHANNELS.map((_, i) => `M${cX(i) + CW / 2} ${GY + GH} L${cX(i) + CW / 2} ${CY}`),
    gapLoop: `M${jX(2) + JW - 50} ${JY} C ${jX(2) + JW - 50} ${JY - 90}, ${sX(4) + SW / 2 + 40} ${SY + SH + 120}, ${sX(4) + SW / 2 + 40} ${SY + SH + 2}`,
    driftLoop: `M${sX(2) + SW - 24} ${SY + SH} C ${sX(2) + SW - 24} ${JY - 110}, ${jX(1) + JW - 40} ${JY - 120}, ${jX(1) + JW - 40} ${JY - 2}`,
    hops: [vcurve(sc(0), entry(0)) + " L" + T(0).join(" "), seg([T(0), R(0), [jX(1), JY], T(1)]), seg([T(1), R(1), [jX(2), JY], T(2)]), seg([T(2), R(2), RB(2), B(2), [jX(2) + JW / 2, GY]]), seg([[jX(2) + JW / 2, GY], [GX + GW, GY], [GX + GW, GY + GH], [cX(5) + CW / 2, GY + GH], [cX(5) + CW / 2, CY]])],
    stops: [sc(0), T(0), T(1), T(2), [jX(2) + JW / 2, GY], [cX(5) + CW / 2, CY]] };
})();
const FM_BEATS = [{ stop: 0, job: -1, rows: 0 }]; FM_JOBS.forEach((s, i) => { FM_BEATS.push({ stop: i + 1, job: i, rows: 0 }); s.run.forEach((_, k) => FM_BEATS.push({ stop: i + 1, job: i, rows: k + 1 })); }); FM_BEATS.push({ stop: 5, job: 3, rows: FM_JOBS[3].run.length });
let fmBeat = 0, fmActive = -1, fmStop = 0, fmRows = 0, fmTimer = null, fmAnim = null;
const FM_REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* The stage markup: headline row with play and stop, the map, the legend, the footnote, the exhibit, the next button */
let FM_NEXT = "";
function flowHTML(nextLabel) {
  FM_NEXT = nextLabel;
  return `<div class="appr2 fm-wrap"><div class="fm-head"><div><p class="eyebrow">Solution architecture</p>
    <h2>A governed knowledge layer: one source of truth for every channel, human or AI.</h2>
    <p class="big2">We fix the knowledge once, at the source, instead of fixing each channel.</p></div>
    <div class="fm-icons"><button class="icb primary" id="fmPlay" title="Play slowly" aria-label="Play slowly"></button><button class="icb" id="fmStop" title="Stop" aria-label="Stop"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg></button></div></div>
    <div id="fm"></div>
    <p class="fm-legend"><span class="fm-dash"></span>dashed green: a feedback loop, running back against the flow</p>
    <p class="small" style="margin-top:8px">Prototype: runs in your browser, nothing sent anywhere. Simple matching stands in for the real search; the AI steps are scripted.</p>
    <div class="fm-panel" id="fmPanel"></div>
    <button class="btn primary" id="toNew" style="display:none">${esc(nextLabel)}</button></div>`;
}
function fmTile(x, y, w, h, t, s, cls) {
  const max = Math.floor((w - 28) / 6.7), words = String(s).split(" "), ln = [""];
  words.forEach(wd => { const L = ln[ln.length - 1]; if (L && (L + " " + wd).length > max) ln.push(wd); else ln[ln.length - 1] = L ? L + " " + wd : wd; });
  const two = ln.length > 1, ly = two ? y + 25 : y + h / 2 - 3, sy = two ? y + 43 : y + h / 2 + 16;
  return `<g class="fm-tile ${cls}"><rect class="fm-box" x="${x}" y="${y}" width="${w}" height="${h}"/><text class="fm-lbl" x="${x + 16}" y="${ly}">${esc(t)}</text><text class="fm-sub" x="${x + 16}" y="${sy}">${ln.slice(0, 2).map((l, i) => `<tspan x="${x + 16}" dy="${i ? 15 : 0}">${esc(l)}${i < Math.min(ln.length, 2) - 1 ? " " : ""}</tspan>`).join("")}</text></g>`; }
function fmJob(i) { const s = FM_JOBS[i], g = FM, x = g.jX(i); return `<g class="fm-job" data-i="${i}" role="button" tabindex="0" aria-label="Job ${i + 1}: ${esc(s.n)}"><rect class="fm-ring" x="${x - 5}" y="${g.JY - 5}" width="${g.JW + 10}" height="${g.JH + 10}"/><rect class="fm-bg" x="${x}" y="${g.JY}" width="${g.JW}" height="${g.JH}"/><text class="fm-num" x="${x + 20}" y="${g.JY + 32}">JOB ${i + 1}</text><text class="fm-lbl" x="${x + 20}" y="${g.JY + 64}">${esc(s.n)}</text><text class="fm-sub" x="${x + 20}" y="${g.JY + 90}">${esc(s.line)}</text></g>`; }
function fmGate() { const s = FM_JOBS[3], g = FM; return `<g class="fm-job fm-gate" data-i="3" role="button" tabindex="0" aria-label="Job 4: ${esc(s.n)}"><rect class="fm-ring" x="${g.GX - 5}" y="${g.GY - 5}" width="${g.GW + 10}" height="${g.GH + 10}"/><rect class="fm-bg" x="${g.GX}" y="${g.GY}" width="${g.GW}" height="${g.GH}"/><text class="fm-num" x="${g.GX + 22}" y="${g.GY + 27}">JOB 4</text><text class="fm-lbl" x="${g.GX + 22}" y="${g.GY + 50}">${esc(s.n)}</text><text class="fm-sub" x="${g.GX + 280}" y="${g.GY + 40}">a fixed question set plus hidden tests · any failure blocks · Renee signs</text></g>`; }
function flowMount() {
  const g = FM, el = document.getElementById("fm"); if (!el) return;
  el.innerHTML = `<svg class="fm-svg" id="fmSvg" viewBox="0 0 ${g.W} ${g.H}" role="img" aria-label="Flow map of the governed knowledge layer: sources at the top, four jobs, six channels at the bottom">
   <defs><marker id="fmM" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 9 4.5 0 9z" fill="#cfd6c9"/></marker><marker id="fmG" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 9 4.5 0 9z" fill="#72992e"/></marker></defs>
   <text class="fm-col" x="40" y="${g.SY - 16}">SOURCES · WHAT GOES IN, AND WHO OWNS IT</text>
   <text class="fm-col" x="40" y="${g.CY + g.CH + 24}">CHANNELS · WHO READS IT</text>
   ${g.srcPaths.map(d => `<path class="fm-p k-src" d="${d}" marker-end="url(#fmM)"/>`).join("")}
   <path class="fm-p k-j12" d="${g.j12}" marker-end="url(#fmM)"/><path class="fm-p k-j23" d="${g.j23}" marker-end="url(#fmM)"/><path class="fm-p k-j3g" d="${g.j3g}" marker-end="url(#fmM)"/>
   ${g.chPaths.map(d => `<path class="fm-p k-ch" d="${d}" marker-end="url(#fmM)"/>`).join("")}
   <path class="fm-loop k-gap" d="${g.gapLoop}" marker-end="url(#fmG)"/><path class="fm-loop k-drift" d="${g.driftLoop}" marker-end="url(#fmG)"/>
   <text class="fm-looplbl k-gap" x="${g.jX(2) + g.JW + 10}" y="${g.JY - 60}" text-anchor="end">content gaps: unanswered questions go back to Priya ↑</text>
   <text class="fm-looplbl k-drift" x="${g.sX(2) + g.SW - 10}" y="${g.SY + g.SH + 34}">drift: when a source changes, one alert finds every copy</text>
   ${FM_SOURCES.map((s, i) => fmTile(g.sX(i), g.SY, g.SW, g.SH, s[0], s[1], "k-sbox")).join("")}
   ${FM_CHANNELS.map((c, i) => fmTile(g.cX(i), g.CY, g.CW, g.CH, c[0], c[1], "k-cbox")).join("")}
   ${[0, 1, 2].map(fmJob).join("")}${fmGate()}
   <g id="fmTrav" class="fm-trav"><circle class="fm-halo" r="11"><animate attributeName="r" values="9;14;9" dur="1.8s" repeatCount="indefinite"/></circle><circle class="fm-core" r="5.5"/></g></svg>`;
  el.querySelectorAll(".fm-job").forEach(j => { const jump = () => fmGo(FM_BEATS.findIndex(b => b.job === +j.dataset.i && b.rows === 0)); j.onclick = jump; j.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); jump(); } }; });
  document.getElementById("fmStop").onclick = () => { if (fmTimer) { clearInterval(fmTimer); fmTimer = null; } fmGo(0); };
  document.getElementById("fmPlay").onclick = fmPlay;
  if (!flowMount.keys) { flowMount.keys = true; document.addEventListener("keydown", e => { if (!document.getElementById("fm")) return; if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; if (e.key === "ArrowRight") { fmGo(fmBeat + 1); e.preventDefault(); } if (e.key === "ArrowLeft") { fmGo(fmBeat - 1); e.preventDefault(); } }); }
  fmBeat = 0; fmActive = -1; fmStop = 0; fmRows = 0; fmPlace(FM.stops[0]); fmGo(0);
}
function fmPlace(pt) { const t = document.getElementById("fmTrav"); if (t) t.setAttribute("transform", `translate(${pt[0]} ${pt[1]})`); }
function fmMove(from, to) {
  if (fmAnim) cancelAnimationFrame(fmAnim);
  if (FM_REDUCED) { fmPlace(FM.stops[to]); return; }
  const step = from < to ? 1 : -1; let i = from;
  const hop = () => { if (i === to) { fmPlace(FM.stops[to]); return; }
    const idx = step > 0 ? i : i - 1, path = document.createElementNS("http://www.w3.org/2000/svg", "path"); path.setAttribute("d", FM.hops[idx]);
    const L = path.getTotalLength(), t0 = performance.now(), dur = Math.max(700, L / 0.45);
    const tick = now => { let u = Math.min(1, (now - t0) / dur); u = 1 - Math.pow(1 - u, 2); const p = path.getPointAtLength((step > 0 ? u : 1 - u) * L); fmPlace([p.x, p.y]); if (u < 1) fmAnim = requestAnimationFrame(tick); else { i += step; hop(); } };
    fmAnim = requestAnimationFrame(tick); };
  hop();
}
function fmFocus() {
  const svg = document.getElementById("fmSvg"); if (!svg) return; svg.classList.toggle("fm-focus", fmActive >= 0);
  const lit = { src: [0], j12: [0, 1], j23: [1, 2], j3g: [2, 3], ch: [2, 3], gap: [2], drift: [1], sbox: [0], cbox: [2, 3] };
  Object.entries(lit).forEach(([k, jobs]) => svg.querySelectorAll(".k-" + k).forEach(n => { n.classList.remove("lit", "dim"); if (fmActive < 0) return; const on = jobs.includes(fmActive); if (on && !/box/.test(k)) n.classList.add("lit"); if (!on) n.classList.add("dim"); }));
  svg.querySelectorAll(".fm-job").forEach(j => j.classList.toggle("on", +j.dataset.i === fmActive));
}
function fmGo(b) {
  const prev = fmStop; fmBeat = Math.max(0, Math.min(FM_BEATS.length - 1, b)); const x = FM_BEATS[fmBeat]; fmStop = x.stop; fmActive = x.job; fmRows = x.rows;
  fmFocus(); if (fmStop !== prev) fmMove(prev, fmStop); fmPanel();
  const pb = document.getElementById("fmPlay"); if (pb) pb.innerHTML = fmTimer ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>' : '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
}
function fmPlay() { if (fmTimer) { clearInterval(fmTimer); fmTimer = null; fmGo(fmBeat); return; } fmTimer = setInterval(() => { if (fmBeat >= FM_BEATS.length - 1) { clearInterval(fmTimer); fmTimer = null; fmGo(fmBeat); return; } fmGo(fmBeat + 1); }, 3400); fmGo(fmBeat + 1); }
function fmPanel() {
  const p = document.getElementById("fmPanel"); if (!p) return;
  if (fmActive < 0) { p.innerHTML = `<div class="fm-intro"><p>We follow one plan policy from Renee's folder to June's screen. Press play, or click a job.</p><button class="btn primary" data-go="0">Begin the journey →</button></div>`; }
  else { const s = FM_JOBS[fmActive], i = fmActive;
    p.innerHTML = `<div><p class="eyebrow">Job ${i + 1} of 4 · ${esc(s.n)} <a class="fm-see" href="${["how1.html", "how2.html", "how3.html", "prove.html"][i]}">See it run →</a></p><p class="fm-ktl">${esc(s.take)}</p>
     <div class="fm-io"><div><b>What comes in</b>${esc(s.inp)}</div><div><b>What goes out</b>${esc(s.out)}</div></div>
     <ul class="fm-bul"><li><b>What it does</b><span>${esc(s.w)}</span></li><li><b>Why it matters</b><span>${esc(s.y)}</span></li><li><b>How we know</b><span>${esc(s.h)}</span></li></ul>
     ${s.loop ? `<div class="fm-loopx"><p class="eyebrow">${esc(s.loop.t)}</p><ol>${s.loop.s.map(x => `<li><b>${esc(x[0])}</b>${esc(x[1])}</li>`).join("")}</ol></div>` : ""}</div>
     <div class="fm-deep"><p class="eyebrow">How it runs, step by step <span>· the highlighted row is where the topic is now</span></p><ol class="fm-run">${s.run.map((r, k) => `<li class="${k < fmRows ? "show" : ""}${k === fmRows - 1 ? " now" : ""}"><span class="fm-who ${r[0]}">${esc(r[1])}</span><span>${esc(r[2])}</span></li>`).join("")}</ol>
     <p class="eyebrow" style="margin-top:16px">What we check before release</p><ul class="fm-chk">${s.checks.map(c => `<li><span>${esc(c[0])}</span><em>${esc(c[1])}</em></li>`).join("")}</ul>
     <div class="fm-legend2"><span class="fm-who rule">System</span> a fixed rule <span class="fm-who ai">AI decides</span> inside rules <span class="fm-who rec">AI recommends</span> a person confirms <span class="fm-who person">Name</span> only a person</div>
     <details><summary>Techniques used</summary><div style="margin-top:8px">${s.tags.map(t => `<span class="fm-tag">${esc(t)}</span>`).join("")}</div></details></div>
     <div class="fm-nav"><button class="btn" data-go="${i - 1}" ${i === 0 ? "disabled" : ""}>← Back a job</button><div class="fm-dots">${FM_JOBS.map((_, j) => `<span class="${j === i ? "on" : ""}"></span>`).join("")}</div>${i < 3 ? `<button class="btn primary" data-go="${i + 1}">Job ${i + 2}: ${esc(FM_JOBS[i + 1].n)} →</button>` : `<button class="btn primary" onclick="document.getElementById('toNew').click()">${esc(FM_NEXT)}</button>`}</div>`; }
  p.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { const j = +b.dataset.go; fmGo(j < 0 ? 0 : FM_BEATS.findIndex(x => x.job === j && x.rows === 0)); });
}
