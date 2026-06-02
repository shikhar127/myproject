# SpamShield

A tiny, **fully offline** Android app that silences spam **calls** and sorts spam **SMS**
out of your way — then shows you how much it has helped. No accounts, no cloud, no
network access of any kind.

> **One screen. Set it and forget it.**

---

## What it does (and what it honestly can't)

SpamShield works **only with signals that already reach your device**. There is no
Airtel/carrier API, and **no app can stop a call or text from being delivered to your
phone over the network.** What a well-behaved app *can* do is step in the instant
something arrives — before it disturbs you.

| Goal | What actually happens |
|------|------------------------|
| "Block" a spam **call** | The OS hands the call to our `CallScreeningService` *before it rings*. We **silence**, **reject**, or **just track** it (your choice). |
| "Block" a spam **SMS** | As the default SMS app we receive `SMS_DELIVER`, classify in memory, store it **read + silent** so it never shows up as an unread inbox notification, and log only metadata. |
| Show how it helped | A lifetime counter + a recent list (time · channel · partial number). |

So "blocking" realistically means **auto-reject / silence / route-out-of-sight on
arrival**, not preventing delivery. The onboarding screen and UI say this plainly.

### Using your carrier's spam label (e.g. Airtel "Suspected spam")
If your network already tags a call as spam in the **caller-ID name** (Airtel shows
"Suspected SPAM"), SpamShield's `CARRIER_MARKER` rule reads that label from
`Call.Details.callerDisplayName` and treats the call as spam — gated behind the
**"Use your network's spam warnings"** setting (on by default).

**Honest caveat:** there is still **no Airtel API**. We can only act on the label *if the
network delivers it as caller-ID text that a third-party `CallScreeningService` can read*.
On some devices/networks Airtel renders "Suspected spam" in its **own** dialer UI, where no
third-party app can see it — in that case this rule simply won't fire, and the other rules
(your block list, unverified-caller, heuristics) still apply. Whether it works is something
you can only confirm on your own SIM: a flagged spam call will appear **silenced in the
Recent list**.

---

## Privacy guarantee (the whole point)

1. **Zero network access.** The app declares **no `INTERNET` permission** at all — grep
   the manifest, it isn't there. No API calls, no analytics, no crash reporting, no
   remote anything. No networking libraries are even on the classpath.
2. **No message-content storage.** SMS bodies and call audio are **classified in memory
   and discarded.** They are never written to the app's database. (Message bodies do
   live in Android's own system SMS store — the same place every SMS app reads — because
   a default SMS app must persist messages there or they're lost. That OS store is *not*
   our database.)
3. **Minimal data footprint.** We store only: your block/allow list, a handful of
   settings, a **200-row capped** spam log of *metadata only* (timestamp, partial sender,
   verdict, which rule fired), and a single-row lifetime stats counter. Cloud backup and
   device-transfer of this data are disabled.
4. **One-tap "Clear all data"** wipes the spam log and resets lifetime stats (incl. the
   "since" date). Your curated block/allow list is preserved.

---

## How the role-request flow works

Two powerful capabilities are gated behind Android **roles**, requested via
`RoleManager` (min SDK 29 for the clean dialog flow). The app **never grants itself
anything** — the user confirms each in a system dialog.

1. **`ROLE_CALL_SCREENING`** → lets `SpamCallScreeningService` see and act on incoming
   calls before they ring. Requested with
   `RoleManager.createRequestRoleIntent(ROLE_CALL_SCREENING)`.
2. **`ROLE_SMS` (default SMS app)** → lets us receive `SMS_DELIVER` and decide where each
   text goes. Requested with `RoleManager.createRequestRoleIntent(ROLE_SMS)`.

Onboarding explains *why* each is needed in plain English, with separate "Grant"
buttons. The app re-checks role status every time it resumes (roles can be revoked in
system settings), and works in a degraded-but-honest way if a role isn't granted.

---

## Architecture

```
classifier/SpamClassifier.kt      Pure, local, no-I/O decision engine (unit-testable)
telecom/SpamCallScreeningService  CallScreeningService → silence/reject/track
sms/SmsDeliverReceiver            SMS_DELIVER → classify in memory → route + log metadata
sms/{Mms,ComposeSms,HeadlessSms}  Required default-SMS components (see manifest comments)
sms/SmsWriter                     Writes bodies ONLY to the OS Telephony store, never our DB
data/                             Room: number_list, settings, spam_log (cap 200), stats (1 row)
data/SpamRepository               The single funnel that records events & enforces the cap
ui/                               Onboarding + one Home screen (hero stats + recent list) + settings sheet
```

### The four mandatory default-SMS components
Android refuses to make an app the default SMS app unless it declares **all four**
(each is commented in `AndroidManifest.xml`):
1. `SMS_DELIVER` broadcast receiver — where we read incoming text.
2. `WAP_PUSH_DELIVER` (MMS) receiver — declared for eligibility (no MMS storage).
3. A `sms:`/`smsto:` **compose/sendto** activity — minimal, no full composer by design.
4. A `RESPOND_VIA_MESSAGE` service — for the in-call "reply with message" feature.

### "How much it helped" stats
The summary card is driven by the **`stats`** table, **not** by counting `spam_log` rows
(the log is capped at 200, so counting it would undercount lifetime totals). Headline:
big numerals for calls silenced / texts filtered, plus "Since &lt;first-active date&gt;".

---

## Building

```bash
cd SpamShield
./gradlew assembleDebug   # wrapper is committed; first run downloads Gradle 8.11.1 + deps
```

> Requires the Android SDK (set `ANDROID_HOME` / `local.properties`) and network access
> on the **build machine** to fetch Gradle, AGP, and AndroidX from Google/Maven. This is
> a build-time dependency only — **the shipped app itself makes no network calls.**

- **Min SDK 29**, target/compile SDK 35, Kotlin 2.0, Jetpack Compose + Material 3.
- Material 3 **dynamic color** (wallpaper accent on Android 12+); respects light/dark.

---

## Play Store: Permissions Declaration Form

Default-SMS and call-screening apps require a **Permissions Declaration** in the Play
Console (the SMS/Call Log Permissions policy). You must:

1. Declare a **core use case** Google permits for the default-SMS role. The honest fit
   here is **"Spam/fraud SMS filtering"** (a spam-blocking app is one of the few approved
   default-SMS use cases). Call screening is covered under the call-screening role.
2. Complete the **Permissions Declaration Form**, stating:
   - **Which sensitive permissions you use:** `RECEIVE_SMS`, `READ_SMS`, `SEND_SMS`,
     `RECEIVE_MMS`, `RECEIVE_WAP_PUSH` (default-SMS set); call screening via
     `ROLE_CALL_SCREENING` (no Call Log permissions are requested).
   - **Why each is required:** to receive and classify incoming SMS for spam, and to be
     eligible as the default SMS app so spam can be routed away from the inbox.
   - **That data stays on-device:** no data is transmitted off the device (no `INTERNET`
     permission), nothing is sold or shared.
3. Provide a **privacy policy** stating the on-device-only, no-network, no-body-storage
   design, and (likely) a short **demo video** showing the role-request flow and spam
   handling, as reviewers request for default-SMS apps.
4. Keep the app's behavior matching the declared use case — requesting the default-SMS
   role for anything other than an approved use case will be rejected.

> Note: if you ship without becoming the default SMS app (call-screening only), the
> SMS-related declarations don't apply, but then SMS sorting is unavailable. SpamShield
> needs the default-SMS role to sort texts, hence the declaration above.
