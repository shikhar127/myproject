# Quick Setup Guide - Krishna Avatar App

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js 16 or higher installed
- [ ] npm or yarn package manager
- [ ] Git installed
- [ ] For iOS development (macOS only):
  - [ ] Xcode 12 or higher
  - [ ] CocoaPods installed (`sudo gem install cocoapods`)
- [ ] For Android development:
  - [ ] Android Studio installed
  - [ ] Android SDK (API level 29 or higher)
  - [ ] Java Development Kit (JDK) 11 or higher

## Quick Start (5 minutes)

### Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the server
npm run dev
```

Server should now be running at `http://localhost:3000`

### Step 2: Mobile App Setup (3 minutes)

Open a new terminal:

```bash
# Navigate to mobile app
cd mobile-app

# Install dependencies
npm install

# For iOS only (macOS users)
cd ios && pod install && cd ..

# Start Metro bundler
npm start
```

### Step 3: Run the App

In another terminal:

**For Android:**
```bash
cd mobile-app
npm run android
```

**For iOS (macOS only):**
```bash
cd mobile-app
npm run ios
```

## First Time Setup Checklist

### Backend Configuration

1. **Start the backend server**
   ```bash
   cd backend && npm run dev
   ```

2. **Verify it's running**
   - Open browser to `http://localhost:3000/health`
   - Should see: `{"status":"OK","message":"Server is running"}`

### Mobile App Configuration

1. **Update API endpoint** (if needed)

   Edit `mobile-app/src/services/api.ts`:

   - **For Android Emulator:**
     ```typescript
     const API_BASE_URL = 'http://10.0.2.2:3000/api';
     ```

   - **For iOS Simulator:**
     ```typescript
     const API_BASE_URL = 'http://localhost:3000/api';
     ```

   - **For Physical Device:**
     ```typescript
     const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api';
     ```
     (Find your IP: macOS: `ifconfig | grep inet`, Windows: `ipconfig`)

2. **Configure Permissions**

   The app needs camera and photo library permissions:

   **iOS** - Create `mobile-app/ios/KrishnaAvatar/Info.plist` additions:
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>We need access to your camera to take photos for Krishna avatar transformation</string>
   <key>NSPhotoLibraryUsageDescription</key>
   <string>We need access to your photo library to select photos for transformation</string>
   ```

   **Android** - Already configured in generated project

## Testing the App

1. **Start the backend** (terminal 1):
   ```bash
   cd backend && npm run dev
   ```

2. **Start Metro** (terminal 2):
   ```bash
   cd mobile-app && npm start
   ```

3. **Run the app** (terminal 3):
   ```bash
   cd mobile-app && npm run android
   # or
   cd mobile-app && npm run ios
   ```

4. **Test the flow:**
   - Tap "Select Photo"
   - Choose from Camera or Gallery
   - Tap "Transform to Krishna"
   - View the transformed result

## Common Setup Issues

### Issue: Metro bundler port conflict
```bash
# Kill process on port 8081
npx react-native start --reset-cache
```

### Issue: Android build fails
```bash
cd mobile-app/android
./gradlew clean
cd ..
npm run android
```

### Issue: iOS build fails
```bash
cd mobile-app/ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Issue: Cannot connect to backend
- Ensure backend is running on port 3000
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical device, use your computer's IP address
- Check firewall settings

### Issue: Camera not working in simulator
- iOS Simulator doesn't support camera - use gallery or test on real device
- Android Emulator has limited camera support - use gallery or test on real device

## Next Steps

Once you have the basic app running:

1. **Read the main README.md** for detailed information
2. **Explore the code structure** in both mobile-app and backend
3. **Set up AI integration** for actual avatar transformation (see README.md)
4. **Customize the UI** to match your preferences
5. **Add features** from the enhancement list in README.md

## Development Workflow

### Daily Development

1. Start backend: `cd backend && npm run dev`
2. Start mobile app: `cd mobile-app && npm start`
3. Run on device: `npm run android` or `npm run ios`
4. Make changes and see live reload

### Before Committing

1. Test on both platforms (if possible)
2. Check console for errors
3. Verify image upload and transformation works
4. Test with different image sizes and formats

## Getting Help

If you're stuck:

1. Check the main **README.md** for detailed documentation
2. Review error messages in terminal
3. Check React Native documentation: https://reactnative.dev/
4. Check Express documentation: https://expressjs.com/

## Production Deployment

See the "Production Deployment" section in the main README.md for:
- Backend deployment options
- Mobile app store submission
- Environment configuration
- Performance optimization

---

Happy coding! 🚀

**Jai Shri Krishna!** 🙏
