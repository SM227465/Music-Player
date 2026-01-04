// components/ui/HomeScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';
import { useHomeData } from '@/hooks/useJioSaavnQueries';
import { Song } from '@/types/searchSong';
import { HomeScreenSkeleton } from './SkeletonLoader';

type ViewMode = 'home' | 'playlist';

interface ViewState {
  mode: ViewMode;
  playlistUrl?: string;
}

interface HomeScreenProps {
  onSongPress?: (song: Song) => void;
  onPlayQueue?: (songs: Song[], startIndex: number) => void;
  currentTrack?: Song | null;
  isPlaying?: boolean;
  onTogglePlayPause?: () => void;
}

export default function HomeScreen({ onSongPress, onPlayQueue, currentTrack, isPlaying, onTogglePlayPause }: HomeScreenProps) {
  const theme = useTheme();
  const [viewState, setViewState] = useState<ViewState>({ mode: 'home' });

  // Use React Query hooks
  const { newReleases, playlists, charts, artists, isLoading, refetch } = useHomeData();

  const handleRefresh = () => {
    refetch();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getImageUrl = (url: string, quality: string = '500x500') => {
    return url.replace('150x150', quality);
  };

  const handlePlaylistPress = (playlistUrl: string) => {
    setViewState({ mode: 'playlist', playlistUrl });
  };

  const handleBackToHome = () => {
    setViewState({ mode: 'home' });
  };

  // Import components dynamically
  const PlaylistDetailScreen = require('./PlaylistDetailScreen').default;

  if (viewState.mode === 'playlist') {
    return (
      <PlaylistDetailScreen
        playlistUrl={viewState.playlistUrl!}
        onBack={handleBackToHome}
        onSongPress={onSongPress}
        onPlayQueue={onPlayQueue}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlayPause={onTogglePlayPause}
      />
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
      color: theme.text.primary,
    },
    subtitle: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
      marginTop: spacing.xs,
    },
    notificationButton: {
      width: iconSize.xl,
      height: iconSize.xl,
      borderRadius: borderRadius.full,
      backgroundColor: theme.card.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 4,
      elevation: 2,
    },
    content: {
      flex: 1,
    },
    section: {
      marginBottom: spacing.xxxl,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.xl,
    },
    sectionTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
    },
    scrollContainer: {
      paddingLeft: spacing.xl,
    },
    releaseCard: {
      width: 160,
      marginRight: spacing.lg,
    },
    releaseImageContainer: {
      position: 'relative',
      marginBottom: spacing.sm,
    },
    releaseImage: {
      width: 160,
      height: 160,
      borderRadius: borderRadius.lg,
      backgroundColor: theme.card.background,
    },
    playButton: {
      position: 'absolute',
      bottom: spacing.sm,
      right: spacing.sm,
      width: iconSize.xxl,
      height: iconSize.xxl,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 6,
    },
    releaseTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    releaseSubtitle: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
    },
    playlistCard: {
      width: 180,
      marginRight: spacing.lg,
    },
    playlistImage: {
      width: 180,
      height: 180,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.sm,
      backgroundColor: theme.card.background,
    },
    playlistTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    playlistFollowers: {
      fontSize: fontSize.xs,
      color: theme.text.tertiary,
    },
    chartCard: {
      width: 140,
      marginRight: spacing.lg,
    },
    chartImage: {
      width: 140,
      height: 140,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      backgroundColor: theme.card.background,
    },
    chartTitle: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      textAlign: 'center',
    },
    artistCard: {
      alignItems: 'center',
      marginRight: spacing.lg,
    },
    artistImage: {
      width: 120,
      height: 120,
      borderRadius: borderRadius.full,
      marginBottom: spacing.sm,
      borderWidth: 3,
      borderColor: theme.accent.primary + '30',
      backgroundColor: theme.card.background,
    },
    artistName: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      textAlign: 'center',
      width: 120,
    },
    paddingBottom: {
      height: 100,
    },
  });

  if (isLoading) {
    return <HomeScreenSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subtitle}>Discover your favorite music</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name='notifications-outline' size={iconSize.md} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={theme.accent.primary}
            colors={[theme.accent.primary]}
          />
        }
      >
        {/* New Releases */}
        {newReleases.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Releases</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
              nestedScrollEnabled={true}
            >
              {newReleases.slice(0, 10).map((release, index) => (
                <TouchableOpacity
                  key={release.id}
                  style={[
                    styles.releaseCard,
                    index === newReleases.slice(0, 10).length - 1 && { marginRight: spacing.xl },
                  ]}
                >
                  <View style={styles.releaseImageContainer}>
                    <Image
                      source={{ uri: getImageUrl(release.image) }}
                      style={styles.releaseImage}
                      resizeMode='cover'
                    />
                    <TouchableOpacity style={styles.playButton}>
                      <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.releaseTitle} numberOfLines={1}>
                    {release.title}
                  </Text>
                  {release.subtitle && (
                    <Text style={styles.releaseSubtitle} numberOfLines={1}>
                      {release.subtitle}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Top Playlists */}
        {playlists.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Playlists</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
              nestedScrollEnabled={true}
            >
              {playlists.slice(0, 10).map((playlist, index) => (
                <TouchableOpacity
                  key={playlist.id}
                  style={[
                    styles.playlistCard,
                    index === playlists.slice(0, 10).length - 1 && { marginRight: spacing.xl },
                  ]}
                  onPress={() => handlePlaylistPress(playlist.url)}
                >
                  <View style={styles.releaseImageContainer}>
                    <Image
                      source={{ uri: getImageUrl(playlist.image) }}
                      style={styles.playlistImage}
                      resizeMode='cover'
                    />
                    <TouchableOpacity style={styles.playButton} onPress={() => handlePlaylistPress(playlist.url)}>
                      <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.playlistTitle} numberOfLines={2}>
                    {playlist.title}
                  </Text>
                  {playlist.followers && (
                    <Text style={styles.playlistFollowers}>{playlist.followers}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Top Charts */}
        {charts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Charts</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
              nestedScrollEnabled={true}
            >
              {charts.slice(0, 10).map((chart, index) => (
                <TouchableOpacity
                  key={chart.id}
                  style={[styles.chartCard, index === charts.slice(0, 10).length - 1 && { marginRight: spacing.xl }]}
                >
                  <View style={styles.releaseImageContainer}>
                    <Image
                      source={{ uri: getImageUrl(chart.image) }}
                      style={styles.chartImage}
                      resizeMode='cover'
                    />
                    <TouchableOpacity style={styles.playButton}>
                      <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.chartTitle} numberOfLines={2}>
                    {chart.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Top Artists */}
        {artists.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Artists</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
              nestedScrollEnabled={true}
            >
              {artists.slice(0, 10).map((artist, index) => (
                <TouchableOpacity
                  key={artist.id}
                  style={[styles.artistCard, index === artists.slice(0, 10).length - 1 && { marginRight: spacing.xl }]}
                >
                  <Image
                    source={{ uri: getImageUrl(artist.image) }}
                    style={styles.artistImage}
                    resizeMode='cover'
                  />
                  <Text style={styles.artistName} numberOfLines={1}>
                    {artist.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.paddingBottom} />
      </ScrollView>
    </View>
  );
}
