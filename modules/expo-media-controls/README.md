# Expo Media Controls

Native module for displaying media playback controls on lock screen and notifications.

## Features

- **Lock Screen Controls**: Display current song information and playback controls on the lock screen
- **Notification Controls**: Show persistent notification with play/pause, next, and previous buttons
- **Media Session Integration**: Integrates with system media controls on both iOS and Android
- **Event Handling**: Listen for media control button presses and respond accordingly

## Platform Support

- ✅ iOS (using MPRemoteCommandCenter and MPNowPlayingInfoCenter)
- ✅ Android (using MediaSession and MediaStyle notifications)

## Installation

This module is already integrated into your app. To rebuild with the module:

```bash
# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

## Usage

The module is automatically integrated with the `useAudioPlayerBackground` hook. It will:

1. Update now playing information when a song starts
2. Update playback state when play/pause/seek occurs
3. Listen for media control button presses
4. Clear now playing info when playback stops

## API Reference

### `updateNowPlaying(info: NowPlayingInfo)`

Updates the now playing information displayed on lock screen and notification.

```typescript
await MediaControls.updateNowPlaying({
  title: 'Song Title',
  artist: 'Artist Name',
  album: 'Album Name',
  artworkUrl: 'https://example.com/artwork.jpg',
  duration: 180, // in seconds
});
```

### `updatePlaybackState(isPlaying: boolean, position: number)`

Updates the current playback state and position.

```typescript
await MediaControls.updatePlaybackState(true, 45.5);
```

### `clearNowPlaying()`

Clears the now playing information and removes the notification.

```typescript
await MediaControls.clearNowPlaying();
```

### Event Listeners

```typescript
// Play button pressed
MediaControls.onPlay(() => {
  // Resume playback
});

// Pause button pressed
MediaControls.onPause(() => {
  // Pause playback
});

// Next track button pressed
MediaControls.onNext(() => {
  // Play next song
});

// Previous track button pressed
MediaControls.onPrevious(() => {
  // Play previous song
});

// Seek position changed
MediaControls.onSeek((event) => {
  // Seek to event.position
});

// Stop button pressed
MediaControls.onStop(() => {
  // Stop playback
});
```

## Implementation Details

### Android

- Uses `MediaSessionCompat` for media session management
- Creates a persistent notification with `MediaStyle`
- Handles media button events through `BroadcastReceiver`
- Supports lock screen controls and notification controls

### iOS

- Uses `MPRemoteCommandCenter` for media controls
- Uses `MPNowPlayingInfoCenter` for now playing information
- Configures `AVAudioSession` for background playback
- Supports Control Center and lock screen controls

## Troubleshooting

### Android

If notifications don't appear:
1. Check that `POST_NOTIFICATIONS` permission is granted (Android 13+)
2. Ensure notification channel is created
3. Verify app has notification permissions enabled in settings

### iOS

If lock screen controls don't appear:
1. Check that `UIBackgroundModes` includes "audio" in Info.plist
2. Ensure audio session is active
3. Verify app is actually playing audio

## License

MIT
