/* How it works: one page per architecture step; the sub-steps are what the lead person does. Each sub-step plays as it would
   happen: a person adds something or something happens, the AI reads and proposes (results appear one after another), a person
   decides, and the result. Scenes live in how-scenes.js. */
const CH_NAME = { Voice: "Phone bot", "Member chat": "Member chat", "Advocate desk": "Call with Dana", Outbound: "Text", Website: "Website" };
const PD = Object.fromEntries(PD_WORDINGS.map(w => [w.label, w.text]));
const docOf = id => DOCS.find(d => d.id === id);
const STEPS = ACT.steps.map(([ch, label, key], i) => Object.assign({ key: key || ch, ch, label, n: i + 1 }, ACT.channels[key || ch]));
let cur = Math.max(0, STEPS.findIndex(s => s.n === +QS.get("s"))), playing = false, run = 0, playFrom = cur; /* A-071: ?s=N&play=1 starts at N */
/* Steps are shown in at most five groups; a group may hold two or three short parts that play back to back (how-scenes.js HOW_GROUPS) */
const GROUPS = (typeof HOW_GROUPS !== "undefined" && HOW_GROUPS[ACT.howIndex]) || STEPS.map((s, i) => [s.label, [i]]);
const ORDER = GROUPS.flatMap(g => g[1]), groupOf = i => GROUPS.findIndex(g => g[1].includes(i)), nextOf = i => ORDER[ORDER.indexOf(i) + 1];
/* The app window's memory: an audit row for every action, a bell for every decision, a clock */
const AUDIT = []; let BELLS = 0, LIVE_Q = "";
const hhmmss = () => new Date().toTimeString().slice(0, 8);
function audit(who, what) { AUDIT.unshift([hhmmss(), who, what]); const a = document.getElementById("auditRows"), n = document.getElementById("auditN"); if (a) a.innerHTML = AUDIT.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join(""); if (n) n.textContent = `Audit (${AUDIT.length})`; }
function bell(n) { BELLS += n || 1; const b = document.getElementById("bellN"); if (b) { b.textContent = BELLS; b.hidden = false; } }
setInterval(() => { const c = document.getElementById("clock"); if (c) c.textContent = hhmmss(); }, 1000);
async function typeInto(root, fast) { for (const el of root.querySelectorAll("[data-type]")) { const text = el.getAttribute("data-type"); if (fast) { el.textContent = text; continue; } el.textContent = ""; const c = document.createElement("span"); c.className = "lv-caret"; el.appendChild(c); for (const ch of text) { c.before(document.createTextNode(ch)); await new Promise(r => setTimeout(r, 12)); } c.remove(); } }

function docView(d, mark) {
  return `<div class="docv"><p class="small" style="margin:0 0 6px"><b>${esc(d.title)}</b> · ${esc(d.tool || "")} · ${esc(d.short)}</p>${d.sections.map(s => `<h5>${esc(s.h)}</h5>${s.blocks.map(b => typeof b === "string" ? `<p class="small">${esc(b)}</p>` : `<p class="${(mark && mark(b)) || ""}">${esc(b.t || (b.table || []).map(r => r.join(" ")).join("; "))}</p>`).join("")}`).join("")}</div>`;
}
const unitCard = (title, meta, cls, locked) => `<div class="unitc ${cls || ""}"><span class="ut">${esc(title)}</span><span class="um"> · ${esc(meta)}</span>${locked ? `<span class="lk">${esc(locked)}</span>` : ""}</div>`;
const screen = (title, rows, foot) => `<div class="docv"><p class="small" style="margin:0 0 6px"><b>${esc(title)}</b></p>${rows.map(r => `<p>${r}</p>`).join("")}${foot ? `<p class="small" style="margin-top:6px">${foot}</p>` : ""}</div>`;

const FILEI = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/></svg>`;
const BELL = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>`;
const person = k => PEOPLE[k] || [k, "", k.slice(0, 2).toUpperCase(), "p"];
const SHORT = { Calloway: "Dr. Calloway", Backup: "The backup reviewer", Translator: "A qualified translator", System: "The system" };
const first = k => SHORT[k] || person(k)[0].split(" ")[0];

