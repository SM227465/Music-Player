// components/ui/MiniPlayer.tsx - Enhanced version
import { useAudioPlayerBackground } from '@/hooks/useAudioPlayerBackground';
import { Song } from '@/types/searchSong';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type AudioPlayerType = ReturnType<typeof useAudioPlayerBackground>;

interface MiniPlayerProps {
  currentTrack: Song;
  onExpand: () => void;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isVisible: boolean;
  audioPlayer: AudioPlayerType;
}

export default function MiniPlayer({
  currentTrack,
  onExpand,
  onClose,
  onNext,
  onPrevious,
  isVisible,
  audioPlayer,
}: MiniPlayerProps) {
  const { togglePlayPause, getProgress, position, duration, formatTime, isPlaying } = audioPlayer;

  if (!isVisible) return null;

  const handlePlayPause = async () => {
    await togglePlayPause();
  };

  const handleClose = (e: any) => {
    e.stopPropagation();
    onClose();
  };

  const handleNext = (e: any) => {
    e.stopPropagation();
    onNext?.();
  };

  const handlePrevious = (e: any) => {
    e.stopPropagation();
    onPrevious?.();
  };

  const progress = getProgress();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.playerContainer} onPress={onExpand} activeOpacity={0.9}>
        <View style={styles.content}>
          <Image
            source={{ uri: currentTrack.image[0].url }}
            style={styles.artwork}
            defaultSource={require('../../assets/images/react-logo.png')}
          />

          <View style={styles.trackInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.name}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artists.primary?.map((a) => a.name).join(', ')}
            </Text>
            <Text style={styles.time}>
              {formatTime(position)} / {formatTime(duration)}
            </Text>
          </View>

          <View style={styles.controls}>
            {onPrevious && (
              <TouchableOpacity style={styles.skipButton} onPress={handlePrevious} activeOpacity={0.8}>
                <Ionicons name='play-skip-back' size={16} color='#fff' />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.playButton} onPress={handlePlayPause} activeOpacity={0.8}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color='#fff' />
            </TouchableOpacity>

            {onNext && (
              <TouchableOpacity style={styles.skipButton} onPress={handleNext} activeOpacity={0.8}>
                <Ionicons name='play-skip-forward' size={16} color='#fff' />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.8}>
              <Ionicons name='close' size={16} color='#fff' />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 1.5,
  },
  playerContainer: {
    backgroundColor: 'rgba(26, 92, 74, 0.95)',
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    backdropFilter: 'blur(10px)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#2d7a5f',
  },
  trackInfo: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
    color: '#B3B3B3',
    marginBottom: 2,
  },
  time: {
    fontSize: 10,
    color: '#888',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skipButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
