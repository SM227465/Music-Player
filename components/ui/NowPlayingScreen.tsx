// components/ui/NowPlayingScreen.tsx
import { useCustomAudioPlayer } from '@/hooks/useAudioPlayer';
import { Song } from '@/types/searchSong';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

interface NowPlayingScreenProps {
  currentTrack: Song;
  onMinimize: () => void;
  isVisible: boolean;
}

export default function NowPlayingScreen({ currentTrack, onMinimize, isVisible }: NowPlayingScreenProps) {
  const insets = useSafeAreaInsets();

  // FIXED: Use the updated hook properties (no .current needed)
  const {
    isPlaying,
    position,
    duration,
    togglePlayPause,
    seekTo,
    playAudio,
    isLoading,
    formatTime, // Use the hook's formatTime function
    getProgress, // Use the hook's getProgress function
  } = useCustomAudioPlayer();

  const [isLiked, setIsLiked] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isSliding, setIsSliding] = useState(false); // Track slider interaction

  // const { data: songDetails, isLoading: songDetailsLoading } = useSongDetails(currentTrack.id);
  const slideAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;

  // FIXED: Use the hook's getProgress function instead of manual calculation
  const progress = getProgress() / 100; // Convert percentage to 0-1 range for slider

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
  useEffect(() => {
    if (currentTrack.downloadUrl.length && isVisible) {
      const audioUrl = getHighestQualityAudioUrl(currentTrack.downloadUrl);
      if (audioUrl) {
        playAudio(audioUrl);
      }
    }
  }, [currentTrack, isVisible, playAudio]);

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

          <TouchableOpacity style={styles.likeButton} onPress={() => setIsLiked(!isLiked)}>
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

          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name='play-skip-back' size={32} color='#fff' />
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

          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name='play-skip-forward' size={32} color='#fff' />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleRepeatPress}>
            <Ionicons name={getRepeatIcon()} size={24} color={repeatMode > 0 ? '#1DB954' : '#fff'} />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.bottomButton}>
            <Ionicons name='list' size={24} color='#fff' />
            <Text style={styles.bottomButtonText}>Queue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomButton} onPress={() => setShowVolumeSlider(!showVolumeSlider)}>
            <Ionicons name='volume-medium' size={24} color='#fff' />
            <Text style={styles.bottomButtonText}>Volume</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomButton}>
            <Ionicons name='share' size={24} color='#fff' />
            <Text style={styles.bottomButtonText}>Share</Text>
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
    paddingBottom: 20,
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
    marginVertical: 40,
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
    width: 300,
    height: 300,
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
    marginBottom: 40,
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
    marginBottom: 40,
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
    marginBottom: 40,
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
  },
  bottomButtonText: {
    fontSize: 12,
    color: '#B3B3B3',
    marginTop: 4,
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
