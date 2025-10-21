# Complete Beginner's Guide - SleepTracker for Garmin

**Never used VS Code or Garmin development tools? No problem!**

This guide assumes ZERO prior experience. Follow each step carefully.

**Total time:** 1-2 hours (mostly waiting for downloads)

---

## What You're About to Do

1. Install Visual Studio Code (a free code editor)
2. Install Garmin's development tools
3. Open the SleepTracker project
4. Test it in a virtual watch on your computer
5. Upload it to Garmin's store as a "Beta" app
6. Install it on your real watch from the Garmin app

---

## Part 1: Install the Software (20 minutes)

### Step 1.1: Download and Install VS Code

**What is VS Code?** It's a free text editor for programmers. We'll use it to build your watch app.

1. **Open your web browser**
2. **Go to:** https://code.visualstudio.com/
3. **Click** the big blue **"Download"** button
   - Windows: It will download `VSCodeSetup.exe`
   - Mac: It will download `VSCode-darwin.zip`
   - Linux: Choose your package format
4. **Run the installer:**
   - Windows: Double-click `VSCodeSetup.exe`, click "Next" through everything
   - Mac: Open the `.zip`, drag "Visual Studio Code" to your Applications folder
5. **Open VS Code** (it should launch automatically, or find it in your programs)
6. **You should see:** A welcome screen with "Get Started" and tutorials

✅ **Checkpoint:** VS Code is open and showing a welcome screen.

---

### Step 1.2: Install the Monkey C Extension

**What is Monkey C?** It's the programming language Garmin watches use.

