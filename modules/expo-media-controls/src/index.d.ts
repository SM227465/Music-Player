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

export interface Subscription {
  remove(): void;
}

declare class MediaControls {
  updateNowPlaying(info: NowPlayingInfo): Promise<boolean>;
  updatePlaybackState(isPlaying: boolean, position: number): Promise<boolean>;
  clearNowPlaying(): Promise<boolean>;
  setActive(active: boolean): Promise<boolean>;
  onPlay(listener: MediaControlListener): Subscription;
  onPause(listener: MediaControlListener): Subscription;
  onNext(listener: MediaControlListener): Subscription;
  onPrevious(listener: MediaControlListener): Subscription;
  onSeek(listener: MediaControlListener): Subscription;
  onStop(listener: MediaControlListener): Subscription;
}

declare const mediaControls: MediaControls;
export default mediaControls;
