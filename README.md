# My Projects Repository

This repository contains two independent projects:

## 1. Krishna Avatar Mobile App

**Location:** `KrishnaAvatar/`

A mobile application that transforms user photos into divine Krishna avatars using AI-powered image transformation.

**Tech Stack:**
- React Native (cross-platform mobile app)
- Node.js/Express (backend API)
- AI/ML integration ready (Replicate, Hugging Face, or custom models)

**Features:**
- Photo upload from camera or gallery
- Smart image transformation
- Share transformed avatars
- Beautiful divine-themed UI

**Getting Started:**
```bash
cd KrishnaAvatar
# See README.md for complete setup instructions
```

**Documentation:**
- `README.md` - Complete project documentation
- `SETUP_GUIDE.md` - Quick setup instructions
- `ARCHITECTURE.md` - System architecture and design

---

## 2. SleepTracker - Garmin Watch App

**Location:** `SleepTracker/`

A Garmin Connect IQ watch app that uses heart rate and accelerometer data to detect actual sleep onset and wake you after a target duration.

**Tech Stack:**
- Monkey C (Connect IQ SDK)
- Works on 40+ Garmin watch models

**Features:**
- Night mode (8h target) and Nap mode (30m cap)
- Smart sleep detection (HR drop + low movement)
- Gentle wake option
- Vibration + audio alarm
- Snooze, extend, and stop controls
- 100% offline (no phone/server needed)

**Getting Started:**
```bash
cd SleepTracker
# See BEGINNER_GUIDE.md for complete setup instructions
```

**Documentation:**
- `START_HERE.md` - Quick orientation
- `BEGINNER_GUIDE.md` - Step-by-step for beginners
- `README.md` - Technical documentation

---

## Project Structure

```
myproject/
├── KrishnaAvatar/          # Mobile app project
│   ├── mobile-app/         # React Native app
│   ├── backend/            # Node.js API
│   ├── README.md
│   ├── SETUP_GUIDE.md
│   └── ARCHITECTURE.md
│
├── SleepTracker/           # Garmin watch app
│   ├── source/             # Monkey C source code
│   ├── resources/          # App resources
│   ├── START_HERE.md
│   ├── BEGINNER_GUIDE.md
│   └── README.md
│
└── README.md               # This file
```

---

## Quick Links

### Krishna Avatar
- [Setup Guide](KrishnaAvatar/SETUP_GUIDE.md)
- [Architecture](KrishnaAvatar/ARCHITECTURE.md)
- [Full Documentation](KrishnaAvatar/README.md)

### SleepTracker
- [Start Here](SleepTracker/START_HERE.md)
- [Beginner's Guide](SleepTracker/BEGINNER_GUIDE.md)
- [Technical Docs](SleepTracker/README.md)

---

## Development

Each project is independent and has its own:
- Dependencies
- Build process
- Documentation
- Deployment instructions

Navigate to the respective project folder to get started!

---

## License

Both projects are free to use, modify, and distribute. No warranty provided.
