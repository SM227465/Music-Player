// hooks/useAudioPlayerBackground.ts
import { Song } from '@/types/searchSong';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
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

  const isSeekingRef = useRef(false);
  const lastPositionRef = useRef(0);
  const positionUpdateThreshold = 0.1;
  const hasPlayedNextRef = useRef(false);

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
    if (statusPosition >= 0 && !isSeekingRef.current) {
      const positionDiff = Math.abs(statusPosition - lastPositionRef.current);
      if (positionDiff > positionUpdateThreshold) {
        setPosition(statusPosition);
        lastPositionRef.current = statusPosition;
      }
    }
  }, [status.isLoaded, status.playing, status.duration, status.currentTime, isPlaying, duration]);

  // Update media controls when playback state changes
  useEffect(() => {
    if (currentTrack && duration > 0) {
      MediaControls.updatePlaybackState(isPlaying, position).catch(error => {
        console.error('Failed to update playback state:', error);
      });
    }
  }, [isPlaying, position, currentTrack, duration]);

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

      console.log('Playing:', song.name, 'at index:', index, 'from URL:', audioUrl);

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

      // Update media controls with now playing info
      MediaControls.updateNowPlaying({
        title: song.name,
        artist: song.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist',
        album: song.album?.name || '',
        artworkUrl: song.image?.find(img => img.quality === '500x500')?.url || song.image?.[0]?.url,
        duration: song.duration || 0,
      }).catch(error => {
        console.error('Failed to update now playing:', error);
      });
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

      console.log('Playing:', song.name, 'from URL:', audioUrl);

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

      // Update media controls with now playing info
      MediaControls.updateNowPlaying({
        title: song.name,
        artist: song.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist',
        album: song.album?.name || '',
        artworkUrl: song.image?.find(img => img.quality === '500x500')?.url || song.image?.[0]?.url,
        duration: song.duration || 0,
      }).catch(error => {
        console.error('Failed to update now playing:', error);
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

    console.log('Setting up queue with', songs.length, 'songs, starting at index', startIndex);
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
        console.log('Auto-playing next song in queue:', currentIndex + 1);
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

      // Clear media controls
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

  // Setup media control event listeners
  useEffect(() => {
    const onPlaySubscription = MediaControls.onPlay(() => {
      if (currentTrack) {
        player.play();
      }
    });

    const onPauseSubscription = MediaControls.onPause(() => {
      player.pause();
    });

    const onNextSubscription = MediaControls.onNext(() => {
      if (currentIndex < queue.length - 1) {
        playSongAtIndex(currentIndex + 1);
      }
    });

    const onPreviousSubscription = MediaControls.onPrevious(() => {
      if (currentIndex > 0) {
        playSongAtIndex(currentIndex - 1);
      }
    });

    const onSeekSubscription = MediaControls.onSeek((event) => {
      if (event.position !== undefined) {
        player.seekTo(event.position);
      }
    });

    const onStopSubscription = MediaControls.onStop(() => {
      player.pause();
      MediaControls.clearNowPlaying();
    });

    return () => {
      onPlaySubscription.remove();
      onPauseSubscription.remove();
      onNextSubscription.remove();
      onPreviousSubscription.remove();
      onSeekSubscription.remove();
      onStopSubscription.remove();
    };
  }, [player, currentTrack, currentIndex, queue.length, playSongAtIndex]);

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
