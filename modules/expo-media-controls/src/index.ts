import { requireNativeModule } from 'expo-modules-core';

// Try to load the native module
let ExpoMediaControlsModule: any;
let isModuleAvailable = false;

try {
  ExpoMediaControlsModule = requireNativeModule('ExpoMediaControls');
  isModuleAvailable = true;
} catch (error) {
  console.warn('ExpoMediaControls native module not available. Media controls will not work. You need to rebuild the app with: npx expo run:android or npx expo run:ios');
  // Create a mock module for development
  ExpoMediaControlsModule = {
    updateNowPlaying: async () => false,
    updatePlaybackState: async () => false,
    clearNowPlaying: async () => false,
    setActive: async () => false,
    addListener: () => {},
    removeListeners: () => {},
  };
}

export interface MediaControlsEvent {
  position?: number;
}

export interface NowPlayingInfo {
  title: string;
  artist: string;
  album: string;
  artworkUrl?: string;
  duration: number;
}

export type MediaControlListener = (event: MediaControlsEvent) => void;

interface Subscription {
  remove: () => void;
}

class MediaControls {
  private module: any;
  private isAvailable: boolean;

  constructor() {
    this.module = ExpoMediaControlsModule;
    this.isAvailable = isModuleAvailable;
  }

  /**
   * Update the now playing information shown in lock screen and notification
   */
  async updateNowPlaying(info: NowPlayingInfo): Promise<boolean> {
    if (!this.isAvailable) {
      return false;
    }
    return await this.module.updateNowPlaying(
      info.title,
      info.artist,
      info.album,
      info.artworkUrl || null,
      info.duration
    );
  }

  /**
   * Update the playback state (playing/paused) and current position
   */
  async updatePlaybackState(isPlaying: boolean, position: number): Promise<boolean> {
    if (!this.isAvailable) {
      return false;
    }
    return await this.module.updatePlaybackState(isPlaying, position);
  }

  /**
   * Clear the now playing information and remove notification
   */
  async clearNowPlaying(): Promise<boolean> {
    if (!this.isAvailable) {
      return false;
    }
    return await this.module.clearNowPlaying();
  }

  /**
   * Set the audio session active state (iOS only)
   */
  async setActive(active: boolean): Promise<boolean> {
    if (!this.isAvailable) {
      return false;
    }
    return await this.module.setActive(active);
  }

  /**
   * Listen for play button press
   */
  onPlay(listener: MediaControlListener): Subscription {
    if (!this.isAvailable) {
      return { remove: () => {} };
    }
    return this.module.addListener('onPlay', listener);
  }

  /**
   * Listen for pause button press
   */
  onPause(listener: MediaControlListener): Subscription {
    if (!this.isAvailable) {
      return { remove: () => {} };
    }
    return this.module.addListener('onPause', listener);
  }

  /**
   * Listen for next track button press
   */
  onNext(listener: MediaControlListener): Subscription {
    if (!this.isAvailable) {
      return { remove: () => {} };
    }
    return this.module.addListener('onNext', listener);
  }

  /**
   * Listen for previous track button press
   */
  onPrevious(listener: MediaControlListener): Subscription {
    if (!this.isAvailable) {
      return { remove: () => {} };
    }
    return this.module.addListener('onPrevious', listener);
  }

  /**
   * Listen for seek/scrub events
   */
  onSeek(listener: MediaControlListener): Subscription {
    if (!this.isAvailable) {
      return { remove: () => {} };
    }
    return this.module.addListener('onSeek', listener);
  }

  /**
   * Listen for stop button press
   */
  onStop(listener: MediaControlListener): Subscription {
    if (!this.isAvailable) {
      return { remove: () => {} };
    }
    return this.module.addListener('onStop', listener);
  }
}

export default new MediaControls();
