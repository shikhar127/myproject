# SleepTracker - Garmin Connect IQ Sleep & Nap Alarm

A minimalist watch app that wakes you after you've **actually slept** X hours (or caps a nap at Y minutes) using heart rate + accelerometer detection.

## Features

- **Night Mode**: Set a target (default 8 hours). Alarm triggers when you've slept that long.
- **Nap Mode**: Cap at 30 minutes (default). Alarm triggers at the cap.
- **Smart Detection**: Uses low accelerometer variance + HR drop to detect sleep onset.
- **Gentle Wake**: In the last 10 minutes before target, if movement increases, alarm fires early.
- **Alarm UX**: Vibration + optional tone, with Snooze (5m), +15m, and Stop buttons.
- **Fully Offline**: No phone companion, no server, runs entirely on your watch.

---

## Complete Setup Guide for Beginners

### Prerequisites

1. **Install Visual Studio Code**: [Download here](https://code.visualstudio.com/)
2. **Install Monkey C Extension**:
   - Open VS Code → Extensions (Ctrl+Shift+X)
   - Search "Monkey C" → Install the official Garmin extension
3. **Install Connect IQ SDK**:
   - The extension will prompt you to download the SDK
   - Or download manually from [Garmin Developer](https://developer.garmin.com/connect-iq/sdk/)
   - Set SDK path in VS Code settings

---

## Step-by-Step: Build, Sign, and Deploy to Beta

### 1. Open Project in VS Code

1. Download/extract this project folder
2. Open VS Code → File → Open Folder → select `SleepTracker/`

### 2. Generate App UUID

1. Open `manifest.xml`
2. Replace `YOUR_APP_UUID_HERE` with a new UUID
   - Visit https://www.uuidgenerator.net/
   - Copy the UUID shown (e.g., `12345678-1234-1234-1234-123456789abc`)
   - Paste it into manifest.xml, replacing `YOUR_APP_UUID_HERE`

### 3. Select Your Watch Model(s)

**IMPORTANT**: The manifest lists ~40 devices for convenience. You should **remove** devices you don't own to reduce build time and app size.

1. Open `manifest.xml`
2. Keep only your watch's product ID (e.g., `<iq:product id="fenix7pro"/>`)
3. Delete all other `<iq:product>` lines
4. Find your device ID in [Garmin's docs](https://developer.garmin.com/connect-iq/compatible-devices/)

### 4. Build in Simulator

1. In VS Code, press **Ctrl+Shift+P** → "Monkey C: Build for Device"
2. Select a device from the list (e.g., `fenix7pro`)
3. The app will build and launch in the simulator
4. **Test in Simulator**:
   - Press START button → starts Night mode (8h)
   - Press UP button → starts Nap mode (30m)
   - The app will detect "sleep" if HR drops and movement is low
   - Alarm will vibrate after elapsed time
   - During alarm: START = Snooze 5m, UP = +15m, DOWN = Stop

### 5. Create Developer Key (First Time Only)

1. Go to [Garmin Developer Account](https://developer.garmin.com/connect-iq/connect-iq-basics/getting-started/)
2. Sign in (or create account)
3. Go to **Account → Connect IQ Keys**
4. Download your `developer_key` file
5. Place it in your project root: `SleepTracker/developer_key`

### 6. Build Release .iq File

1. In VS Code, press **Ctrl+Shift+P** → "Monkey C: Export Package"
2. Select device(s) to build for
3. This creates a signed `.iq` file in `/bin/SleepTracker.iq`

### 7. Upload to Connect IQ Store (Beta)

1. Go to [Garmin Connect IQ Developer Dashboard](https://apps.garmin.com/en-US/developer/dashboard)
2. Click **"Upload New App"**
3. Select **"Watch App"**
4. Upload your `SleepTracker.iq` file
5. Fill in:
   - **App Name**: SleepTracker
   - **Description**: "Sleep timer with smart onset detection"
   - **Version**: 1.0.0
   - **Supported Devices**: (auto-detected from .iq)
6. Under **Distribution**, select **"Beta"**
7. Click **"Save as Draft"** then **"Submit for Beta"**
8. Wait for approval (usually 1-2 days, often faster)

### 8. Install on Your Watch

1. **Via Garmin Connect Mobile App**:
   - Open Garmin Connect app on your phone
   - Go to **More (☰)** → **Connect IQ Store**
   - Tap your profile → **My Apps** → **Beta Apps**
   - Find **SleepTracker** → **Download**
   - Sync your watch (it will install automatically)

2. **Via Website** (alternative):
   - Go to [Garmin Connect IQ Store](https://apps.garmin.com/)
   - Sign in → **My Device** → **Beta Apps**
   - Click **SleepTracker** → **Send to Device**
   - Sync your watch

### 9. Launch on Watch

1. On your watch: **Hold MENU** → **Activities & Apps**
2. Scroll to **SleepTracker** → **START**
3. Use as described below

---

## Usage

### Starting a Session

- **Night Mode** (8h target):
  - Press **START** button (or tap top half of screen)
  - Watch enters "Detecting onset..." state
  - Once sleep is detected (low movement + HR drop), timer starts

- **Nap Mode** (30m cap):
  - Press **UP** button (or tap bottom half of screen)
  - Same detection flow

### During Sleep

- Status shows "Sleeping"
- Displays:
  - **Asleep**: HH:MM elapsed
  - **Target**: HH:MM goal
- Press **DOWN** to stop/cancel anytime

### Alarm

- When target is reached (or gentle wake triggers), watch vibrates + beeps
- **START** button: Snooze 5 minutes
- **UP** button: +15 minutes (extends target)
- **DOWN** button: Stop session

---

## Tuning & Customization

### Adjust Sleep Detection Sensitivity

Edit `source/SleepModel.mc`:

```java
const ONSET_QUIET_SECS = 600;           // Seconds of quiet needed (default 10 min)
const ACCEL_VARIANCE_THRESHOLD = 50.0;  // Lower = more sensitive (default 50)
const HR_DROP_BPM = 8;                  // HR drop from baseline (default 8 bpm)
const HR_ABSOLUTE_THRESHOLD = 65;       // Fallback HR limit if no baseline
const GENTLE_WAKE_MULTIPLIER = 1.35;    // Movement spike threshold
```

**Tips**:
- If **onset is too slow**: Lower `ACCEL_VARIANCE_THRESHOLD` (try 30) or reduce `ONSET_QUIET_SECS` (try 300)
- If **false positives** (triggers when awake): Raise `ACCEL_VARIANCE_THRESHOLD` (try 70)
- If **gentle wake fires too early**: Increase `GENTLE_WAKE_MULTIPLIER` (try 1.5)

### Change Default Targets

Edit `source/App.mc`:

```java
var targetSecs = 28800;  // Night mode (8 hours = 28800 seconds)
var capSecs = 1800;      // Nap mode (30 minutes = 1800 seconds)
```

### Disable Audio Tone

If your watch doesn't support audio (or you prefer vibration only):

Edit `source/Alarm.mc`, comment out:

```java
// Attention.playTone(Attention.TONE_ALARM);
```

### Adjust Snooze Duration

Edit `source/Alarm.mc`:

```java
snoozeTimer.start(method(:onSnoozeExpire), 300000, false); // 300000ms = 5 minutes
```

Change `300000` to desired milliseconds (e.g., `600000` for 10 minutes).

---

## Battery Tips

- **Foreground use recommended**: The app runs best when screen is on (or as last active app)
- **Background limitations**: Garmin restricts background execution; alarm may be delayed if watch sleeps
- **Best practice**:
  - Start the app before bed
  - Keep watch on wrist (sensors need contact)
  - Don't start other apps while tracking

---

## Known Limitations

1. **Simulator Testing**: Accelerometer data is simulated in the Connect IQ simulator. Real-world testing on device is essential.
2. **HR Sensor Accuracy**: Optical HR can be unreliable during sleep (especially if watch is loose).
3. **Background Restrictions**: Garmin limits background processing. If the watch sleeps deeply, the app may not wake exactly on time.
4. **No History**: This app does not store past sessions (to keep it simple and offline).
5. **One Session at a Time**: Can't run multiple tracking sessions simultaneously.

---

## Troubleshooting

### "Build failed" in VS Code

- Check that SDK path is set correctly: **File → Preferences → Settings** → search "Monkey C"
- Ensure `manifest.xml` has a valid UUID
- Verify all product IDs in manifest are valid (remove invalid ones)

### "App won't install on watch"

- Make sure your watch model is listed in `manifest.xml`
- Check that Beta app was approved in Connect IQ Store dashboard
- Try syncing watch again via Garmin Connect app

### "Sleep never detected"

- Check HR sensor is getting data (wear watch snugly)
- Lower `ACCEL_VARIANCE_THRESHOLD` in `SleepModel.mc`
- Reduce `ONSET_QUIET_SECS` for faster detection

### "Alarm doesn't fire"

- Ensure app is in foreground (or was last active app)
- Check if watch entered "sleep mode" (screen off for long time)
- Verify elapsed time >= target in the UI

### "No sound on alarm"

- Many Garmin watches don't support audio tones
- Vibration should always work
- If neither works, check `Alarm.mc` for errors in device logs

---

## Device Compatibility

Tested on Connect IQ Simulator. Should work on **all** devices in `manifest.xml` (API level 3.2+):

- Fenix 6/7/8 series
- Epix Gen 2 & Pro
- Enduro 1/2
- Instinct 1/2
- Forerunner 55, 165, 255, 265, 745, 945, 955, 965
- Venu / Venu Sq / Venu 2/3
- Vivoactive 4/5

**Note**: Always test on your specific watch model before relying on alarms.

---

## Support & Contributions

This is a minimal, self-contained app. For bugs or feature requests:

1. Check **Tuning & Customization** section above
2. Review Connect IQ docs: [https://developer.garmin.com/connect-iq/](https://developer.garmin.com/connect-iq/)
3. Modify source code directly (it's yours!)

---

## License

Free to use, modify, and distribute. No warranty provided. Use at your own risk (especially for critical wake-up times).

---

**Sleep well, wake smart!**
