// components/ui/NowPlayingScreen.tsx
import { useAudioPlayerBackground } from '@/hooks/useAudioPlayerBackground';
import { useFavorites, useHistory, useQueue } from '@/hooks/useStorage';
import { Song } from '@/types/searchSong';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, Alert, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QueueModal from './QueueModal';
import LyricsModal from './LyricsModal';
import SongOptionsModal from './SongOptionsModal';
import { decodeHtmlEntities } from '../../utils/htmlDecode';

type AudioPlayerType = ReturnType<typeof useAudioPlayerBackground>;

const { height, width } = Dimensions.get('window');

interface NowPlayingScreenProps {
  currentTrack: Song;
  onMinimize: () => void;
  isVisible: boolean;
  audioPlayer: AudioPlayerType;
}

export default function NowPlayingScreen({ currentTrack, onMinimize, isVisible, audioPlayer }: NowPlayingScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToHistory } = useHistory();
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const slideAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const {
    getProgress,
    playAudio,
    playSongAtIndex,
    duration,
    seekTo,
    togglePlayPause,
    isLoading,
    formatTime,
    position,
    isPlaying,
    queue,
    currentIndex,
    playNext,
    playPrevious,
    removeFromQueue,
    clearQueue
  } = audioPlayer;
  const progress = getProgress() / 100;
  const hasNext = currentIndex < queue.length - 1;
  const hasPrevious = currentIndex > 0;

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

  const getHighestQualityAudioUrl = useCallback((downloadUrls: any[]) => {
    if (!downloadUrls || downloadUrls.length === 0) return null;
    const qualityOrder = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
    for (const quality of qualityOrder) {
      const url = downloadUrls.find((url) => url.quality === quality);
      if (url) return url.url;
    }
    return downloadUrls[0]?.url || null;
  }, []);

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

  useEffect(() => {
    if (isPlaying && currentTrack) {
      addToHistory(currentTrack);
    }
  }, [isPlaying, currentTrack.id]);

  const handleNextTrack = useCallback(async () => {
    if (hasNext) {
      await addToHistory(currentTrack);
      await playNext();
    }
  }, [hasNext, playNext, addToHistory, currentTrack]);

  const handlePreviousTrack = useCallback(async () => {
    if (hasPrevious) {
      await addToHistory(currentTrack);
      await playPrevious();
    }
  }, [hasPrevious, playPrevious, addToHistory, currentTrack]);

  const handleQueueSongPress = useCallback(async (song: Song, index: number) => {
    // Play the song at the specified index in the queue
    await playSongAtIndex(index);
    setShowQueueModal(false);
  }, [playSongAtIndex]);

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

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      backgroundColor: theme.background.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: insets.top + spacing.md,
      paddingBottom: spacing.lg,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: theme.card.background,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,
      elevation: 3,
    },
    headerTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
    },
    artworkContainer: {
      alignItems: 'center',
      marginTop: spacing.xxl,
      marginBottom: spacing.xxxl,
    },
    artworkWrapper: {
      position: 'relative',
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: theme.shadow.opacity * 2,
      shadowRadius: 40,
      elevation: 20,
    },
    artwork: {
      width: width - spacing.xl * 4,
      height: width - spacing.xl * 4,
      borderRadius: borderRadius.xxl,
      backgroundColor: theme.card.background,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.background.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.xxl,
    },
    trackInfo: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
      paddingHorizontal: spacing.lg,
    },
    trackTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    trackTitle: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
      textAlign: 'center',
      flex: 1,
    },
    likeButton: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.full,
      backgroundColor: theme.card.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.md,
    },
    trackArtist: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.medium,
      color: theme.text.secondary,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    trackAlbum: {
      fontSize: fontSize.sm,
      color: theme.text.tertiary,
      textAlign: 'center',
    },
    progressContainer: {
      marginBottom: spacing.xxl,
    },
    progressSlider: {
      width: '100%',
      height: 40,
    },
    progressTrack: {
      height: 4,
      backgroundColor: theme.player.progressBackground,
      borderRadius: borderRadius.full,
      marginBottom: spacing.md,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.player.progress,
      borderRadius: borderRadius.full,
    },
    timeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xs,
    },
    timeText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: theme.text.secondary,
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xxl,
      paddingHorizontal: spacing.lg,
    },
    controlButton: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: theme.player.controlBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    controlButtonActive: {
      backgroundColor: theme.accent.primary,
    },
    playButton: {
      width: 72,
      height: 72,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    disabledButton: {
      opacity: 0.4,
    },
    bottomControls: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingBottom: insets.bottom + spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.border.primary,
    },
    bottomButton: {
      alignItems: 'center',
      padding: spacing.md,
      position: 'relative',
      minWidth: 80,
    },
    bottomButtonText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      color: theme.text.secondary,
      marginTop: spacing.xs,
    },
    badge: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.lg,
      backgroundColor: theme.accent.primary,
      borderRadius: borderRadius.full,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xs,
    },
    badgeText: {
      color: theme.text.inverse,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
    },
    volumeContainer: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.lg,
      marginHorizontal: spacing.xl,
      marginBottom: spacing.lg,
    },
    volumeSlider: {
      width: '100%',
      height: 40,
    },
  });

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
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onMinimize} style={styles.headerButton} activeOpacity={0.7}>
            <Ionicons name='chevron-down' size={iconSize.md} color={theme.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.7}
            onPress={() => setShowOptionsModal(true)}
          >
            <Ionicons name='ellipsis-horizontal' size={iconSize.md} color={theme.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Album Art */}
        <View style={styles.artworkContainer}>
          <View style={styles.artworkWrapper}>
            <Image
              source={{ uri: currentTrack.image[currentTrack.image.length - 1].url }}
              style={styles.artwork}
              defaultSource={require('../../assets/images/react-logo.png')}
            />
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size='large' color={theme.accent.primary} />
              </View>
            )}
          </View>
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <View style={styles.trackTitleRow}>
            <Text style={styles.trackTitle} numberOfLines={2}>
              {decodeHtmlEntities(currentTrack.name)}
            </Text>
            <TouchableOpacity style={styles.likeButton} onPress={handleLikePress} activeOpacity={0.7}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={iconSize.sm}
                color={isLiked ? theme.accent.error : theme.text.primary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {decodeHtmlEntities(currentTrack.artists?.primary?.map((a) => a.name).join(', '))}
          </Text>
          <Text style={styles.trackAlbum} numberOfLines={1}>
            {decodeHtmlEntities(currentTrack.album.name)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.progressSlider}
            value={isSliding ? undefined : progress}
            onValueChange={handleProgressChange}
            onSlidingStart={handleSlidingStart}
            onSlidingComplete={handleSlidingComplete}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor={theme.player.progress}
            maximumTrackTintColor={theme.player.progressBackground}
            thumbTintColor={theme.player.progress}
            disabled={isLoading}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, isShuffling && styles.controlButtonActive]}
            onPress={() => setIsShuffling(!isShuffling)}
            activeOpacity={0.7}
          >
            <Ionicons
              name='shuffle'
              size={iconSize.sm}
              color={isShuffling ? theme.text.inverse : theme.text.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !hasPrevious && styles.disabledButton]}
            onPress={handlePreviousTrack}
            disabled={!hasPrevious}
            activeOpacity={0.7}
          >
            <Ionicons name='play-skip-back' size={iconSize.lg} color={theme.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playButton, isLoading && styles.disabledButton]}
            onPress={handlePlayPause}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size='small' color={theme.text.inverse} />
            ) : (
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={iconSize.xl} color={theme.text.inverse} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !hasNext && styles.disabledButton]}
            onPress={handleNextTrack}
            disabled={!hasNext}
            activeOpacity={0.7}
          >
            <Ionicons name='play-skip-forward' size={iconSize.lg} color={theme.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, repeatMode > 0 && styles.controlButtonActive]}
            onPress={handleRepeatPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={getRepeatIcon()}
              size={iconSize.sm}
              color={repeatMode > 0 ? theme.text.inverse : theme.text.primary}
            />
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
              minimumTrackTintColor={theme.player.progress}
              maximumTrackTintColor={theme.player.progressBackground}
              thumbTintColor={theme.player.progress}
            />
          </View>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.bottomButton} onPress={() => setShowQueueModal(true)} activeOpacity={0.7}>
            <Ionicons name='list' size={iconSize.md} color={theme.text.primary} />
            <Text style={styles.bottomButtonText}>Queue</Text>
            {queue.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{queue.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomButton} onPress={() => setShowLyricsModal(true)} activeOpacity={0.7}>
            <Ionicons name='musical-notes' size={iconSize.md} color={theme.text.primary} />
            <Text style={styles.bottomButtonText}>Lyrics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomButton} onPress={() => setShowVolumeSlider(!showVolumeSlider)} activeOpacity={0.7}>
            <Ionicons name='volume-medium' size={iconSize.md} color={theme.text.primary} />
            <Text style={styles.bottomButtonText}>Volume</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Queue Modal */}
      <QueueModal
        visible={showQueueModal}
        onClose={() => setShowQueueModal(false)}
        queue={queue}
        currentIndex={currentIndex}
        onSongPress={handleQueueSongPress}
        onRemoveSong={handleRemoveFromQueue}
        onClearQueue={handleClearQueue}
      />

      {/* Lyrics Modal */}
      <LyricsModal
        visible={showLyricsModal}
        onClose={() => setShowLyricsModal(false)}
        songId={currentTrack.id}
        songName={decodeHtmlEntities(currentTrack.name)}
        artistName={decodeHtmlEntities(currentTrack.artists?.primary?.map((a) => a.name).join(', ') || '')}
        isPlaying={isPlaying}
        currentTime={position}
      />

      {/* Song Options Modal */}
      <SongOptionsModal
        visible={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        song={currentTrack}
        onAddToFavorites={handleLikePress}
        isFavorite={isLiked}
      />
    </Animated.View>
  );
}
