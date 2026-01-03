// components/ui/NowPlayingScreen.tsx
import { useAudioPlayerBackground } from '@/hooks/useAudioPlayerBackground';
import { useFavorites, useHistory, useQueue } from '@/hooks/useStorage';
import { Song } from '@/types/searchSong';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QueueModal from './QueueModal';
import LyricsModal from './LyricsModal';

type AudioPlayerType = ReturnType<typeof useAudioPlayerBackground>;

const { height } = Dimensions.get('window');

interface NowPlayingScreenProps {
  currentTrack: Song;
  onMinimize: () => void;
  isVisible: boolean;
  audioPlayer: AudioPlayerType;
}

export default function NowPlayingScreen({ currentTrack, onMinimize, isVisible, audioPlayer }: NowPlayingScreenProps) {
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToHistory } = useHistory();
  const { queue, playNext, playPrevious, hasNext, hasPrevious, removeFromQueue, clearQueue } = useQueue();
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const slideAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const { getProgress, playAudio, duration, seekTo, togglePlayPause, isLoading, formatTime, position, isPlaying } = audioPlayer;
  const progress = getProgress() / 100;

  // Check if current track is favorited
  useEffect(() => {
    setIsLiked(isFavorite(currentTrack.id));
  }, [currentTrack.id, isFavorite]);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  // Auto-play when song details are loaded
  // Note: playAudio is now called from the parent component (handleSongPress)
  // so we don't need to call it here anymore
  useEffect(() => {
    // This effect is no longer needed as playAudio is called from parent
    // when the song is first selected
  }, [currentTrack, isVisible]);

  const getHighestQualityAudioUrl = useCallback((downloadUrls: any[]) => {
    if (!downloadUrls || downloadUrls.length === 0) return null;

    // Prefer 320kbps, then 160kbps, then 96kbps, etc.
    const qualityOrder = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];

    for (const quality of qualityOrder) {
      const url = downloadUrls.find((url) => url.quality === quality);
      if (url) return url.url;
    }

    return downloadUrls[0]?.url || null;
  }, []);

  // FIXED: Better slider handling to prevent jumping
  const handleProgressChange = useCallback(
    (value: number) => {
      if (!isSliding) return;

      const newPosition = value * duration;
      seekTo(newPosition);
    },
    [duration, seekTo, isSliding]
  );

  const handleSlidingStart = useCallback(() => {
    setIsSliding(true);
  }, []);

  const handleSlidingComplete = useCallback(
    (value: number) => {
      const newPosition = value * duration;
      seekTo(newPosition);
      setIsSliding(false);
    },
    [duration, seekTo]
  );

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 1:
        return 'repeat';
      case 2:
        return 'repeat-outline';
      default:
        return 'repeat';
    }
  };

  const handleRepeatPress = () => {
    setRepeatMode((prev) => (prev + 1) % 3);
  };

  const handlePlayPause = async () => {
    togglePlayPause();
  };

  const handleLikePress = async () => {
    try {
      const newLikedState = await toggleFavorite(currentTrack);
      setIsLiked(newLikedState);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Add to history when track starts playing
  useEffect(() => {
    if (isPlaying && currentTrack) {
      addToHistory(currentTrack);
    }
  }, [isPlaying, currentTrack.id]);

  const handleNextTrack = useCallback(() => {
    const nextSong = playNext();
    if (nextSong) {
      // Play next song from queue
      const audioUrl = getHighestQualityAudioUrl(nextSong.downloadUrl);
      if (audioUrl) {
        playAudio(audioUrl);
      }
    }
  }, [playNext, playAudio]);

  const handlePreviousTrack = useCallback(() => {
    const prevSong = playPrevious();
    if (prevSong) {
      // Play previous song from queue
      const audioUrl = getHighestQualityAudioUrl(prevSong.downloadUrl);
      if (audioUrl) {
        playAudio(audioUrl);
      }
    }
  }, [playPrevious, playAudio]);

  const handleQueueSongPress = useCallback((song: Song, index: number) => {
    const audioUrl = getHighestQualityAudioUrl(song.downloadUrl);
    if (audioUrl) {
      playAudio(audioUrl);
      setShowQueueModal(false);
    }
  }, [playAudio]);

  const handleRemoveFromQueue = useCallback(async (index: number) => {
    await removeFromQueue(index);
  }, [removeFromQueue]);

  const handleClearQueue = useCallback(() => {
    Alert.alert(
      'Clear Queue',
      'Are you sure you want to clear the entire queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearQueue();
            setShowQueueModal(false);
          },
        },
      ]
    );
  }, [clearQueue]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [height + insets.bottom + 80, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient colors={['#0d4f3c', '#1a5c4a', '#2d7a5f']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onMinimize} style={styles.minimizeButton}>
            <Ionicons name='chevron-down' size={28} color='#fff' />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name='ellipsis-horizontal' size={28} color='#fff' />
          </TouchableOpacity>
        </View>

        {/* Album Art Container */}
        <View style={styles.artworkContainer}>
          <View style={styles.artworkShadow}>
            <Image
              source={{ uri: currentTrack.image[currentTrack.image.length - 1].url }}
              style={styles.artwork}
              defaultSource={require('../../assets/images/react-logo.png')}
            />
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size='large' color='#1DB954' />
              </View>
            )}
          </View>
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={2}>
            {currentTrack.name}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {currentTrack.artists?.primary?.map((a) => a.name).join(', ')}
          </Text>
          <Text style={styles.trackAlbum} numberOfLines={1}>
            {currentTrack.album.name}
          </Text>

          <TouchableOpacity style={styles.likeButton} onPress={handleLikePress}>
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={28} color={isLiked ? '#1DB954' : '#fff'} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.progressSlider}
            value={isSliding ? undefined : progress} // Don't update value while sliding
            onValueChange={handleProgressChange}
            onSlidingStart={handleSlidingStart}
            onSlidingComplete={handleSlidingComplete}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor='#1DB954'
            maximumTrackTintColor='rgba(255, 255, 255, 0.3)'
            thumbTintColor='#1DB954'
            disabled={isLoading}
          />
          <View style={styles.timeContainer}>
            {/* FIXED: Remove .current from position and duration */}
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={() => setIsShuffling(!isShuffling)}>
            <Ionicons name='shuffle' size={24} color={isShuffling ? '#1DB954' : '#fff'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !hasPrevious && styles.disabledButton]}
            onPress={handlePreviousTrack}
            disabled={!hasPrevious}
          >
            <Ionicons name='play-skip-back' size={32} color={hasPrevious ? '#fff' : '#666'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playButton, isLoading && styles.disabledButton]}
            onPress={handlePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size='small' color='#000' />
            ) : (
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color='#000' />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !hasNext && styles.disabledButton]}
            onPress={handleNextTrack}
            disabled={!hasNext}
          >
            <Ionicons name='play-skip-forward' size={32} color={hasNext ? '#fff' : '#666'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleRepeatPress}>
            <Ionicons name={getRepeatIcon()} size={24} color={repeatMode > 0 ? '#1DB954' : '#fff'} />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.bottomButton} onPress={() => setShowQueueModal(true)}>
            <Ionicons name='list' size={24} color='#fff' />
            <Text style={styles.bottomButtonText}>Queue</Text>
            {queue.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{queue.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomButton} onPress={() => setShowLyricsModal(true)}>
            <Ionicons name='musical-notes' size={24} color='#fff' />
            <Text style={styles.bottomButtonText}>Lyrics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomButton} onPress={() => setShowVolumeSlider(!showVolumeSlider)}>
            <Ionicons name='volume-medium' size={24} color='#fff' />
            <Text style={styles.bottomButtonText}>Volume</Text>
          </TouchableOpacity>
        </View>

        {/* Volume Slider */}
        {showVolumeSlider && (
          <View style={styles.volumeContainer}>
            <Slider
              style={styles.volumeSlider}
              value={volume}
              onValueChange={setVolume}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor='#1DB954'
              maximumTrackTintColor='rgba(255, 255, 255, 0.3)'
              thumbTintColor='#1DB954'
            />
          </View>
        )}
      </LinearGradient>

      {/* Queue Modal */}
      <QueueModal
        visible={showQueueModal}
        onClose={() => setShowQueueModal(false)}
        queue={queue}
        currentIndex={0}
        onSongPress={handleQueueSongPress}
        onRemoveSong={handleRemoveFromQueue}
        onClearQueue={handleClearQueue}
      />

      {/* Lyrics Modal */}
      <LyricsModal
        visible={showLyricsModal}
        onClose={() => setShowLyricsModal(false)}
        songId={currentTrack.id}
        songName={currentTrack.name}
        artistName={currentTrack.artists?.primary?.map((a) => a.name).join(', ') || ''}
        isPlaying={isPlaying}
        currentTime={position}
      />
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 12,
  },
  minimizeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  moreButton: {
    padding: 8,
  },
  artworkContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  artworkShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    position: 'relative',
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 16,
    backgroundColor: '#2d7a5f',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  trackArtist: {
    fontSize: 18,
    color: '#B3B3B3',
    marginBottom: 4,
    textAlign: 'center',
  },
  trackAlbum: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  likeButton: {
    padding: 8,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressSlider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  timeText: {
    fontSize: 12,
    color: '#B3B3B3',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  controlButton: {
    padding: 12,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomButton: {
    alignItems: 'center',
    padding: 12,
    position: 'relative',
  },
  bottomButtonText: {
    fontSize: 12,
    color: '#B3B3B3',
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#1DB954',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  volumeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  volumeSlider: {
    width: '100%',
    height: 40,
  },
});
