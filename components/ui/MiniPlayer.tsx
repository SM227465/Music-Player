// components/ui/MiniPlayer.tsx
import { useCustomAudioPlayer } from '@/hooks/useAudioPlayer';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MiniPlayerProps {
  currentTrack: {
    id: string;
    title: string;
    artist: string;
    artwork: string;
  };
  onExpand: () => void;
  isVisible: boolean;
}

export default function MiniPlayer({ currentTrack, onExpand, isVisible }: MiniPlayerProps) {
  const { isPlaying, togglePlayPause } = useCustomAudioPlayer();

  if (!isVisible) return null;

  const handlePlayPause = async (e: any) => {
    e.stopPropagation(); // Prevent expanding the player
    await togglePlayPause();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onExpand} activeOpacity={0.9}>
      <View style={styles.background}>
        <Image
          source={{ uri: currentTrack.artwork }}
          style={styles.artwork}
          defaultSource={require('../../assets/images/react-logo.png')}
        />

        <View style={styles.trackInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>

        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause} activeOpacity={0.8}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color='#fff' />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
  background: {
    backgroundColor: 'rgba(26, 92, 74, 0.95)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
