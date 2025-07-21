// hooks/useAudioPlayer.ts
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';

export const useCustomAudioPlayer = () => {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const duration = useRef(0);
  const position = useRef(0);
  const [isLoading, setIsLoading] = useState(false);

  // Update state based on player status
  useEffect(() => {
    console.log(status);

    if (status.isLoaded) {
      setIsPlaying(status.playing || false);
      duration.current = status.duration || 0;
      position.current = status.currentTime || 0;
      setIsLoading(false);
    }
  }, [status]);

  const playAudio = async (uri: string) => {
    try {
      setIsLoading(true);

      if (currentTrack !== uri) {
        await player.replace(uri);
        setCurrentTrack(uri);
      }

      await player.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
    }
  };

  const pauseAudio = async () => {
    try {
      await player.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const resumeAudio = async () => {
    try {
      if (currentTrack) {
        await player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error resuming audio:', error);
    }
  };

  const stopAudio = async () => {
    try {
      await player.pause();
      await player.seekTo(0);
      setIsPlaying(false);
      position.current = 0;
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const togglePlayPause = async () => {
    try {
      if (isPlaying) {
        await pauseAudio();
      } else {
        await resumeAudio();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const seekTo = async (positionSeconds: number) => {
    try {
      // expo-audio expects seconds
      await player.seekTo(positionSeconds);
      position.current = positionSeconds;
    } catch (error) {
      console.error('Error seeking:', error);
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
    duration, // This is in seconds
    position, // This is in seconds
    isLoading,
    status,
  };
};
