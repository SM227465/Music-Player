// hooks/useAudioPlayer.ts
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';

export const useCustomAudioPlayer = () => {
  const player = useAudioPlayer();
  // console.log({ player });

  const status = useAudioPlayerStatus(player);

  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Update state based on player status
  useEffect(() => {
    if (status.isLoaded) {
      setIsPlaying(status.playing || false);
      setDuration((status.duration || 0) * 1000); // Convert to milliseconds
      setPosition((status.currentTime || 0) * 1000); // Convert to milliseconds
      setIsLoading(false);
    }
  }, [status]);

  const playAudio = async (uri: string) => {
    try {
      setIsLoading(true);

      if (currentTrack !== uri) {
        // Replace current track if it's different
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
      setPosition(0);
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

  const seekTo = async (positionMs: number) => {
    try {
      const positionSeconds = positionMs / 1000;
      await player.seekTo(positionSeconds);
      setPosition(positionMs);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  // const setVolume = async (volume: number) => {
  //   try {
  //     await player.setVolume(volume);
  //   } catch (error) {
  //     console.error('Error setting volume:', error);
  //   }
  // };

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
  };
};
