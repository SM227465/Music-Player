// components/ui/SkeletonLoader.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { useTheme, spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius: customRadius, style }: SkeletonProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: theme.card.background,
          borderRadius: customRadius !== undefined ? customRadius : borderRadius.md,
          opacity,
        },
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  size?: number;
}

export function SkeletonCard({ size = 140 }: SkeletonCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.cardContainer, { marginRight: spacing.md }]}>
      <Skeleton width={size} height={size} borderRadius={borderRadius.lg} />
      <Skeleton width={size * 0.8} height={14} style={{ marginTop: spacing.sm }} />
      <Skeleton width={size * 0.6} height={12} style={{ marginTop: spacing.xs }} />
    </View>
  );
}

interface SkeletonArtistCardProps {
  size?: number;
}

export function SkeletonArtistCard({ size = 100 }: SkeletonArtistCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.artistCardContainer, { marginRight: spacing.md }]}>
      <Skeleton width={size} height={size} borderRadius={borderRadius.full} />
      <Skeleton width={size * 0.7} height={12} style={{ marginTop: spacing.sm }} />
    </View>
  );
}

export function HomeScreenSkeleton() {
  const theme = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderSkeletonSection = (title: string, cardCount: number, isArtist: boolean = false) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{title}</Text>
      </View>
      <View style={styles.scrollContainer}>
        {Array.from({ length: cardCount }).map((_, index) => (
          isArtist ? (
            <SkeletonArtistCard key={index} />
          ) : (
            <SkeletonCard key={index} />
          )
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header - Show actual greeting text */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.text.primary }]}>{getGreeting()}</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>Discover your favorite music</Text>
        </View>
        <Skeleton width={48} height={48} borderRadius={borderRadius.full} />
      </View>

      {/* Content - Show section titles with skeleton cards */}
      <View style={styles.content}>
        {renderSkeletonSection('New Releases', 3)}
        {renderSkeletonSection('Top Playlists', 3)}
        {renderSkeletonSection('Top Charts', 3)}
        {renderSkeletonSection('Top Artists', 4, true)}
      </View>
    </View>
  );
}

export function PlaylistDetailSkeleton() {
  const theme = useTheme();

  return (
    <View style={[playlistStyles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header Skeleton */}
      <View style={playlistStyles.header}>
        <Skeleton width={40} height={40} borderRadius={borderRadius.full} />
      </View>

      {/* Playlist Info Skeleton */}
      <View style={playlistStyles.playlistInfo}>
        <Skeleton width={140} height={140} borderRadius={borderRadius.lg} style={{ marginBottom: spacing.md }} />
        <Skeleton width={200} height={24} style={{ marginBottom: spacing.xs }} />
        <Skeleton width={150} height={14} style={{ marginBottom: spacing.xs }} />
        <Skeleton width={100} height={14} style={{ marginBottom: spacing.md }} />
        <Skeleton width={120} height={44} borderRadius={borderRadius.full} />
      </View>

      {/* Song List Skeleton */}
      <View style={playlistStyles.songListContainer}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} style={playlistStyles.songItem}>
            <Skeleton width={45} height={45} borderRadius={borderRadius.sm} />
            <View style={playlistStyles.songDetails}>
              <Skeleton width={180} height={14} style={{ marginBottom: spacing.xs }} />
              <Skeleton width={120} height={12} />
            </View>
            <Skeleton width={24} height={24} borderRadius={borderRadius.full} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  scrollContainer: {
    flexDirection: 'row',
    paddingLeft: spacing.xl,
  },
  cardContainer: {
    alignItems: 'flex-start',
  },
  artistCardContainer: {
    alignItems: 'center',
  },
});

const playlistStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  playlistInfo: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  songListContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  songDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
