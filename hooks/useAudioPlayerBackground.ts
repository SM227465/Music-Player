// hooks/useAudioPlayerBackground.ts
import { Song } from '@/types/searchSong';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

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

  const isSeekingRef = useRef(false);
  const lastPositionRef = useRef(0);
  const hasPlayedNextRef = useRef(false);
  const audioModeConfigured = useRef(false);
  const lastUpdateTimeRef = useRef(0);

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
      setCurrentIndex(index);
      setPosition(0);
      lastPositionRef.current = 0;
      setDuration(0);

      // Start playback
      player.play();
      setIsPlaying(true);
      setIsLoading(false);

      // Note: Lock screen controls would be handled by expo-media-controls native module
      // or through expo-audio's built-in media session if available
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
    }
  }, [queue, player]);

  // Play audio function - sets up queue and plays first song
  const playAudio = useCallback(async (song: Song) => {
    try {
      // Validate song object
      if (!song || typeof song !== 'object' || !song.id) {
        console.error('Invalid song object passed to playAudio:', song);
        return;
      }

      // Set queue with single song and play it
      setQueue([song]);
      setCurrentIndex(0);

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

      // Note: Lock screen controls would be handled by expo-media-controls native module
      // or through expo-audio's built-in media session if available
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
    if (currentIndex < queue.length - 1) {
      await playSongAtIndex(currentIndex + 1);
    }
  }, [currentIndex, queue.length, playSongAtIndex]);

  // Auto-play next song when current song ends
  useEffect(() => {
    const statusPosition = status.currentTime || 0;
    const statusDuration = status.duration || 0;

    if (status.isLoaded && !status.playing && statusPosition > 0 && statusDuration > 0) {
      const isNearEnd = Math.abs(statusPosition - statusDuration) < 1;

      // Only auto-play if we haven't already played next for this song
      if (isNearEnd && queue.length > 0 && currentIndex < queue.length - 1 && !hasPlayedNextRef.current) {
        hasPlayedNextRef.current = true; // Prevent multiple triggers
        playNext();
      }
    }
  }, [status.isLoaded, status.playing, status.currentTime, status.duration, queue.length, currentIndex, playNext]);

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

      // Lock screen controls cleanup handled by native module
    } catch (error) {
      console.error('Error in stopAndClear:', error);
      setCurrentTrack(null);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
      setIsLoading(false);
    }
  }, [currentTrack, player]);

  return {
    currentTrack,
    isPlaying,
    duration,
    position,
    isLoading,
    queue,
    currentIndex,
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
    formatTime,
    getProgress,
    stopAndClear,
  };
};
