/* WakeWork — schedule-aware alarm clock for Indian working professionals.
 * Pure scheduling engine + localStorage state + WebAudio ringer.
 * No dependencies; everything runs on-device. */

"use strict";

/* ============================== helpers ============================== */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const uid = () => Math.random().toString(36).slice(2, 10);

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function dateKey(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function parseKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function hm(date) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(date.getHours())}:${p(date.getMinutes())}`;
}
function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function fromMin(min) {
  min = ((min % 1440) + 1440) % 1440;
  const p = (n) => String(n).padStart(2, "0");
  return `${p(Math.floor(min / 60))}:${p(min % 60)}`;
}
function fmt12(t) {
  let [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}
function niceDate(key) {
  const d = parseKey(key);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ============================== holiday preset ============================== */
/* India 2026 — gazetted + widely observed. tentative = lunar calendar, may shift. */

const HOLIDAYS_2026 = [
  ["2026-01-01", "New Year's Day", false],
  ["2026-01-14", "Makar Sankranti / Pongal", false],
  ["2026-01-26", "Republic Day", false],
  ["2026-02-15", "Maha Shivaratri", false],
  ["2026-03-04", "Holi", false],
  ["2026-03-21", "Eid-ul-Fitr", true],
  ["2026-03-26", "Ram Navami", false],
  ["2026-03-31", "Mahavir Jayanti", false],
  ["2026-04-03", "Good Friday", false],
  ["2026-04-14", "Dr Ambedkar Jayanti", false],
  ["2026-05-01", "Buddha Purnima / May Day", false],
  ["2026-05-27", "Eid-ul-Zuha (Bakrid)", true],
  ["2026-06-26", "Muharram", true],
  ["2026-08-15", "Independence Day", false],
  ["2026-08-26", "Milad-un-Nabi", true],
  ["2026-09-04", "Janmashtami", false],
  ["2026-09-14", "Ganesh Chaturthi", false],
  ["2026-10-02", "Gandhi Jayanti", false],
  ["2026-10-20", "Dussehra (Vijaya Dashami)", false],
  ["2026-11-08", "Diwali (Deepavali)", false],
  ["2026-11-24", "Guru Nanak Jayanti", false],
  ["2026-12-25", "Christmas Day", false],
].map(([date, name, tentative]) => ({ id: uid(), date, name, tentative, enabled: true, custom: false }));

/* ============================== state ============================== */

const STORE_KEY = "wakework_v1";

function defaultState() {
  return {
    alarms: [{
      id: uid(), time: "07:00", label: "Office wake-up",
      days: [1, 2, 3, 4, 5], enabled: true,
      skipHolidays: true, smart: true,
      wfhMode: "shift", wfhTime: "08:30",
      sound: "classic", snooze: 10,
    }],
    holidays: HOLIDAYS_2026,
    overrides: [],   // {id, date, type: wfh|early|leave|custom, time?, note?}
    meetings: [],    // {date, time, title} — first meetings from .ics import
    settings: { prep: 45, commute: 40, threshold: "10:00", wfhShift: 60 },
  };
}

function loadState() {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(STORE_KEY) : null;
    if (raw) {
      const s = JSON.parse(raw);
      s.settings = Object.assign(defaultState().settings, s.settings || {});
      return s;
    }
  } catch (e) { /* corrupted store — start fresh */ }
  return defaultState();
}

let state = loadState();
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) { /* storage unavailable (private mode etc.) — keep running in-memory */ }
}

/* ============================== scheduling engine ==============================
 * Single source of truth: what rings on date D, at what time, and why.
 * Used by the week preview, the next-alarm banner, and the live ticker. */

function holidayOn(key) {
  return state.holidays.find((h) => h.enabled && h.date === key) || null;
}
function overrideOn(key) {
  return state.overrides.find((o) => o.date === key) || null;
}

/* Returns [{alarm, time|null, skipped, why}] for every alarm scheduled on D. */
function scheduleFor(dateObj) {
  const key = dateKey(dateObj);
  const dow = dateObj.getDay();
  const hol = holidayOn(key);
  const ov = overrideOn(key);
  const out = [];

  for (const a of state.alarms) {
    if (!a.days.includes(dow)) continue;
    if (!a.enabled) continue;

    if (a.smart && ov && ov.type === "leave") {
      out.push({ alarm: a, time: null, skipped: true, why: "On leave" });
      continue;
    }
    if (a.skipHolidays && hol) {
      out.push({ alarm: a, time: null, skipped: true, why: `Holiday: ${hol.name}` });
      continue;
    }

    let time = a.time;
    let why = "";
    if (a.smart && ov) {
      if (ov.type === "wfh") {
        if (a.wfhMode === "shift") {
          time = fromMin(toMin(a.time) + state.settings.wfhShift);
          why = `WFH, +${state.settings.wfhShift} min`;
        } else if (a.wfhMode === "time") {
          time = a.wfhTime;
          why = "WFH time";
        } else {
          why = "WFH (unchanged)";
        }
      } else if (ov.type === "early" || ov.type === "custom") {
        time = ov.time;
        why = (ov.type === "early" ? "Early start" : "Custom") + (ov.note ? ` — ${ov.note}` : "");
      }
    }
    out.push({ alarm: a, time, skipped: false, why });
  }
  out.sort((x, y) => (x.time || "99").localeCompare(y.time || "99"));
  return out;
}

/* Next ringing alarm within 7 days: {dateObj, key, time, alarm} or null. */
function nextAlarm() {
  const now = new Date();
  const nowHM = hm(now);
  for (let i = 0; i < 8; i++) {
    const d = addDays(now, i);
    for (const e of scheduleFor(d)) {
      if (e.skipped) continue;
      if (i === 0 && e.time <= nowHM) continue;
      return { dateObj: d, key: dateKey(d), time: e.time, alarm: e.alarm, why: e.why };
    }
  }
  return null;
}

/* ============================== ICS parsing ==============================
 * Minimal parser: unfold lines, pull DTSTART + SUMMARY from each VEVENT.
 * Handles UTC (...Z), TZID values (treated as local — fine for Asia/Kolkata
 * calendars), and skips all-day events. */

function parseICS(text) {
  const lines = text.split(/\r?\n/);
  const unfolded = [];
  for (const line of lines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && unfolded.length) {
      unfolded[unfolded.length - 1] += line.slice(1);
    } else {
      unfolded.push(line);
    }
  }
  const events = [];
  let cur = null;
  for (const line of unfolded) {
    if (line === "BEGIN:VEVENT") { cur = {}; continue; }
    if (line === "END:VEVENT") {
      if (cur && cur.start) events.push(cur);
      cur = null;
      continue;
    }
    if (!cur) continue;
    if (line.startsWith("DTSTART")) {
      const val = line.slice(line.indexOf(":") + 1).trim();
      if (/VALUE=DATE[^T]/.test(line) || /^\d{8}$/.test(val)) continue; // all-day
      const m = val.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z?)$/);
      if (!m) continue;
      const [, y, mo, da, h, mi, , z] = m;
      cur.start = z === "Z"
        ? new Date(Date.UTC(+y, +mo - 1, +da, +h, +mi))
        : new Date(+y, +mo - 1, +da, +h, +mi);
    } else if (line.startsWith("SUMMARY")) {
      cur.title = line.slice(line.indexOf(":") + 1).trim();
    }
  }
  return events;
}

/* First timed event per day for the next `horizon` days. */
function firstMeetings(events, horizon = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = addDays(today, horizon);
  const byDay = {};
  for (const ev of events) {
    if (!ev.start || ev.start < today || ev.start >= end) continue;
    const key = dateKey(ev.start);
    const t = hm(ev.start);
    if (!byDay[key] || t < byDay[key].time) {
      byDay[key] = { date: key, time: t, title: ev.title || "(untitled meeting)" };
    }
  }
  return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
}

/* Wake-time suggestions from imported first meetings. */
function meetingSuggestions() {
  const s = state.settings;
  const out = [];
  for (const mt of state.meetings) {
    if (mt.time >= s.threshold) continue;
    const ov = overrideOn(mt.date);
    if (ov && ov.type === "leave") continue;
    const isWfh = !!(ov && ov.type === "wfh");
    const wake = fromMin(toMin(mt.time) - s.prep - (isWfh ? 0 : s.commute));
    const day = scheduleFor(parseKey(mt.date));
    const current = day.find((e) => !e.skipped);
    // Only suggest if it actually buys time: no alarm that day, or alarm too late.
    if (current && current.time <= wake) continue;
    out.push({ ...mt, wake, isWfh, currentTime: current ? current.time : null });
  }
  return out;
}

/* ============================== ringer (WebAudio) ============================== */

const Ringer = {
  ctx: null, timer: null,
  start(sound) {
    this.stop();
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return; }
    const patterns = {
      classic: { type: "square", freq: 880, on: 180, gap: 140, vol: 0.18, every: 700 },
      gentle:  { type: "sine",   freq: 523, on: 450, gap: 250, vol: 0.10, every: 1500 },
      urgent:  { type: "sawtooth", freq: 1040, on: 120, gap: 80, vol: 0.22, every: 450 },
    };
    const p = patterns[sound] || patterns.classic;
    const beep = () => {
      const t0 = this.ctx.currentTime;
      for (let i = 0; i < 2; i++) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = p.type;
        osc.frequency.value = p.freq * (i ? 1.25 : 1);
        g.gain.setValueAtTime(p.vol, t0 + i * (p.on + p.gap) / 1000);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + (i * (p.on + p.gap) + p.on) / 1000);
        osc.connect(g).connect(this.ctx.destination);
        osc.start(t0 + i * (p.on + p.gap) / 1000);
        osc.stop(t0 + (i * (p.on + p.gap) + p.on) / 1000 + 0.05);
      }
    };
    beep();
    this.timer = setInterval(beep, p.every);
  },
  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.ctx) { this.ctx.close().catch(() => {}); this.ctx = null; }
  },
};

/* ============================== alarm ticker ============================== */

let firedKeys = new Set();        // "date|alarmId|HH:MM" already rung this session
let snoozes = [];                 // {atMs, alarm, why}
let ringing = null;               // {alarm, why}

function tick() {
  renderClock();
  const now = new Date();
  const nowHM = hm(now);
  if (!ringing) {
    // snoozed alarms
    const due = snoozes.find((s) => Date.now() >= s.atMs);
    if (due) {
      snoozes = snoozes.filter((s) => s !== due);
      startRing(due.alarm, "Snoozed alarm");
      return;
    }
    // scheduled alarms
    for (const e of scheduleFor(now)) {
      if (e.skipped || e.time !== nowHM) continue;
      const k = `${dateKey(now)}|${e.alarm.id}|${e.time}`;
      if (firedKeys.has(k)) continue;
      firedKeys.add(k);
      startRing(e.alarm, e.why);
      return;
    }
  }
}

function startRing(alarm, why) {
  ringing = { alarm, why };
  $("#ringTime").textContent = fmt12(hm(new Date()));
  $("#ringLabel").textContent = alarm.label || "Wake up!";
  $("#ringReason").textContent = why || "";
  $("#ringOverlay").classList.remove("hidden");
  Ringer.start(alarm.sound);
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("⏰ " + (alarm.label || "WakeWork alarm"), {
        body: why || "Time to wake up!", tag: "wakework",
      });
    } catch (e) { /* notification constructor unsupported in some browsers */ }
  }
}

function stopRing(snooze) {
  if (!ringing) return;
  if (snooze) {
    snoozes.push({
      atMs: Date.now() + (ringing.alarm.snooze || 10) * 60000,
      alarm: ringing.alarm,
    });
  }
  ringing = null;
  Ringer.stop();
  $("#ringOverlay").classList.add("hidden");
  renderAll();
}

/* ============================== rendering ============================== */

function renderClock() {
  const now = new Date();
  $("#clockTime").textContent = fmt12(hm(now));
  $("#clockDate").textContent = now.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function renderNextAlarm() {
  const el = $("#nextAlarmBanner");
  const n = nextAlarm();
  if (!n) {
    el.textContent = "No alarms in the next 7 days";
    el.classList.add("none");
    return;
  }
  el.classList.remove("none");
  const todayKey = dateKey(new Date());
  const tomorrowKey = dateKey(addDays(new Date(), 1));
  const dayName = n.key === todayKey ? "Today" : n.key === tomorrowKey ? "Tomorrow" : niceDate(n.key);
  el.textContent = `Next: ${dayName} ${fmt12(n.time)}` + (n.why ? ` · ${n.why}` : "");
}

function daysLabel(days) {
  const sorted = [...days].sort();
  if (sorted.join() === "1,2,3,4,5") return "Weekdays";
  if (sorted.join() === "0,1,2,3,4,5,6") return "Every day";
  if (sorted.join() === "0,6") return "Weekends";
  return sorted.map((d) => DAY_NAMES[d]).join(" ");
}

function renderAlarms() {
  const list = $("#alarmList");
  if (!state.alarms.length) {
    list.innerHTML = '<p class="hint">No alarms yet — add your office wake-up below.</p>';
    return;
  }
  list.innerHTML = state.alarms.map((a) => `
    <div class="alarm-card ${a.enabled ? "" : "off"}" data-id="${a.id}">
      <div class="alarm-main" data-act="edit">
        <div class="alarm-time">${fmt12(a.time)}</div>
        <div class="alarm-meta">${esc(a.label || "Alarm")} · ${daysLabel(a.days)} · snooze ${a.snooze}m</div>
        <div class="alarm-badges">
          ${a.skipHolidays ? '<span class="badge hol">skips holidays</span>' : ""}
          ${a.smart ? '<span class="badge smart">smart adjust</span>' : '<span class="badge">always rings</span>'}
        </div>
      </div>
      <label class="switch"><input type="checkbox" data-act="toggle" ${a.enabled ? "checked" : ""}><span class="slider"></span></label>
      <button class="icon-btn" data-act="delete" title="Delete">🗑</button>
    </div>`).join("");
}

function renderWeek() {
  const todayKey = dateKey(new Date());
  const rows = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(new Date(), i);
    const key = dateKey(d);
    const hol = holidayOn(key);
    const ov = overrideOn(key);
    const entries = scheduleFor(d);
    const tags = [];
    if (hol) tags.push(`<span class="day-tag holiday">🎉 ${esc(hol.name)}</span>`);
    if (ov) {
      const t = { wfh: ["wfh", "🏠 WFH"], leave: ["leave", "🌴 Leave"], early: ["early", "⏪ Early"], custom: ["early", "🕑 Custom"] }[ov.type];
      tags.push(`<span class="day-tag ${t[0]}">${t[1]}</span>`);
    }
    const body = entries.length
      ? entries.map((e) => e.skipped
          ? `<div><span class="da-time da-skip">${fmt12(e.alarm.time)}</span> ${esc(e.alarm.label)} <span class="da-why">— ${esc(e.why)}</span></div>`
          : `<div><span class="da-time">${fmt12(e.time)}</span> ${esc(e.alarm.label)} ${e.why ? `<span class="da-why shift">· ${esc(e.why)}</span>` : ""}</div>`
        ).join("")
      : '<div class="da-why">No alarms scheduled</div>';
    const quick = ov
      ? `<button class="qbtn" data-clear="${key}">✕ Clear ${ov.type}</button>`
      : `<button class="qbtn" data-quick="wfh" data-date="${key}">🏠 WFH</button>
         <button class="qbtn" data-quick="leave" data-date="${key}">🌴 Leave</button>
         <button class="qbtn" data-quick="early" data-date="${key}">⏪ Early…</button>`;
    rows.push(`
      <div class="day-row ${key === todayKey ? "today" : ""}">
        <div class="day-head">
          <span class="day-name">${i === 0 ? "Today" : i === 1 ? "Tomorrow" : niceDate(key)}</span>
          <span>${tags.join(" ")}</span>
        </div>
        <div class="day-alarms">${body}</div>
        <div class="day-quick">${quick}</div>
      </div>`);
  }
  $("#weekList").innerHTML = rows.join("");

  const todayK = dateKey(new Date());
  const future = state.overrides.filter((o) => o.date >= todayK).sort((a, b) => a.date.localeCompare(b.date));
  $("#overrideList").innerHTML = future.length
    ? future.map((o) => {
        const label = { wfh: "🏠 WFH", leave: "🌴 On leave", early: "⏪ Early start", custom: "🕑 Custom" }[o.type];
        return `<div class="ov-row" data-id="${o.id}">
          <span class="ov-date">${niceDate(o.date)}</span>
          <span class="grow">${label}${o.time ? " · " + fmt12(o.time) : ""}${o.note ? `<div class="ov-note">${esc(o.note)}</div>` : ""}</span>
          <button class="icon-btn" data-act="del-ov" title="Remove">🗑</button>
        </div>`;
      }).join("")
    : '<p class="hint">None yet. WFH days, leaves and early starts you add appear here.</p>';
}

let showPastHolidays = false;
let editingHolidayId = null;

function renderHolidays() {
  const todayK = dateKey(new Date());
  const sorted = [...state.holidays].sort((a, b) => a.date.localeCompare(b.date));
  const past = sorted.filter((h) => h.date < todayK);
  const upcoming = sorted.filter((h) => h.date >= todayK);
  const visible = showPastHolidays ? sorted : upcoming;
  const enabledCount = upcoming.filter((h) => h.enabled).length;

  const row = (h) => `
    <div class="hol-row ${h.date < todayK ? "past" : ""} ${h.enabled ? "" : "off-h"}" data-id="${h.id}">
      ${h.id === editingHolidayId
        ? `<input type="date" class="hol-date-input" value="${h.date}">`
        : `<button class="hol-date" data-act="edit-date" title="Change date">${niceDate(h.date)} ✎</button>`}
      <span class="hol-name">${esc(h.name)} ${h.tentative ? '<span class="tentative" title="Lunar date — tentative, tap the date to fix">~</span>' : ""}</span>
      <label class="switch"><input type="checkbox" data-act="toggle-h" ${h.enabled ? "checked" : ""}><span class="slider"></span></label>
      <button class="icon-btn" data-act="del-h" title="Delete">🗑</button>
    </div>`;

  $("#holidayList").innerHTML =
    `<p class="hint">${upcoming.length} upcoming · ${enabledCount} will skip alarms</p>` +
    visible.map(row).join("") +
    (past.length && !showPastHolidays
      ? `<button class="btn btn-ghost btn-small btn-wide" id="showPastHol">Show ${past.length} past holidays</button>`
      : "") +
    (showPastHolidays && past.length
      ? `<button class="btn btn-ghost btn-small btn-wide" id="hidePastHol">Hide past holidays</button>`
      : "");
}

function renderSuggestions() {
  $("#thresholdEcho").textContent = fmt12(state.settings.threshold);
  const box = $("#suggestionList");
  if (!state.meetings.length) {
    box.innerHTML = "";
    return;
  }
  const sugs = meetingSuggestions();
  const head = `<h3>Early meetings found</h3>`;
  if (!sugs.length) {
    box.innerHTML = head + `<p class="hint">No first-meetings before ${fmt12(state.settings.threshold)} in the imported window that need an earlier alarm. 😌</p>`;
    return;
  }
  box.innerHTML = head + sugs.map((s) => `
    <div class="sug-card">
      <div class="sug-head">${niceDate(s.date)} — first meeting ${fmt12(s.time)}</div>
      <div class="hint">${esc(s.title)}${s.isWfh ? " · WFH day, commute skipped" : ""}</div>
      <div>Suggested wake-up: <b>${fmt12(s.wake)}</b>
        ${s.currentTime ? `<span class="hint">(currently ${fmt12(s.currentTime)})</span>` : '<span class="hint">(no alarm set that day)</span>'}
      </div>
      <div class="form-actions">
        <button class="btn btn-primary btn-small" data-apply-date="${s.date}" data-apply-time="${s.wake}" data-apply-note="${esc(s.title)}">Apply as early start</button>
      </div>
    </div>`).join("");
}

function renderSettings() {
  const s = state.settings;
  $("#setPrep").value = s.prep;
  $("#setCommute").value = s.commute;
  $("#setThreshold").value = s.threshold;
  $("#setWfhShift").value = s.wfhShift;
  const btn = $("#notifBtn");
  if (!("Notification" in window)) btn.textContent = "Unsupported";
  else if (Notification.permission === "granted") btn.textContent = "Enabled ✓";
  else btn.textContent = "Enable";
}

function renderAll() {
  renderClock();
  renderNextAlarm();
  renderAlarms();
  renderWeek();
  renderHolidays();
  renderSuggestions();
  renderSettings();
}

/* ============================== alarm form ============================== */

function openAlarmForm(alarm) {
  $("#alarmFormTitle").textContent = alarm ? "Edit alarm" : "New alarm";
  $("#afId").value = alarm ? alarm.id : "";
  $("#afTime").value = alarm ? alarm.time : "07:00";
  $("#afLabel").value = alarm ? alarm.label : "";
  $("#afSkipHolidays").checked = alarm ? alarm.skipHolidays : true;
  $("#afSmart").checked = alarm ? alarm.smart : true;
  $("#afWfhMode").value = alarm ? alarm.wfhMode : "shift";
  $("#afWfhTime").value = alarm ? alarm.wfhTime : "08:30";
  $("#afWfhTime").classList.toggle("hidden", $("#afWfhMode").value !== "time");
  $("#afSound").value = alarm ? alarm.sound : "classic";
  $("#afSnooze").value = alarm ? alarm.snooze : 10;
  const days = alarm ? alarm.days : [1, 2, 3, 4, 5];
  $$("#afDays .chip").forEach((c) => c.classList.toggle("on", days.includes(+c.dataset.day)));
  $("#alarmForm").classList.remove("hidden");
  $("#alarmForm").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function saveAlarmForm() {
  const days = $$("#afDays .chip.on").map((c) => +c.dataset.day);
  if (!days.length) { alert("Pick at least one repeat day."); return; }
  const data = {
    time: $("#afTime").value || "07:00",
    label: $("#afLabel").value.trim() || "Alarm",
    days,
    skipHolidays: $("#afSkipHolidays").checked,
    smart: $("#afSmart").checked,
    wfhMode: $("#afWfhMode").value,
    wfhTime: $("#afWfhTime").value || "08:30",
    sound: $("#afSound").value,
    snooze: Math.max(1, Math.min(30, +$("#afSnooze").value || 10)),
  };
  const id = $("#afId").value;
  if (id) {
    const a = state.alarms.find((x) => x.id === id);
    if (a) Object.assign(a, data);
  } else {
    state.alarms.push({ id: uid(), enabled: true, ...data });
  }
  save();
  $("#alarmForm").classList.add("hidden");
  renderAll();
}

/* ============================== events ============================== */

function bindEvents() {
  // tabs
  $("#tabs").addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    switchTab(btn.dataset.tab);
  });
  document.body.addEventListener("click", (e) => {
    const goto = e.target.closest("[data-goto]");
    if (goto) { e.preventDefault(); switchTab(goto.dataset.goto); }
  });

  // alarms
  $("#addAlarmBtn").addEventListener("click", () => openAlarmForm(null));
  $("#afCancel").addEventListener("click", () => $("#alarmForm").classList.add("hidden"));
  $("#afSave").addEventListener("click", saveAlarmForm);
  $("#afWfhMode").addEventListener("change", () =>
    $("#afWfhTime").classList.toggle("hidden", $("#afWfhMode").value !== "time"));
  $("#afDays").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) chip.classList.toggle("on");
  });
  $("#afPreviewSound").addEventListener("click", () => {
    Ringer.start($("#afSound").value);
    setTimeout(() => Ringer.stop(), 2200);
  });
  $("#alarmList").addEventListener("click", (e) => {
    const card = e.target.closest(".alarm-card");
    if (!card) return;
    const a = state.alarms.find((x) => x.id === card.dataset.id);
    if (!a) return;
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "toggle") {
      a.enabled = e.target.checked;
      save(); renderAll();
    } else if (act === "delete") {
      if (confirm(`Delete "${a.label}"?`)) {
        state.alarms = state.alarms.filter((x) => x !== a);
        save(); renderAll();
      }
    } else if (act === "edit") {
      openAlarmForm(a);
    }
  });

  // week: quick overrides + list
  $("#weekList").addEventListener("click", (e) => {
    const clear = e.target.closest("[data-clear]");
    if (clear) {
      state.overrides = state.overrides.filter((o) => o.date !== clear.dataset.clear);
      save(); renderAll(); return;
    }
    const q = e.target.closest("[data-quick]");
    if (!q) return;
    const date = q.dataset.date;
    const type = q.dataset.quick;
    if (type === "early") {
      const t = prompt("Wake-up time for that day (HH:MM, 24h):", "06:00");
      if (!t || !/^\d{1,2}:\d{2}$/.test(t)) return;
      state.overrides.push({ id: uid(), date, type: "early", time: fromMin(toMin(t)), note: "" });
    } else {
      state.overrides.push({ id: uid(), date, type, note: "" });
    }
    save(); renderAll();
  });
  $("#overrideList").addEventListener("click", (e) => {
    if (e.target.closest('[data-act="del-ov"]')) {
      const row = e.target.closest(".ov-row");
      state.overrides = state.overrides.filter((o) => o.id !== row.dataset.id);
      save(); renderAll();
    }
  });
  $("#ovType").addEventListener("change", () => {
    const t = $("#ovType").value;
    $("#ovTimeRow").classList.toggle("hidden", t === "leave" || t === "wfh");
  });
  $("#ovSave").addEventListener("click", () => {
    const date = $("#ovDate").value;
    if (!date) { alert("Pick a date."); return; }
    const type = $("#ovType").value;
    state.overrides = state.overrides.filter((o) => o.date !== date); // one override per day
    state.overrides.push({
      id: uid(), date, type,
      time: (type === "early" || type === "custom") ? ($("#ovTime").value || "06:00") : undefined,
      note: $("#ovNote").value.trim(),
    });
    save();
    $("#ovDate").value = ""; $("#ovNote").value = "";
    renderAll();
  });

  // holidays
  $("#holidayList").addEventListener("click", (e) => {
    if (e.target.closest("#showPastHol")) { showPastHolidays = true; renderHolidays(); return; }
    if (e.target.closest("#hidePastHol")) { showPastHolidays = false; renderHolidays(); return; }
    const row = e.target.closest(".hol-row");
    if (!row) return;
    const h = state.holidays.find((x) => x.id === row.dataset.id);
    if (!h) return;
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "toggle-h") {
      h.enabled = e.target.checked;
      save(); renderAll();
    } else if (act === "del-h") {
      if (confirm(`Remove "${h.name}" from your holiday list?`)) {
        state.holidays = state.holidays.filter((x) => x !== h);
        save(); renderAll();
      }
    } else if (act === "edit-date") {
      editingHolidayId = h.id;
      renderHolidays();
      const inp = $("#holidayList .hol-date-input");
      if (inp) inp.focus();
    }
  });
  // commit inline date edits
  $("#holidayList").addEventListener("change", (e) => {
    const inp = e.target.closest(".hol-date-input");
    if (!inp) return;
    const h = state.holidays.find((x) => x.id === editingHolidayId);
    if (h && /^\d{4}-\d{2}-\d{2}$/.test(inp.value)) {
      h.date = inp.value;
      h.tentative = false;
      save();
    }
    editingHolidayId = null;
    renderAll();
  });
  $("#holidayList").addEventListener("focusout", (e) => {
    if (e.target.closest(".hol-date-input") && editingHolidayId) {
      // change (if any) fires before focusout; this just closes the editor
      setTimeout(() => {
        if (editingHolidayId) { editingHolidayId = null; renderHolidays(); }
      }, 150);
    }
  });
  $("#hoSave").addEventListener("click", () => {
    const date = $("#hoDate").value, name = $("#hoName").value.trim();
    if (!date || !name) { alert("Need both a date and a name."); return; }
    state.holidays.push({ id: uid(), date, name, tentative: false, enabled: true, custom: true });
    save();
    $("#hoDate").value = ""; $("#hoName").value = "";
    renderAll();
  });

  // calendar import
  $("#icsFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const events = parseICS(String(reader.result));
        state.meetings = firstMeetings(events);
        save();
        $("#icsStatus").textContent =
          `Imported ${events.length} timed events · first-meeting found on ${state.meetings.length} of the next 14 days.`;
        renderAll();
      } catch (err) {
        $("#icsStatus").textContent = "Could not parse that file — is it a valid .ics export?";
      }
    };
    reader.readAsText(file);
  });
  $("#suggestionList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-apply-date]");
    if (!btn) return;
    const date = btn.dataset.applyDate;
    state.overrides = state.overrides.filter((o) => o.date !== date);
    state.overrides.push({
      id: uid(), date, type: "early",
      time: btn.dataset.applyTime, note: btn.dataset.applyNote,
    });
    save(); renderAll();
    switchTab("week");
  });

  // settings
  $("#setSave").addEventListener("click", () => {
    state.settings.prep = Math.max(5, +$("#setPrep").value || 45);
    state.settings.commute = Math.max(0, +$("#setCommute").value || 0);
    state.settings.threshold = $("#setThreshold").value || "10:00";
    state.settings.wfhShift = Math.max(0, +$("#setWfhShift").value || 60);
    save(); renderAll();
  });
  $("#notifBtn").addEventListener("click", () => {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then(renderSettings);
  });
  $("#testRing").addEventListener("click", () => {
    startRing(state.alarms[0] || { label: "Test alarm", sound: "classic", snooze: 10 }, "Test ring");
  });
  $("#resetAll").addEventListener("click", () => {
    if (confirm("Reset all alarms, overrides, holidays and settings?")) {
      localStorage.removeItem(STORE_KEY);
      state = defaultState();
      renderAll();
    }
  });

  // ring overlay
  $("#snoozeBtn").addEventListener("click", () => stopRing(true));
  $("#dismissBtn").addEventListener("click", () => stopRing(false));
}

function switchTab(name) {
  $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
  $$(".panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + name));
}

/* ============================== boot ============================== */

if (typeof document !== "undefined" && document.getElementById("clockTime")) {
  bindEvents();
  $("#ovTimeRow").classList.toggle("hidden", ["leave", "wfh"].includes($("#ovType").value));
  renderAll();
  setInterval(tick, 1000);
}

/* Exported for node-based sanity tests. */
if (typeof module !== "undefined") {
  module.exports = {
    scheduleFor, nextAlarm, parseICS, firstMeetings, meetingSuggestions,
    fromMin, toMin, dateKey,
    _setState: (s) => { state = s; },
    defaultState, HOLIDAYS_2026,
  };
}
