/* Node sanity tests for the WakeWork scheduling engine: node alarm/test.js */
"use strict";
const W = require("./alarm.js");

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n      got:  ${JSON.stringify(got)}\n      want: ${JSON.stringify(want)}`}`);
}

const baseAlarm = {
  id: "a1", time: "07:00", label: "Office", days: [1, 2, 3, 4, 5], enabled: true,
  skipHolidays: true, smart: true, wfhMode: "shift", wfhTime: "08:30",
  sound: "classic", snooze: 10,
};
function mkState(extra) {
  return Object.assign({
    alarms: [JSON.parse(JSON.stringify(baseAlarm))],
    holidays: [{ id: "h1", date: "2026-10-02", name: "Gandhi Jayanti", enabled: true }],
    overrides: [],
    meetings: [],
    settings: { prep: 45, commute: 40, threshold: "10:00", wfhShift: 60 },
  }, extra);
}

// 1. Plain weekday rings at its own time (Thu 2026-10-01)
W._setState(mkState());
let s = W.scheduleFor(new Date(2026, 9, 1));
eq("weekday rings 07:00", [s[0].time, s[0].skipped], ["07:00", false]);

// 2. Weekend day not scheduled (Sat 2026-10-03)
eq("weekend has no entry", W.scheduleFor(new Date(2026, 9, 3)).length, 0);

// 3. Holiday skip (Fri 2026-10-02 = Gandhi Jayanti)
s = W.scheduleFor(new Date(2026, 9, 2));
eq("holiday skipped with reason", [s[0].skipped, s[0].why], [true, "Holiday: Gandhi Jayanti"]);

// 4. Disabled holiday → rings
W._setState(mkState({ holidays: [{ id: "h1", date: "2026-10-02", name: "GJ", enabled: false }] }));
s = W.scheduleFor(new Date(2026, 9, 2));
eq("disabled holiday rings", [s[0].time, s[0].skipped], ["07:00", false]);

// 5. WFH shift: +60 min
W._setState(mkState({ overrides: [{ id: "o1", date: "2026-10-01", type: "wfh" }] }));
s = W.scheduleFor(new Date(2026, 9, 1));
eq("WFH shifts to 08:00", s[0].time, "08:00");

// 6. WFH fixed-time mode
const st6 = mkState({ overrides: [{ id: "o1", date: "2026-10-01", type: "wfh" }] });
st6.alarms[0].wfhMode = "time";
W._setState(st6);
eq("WFH fixed time 08:30", W.scheduleFor(new Date(2026, 9, 1))[0].time, "08:30");

// 7. Leave skips
W._setState(mkState({ overrides: [{ id: "o1", date: "2026-10-01", type: "leave" }] }));
s = W.scheduleFor(new Date(2026, 9, 1));
eq("leave skipped", [s[0].skipped, s[0].why], [true, "On leave"]);

// 8. Early override wins
W._setState(mkState({ overrides: [{ id: "o1", date: "2026-10-01", type: "early", time: "05:45", note: "US call" }] }));
s = W.scheduleFor(new Date(2026, 9, 1));
eq("early override 05:45", [s[0].time, s[0].why], ["05:45", "Early start — US call"]);

// 9. Non-smart alarm ignores overrides but still made of holidays choice
const st9 = mkState({ overrides: [{ id: "o1", date: "2026-10-01", type: "leave" }] });
st9.alarms[0].smart = false;
W._setState(st9);
eq("non-smart alarm rings through leave", W.scheduleFor(new Date(2026, 9, 1))[0].time, "07:00");

// 10. ICS parsing: UTC + TZID + all-day skipped + folded line
const ics = [
  "BEGIN:VCALENDAR",
  "BEGIN:VEVENT",
  "DTSTART:20261001T040000Z", // 09:30 IST if TZ=Asia/Kolkata; in node test just check parse
  "SUMMARY:Standup with",
  " EU team",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "DTSTART;TZID=Asia/Kolkata:20261001T143000",
  "SUMMARY:Afternoon review",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "DTSTART;VALUE=DATE:20261002",
  "SUMMARY:All-day offsite",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");
const events = W.parseICS(ics);
eq("ICS: 2 timed events (all-day skipped)", events.length, 2);
eq("ICS: folded summary joined", events[0].title, "Standup withEU team");

// 11. Suggestion math: meeting 07:30, prep 45 + commute 40 → wake 06:05 (< 07:00 alarm)
W._setState(mkState({ meetings: [{ date: "2026-10-01", time: "07:30", title: "Client sync" }] }));
let sug = W.meetingSuggestions();
eq("suggestion wake 06:05 (office day)", [sug.length, sug[0] && sug[0].wake], [1, "06:05"]);

// 12. Same meeting on a WFH day → commute skipped → 07:45, vs WFH alarm 08:00 → still suggested
W._setState(mkState({
  meetings: [{ date: "2026-10-01", time: "08:30", title: "Client sync" }],
  overrides: [{ id: "o1", date: "2026-10-01", type: "wfh" }],
}));
sug = W.meetingSuggestions();
eq("suggestion wake 07:45 (WFH day)", [sug.length, sug[0] && sug[0].wake], [1, "07:45"]);

// 13. Late first meeting (11:00) → no suggestion
W._setState(mkState({ meetings: [{ date: "2026-10-01", time: "11:00", title: "Late sync" }] }));
eq("late meeting → no suggestion", W.meetingSuggestions().length, 0);

// 14. Meeting where existing alarm is already early enough → no suggestion
W._setState(mkState({ meetings: [{ date: "2026-10-01", time: "09:30", title: "OK sync" }] }));
// wake would be 09:30-85 = 08:05, alarm 07:00 ≤ 08:05 → skip
eq("alarm already early enough → no suggestion", W.meetingSuggestions().length, 0);

// 15. fromMin wraps correctly
eq("fromMin wraps negative", W.fromMin(-30), "23:30");
eq("fromMin wraps past midnight", W.fromMin(25 * 60), "01:00");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
