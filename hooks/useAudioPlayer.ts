// hooks/useAudioPlayer.ts
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useCustomAudioPlayer = () => {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const isSeekingRef = useRef(false);
  const lastPositionRef = useRef(0);
  const positionUpdateThreshold = 0.1; // Only update if position changes by more than 100ms

  // Debounced position update to prevent rapid jumping
  const updatePosition = useCallback((newPosition: number) => {
    const positionDiff = Math.abs(newPosition - lastPositionRef.current);

    // Only update position if it's a significant change and we're not seeking
    if (positionDiff > positionUpdateThreshold && !isSeekingRef.current) {
      setPosition(newPosition);
      lastPositionRef.current = newPosition;
    }
  }, []);

  // Update state based on player status with better handling
  useEffect(() => {
    if (!status.isLoaded) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);

    // Handle playing state
    const playerIsPlaying = status.playing || false;
    if (playerIsPlaying !== isPlaying) {
      setIsPlaying(playerIsPlaying);
    }

    // Handle duration - only set once when loaded
    const statusDuration = status.duration || 0;
    if (statusDuration > 0 && Math.abs(statusDuration - duration) > 0.1) {
      setDuration(statusDuration);
    }

    // Handle position updates more carefully
    const statusPosition = status.currentTime || 0;
    if (statusPosition >= 0) {
      updatePosition(statusPosition);
    }
  }, [status.isLoaded, status.playing, status.duration, status.currentTime, isPlaying, duration, updatePosition]);

  const playAudio = useCallback(
    async (uri: string) => {
      try {
        // setIsLoading(true);

        // If it's a different track, replace and reset position
        if (currentTrack !== uri) {
          await player.replace(uri);
          setCurrentTrack(uri);
          setPosition(0);
          lastPositionRef.current = 0;
          setDuration(0);
        }

        await player.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsLoading(false);
      }
    },
    [currentTrack, player]
  );

  const pauseAudio = useCallback(async () => {
    try {
      await player.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }, [player]);

  const resumeAudio = useCallback(async () => {
    try {
      if (currentTrack) {
        await player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error resuming audio:', error);
    }
  }, [currentTrack, player]);

  const stopAudio = useCallback(async () => {
    try {
      await player.pause();
      await player.seekTo(0);
      setIsPlaying(false);
      setPosition(0);
      lastPositionRef.current = 0;
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }, [player]);

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

  const seekTo = useCallback(
    async (positionSeconds: number) => {
      try {
        // Prevent position updates during seeking
        isSeekingRef.current = true;

        await player.seekTo(positionSeconds);

        // Update position immediately for UI responsiveness
        setPosition(positionSeconds);
        lastPositionRef.current = positionSeconds;

        // Reset seeking flag after a short delay
        setTimeout(() => {
          isSeekingRef.current = false;
        }, 200);
      } catch (error) {
        console.error('Error seeking:', error);
        isSeekingRef.current = false;
      }
    },
    [player]
  );

  // Format time for display (helper function)
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get progress as percentage
  const getProgress = useCallback(() => {
    return duration > 0 ? (position / duration) * 100 : 0;
  }, [position, duration]);

  // hooks/useAudioPlayer.ts - Enhanced version
  const stopAndClear = async () => {
    try {
      if (player) {
        if (currentTrack) {
          await player.pause();
        }

        await player.seekTo(0);
      }

      setIsPlaying(false);
      setPosition(0);
      setCurrentTrack(null);
      setDuration(0);
      setIsLoading(false);
    } catch (error) {
      setIsPlaying(false);
      setPosition(0);
      setCurrentTrack(null);
      setDuration(0);
      setIsLoading(false);
    }
  };

  return {
    player,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    togglePlayPause,
    seekTo,
    isPlaying,
    duration,
    position,
    isLoading,
    status,
    formatTime,
    getProgress,
    currentTrack,
    stopAndClear,
  };
};
