// hooks/useAudioPlayerBackground.ts
import { Song } from '@/types/searchSong';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import MediaControls from '../modules/expo-media-controls/src/index';

export const useAudioPlayerBackground = () => {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update refs whenever state changes
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  const [showAutoPlayNext, setShowAutoPlayNext] = useState(false);
  const [autoPlayNextSong, setAutoPlayNextSong] = useState<Song | null>(null);

  const isSeekingRef = useRef(false);
  const lastPositionRef = useRef(0);
  const hasPlayedNextRef = useRef(false);
  const audioModeConfigured = useRef(false);
  const lastUpdateTimeRef = useRef(0);
  const lastPlaybackStateRef = useRef(false);
  const isSingleSongPlayRef = useRef(false);
  const currentIndexRef = useRef(0);
  const queueRef = useRef<Song[]>([]);

  // Configure audio mode for background playback (once)
  useEffect(() => {
    async function setupAudioMode() {
      if (audioModeConfigured.current) return;

      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'doNotMix',
        });
        audioModeConfigured.current = true;
      } catch (error) {
        console.error('Error configuring audio mode:', error);
      }
    }

    setupAudioMode();
  }, []);

  // Update state based on player status
  useEffect(() => {
    if (!status.isLoaded) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);

    const playerIsPlaying = status.playing || false;
    if (playerIsPlaying !== isPlaying) {
      setIsPlaying(playerIsPlaying);
    }

    const statusDuration = status.duration || 0;
    if (statusDuration > 0 && Math.abs(statusDuration - duration) > 0.1) {
      setDuration(statusDuration);
    }

    const statusPosition = status.currentTime || 0;
    const now = Date.now();

    // Only update position if:
    // 1. Not currently seeking
    // 2. Position moved forward (or backward by more than threshold - user seeked)
    // 3. Enough time passed since last update (throttle updates)
    if (statusPosition >= 0 && !isSeekingRef.current) {
      const positionDiff = statusPosition - lastPositionRef.current;
      const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

      // Update if position moved forward, or if it jumped backward significantly (user seeked)
      const shouldUpdate =
        positionDiff > 0.2 || // Forward progress
        positionDiff < -1 || // Significant backward jump (seek)
        timeSinceLastUpdate > 1000; // Or enough time passed (1 second)

      if (shouldUpdate) {
        setPosition(statusPosition);
        lastPositionRef.current = statusPosition;
        lastUpdateTimeRef.current = now;
      }
    }
  }, [status.isLoaded, status.playing, status.duration, status.currentTime, isPlaying, duration]);

  // Play a specific song from the queue by index
  const playSongAtIndex = useCallback(async (index: number, queueToUse?: Song[]) => {
    const currentQueue = queueToUse || queue;

    if (index < 0 || index >= currentQueue.length) {
      console.error('Invalid queue index:', index, 'Queue length:', currentQueue.length);
      return;
    }

    const song = currentQueue[index];
    try {
      setIsLoading(true);
      hasPlayedNextRef.current = false; // Reset flag when manually changing songs

      // Always re-configure audio mode for background playback
      // This is critical for transitions while phone is locked
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
      });

      // Get the best quality audio URL
      const audioUrl = song.downloadUrl?.find(u => u.quality === '320kbps')?.url ||
                      song.downloadUrl?.find(u => u.quality === '160kbps')?.url ||
                      song.downloadUrl?.[0]?.url;

      if (!audioUrl) {
        console.error('No audio URL available for song:', song.name);
        setIsLoading(false);
        return;
      }

      // Update state before replacing track
      setCurrentTrack(song);
      setCurrentIndex(index);
      setPosition(0);
      lastPositionRef.current = 0;
      setDuration(0);

      // Replace the current track and start playback
      player.replace(audioUrl);

      // Small delay to ensure the track is loaded before playing
      await new Promise(resolve => setTimeout(resolve, 50));

      // Start playback
      player.play();
      setIsPlaying(true);
      setIsLoading(false);
      lastPlaybackStateRef.current = true;

      // Update media notification
      const artworkUrl = song.image?.find(img => img.quality === '500x500')?.url || song.image?.[0]?.url || '';
      console.log('[playSongAtIndex] Updating notification for:', song.name, 'artwork:', artworkUrl ? 'available' : 'missing');

      MediaControls.updateNowPlaying({
        title: song.name,
        artist: song.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist',
        album: song.album?.name || '',
        artworkUrl: artworkUrl,
        duration: song.duration || 0,
      }).then(() => {
        console.log('[playSongAtIndex] Notification updated successfully for:', song.name);
      }).catch(error => {
        console.error('[playSongAtIndex] Failed to update now playing:', error);
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
    }
  }, [queue, player]);

  // Play audio function - sets up queue and plays first song
  const playAudio = useCallback(async (song: Song, playlistSongs?: Song[]) => {
    try {
      // Validate song object
      if (!song || typeof song !== 'object' || !song.id) {
        console.error('Invalid song object passed to playAudio:', song);
        return;
      }

      // If playlistSongs provided, this is a single song from a playlist
      // We'll set up the queue with all songs but mark it as single play for auto-play feature
      if (playlistSongs && playlistSongs.length > 1) {
        const songIndex = playlistSongs.findIndex(s => s.id === song.id);
        if (songIndex !== -1) {
          isSingleSongPlayRef.current = true;
          setQueue(playlistSongs);
          setCurrentIndex(songIndex);
          // Check if there's a next song to show auto-play
          if (songIndex < playlistSongs.length - 1) {
            setAutoPlayNextSong(playlistSongs[songIndex + 1]);
          }
        } else {
          // Song not found in playlist, just play single
          isSingleSongPlayRef.current = false;
          setQueue([song]);
          setCurrentIndex(0);
          setAutoPlayNextSong(null);
        }
      } else {
        // Regular single song play
        isSingleSongPlayRef.current = false;
        setQueue([song]);
        setCurrentIndex(0);
        setAutoPlayNextSong(null);
      }

      setShowAutoPlayNext(false);
      setIsLoading(true);

      // Get the best quality audio URL
      const audioUrl = song.downloadUrl?.find(u => u.quality === '320kbps')?.url ||
                      song.downloadUrl?.find(u => u.quality === '160kbps')?.url ||
                      song.downloadUrl?.[0]?.url;

      if (!audioUrl) {
        console.error('No audio URL available for song:', song.name);
        setIsLoading(false);
        return;
      }


      // Replace the current track
      player.replace(audioUrl);
      setCurrentTrack(song);
      setPosition(0);
      lastPositionRef.current = 0;
      setDuration(0);

      // Start playback
      player.play();
      setIsPlaying(true);
      setIsLoading(false);
      lastPlaybackStateRef.current = true;

      // Update media notification
      const artworkUrl = song.image?.find(img => img.quality === '500x500')?.url || song.image?.[0]?.url || '';
      console.log('[playAudio] Updating notification for:', song.name, 'artwork:', artworkUrl ? 'available' : 'missing');

      MediaControls.updateNowPlaying({
        title: song.name,
        artist: song.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist',
        album: song.album?.name || '',
        artworkUrl: artworkUrl,
        duration: song.duration || 0,
      }).then(() => {
        console.log('[playAudio] Notification updated successfully for:', song.name);
      }).catch(error => {
        console.error('[playAudio] Failed to update now playing:', error);
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
    }
  }, [player]);

  // Play queue - sets up queue with multiple songs
  const playQueue = useCallback(async (songs: Song[], startIndex: number = 0) => {
    if (!songs || songs.length === 0) {
      console.error('Empty songs array passed to playQueue');
      return;
    }

    setQueue(songs);
    // Pass the songs array directly to avoid state update timing issues
    await playSongAtIndex(startIndex, songs);
  }, [playSongAtIndex]);

  // Play next song in queue
  const playNext = useCallback(async () => {
    setShowAutoPlayNext(false);
    isSingleSongPlayRef.current = false; // Reset single song play flag
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      await playSongAtIndex(nextIndex);
      // Update next song for auto-play if there's another one after the next song
      const songAfterNext = nextIndex + 1;
      if (songAfterNext < queue.length) {
        setAutoPlayNextSong(queue[songAfterNext]);
      } else {
        setAutoPlayNextSong(null);
      }
    }
  }, [currentIndex, queue, playSongAtIndex]);

  // Cancel auto-play next
  const cancelAutoPlayNext = useCallback(() => {
    setShowAutoPlayNext(false);
    hasPlayedNextRef.current = false; // Allow re-trigger if user plays again
  }, []);

  // Auto-play next song when current song ends
  useEffect(() => {
    const statusPosition = status.currentTime || 0;
    const statusDuration = status.duration || 0;

    if (status.isLoaded && statusDuration > 0) {
      const isNearEnd = Math.abs(statusPosition - statusDuration) < 1;
      const hasEnded = !status.playing && statusPosition > 0 && isNearEnd;

      // Use refs to get current values
      const index = currentIndexRef.current;
      const q = queueRef.current;

      // Only auto-play if we haven't already played next for this song
      if (hasEnded && q.length > 0 && index < q.length - 1 && !hasPlayedNextRef.current) {
        hasPlayedNextRef.current = true; // Prevent multiple triggers

        // If this was a single song play from a playlist, show auto-play countdown
        if (isSingleSongPlayRef.current) {
          const nextSong = q[index + 1];
          setAutoPlayNextSong(nextSong);
          setShowAutoPlayNext(true);
          // Don't auto-play immediately, let the countdown handle it
        } else {
          // Regular queue play - auto-advance immediately (no setTimeout for more reliability when locked)
          playSongAtIndex(index + 1);
        }
      }
    }
  }, [status.isLoaded, status.playing, status.currentTime, status.duration, playSongAtIndex]);

  // Play previous song in queue
  const playPrevious = useCallback(async () => {
    if (currentIndex > 0) {
      await playSongAtIndex(currentIndex - 1);
    }
  }, [currentIndex, playSongAtIndex]);

  // Add song to queue
  const addToQueue = useCallback((song: Song) => {
    setQueue(prevQueue => [...prevQueue, song]);
  }, []);

  // Remove song from queue by index
  const removeFromQueue = useCallback((index: number) => {
    setQueue(prevQueue => {
      const newQueue = [...prevQueue];
      newQueue.splice(index, 1);

      // Adjust current index if needed
      if (index < currentIndex) {
        setCurrentIndex(prev => prev - 1);
      } else if (index === currentIndex) {
        // If we're removing the current song, stop playback
        player.pause();
        setCurrentTrack(null);
        setIsPlaying(false);
        // Lock screen controls cleanup handled by native module
      }

      return newQueue;
    });
  }, [currentIndex, player]);

  // Clear queue
  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
  }, []);

  // Pause audio
  const pauseAudio = useCallback(async () => {
    try {
      player.pause();
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }, [player]);

  // Resume audio
  const resumeAudio = useCallback(async () => {
    try {
      if (currentTrack) {
        player.play();
      }
    } catch (error) {
      console.error('Error resuming audio:', error);
    }
  }, [currentTrack, player]);

  // Stop audio
  const stopAudio = useCallback(async () => {
    try {
      player.pause();
      player.seekTo(0);
      setPosition(0);
      lastPositionRef.current = 0;

      // Clear media notification
      MediaControls.clearNowPlaying().catch(error => {
        console.error('Failed to clear now playing:', error);
      });
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }, [player]);

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    try {
      if (isPlaying) {
        await pauseAudio();
      } else {
        await resumeAudio();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, [isPlaying, pauseAudio, resumeAudio]);

  // Seek to position
  const seekTo = useCallback(async (positionSeconds: number) => {
    try {
      isSeekingRef.current = true;
      player.seekTo(positionSeconds);
      setPosition(positionSeconds);
      lastPositionRef.current = positionSeconds;

      setTimeout(() => {
        isSeekingRef.current = false;
      }, 200);
    } catch (error) {
      console.error('Error seeking:', error);
      isSeekingRef.current = false;
    }
  }, [player]);

  // Set volume
  const setVolume = useCallback((volumeLevel: number) => {
    try {
      player.volume = volumeLevel;
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }, [player]);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get progress percentage
  const getProgress = useCallback(() => {
    return duration > 0 ? (position / duration) * 100 : 0;
  }, [position, duration]);

  // Stop and clear
  const stopAndClear = useCallback(async () => {
    try {
      if (currentTrack) {
        player.pause();
      }
      player.seekTo(0);
      setCurrentTrack(null);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
      setIsLoading(false);

      // Clear media notification
      MediaControls.clearNowPlaying().catch(error => {
        console.error('Failed to clear now playing:', error);
      });
    } catch (error) {
      console.error('Error in stopAndClear:', error);
      setCurrentTrack(null);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
      setIsLoading(false);
    }
  }, [currentTrack, player]);

  // Update playback state in notification
  useEffect(() => {
    if (!currentTrack || duration <= 0) return;

    // Update immediately when play/pause state changes or position changes significantly
    const positionChanged = Math.abs(lastPositionRef.current - position) > 0.5;

    if (lastPlaybackStateRef.current !== isPlaying || positionChanged) {
      lastPlaybackStateRef.current = isPlaying;
      MediaControls.updatePlaybackState(isPlaying, position).catch(error => {
        console.error('Failed to update playback state:', error);
      });
    }
  }, [isPlaying, position, currentTrack, duration]);

  // Handle media control events - using refs to avoid stale closures
  useEffect(() => {
    const subscriptions = [
      MediaControls.onPlay(() => {
        player.play();
      }),
      MediaControls.onPause(() => {
        player.pause();
      }),
      MediaControls.onNext(() => {
        // Use refs to get current values
        const index = currentIndexRef.current;
        const q = queueRef.current;
        if (index < q.length - 1) {
          playSongAtIndex(index + 1);
        }
      }),
      MediaControls.onPrevious(() => {
        // Use refs to get current values
        const index = currentIndexRef.current;
        if (index > 0) {
          playSongAtIndex(index - 1);
        }
      }),
      MediaControls.onSeek((event) => {
        if (event.position !== undefined) {
          player.seekTo(event.position);
        }
      }),
      MediaControls.onStop(() => {
        player.pause();
        player.seekTo(0);
        MediaControls.clearNowPlaying().catch(() => {});
      }),
    ];

    return () => {
      subscriptions.forEach(sub => sub.remove());
      MediaControls.clearNowPlaying().catch(error => {
        console.error('Failed to clear now playing on unmount:', error);
      });
    };
  }, [player, playSongAtIndex]);

  return {
    currentTrack,
    isPlaying,
    duration,
    position,
    isLoading,
    queue,
    currentIndex,
    showAutoPlayNext,
    autoPlayNextSong,
    playAudio,
    playQueue,
    playSongAtIndex,
    playNext,
    playPrevious,
    addToQueue,
    removeFromQueue,
    clearQueue,
    pauseAudio,
    resumeAudio,
    togglePlayPause,
    stopAudio,
    seekTo,
    setVolume,
    formatTime,
    getProgress,
    stopAndClear,
    cancelAutoPlayNext,
  };
};
