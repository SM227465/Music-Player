// components/ui/MiniPlayer.tsx
import { useAudioPlayerBackground } from '@/hooks/useAudioPlayerBackground';
import { Song } from '@/types/searchSong';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
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

  // Calculate bottom position: navigation bar height + safe area bottom + spacing
  // Navigation bar height = paddingTop (spacing.md) + content (~40px) + paddingBottom (Math.max(insets.bottom, spacing.md))
  // Total = 16 + 40 + Math.max(insets.bottom, 16) + 16 (extra spacing)
  const navigationBarHeight = 72 + Math.max(insets.bottom, spacing.md);

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: navigationBarHeight,
      left: spacing.lg,
      right: spacing.lg,
      zIndex: 999,
    },
    playerContainer: {
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: theme.shadow.opacity * 2,
      shadowRadius: 16,
      elevation: 12,
      overflow: 'hidden',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
    },
    artwork: {
      width: 52,
      height: 52,
      borderRadius: borderRadius.md,
      marginRight: spacing.md,
      backgroundColor: theme.card.background,
    },
    trackInfo: {
      flex: 1,
      paddingRight: spacing.sm,
    },
    title: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs - 2,
    },
    artist: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: theme.text.secondary,
      marginBottom: spacing.xs - 2,
    },
    time: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      color: theme.text.tertiary,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    skipButton: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.full,
      backgroundColor: theme.player.controlBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.full,
      backgroundColor: theme.player.controlBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressBar: {
      height: 3,
      backgroundColor: theme.player.progressBackground,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.player.progress,
    },
  });

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
              <TouchableOpacity style={styles.skipButton} onPress={handlePrevious} activeOpacity={0.7}>
                <Ionicons name='play-skip-back' size={iconSize.sm} color={theme.text.primary} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.playButton} onPress={handlePlayPause} activeOpacity={0.8}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={iconSize.md} color={theme.text.inverse} />
            </TouchableOpacity>

            {onNext && (
              <TouchableOpacity style={styles.skipButton} onPress={handleNext} activeOpacity={0.7}>
                <Ionicons name='play-skip-forward' size={iconSize.sm} color={theme.text.primary} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
              <Ionicons name='close' size={iconSize.sm} color={theme.text.primary} />
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
