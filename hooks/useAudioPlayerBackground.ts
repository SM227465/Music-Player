// hooks/useAudioPlayerBackground.ts
import { Song } from '@/types/searchSong';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useAudioPlayerBackground = () => {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const isSeekingRef = useRef(false);
  const lastPositionRef = useRef(0);
  const positionUpdateThreshold = 0.1;

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

  // Play audio function
  const playAudio = useCallback(async (song: Song) => {
    try {
      // Validate song object
      if (!song || typeof song !== 'object' || !song.id) {
        console.error('Invalid song object passed to playAudio:', song);
        return;
      }

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
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
    }
  }, [player]);

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
    playAudio,
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
