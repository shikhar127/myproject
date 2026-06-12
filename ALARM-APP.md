# WakeWork — Alarm Clock for Indian Working Professionals

A thought-through product design + working web prototype (in [`alarm/`](alarm/))
for an alarm clock built around how working professionals in India actually
plan their mornings: public holidays, WFH days, early client calls, and
recurring weekday routines.

## 1. The problem

Stock alarm apps treat every weekday the same. An Indian professional's week
is not uniform:

- **Public holidays** — 15–20 gazetted + company holidays a year, many of them
  mid-week (Holi, Diwali, Eid, Ganesh Chaturthi…). The Sunday-night alarm still
  fires on Monday's holiday.
- **Hybrid work** — 2–3 office days, rest WFH. Office days need
  commute + getting-ready buffer; WFH days can start 60–90 minutes later.
- **Meeting-driven mornings** — an 8:30 AM call with a US/EU team means waking
  earlier *that day only*; a first meeting at 11:30 means you could sleep in.
- **State/company variance** — Maharashtra Day, Kannada Rajyotsava, Pongal,
  optional/restricted holidays — every employer's list is different.

The result: people either wake up needlessly on holidays/WFH days, or
manually fiddle with alarms every night and occasionally get it wrong.

## 2. Product concept

One **recurring "work wake-up" alarm** that is *schedule-aware*:

> "Wake me at 7:00 on working days. Skip holidays and leaves. Push me later
> on WFH days. Pull me earlier when my calendar shows an early meeting."

### Core features

| Feature | Behaviour |
|---|---|
| Recurring alarms | Multiple alarms, each with per-weekday repeat (Mon–Fri default), label, sound, snooze duration |
| Holiday skip | Preloaded 2026 India holiday calendar (editable). Alarms flagged *skip on holidays* don't ring on enabled holidays |
| Day overrides | Mark any date as **WFH** (alarm shifts later by a configurable offset or to a fixed time), **Early start** (specific earlier time), **On leave** (skip), or **Custom time** |
| Calendar awareness | Reads the calendar, finds each day's *first meeting*; if it's before a threshold (default 10:00), suggests a wake time = meeting − prep time − commute (commute = 0 on WFH days). One tap applies it as an override |
| Smart vs. fixed alarms | Each alarm chooses whether it follows holidays/overrides ("smart") or always fires (e.g., medication, gym) |
| 7-day preview | Shows exactly what will ring (or be skipped, and why) for the coming week — trust is the feature |

### Holiday data strategy

- Ship a **national preset** (gazetted + widely observed) per year.
- Every entry is toggleable and deletable; users add company/state holidays.
- Lunar-calendar festivals (Eid, Muharram…) are tentative until moon sighting —
  the UI labels them and lets the user move the date.
- Production version: serve yearly JSON holiday packs (national + per-state)
  from a small CDN endpoint, refreshed when governments publish final lists.

## 3. Calendar access — how it should work in production

The prototype imports an `.ics` export (works with Google Calendar, Outlook,
Apple Calendar — zero auth, fully private, parsed locally). The production
path, in order of preference:

1. **Android (primary market)** — native app reading the on-device Calendar
   Provider (`READ_CALENDAR` permission). No OAuth, works with every account
   already synced to the phone, works offline. Alarms scheduled with
   `AlarmManager.setAlarmClock()` so they survive Doze/battery optimisation —
   this is the *only* reliable way to ring when the app is killed, which is
   why the real product must be native, not a web app.
2. **iOS** — EventKit (`EKEventStore`) for calendar; critical alerts /
   scheduled local notifications for the alarm.
3. **Google Calendar API (OAuth)** — only needed for a web/companion version:
   `https://www.googleapis.com/auth/calendar.readonly` scope, incremental
   consent, store only the next-7-days first-event times, never event bodies.

Privacy stance: the app only ever needs **start time of the first event of
each day**. Compute that on-device and discard everything else.

### Why the prototype is a web app

Same pattern as the salary calculator in this repo: instant to try, no
install, and it exercises 100% of the scheduling logic (the hard part).
Limitations are documented in-app: a browser tab must be open for the alarm
to ring; notifications need one-time permission. The scheduling engine
(holiday/override/meeting resolution) is pure JS and ports directly to
Kotlin/Swift.

## 4. Architecture of the prototype

```
alarm/
  index.html   — UI: tabs for Alarms / Week / Holidays / Calendar / Settings
  alarm.css    — dark theme, mobile-first
  alarm.js     — state (localStorage), pure scheduling engine, ICS parser,
                 alarm ticker (checks once per second), WebAudio ringtones
```

Resolution order for "should alarm A ring on date D, and when":

1. Not a repeat day → no alarm.
2. Alarm disabled → no alarm.
3. *Smart* alarm + "On leave" override → skip.
4. "Skip holidays" + D is an enabled holiday → skip.
5. *Smart* alarm + WFH override → shift later (offset or fixed time).
6. *Smart* alarm + Early/Custom override → use override time.
7. Otherwise → alarm's own time.

Everything renders from this single function, so the 7-day preview, the
"next alarm" banner, and the actual ringer can never disagree.

## 5. Roadmap (post-prototype)

- Android app (Kotlin, `setAlarmClock`, Calendar Provider, holiday packs)
- State-wise holiday presets (start with MH, KA, TN, DL, TS, WB)
- Sunrise-aware gentle ramp + vibration patterns
- "Long weekend radar": notify when a leave on a bridge day buys a 4-day break
- Team sharing: company admin publishes the office holiday list as a pack

## Sources for the 2026 holiday preset

- [DoPT list of gazetted & restricted holidays 2026 (via CAG)](https://cag.gov.in/uploads/media/List-of-Gazetted-Holidays-and-Restricted-Holidays-2026-069492ddf80fa39-36385303.pdf)
- [timeanddate.com — Holidays in India 2026](https://www.timeanddate.com/holidays/india/2026)
- [Office Holidays — India 2026 planner](https://www.officeholidays.com/calendars/planners/india/2026)

Lunar-festival dates are tentative and user-editable in the app.