/* The beats of one scene, each with the line the narrator says */
function beatsOf(s) {
  const sc = (SCENES[ACT.howIndex + ":" + s.key] || (() => ({})))(), st = sc.start || ["System", "event", s.label, ""], B = [];
  const verb = { upload: "adds a document", event: "", ask: "asks" }[st[1]];
  B.push({ k: "start", who: st[0], say: st[1] === "event" ? (st[0] === "System" ? st[2] : `${first(st[0])}: ${st[2]}`) : `${first(st[0])} ${verb}`, sc, st, label: st[1] === "upload" ? "Adds" : st[1] === "ask" ? "Asks" : "Trigger" });
  const sys = /^Rule/i.test(((s.fix4 || {}).kind) || "") || /system checks|clock|reminder reads|diff|Drift|Only the approved|linked Spanish/.test(sc.ai || "");
  B.push({ k: "ai", who: sys ? "System" : "AI", say: sc.ai || "The AI proposes", sc, label: sys ? "Rules check" : "AI works" });
  (sc.decide || []).forEach(d => B.push({ k: "decide", who: d[0], say: `${first(d[0])} decides`, d, label: first(d[0]).replace(/^The b/, "B").replace(/^A q/, "Q") + " decides" }));
  B.push({ k: "end", who: "", say: "The result", label: "Result" });
  return B;
}
function feedItem(who, say, body, cls) {
  const p = person(who);
  return `<div class="fe ${p[3]} ${cls || ""}"><span class="av">${p[3] === "ai" ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>` : esc(p[2])}</span>
    <div class="fb"><p class="fh"><b>${esc(p[0])}</b>${p[1] ? ` · ${esc(p[1])}` : ""}</p><p class="fs">${esc(say)}</p>${body ? `<div class="fp">${body}</div>` : ""}</div></div>`;
}
const SLOW = 2.0, wait = ms => new Promise(r => setTimeout(r, ms * SLOW));
const REVEAL = ".unitc, .docv > p, .docv > h5, .results > div, .cmp > div, .match, .chips2 span, .phone .sms";

function shell(s, B) {
  const nextS = STEPS[nextOf(cur)], nextHow = HOW4[ACT.howIndex + 1], f = s.fix4 || {}, g = groupOf(cur), G = GROUPS[g] || [s.label, [cur]], parts = G[1].length, part = G[1].indexOf(cur) + 1;
  const nextLabel = nextS ? (groupOf(nextOf(cur)) === g ? `Next: part ${part + 1}, ${nextS.label}` : `Next: ${GROUPS[g + 1][0]}`) : "";
  document.getElementById("stage").innerHTML = `
    <p class="eyebrow">${esc(ACT.lead)}${parts > 1 ? ` <span class="lv-part">· step ${g + 1}, part ${part} of ${parts}</span>` : ""}</p>
    <h2 class="hl">${esc(f.line || s.label)}</h2>
    <p class="was1"><b>Today:</b> ${esc((s.issue || [])[0] || "")}</p>
    <div class="beats">${B.map((b, i) => `<span data-b="${i}">${esc(b.label)}</span>`).join("")}</div>
    <p class="narr" id="narr">&nbsp;</p>
    ${s.live ? `<div class="lv-ask"><input id="liveQ" value="${esc(LIVE_Q || s.live)}" aria-label="Ask as June"><button class="btn sm primary" id="liveAsk">Ask as June</button><span class="small" style="flex-basis:100%">Or pick one:</span>${(s.chips || []).map(c => `<button class="lv-chip" data-q="${esc(c)}">${esc(c)}</button>`).join("")}</div>` : ""}
    <div class="appwin"><div class="appbar"><i></i><i></i><i></i><span>Lakewell Knowledge · ${esc(HOW4[ACT.howIndex][0])}</span><div class="lv-tabs"><button class="on" data-pane="feed">Feed</button><button data-pane="audit" id="auditN">Audit (${AUDIT.length})</button></div><span style="flex:1"></span><span class="lv-clock" id="clock">${hhmmss()}</span><span class="lv-bell" aria-label="Notifications"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg><b id="bellN" ${BELLS ? "" : "hidden"}>${BELLS}</b></span><button class="btn sm" id="replay">↻ Replay</button><button class="btn sm" id="skip">Skip to result</button></div><div class="feed" id="feed"></div><div class="lv-audit" id="auditPane" hidden><table><tbody id="auditRows">${AUDIT.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div></div>
    <div id="endc" class="endc" hidden>
      <div class="now"><b>Result</b>${esc(f.line || "")}<span class="forj">For June: ${esc((s.fix || [])[1] || "")} <a href="day.html?mode=new&ch=${encodeURIComponent(s.ch)}">See it in the ${esc(CH_NAME[s.ch].toLowerCase())} →</a></span></div>
      <div class="meta3"><span><b>Owner</b> ${esc(f.who || "")}</span><span><b>Control</b> ${esc(f.kind || "")}</span><span><b>Proof</b> ${esc(f.proof || "")}</span></div>
      <div class="foot"><span></span>${nextS ? `<button class="btn primary" id="nextch">${esc(nextLabel)} →</button>` : nextHow ? `<a class="btn primary" href="${nextHow[1]}?play=${playing ? 1 : 0}">Next: ${esc(nextHow[0])} →</a>` : `<a class="btn primary" href="day.html?mode=new">Next: the future state →</a>`}</div></div>`;
}
async function scene(fast) {
  const my = ++run, s = STEPS[cur], B = beatsOf(s), T = ms => fast ? 0 : ms, live = () => my === run;
  shell(s, B);
  document.getElementById("replay").onclick = () => scene(false);
  document.getElementById("skip").onclick = () => scene(true);
  const n = document.getElementById("nextch"); if (n) n.onclick = () => { cur = nextOf(cur); draw(); scrollTo({ top: 0, behavior: SMOOTH }); };
  document.querySelectorAll(".lv-tabs button").forEach(b => b.onclick = () => { document.querySelectorAll(".lv-tabs button").forEach(x => x.classList.toggle("on", x === b)); document.getElementById("feed").hidden = b.dataset.pane !== "feed"; document.getElementById("auditPane").hidden = b.dataset.pane !== "audit"; });
  const ask = document.getElementById("liveAsk"); if (ask) { const go = q => { LIVE_Q = q; playing = false; scene(false); }; ask.onclick = () => go(document.getElementById("liveQ").value); document.getElementById("liveQ").onkeydown = e => { if (e.key === "Enter") go(e.target.value); }; document.querySelectorAll(".lv-chip").forEach(c => c.onclick = () => go(c.dataset.q)); }
  const feed = document.getElementById("feed"), narr = document.getElementById("narr");
  const on = i => { document.querySelectorAll("[data-b]").forEach((x, j) => x.className = j < i ? "done" : j === i ? "on" : ""); narr.textContent = B[i].say; };
  const down = () => feed.scrollTo({ top: feed.scrollHeight, behavior: fast ? "auto" : SMOOTH });
  const push = html => { feed.insertAdjacentHTML("beforeend", html); const el = feed.lastElementChild; down(); return el; };
  const reveal = async el => { const rows = [...el.querySelectorAll(REVEAL)]; if (fast) return; rows.forEach(r => r.classList.add("rv")); for (const r of rows) { if (!live()) return; await wait(520); r.classList.add("in"); down(); } };
  for (let i = 0; i < B.length; i++) {
    if (!live()) return; const b = B[i]; on(i);
    if (b.k === "start") { const [who, kind, title, meta] = b.st;
      const body = kind === "upload" ? `<div class="filec"><span class="fi">${FILEI}</span><div><b>${esc(title)}</b><span class="small">${esc(meta)}</span><div class="bar"><i style="${fast ? "width:100%" : ""}"></i></div></div></div>`
        : kind === "ask" ? `<div class="askb">${esc(title)}</div><span class="small">${esc(meta)}</span>` : `<div class="filec ev"><span class="fi">${BELL}</span><div><b>${esc(meta)}</b></div></div>`;
      const el = push(feedItem(who, kind === "upload" ? "Adds a document" : kind === "ask" ? "Asks" : title, body));
      audit(person(who)[0], kind === "upload" ? `Added ${title}` : kind === "ask" ? `Asked: "${title}" · redacted before storage` : title);
      if (kind === "upload" && !fast) { await wait(150); el.querySelector(".bar i").style.width = "100%"; await wait(1300); el.querySelector(".bar").outerHTML = `<span class="ok3">✓ Uploaded</span>`; }
      else await wait(T(1400));
      if (b.sc.src) { const sv = push(feedItem("AI", "Reading it", `<div class="scan">${b.sc.src}</div>`)); if (!fast) { sv.querySelector(".scan").classList.add("go"); await wait(2200); } }
    }
    if (b.k === "ai") { const el = push(feedItem(b.who, b.say, `<div class="think"><i></i><i></i><i></i></div>`));
      await wait(T(1100)); if (!live()) return;
      const html = b.sc.show || (s.now ? s.now() : ""), R = s.live ? window.LIVE_R : null;
      if (R && R.trace) { const tk = document.createElement("div"); tk.className = "lv-tick"; el.querySelector(".fp").innerHTML = ""; el.querySelector(".fp").appendChild(tk);
        for (const t of R.trace) { const sp = document.createElement("span"); sp.className = "run"; sp.textContent = t; tk.appendChild(sp); down(); await wait(T(600)); if (!live()) return; sp.classList.remove("run"); }
        tk.insertAdjacentHTML("afterend", html); audit("System", R.kind === "answer" ? `Served ${R.unit.id} v${R.unit.version} to ${R.role} on ${R.channel} · exact wording rendered by template` : `No approved topic answered · abstained · gap log +1`); bell(); }
      else el.querySelector(".fp").innerHTML = html;
      down(); await typeInto(el, fast); await reveal(el); await wait(T(700)); }
    if (b.k === "decide") { const [who, btn, out] = b.d, p = person(who);
      const el = push(feedItem(who, "Reviews and decides", `<div class="dec"><button class="btn sm primary fakeb" tabindex="-1" aria-hidden="true">${esc(btn)}</button><span class="cursor"></span></div>`));
      await wait(T(1100)); if (!live()) return; el.querySelector(".fakeb").classList.add("press"); await wait(T(450));
      el.querySelector(".dec").innerHTML = `<span class="stampd">✓ ${esc(btn)}</span><span class="small">${esc(p[0])} · ${esc(out)}</span>`; audit(p[0], `${btn} · ${out}`); bell(); await wait(T(1300)); }
    if (b.k === "end") { document.getElementById("endc").hidden = false; document.querySelectorAll("[data-b]").forEach(x => x.className = "done"); narr.textContent = "Done. " + ((s.fix || [])[1] || "");
      if (!fast) document.getElementById("endc").scrollIntoView({ block: "nearest", behavior: SMOOTH }); }
  }
  return my;
}
function draw() {
  document.getElementById("stepper").innerHTML = storyStepper(2);
  document.getElementById("how4").innerHTML = HOW4.map(([n, h], i) => `<a href="${h}" class="${i === ACT.howIndex ? "on" : ""}"><i>${i + 1}</i>${esc(n)}</a>`).join("");
  const here = document.getElementById("here"); if (here) { const H = HOW4[ACT.howIndex]; here.innerHTML = `Job ${ACT.howIndex + 1} of 4 on the <a href="day.html?mode=approach">Solution architecture map</a>: <b>${esc(H[0])}</b>. ${esc(H[3] || "")}`; }
  const g = groupOf(cur); document.getElementById("tabs").classList.toggle("many", GROUPS.length > 6);
  document.getElementById("tabs").innerHTML = GROUPS.map((x, i) => `<button data-t="${x[1][0]}" class="${i === g ? "on" : i < g ? "done" : ""}"><i>${i + 1}</i><span>${esc(x[0])}${x[1].length > 1 ? `<em class="lv-parts">${x[1].length} parts</em>` : ""}</span></button>`).join("");
  document.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { playing = false; cur = +b.dataset.t; draw(); });
  return scene(false);
}
document.getElementById("play").onclick = async () => { playing = true; cur = playFrom; playFrom = ORDER[0];
  while (playing) { const my = await draw(); if (!playing || my !== run) return; await wait(2500); if (!playing || my !== run) return;
    if (nextOf(cur) !== undefined) cur = nextOf(cur); else { const nx = HOW4[ACT.howIndex + 1]; location.href = nx ? nx[1] + "?play=1" : "day.html?mode=new"; return; } } };
document.getElementById("stop").onclick = () => { playing = false; run++; };
/* Audit A-072: the same stand-in line as Solution architecture, always shown under How it works */
document.querySelector("main").insertAdjacentHTML("beforeend", `<p class="small" style="margin-top:14px">Built to run without a server or API key: text matching stands in for embeddings, semantic deduplication, hybrid and graph retrieval, and ingest replays a recorded model run. The AI steps on these pages are scripted, except the answer on Job 3, which the prototype computes when the page runs.</p>`);
if (QS.get("play") === "1") document.getElementById("play").click(); else draw();
