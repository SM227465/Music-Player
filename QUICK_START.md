# Quick Start Guide - Media Controls

## 🚀 Build and Test in 5 Minutes

### Step 1: Install Dependencies (if needed)
```bash
npm install
```

### Step 2: Build for Android
```bash
# Connect your Android device or start emulator
npx expo run:android
```

**What happens**:
- Compiles the native MediaSession module
- Builds the APK
- Installs on your device
- Starts the app

### Step 3: Build for iOS
```bash
# Connect your iPhone or start simulator
npx expo run:ios
```

**What happens**:
- Compiles the native MPRemoteCommandCenter module
- Builds the app
- Installs on your device
- Starts the app

### Step 4: Test the Features

#### Test 1: Background Playback
1. ✅ Play a song
2. ✅ Press home button
3. ✅ Music should continue playing

#### Test 2: Lock Screen Controls (iOS)
1. ✅ Play a song
2. ✅ Lock your iPhone
3. ✅ Wake screen (don't unlock)
4. ✅ See album art, song info, and controls

#### Test 3: Notification Controls (Android)
1. ✅ Play a song
2. ✅ Pull down notification shade
3. ✅ See media notification with controls
4. ✅ Try play/pause, next, previous buttons

#### Test 4: Control Center (iOS)
1. ✅ Play a song
2. ✅ Swipe down from top-right corner
3. ✅ See now playing card with controls

## ⚠️ Important Notes

- **Don't use Expo Go** - This won't work in Expo Go because it uses custom native code
- **Use a real device** - Lock screen features work best on physical devices
- **Grant permissions** - Accept notification permissions on Android 13+

## 🎵 What You'll See

### Android
- Persistent notification with:
  - Album artwork
  - Song title and artist
  - Play/Pause, Next, Previous buttons

### iOS
- Lock screen with:
  - Large album artwork
  - Song info
  - Media controls
- Control Center integration

## 🛠️ If Something Goes Wrong

### Notification not showing (Android)?
```bash
# Check permissions in Settings → Apps → Music App → Notifications
# Make sure they're enabled
```

### Lock screen controls not showing (iOS)?
```bash
# Rebuild the app
npx expo run:ios
```

### Controls not responding?
```bash
# Check logs for errors
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

### Module not found error?
```bash
# Clean and rebuild
npx expo prebuild --clean
npx expo run:android  # or run:ios
```

## 📚 Need More Details?

- **Full setup guide**: See `MEDIA_CONTROLS_SETUP.md`
- **Implementation details**: See `IMPLEMENTATION_SUMMARY.md`
- **Module API**: See `modules/expo-media-controls/README.md`

## ✅ You're Done!

Your music player now has:
- Background playback ✅
- Lock screen controls ✅
- Notification controls ✅
- Hardware button support ✅

Enjoy your fully-featured music player! 🎶
