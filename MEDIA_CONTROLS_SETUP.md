# Media Controls Setup Guide

This guide explains how to build and test the background music playback with lock screen and notification controls.

## What's Been Implemented

✅ **Native Android Module** - MediaSession with notification controls
✅ **Native iOS Module** - MPRemoteCommandCenter with lock screen controls
✅ **TypeScript Wrapper** - Type-safe API for media controls
✅ **Hook Integration** - Automatic integration with audio player
✅ **Permissions** - Proper Android and iOS permissions configured

## Architecture

```
┌─────────────────────────────────────────┐
│   useAudioPlayerBackground Hook         │
│   - Manages playback state              │
│   - Listens to media control events     │
│   - Updates now playing info            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   expo-media-controls Module            │
│   - TypeScript API wrapper              │
│   - Event emitter for controls          │
└─────────┬───────────────────┬───────────┘
          │                   │
          ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│   Android        │  │   iOS            │
│   - MediaSession │  │   - MPRemote     │
│   - Notification │  │   - NowPlaying   │
└──────────────────┘  └──────────────────┘
```

## Building the App

Since this uses custom native modules, you need to create a development build:

### Prerequisites

```bash
# Install dependencies
npm install

# Install EAS CLI (if not already installed)
npm install -g eas-cli
```

### Option 1: Local Development Build

#### Android

```bash
# Build and run on Android device/emulator
npx expo run:android
```

This will:
1. Compile the native Android module
2. Build the APK
3. Install on your connected device/emulator
4. Start the Metro bundler

#### iOS

```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Build and run on iOS device/simulator
npx expo run:ios
```

This will:
1. Compile the native iOS module
2. Build the app
3. Install on your connected device/simulator
4. Start the Metro bundler

### Option 2: EAS Build (Cloud Build)

```bash
# Configure EAS (first time only)
eas build:configure

# Build for Android
eas build --platform android --profile development

# Build for iOS
eas build --platform ios --profile development

# Install the build on your device
# Android: Download and install APK
# iOS: Use the installation URL from EAS
```

## Testing the Features

### 1. Background Playback

1. Start playing a song
2. Press the home button or lock the device
3. **Expected**: Music continues playing in background

### 2. Lock Screen Controls (iOS)

1. Lock your device while music is playing
2. Wake the screen (don't unlock)
3. **Expected**:
   - Album artwork visible
   - Song title and artist displayed
   - Play/pause, next, previous buttons functional

### 3. Notification Controls (Android)

1. Start playing a song
2. Pull down notification shade
3. **Expected**:
   - Persistent music notification
   - Album artwork visible
   - Play/pause, next, previous buttons
   - Tapping notification opens app

### 4. Control Center (iOS)

1. Swipe down from top-right (or swipe up from bottom on older devices)
2. **Expected**:
   - Now playing card with album art
   - Song info and playback controls
   - Progress bar (if implemented)

### 5. Quick Settings (Android)

1. Swipe down twice to open Quick Settings
2. Look for media player card
3. **Expected**:
   - Album artwork and song info
   - Playback controls

### 6. Bluetooth/Headset Controls

1. Connect Bluetooth headphones or wired headset
2. Use play/pause buttons on headset
3. **Expected**: Controls work correctly

## Debugging

### Android Debugging

```bash
# View Android logs
npx react-native log-android

# Or use adb directly
adb logcat | grep "ExpoMediaControls"
```

### iOS Debugging

```bash
# View iOS logs
npx react-native log-ios

# Or use Xcode Console
```

### Common Issues

#### Android: Notification doesn't appear

**Solution**:
1. Check notification permissions (Settings → Apps → Music App → Notifications)
2. On Android 13+, ensure POST_NOTIFICATIONS permission is granted
3. Check logs for notification creation errors

#### iOS: Lock screen controls don't appear

**Solution**:
1. Ensure audio is actually playing
2. Check Info.plist has UIBackgroundModes with "audio"
3. Verify audio session is active

#### Events not firing

**Solution**:
1. Check event listeners are properly set up in useAudioPlayerBackground
2. Verify native module is properly linked
3. Rebuild the app (`npx expo run:android` or `npx expo run:ios`)

## File Structure

```
Music-Player/
├── modules/
│   └── expo-media-controls/
│       ├── android/
│       │   ├── build.gradle
│       │   └── src/main/java/expo/modules/mediacontrols/
│       │       ├── ExpoMediaControlsModule.kt
│       │       └── MediaControlReceiver.kt
│       ├── ios/
│       │   └── ExpoMediaControlsModule.swift
│       ├── src/
│       │   └── index.ts
│       ├── expo-module.config.json
│       ├── package.json
│       └── README.md
├── hooks/
│   └── useAudioPlayerBackground.ts  (integrated with media controls)
├── app.json  (updated with permissions)
└── MEDIA_CONTROLS_SETUP.md  (this file)
```

## Next Steps

1. **Build the app** using one of the methods above
2. **Test all features** on a real device (simulator/emulator may have limited functionality)
3. **Grant permissions** when prompted
4. **Test background playback** by locking device or switching apps

## Notes

- **Development builds** are required because this uses custom native code
- **Expo Go** does NOT support this module (native code not included)
- **Real devices** recommended for testing (especially for lock screen/notification features)
- **Android 13+** requires runtime permission for POST_NOTIFICATIONS

## Support

If you encounter issues:
1. Check the logs for error messages
2. Verify all permissions are granted
3. Ensure you're running a development build (not Expo Go)
4. Try rebuilding: `npx expo prebuild --clean` then `npx expo run:android/ios`
