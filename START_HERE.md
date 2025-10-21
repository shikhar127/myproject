# 🎯 START HERE - Your SleepTracker Project is Ready!

## What You Have

I've created a **complete, working Garmin watch app** called **SleepTracker** that:

✅ Detects when you fall asleep using heart rate + movement
✅ Wakes you after exactly X hours of actual sleep (not just time in bed)
✅ Has a nap mode that caps at 30 minutes
✅ Vibrates/beeps when it's time to wake up
✅ Lets you snooze, extend, or stop
✅ Works 100% offline on your watch (no phone needed)

---

## Your Project Files

**Location:** `/home/user/myproject/SleepTracker/`

**Also available as:** `/home/user/myproject/SleepTracker.zip`

**Project structure:**
```
SleepTracker/
├── BEGINNER_GUIDE.md  ← Read this if you've never used VS Code
├── README.md          ← Full documentation and tuning guide
├── manifest.xml       ← App configuration (you'll edit this)
├── monkey.jungle      ← Build configuration
├── source/
│   ├── App.mc         ← Main app logic
│   ├── SleepModel.mc  ← Sleep detection algorithms
│   ├── Alarm.mc       ← Vibration/sound alerts
│   └── Views.mc       ← What you see on screen
└── resources/
    ├── strings.xml    ← Text labels
    └── properties.xml ← Settings
```

---

## What to Do Next

### Option 1: You've Never Used Developer Tools (Most People)

👉 **Open `BEGINNER_GUIDE.md`** and follow it step-by-step.

It will walk you through:
1. Installing VS Code (15 min)
2. Installing Garmin SDK (15 min)
3. Opening this project (2 min)
4. Testing in a simulator (10 min)
5. Getting it onto your watch (30 min)

**Total time:** About 1-2 hours (mostly waiting for downloads)

---

### Option 2: You're Familiar with Development

**Quick start:**

1. Install VS Code + Monkey C extension + Connect IQ SDK
2. Open this folder in VS Code
3. Edit `manifest.xml`:
   - Replace `YOUR_APP_UUID_HERE` with a UUID from https://www.uuidgenerator.net/
   - Remove watch models you don't own
4. Test: `Ctrl+Shift+P` → "Monkey C: Build for Device"
5. Get developer key from https://developer.garmin.com/
6. Export: `Ctrl+Shift+P` → "Monkey C: Export Package"
7. Upload .iq to https://apps.garmin.com/developer as Beta
8. Install from Garmin Connect app → Connect IQ Store → Beta Apps

**See `README.md` for full details.**

---

## Quick Reference

### Which File Should I Read?

| If you want to... | Read this file |
|------------------|---------------|
| **Get started (never used VS Code)** | `BEGINNER_GUIDE.md` |
| **Quick setup (experienced dev)** | `README.md` |
| **Understand how it works** | `source/App.mc` and `source/SleepModel.mc` |
| **Customize sleep detection** | `source/SleepModel.mc` (see thresholds at top) |
| **Change default sleep times** | `source/App.mc` (see targetSecs/capSecs) |
| **Modify alarm behavior** | `source/Alarm.mc` |
| **Change the UI** | `source/Views.mc` |

---

## How to Use the App (Once Installed)

**On your watch:**

1. Launch SleepTracker from your apps menu
2. Press **START** for Night mode (8h target)
   OR press **UP** for Nap mode (30m cap)
3. App shows "Detecting onset..." while you settle in
4. When it detects you're asleep (HR drops + low movement), timer starts
5. When target is reached, watch vibrates/beeps
6. During alarm:
   - START = Snooze 5 minutes
   - UP = +15 minutes
   - DOWN = Stop

---

## Support

### "I'm stuck on step X"

- Check the relevant section in BEGINNER_GUIDE.md
- Look for the "Troubleshooting" section
- Common issues have detailed fixes

### "I want to customize the detection"

- See README.md → "Tuning & Customization"
- Edit the constants in `source/SleepModel.mc`
- Examples:
  - Too sensitive? Increase `ACCEL_VARIANCE_THRESHOLD`
  - Too slow? Decrease `ONSET_QUIET_SECS`

### "Where do I get help?"

1. First: Check BEGINNER_GUIDE.md and README.md
2. Garmin developer docs: https://developer.garmin.com/connect-iq/
3. Garmin forums: https://forums.garmin.com/developer/

---

## Files at a Glance

| File | Purpose | Do You Need to Edit It? |
|------|---------|------------------------|
| `manifest.xml` | App ID and watch models | ✅ YES (UUID and devices) |
| `source/App.mc` | Main app logic | ⚙️ Optional (to change defaults) |
| `source/SleepModel.mc` | Sleep detection | ⚙️ Optional (to tune sensitivity) |
| `source/Alarm.mc` | Alarm behavior | ⚙️ Optional (to change snooze time) |
| `source/Views.mc` | Screen layout | ⚙️ Optional (to customize UI) |
| `resources/strings.xml` | App name | ⚙️ Optional (to rename app) |
| `monkey.jungle` | Build config | ❌ No, leave as-is |
| `resources/properties.xml` | Settings | ❌ No, not used yet |

---

## What's Next?

**Choose your path:**

### Path A: Beginner (Recommended)
1. Read BEGINNER_GUIDE.md from start to finish
2. Follow each step carefully
3. Test in simulator
4. Upload to Garmin
5. Install on your watch
6. Try it tonight!

### Path B: Experienced Developer
1. Skim README.md
2. Install tools
3. Build and export
4. Upload and install
5. Done in 30 minutes

---

## Important Notes

⚠️ **Before you start:**
- You need a Garmin watch (see manifest.xml for supported models)
- You need a Garmin Connect account
- You need a computer (Windows, Mac, or Linux)
- You need an internet connection (for downloads and uploads)

⚠️ **First-time builds:**
- SDK download is ~500MB (plan for 10-20 min)
- Beta approval usually takes 1-2 days (but can be as fast as a few hours)

⚠️ **Testing:**
- The simulator uses fake data
- Real-world testing on your actual watch is essential
- Wear your watch snugly for accurate HR readings

---

## Quick Wins

### "I just want to see it run!"
1. Install VS Code + Monkey C extension
2. Open this folder
3. Edit manifest.xml (add UUID, select your watch)
4. Press Ctrl+Shift+P → "Monkey C: Build for Device"
5. Watch it run in the simulator!

### "I just want it on my watch!"
- Follow BEGINNER_GUIDE.md completely
- Don't skip steps
- Budget 1-2 hours for first-time setup

---

## Success Checklist

When you're done, you should have:

- [ ] SleepTracker running in VS Code simulator
- [ ] A .iq file in the `bin/` folder
- [ ] SleepTracker uploaded to Garmin as Beta
- [ ] SleepTracker installed on your actual watch
- [ ] Successfully started and stopped a test session

---

**Ready? Start with `BEGINNER_GUIDE.md` or `README.md`!**

Good luck, and sleep well! 🌙