1. **In VS Code**, look at the **left sidebar** (you'll see 5-6 icons)
2. **Click** the **Extensions icon** (looks like 4 squares, or press `Ctrl+Shift+X` on Windows/Linux, `Cmd+Shift+X` on Mac)
3. **In the search box at the top**, type: `Monkey C`
4. **You'll see** "Monkey C" by Garmin (official extension)
5. **Click the green "Install" button** next to it
6. **Wait ~30 seconds** for it to install
7. **You'll see** a notification saying "Extension installed"

✅ **Checkpoint:** The Extensions list shows "Monkey C" as installed.

---

### Step 1.3: Install the Connect IQ SDK

**What is the SDK?** It's Garmin's toolkit - includes a virtual watch simulator and build tools.

**⚠️ This is a BIG download (~500MB). Start it and go make coffee!**

1. **After installing the Monkey C extension**, you should see a **notification in the bottom-right corner** saying:
   - "Monkey C extension requires the Connect IQ SDK"
2. **Click "Download SDK"** in that notification

   **If you missed the notification:**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type: `Monkey C: Edit SDK`
   - Press Enter
   - Click "Download SDK"

3. **Choose where to save it:**
   - Windows: `C:\Garmin\SDK` (create this folder if needed)
   - Mac: `~/GarminSDK` (in your home folder)
   - Linux: `~/GarminSDK`

4. **Click "Select Folder"**

5. **WAIT 10-20 MINUTES** while it downloads:
   - You'll see a progress bar at the bottom
   - It's downloading Java, the simulator, and build tools
   - Don't close VS Code during this!

6. **When complete**, you'll see: "SDK installed successfully"

✅ **Checkpoint:** VS Code shows "SDK installed successfully" and the progress bar is gone.

---

## Part 2: Get Your Project Files (2 minutes)

### Step 2.1: Download the SleepTracker Project

**You have two options:**

#### Option A: If you have the files already
- If you already extracted the `SleepTracker` folder to your Desktop or Downloads, skip to Step 2.2

#### Option B: Download from your current location
- The project files are already created in: `/home/user/myproject/SleepTracker/`
- You can also find `SleepTracker.zip` in the same location

### Step 2.2: Open the Project in VS Code

1. **In VS Code**, click **File → Open Folder** (top menu)
2. **Navigate to** where you saved/extracted the `SleepTracker` folder
3. **Click the `SleepTracker` folder** (not the files inside, the folder itself)
4. **Click "Open" or "Select Folder"**

**You should now see:**
- Left sidebar shows: `SLEEPTRACKER` at the top
- Below that: `source`, `resources`, `manifest.xml`, etc.

✅ **Checkpoint:** Left sidebar shows the SleepTracker project files.

---

## Part 3: Configure Your App (5 minutes)

### Step 3.1: Generate a Unique App ID (UUID)

Every Garmin app needs a unique ID number.

1. **In the left sidebar**, click **`manifest.xml`** to open it
2. **Find the line** (near the top):
   ```xml
   id="YOUR_APP_UUID_HERE"
   ```
3. **Open a new browser tab** and go to: https://www.uuidgenerator.net/
4. **You'll see** a random string like: `a1b2c3d4-1234-5678-90ab-cdef12345678`
5. **Click "Copy"** (or select it and press Ctrl+C)
6. **Back in VS Code**, select `YOUR_APP_UUID_HERE` (just the text, keep the quotes)
7. **Paste** your UUID (Ctrl+V or Cmd+V)
8. **Save the file** (Ctrl+S or Cmd+S)

**Before:**
```xml
id="YOUR_APP_UUID_HERE"
```

**After:**
```xml
id="a1b2c3d4-1234-5678-90ab-cdef12345678"
```

✅ **Checkpoint:** manifest.xml now has a real UUID instead of YOUR_APP_UUID_HERE.

---

### Step 3.2: Choose Your Watch Model

**The manifest includes 40+ watch models. You should remove the ones you don't own to make builds faster.**

1. **Still in `manifest.xml`**, scroll down to the `<iq:products>` section
2. **Find YOUR watch model** in the list
   - Look for lines like: `<iq:product id="fenix7pro"/>`
   - Common models: `fenix6`, `fenix7`, `fenix7pro`, `fenix8`, `fr955`, `fr965`, `venu2`, `vivoactive4`, etc.
   - **Not sure?** Check your watch box or Garmin Connect app → Menu → Garmin Devices

3. **Delete all other `<iq:product>` lines** EXCEPT your watch
   - Keep the opening `<iq:products>` and closing `</iq:products>` tags
   - Only keep 1-3 lines for your watch model(s)

**Example - if you have a Fenix 7 Pro:**

**Before (40+ lines):**
```xml
<iq:products>
    <iq:product id="fenix6"/>
    <iq:product id="fenix6pro"/>
    ... (many more) ...
    <iq:product id="fenix7pro"/>
    ... (many more) ...
</iq:products>
```

**After (just your watch):**
```xml
<iq:products>
    <iq:product id="fenix7pro"/>
</iq:products>
```

4. **Save the file** (Ctrl+S or Cmd+S)

✅ **Checkpoint:** manifest.xml only lists YOUR watch model(s).

---

## Part 4: Test in the Simulator (10 minutes)

### Step 4.1: Build and Run

1. **Press** `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - This opens the "Command Palette"
2. **Type:** `Monkey C: Build for Device`
3. **Press Enter**
4. **Choose your watch** from the dropdown list (e.g., `fenix7pro`)
5. **Press Enter**

**What happens next:**
- VS Code will compile the code (~30 seconds)
- A virtual watch simulator will open
- Your app will launch on the virtual watch!

**If you see an error:**
- Check that your UUID was pasted correctly in manifest.xml
- Make sure you chose a valid watch model
- Try again - first builds are sometimes slow

### Step 4.2: Test the App in the Simulator

**The simulator shows a virtual watch on your screen.**

**Buttons on the simulator:**
- **START** button (usually top-right): Start Night mode
- **UP** button (usually middle-top): Start Nap mode
- **DOWN** button (usually middle-bottom): Stop tracking

**Try this:**
1. **Click the START button** on the simulator
2. **You should see:** Screen changes to "Detecting onset..."
3. **Wait ~5-10 seconds:** It simulates sleep detection
4. **Screen shows:** "Sleeping" and a timer counting up
5. **Click the DOWN button** to stop

**If it works, great! If not:**
- Check the OUTPUT panel at the bottom of VS Code for error messages
- Make sure all files were created correctly

✅ **Checkpoint:** App runs in the simulator and you can start/stop tracking.

---

## Part 5: Get a Developer Key (10 minutes, one-time setup)

**You need a free Garmin developer account to publish apps.**

### Step 5.1: Create a Garmin Developer Account

1. **Go to:** https://developer.garmin.com/
2. **Click** "Sign In" (top-right)
3. **If you have a Garmin account** (from Garmin Connect app): Sign in with that
4. **If not**: Click "Create Account" and fill out the form (use the same email as your Garmin Connect app if possible)
5. **Agree to the terms** and complete setup

### Step 5.2: Download Your Developer Key

1. **Once signed in**, go to: https://developer.garmin.com/connect-iq/connect-iq-basics/getting-started/
2. **Scroll down** to "Generating a Developer Key"
3. **Click** the link to go to your Connect IQ Keys page
   - Or go directly to: https://developer.garmin.com/connect-iq/developer-settings/
4. **Click "Generate New Key"** (if you don't have one already)
5. **Download the key file** (it's named `developer_key` or `developer_key.der`)
6. **Save it in your SleepTracker folder:**
   - Windows: Save to `C:\Users\YourName\Desktop\SleepTracker\developer_key`
   - Mac: Save to `~/Desktop/SleepTracker/developer_key`
   - **IMPORTANT:** The file MUST be named exactly `developer_key` (no extension)

✅ **Checkpoint:** You have a file named `developer_key` in your SleepTracker folder.

---

## Part 6: Build the Final App (5 minutes)

### Step 6.1: Export the .iq Package

1. **In VS Code**, press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. **Type:** `Monkey C: Export Package`
3. **Press Enter**
4. **Choose your watch** from the list (same as before)
5. **Press Enter**

**What happens:**
- VS Code builds and signs the app with your developer key
- Creates a file: `SleepTracker/bin/SleepTracker.iq`
- This `.iq` file is what you upload to Garmin

**If you see an error about "developer_key not found":**
- Check that `developer_key` is in the SleepTracker folder
- Make sure it's not named `developer_key.txt` or `developer_key.der`

### Step 6.2: Find Your .iq File

1. **In VS Code left sidebar**, expand the `bin` folder (click the arrow next to it)
2. **You should see:** `SleepTracker.iq` (usually a few hundred KB)
3. **Right-click** `SleepTracker.iq` → **Reveal in File Explorer** (Windows) or **Reveal in Finder** (Mac)
4. **Remember this location** - you'll upload this file next

✅ **Checkpoint:** You have a file named `SleepTracker.iq` in the `bin` folder.

---

## Part 7: Upload to Garmin as Beta (20 minutes)

### Step 7.1: Go to the Connect IQ Developer Dashboard

1. **Open your browser**
2. **Go to:** https://apps.garmin.com/en-US/developer/dashboard
3. **Sign in** with your Garmin developer account (same as before)
4. **You should see:** "My Apps" dashboard (probably empty if this is your first app)

### Step 7.2: Upload Your App

1. **Click** the big **"Upload New App"** button
2. **Choose:** "Watch App" (not widget or data field)
3. **Click "Choose File"** and select your `SleepTracker.iq` file
4. **Click "Upload"**
5. **Wait ~30 seconds** while it analyzes the file

### Step 7.3: Fill Out the App Information

**The system auto-detects most info from your .iq file, but you need to provide:**

1. **App Name:** `SleepTracker` (or whatever you want to call it)
2. **Short Description:** "Smart sleep timer with HR-based onset detection"
3. **Long Description:** Copy-paste this:
   ```
   SleepTracker uses heart rate and movement sensors to detect when you actually fall asleep, then wakes you after your target sleep duration. Perfect for power naps or ensuring you get exactly 8 hours of sleep.

   Features:
   - Night mode (8h target) and Nap mode (30m cap)
   - Smart sleep detection using HR drop + low movement
   - Gentle wake option
   - Vibration + audio alarm
   - Snooze, extend, and stop controls
   ```
4. **Category:** Health & Fitness
5. **Supported Devices:** (Should auto-fill from your .iq file)
6. **Screenshots:** (Optional for Beta, but recommended)
   - You can skip this for now or take screenshots from the simulator

### Step 7.4: Set Distribution to Beta

**IMPORTANT: This is how you install it on your watch without public release!**

1. **Scroll down** to "Distribution" section
2. **Select:** "Beta"
3. **Do NOT** select "Public Store" (unless you want everyone to see it)

### Step 7.5: Submit

1. **Click** "Save as Draft"
2. **Review** everything looks correct
3. **Click** "Submit for Beta Review"
4. **You'll see:** "Your app has been submitted"

**What happens next:**
- Garmin reviews it (usually 1-2 days, sometimes just a few hours)
- You'll get an email when approved
- Once approved, you can install it!

✅ **Checkpoint:** App is submitted for Beta review. Wait for approval email.

---

## Part 8: Install on Your Watch (10 minutes)

**⚠️ Wait for the approval email before doing this!**

### Step 8.1: Via Garmin Connect Mobile App (Easiest)

**On your smartphone:**

1. **Open** the Garmin Connect app
2. **Tap** the menu (☰ three lines, usually top-left or bottom-right)
3. **Tap** "Connect IQ Store"
4. **Tap** your profile icon (top-right)
5. **Tap** "My Apps"
6. **Look for** "Beta Apps" tab
7. **Find** SleepTracker in the list
8. **Tap** "Download"
9. **Wait** for it to download
10. **Sync your watch:**
    - Make sure watch is connected via Bluetooth
    - On main Garmin Connect screen, pull down to refresh
    - Watch will sync and install the app

**If you don't see it:**
- Make sure you're signed into the same Garmin account you used to upload
- Check you received the approval email
- Try refreshing the Beta Apps list

### Step 8.2: Via Website (Alternative)

1. **Go to:** https://apps.garmin.com/
2. **Sign in**
3. **Click** your profile → "My Device"
4. **Click** "Beta Apps" tab
5. **Find** SleepTracker
6. **Click** "Send to Device"
7. **Sync your watch** with the Garmin Connect app

✅ **Checkpoint:** SleepTracker appears in your watch's Apps list.

---

## Part 9: Use the App on Your Watch!

### Step 9.1: Launch SleepTracker

**On your watch:**

1. **Hold** the MENU button (or UP button on some models)
2. **Scroll** to "Activities & Apps" or just "Apps"
3. **Find** "SleepTracker"
4. **Press** START to launch it

### Step 9.2: Start a Session

**Main screen shows:**
- "Idle" at the top
- "Ready" in the middle
- Button hints at the bottom

**To start Night mode (8h):**
- Press START button

**To start Nap mode (30m):**
- Press UP button

**The app will now:**
1. Show "Detecting onset..."
2. Monitor your HR and movement
3. When it detects you're asleep (low movement + HR drop), it starts counting
4. When you've slept the target time, it vibrates/beeps

**To stop early:**
- Press DOWN button

### Step 9.3: When the Alarm Triggers

**Watch will vibrate and beep.**

**You have 3 options:**
- Press START: Snooze for 5 minutes
- Press UP: Add 15 more minutes to target
- Press DOWN: Stop and return to idle

---

## Troubleshooting Common Issues

### "VS Code won't download the SDK"

- Check your internet connection
- Try: Ctrl+Shift+P → "Monkey C: Edit SDK" → manually download from https://developer.garmin.com/connect-iq/sdk/
- Extract it to a folder, then in VS Code set the SDK path to that folder

### "Build failed with errors"

Common causes:
- **UUID not replaced:** Check manifest.xml, make sure it's not still `YOUR_APP_UUID_HERE`
- **Invalid device ID:** Double-check your watch model in manifest.xml
- **Typo in code:** If you manually edited files, check for errors

### "Can't find developer_key"

- Make sure the file is named EXACTLY `developer_key` (no `.txt`, no `.der`)
- Must be in the root SleepTracker folder, not in `source` or `resources`
- On Windows, you may need to show file extensions: File Explorer → View → Show File Extensions

### "App not appearing in Beta Apps"

- Wait for approval email (can take 24-48 hours)
- Check spam folder for email
- Make sure you're signed into the correct Garmin account on your phone
- Try signing out and back in to Garmin Connect app

### "Sleep detection isn't working on my real watch"

This is normal - the simulator uses fake data. On your real watch:
- Wear it snugly (HR sensor needs good contact)
- Lie still for 10 minutes to trigger onset
- If it's too sensitive/not sensitive enough, see the tuning guide in README.md

---

## Next Steps

### Want to customize the app?

**See README.md for:**
- Adjusting detection sensitivity
- Changing default sleep targets
- Disabling audio tone
- Tweaking snooze duration

**Files to edit:**
- `source/App.mc` - main logic, default targets
- `source/SleepModel.mc` - detection thresholds
- `source/Alarm.mc` - alarm behavior
- `source/Views.mc` - screen layout

**After editing:**
- Rebuild: Ctrl+Shift+P → "Monkey C: Build for Device"
- Test in simulator
- Export new .iq
- Upload as new version to Connect IQ Store

---

## Summary Checklist

- [ ] VS Code installed
- [ ] Monkey C extension installed
- [ ] Connect IQ SDK downloaded
- [ ] SleepTracker project opened
- [ ] UUID generated and pasted into manifest.xml
- [ ] Watch model selected in manifest.xml
- [ ] App tested in simulator
- [ ] Garmin developer account created
- [ ] Developer key downloaded
- [ ] .iq file exported
- [ ] App uploaded to Connect IQ Store as Beta
- [ ] Beta approval received
- [ ] App installed on watch via Garmin Connect app
- [ ] App successfully launched and tested on watch

---

**Congratulations! You've built and deployed your first Garmin watch app!**

Questions? Check README.md or the Garmin developer forums: https://forums.garmin.com/developer/

**Sleep well, wake smart!** 🌙
