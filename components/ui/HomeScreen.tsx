// components/ui/HomeScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useSongDetails } from '@/hooks/useApiQueries';
import { useFollowedArtists } from '@/hooks/useStorage';
import { Song } from '@/types/searchSong';
import { HomeScreenSkeleton } from './SkeletonLoader';
import { decodeHtmlEntities } from '../../utils/htmlDecode';

type ViewMode = 'home' | 'playlist' | 'artist';

interface ViewState {
  mode: ViewMode;
  playlistUrl?: string;
  artistId?: string;
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
  const [selectedSongId, setSelectedSongId] = useState<string>('');

  // Use React Query hooks
  const { allModules, isLoading, refetch } = useHomeData();
  const { data: songDetails, isSuccess, isError, isLoading: isFetchingSong } = useSongDetails(selectedSongId);
  const { followedArtists } = useFollowedArtists();

  // When song details are fetched, play the song
  useEffect(() => {
    if (isSuccess && songDetails && onSongPress && selectedSongId) {
      const song: Song = songDetails.data?.[0] || songDetails.data;
      onSongPress(song);
      setSelectedSongId(''); // Reset after playing
    }
  }, [isSuccess, songDetails, onSongPress, selectedSongId]);

  // Handle API errors
  useEffect(() => {
    if (isError && selectedSongId) {
      Alert.alert(
        'Error',
        'Failed to load song. Please try again.',
        [{ text: 'OK', onPress: () => setSelectedSongId('') }]
      );
    }
  }, [isError, selectedSongId]);

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
    // Convert the URL to use the API format
    // The playlistUrl comes from charts/playlists and needs to be passed to the API
    setViewState({ mode: 'playlist', playlistUrl });
  };

  const handleChartPress = (chartUrl: string) => {
    // Charts use the same playlist detail screen, just pass the URL
    setViewState({ mode: 'playlist', playlistUrl: chartUrl });
  };

  const handleArtistPress = (artistId: string) => {
    setViewState({ mode: 'artist', artistId });
  };

  const handleNewReleasePress = (songId: string) => {
    setSelectedSongId(songId);
  };

  const handleBackToHome = () => {
    setViewState({ mode: 'home' });
  };

  // Render items based on type
  const renderModuleItem = (item: any, index: number, totalLength: number, moduleKey: string) => {
    const isLast = index === totalLength - 1;

    // Check if ID is numeric only (disable interaction for numeric IDs in new_trending and new_albums)
    const isRestrictedSection = moduleKey === 'new_trending' || moduleKey === 'new_albums';
    const isNumericId = isRestrictedSection && /^\d+$/.test(item.id);

    // Handle songs
    if (item.type === 'song') {
      return (
        <TouchableOpacity
          key={`${item.id}-${index}`}
          style={[styles.releaseCard, isLast && { marginRight: spacing.xl }]}
          onPress={() => !isNumericId && handleNewReleasePress(item.id)}
          activeOpacity={isNumericId ? 1 : 0.7}
          disabled={isNumericId}
        >
          <View style={styles.releaseImageContainer}>
            <Image
              source={{ uri: getImageUrl(item.image) }}
              style={[styles.releaseImage, isNumericId && { opacity: 0.6 }]}
              resizeMode='cover'
            />
            {!isNumericId && (
              <TouchableOpacity
                style={styles.playButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleNewReleasePress(item.id);
                }}
              >
                <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.releaseTitle, isNumericId && { opacity: 0.6 }]} numberOfLines={1}>
            {decodeHtmlEntities(item.title || item.name)}
          </Text>
          {(item.subtitle || item.followers) && (
            <Text style={[styles.releaseSubtitle, isNumericId && { opacity: 0.6 }]} numberOfLines={1}>
              {decodeHtmlEntities(item.subtitle || item.followers)}
            </Text>
          )}
        </TouchableOpacity>
      );
    }

    // Handle albums
    if (item.type === 'album') {
      return (
        <TouchableOpacity
          key={`${item.id}-${index}`}
          style={[styles.releaseCard, isLast && { marginRight: spacing.xl }]}
          onPress={() => !isNumericId && handleNewReleasePress(item.id)}
          activeOpacity={isNumericId ? 1 : 0.7}
          disabled={isNumericId}
        >
          <View style={styles.releaseImageContainer}>
            <Image
              source={{ uri: getImageUrl(item.image) }}
              style={[styles.releaseImage, isNumericId && { opacity: 0.6 }]}
              resizeMode='cover'
            />
            {!isNumericId && (
              <TouchableOpacity
                style={styles.playButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleNewReleasePress(item.id);
                }}
              >
                <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.releaseTitle, isNumericId && { opacity: 0.6 }]} numberOfLines={1}>
            {decodeHtmlEntities(item.title)}
          </Text>
          {item.subtitle && (
            <Text style={[styles.releaseSubtitle, isNumericId && { opacity: 0.6 }]} numberOfLines={1}>
              {decodeHtmlEntities(item.subtitle)}
            </Text>
          )}
        </TouchableOpacity>
      );
    }

    // Handle playlists
    if (item.type === 'playlist') {
      return (
        <TouchableOpacity
          key={item.id}
          style={[styles.playlistCard, isLast && { marginRight: spacing.xl }]}
          onPress={() => !isNumericId && handlePlaylistPress(item.url)}
          activeOpacity={isNumericId ? 1 : 0.7}
          disabled={isNumericId}
        >
          <View style={styles.releaseImageContainer}>
            <Image
              source={{ uri: getImageUrl(item.image) }}
              style={[styles.playlistImage, isNumericId && { opacity: 0.6 }]}
              resizeMode='cover'
            />
            {!isNumericId && (
              <TouchableOpacity style={styles.playButton} onPress={() => handlePlaylistPress(item.url)}>
                <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.playlistTitle, isNumericId && { opacity: 0.6 }]} numberOfLines={2}>
            {decodeHtmlEntities(item.title)}
          </Text>
          {item.followers && (
            <Text style={[styles.playlistFollowers, isNumericId && { opacity: 0.6 }]}>{item.followers}</Text>
          )}
        </TouchableOpacity>
      );
    }

    // Handle artists (fallback to default rendering if not in followed section)
    if (item.type === 'artist') {
      return (
        <TouchableOpacity
          key={item.id}
          style={[styles.artistCard, isLast && { marginRight: spacing.xl }]}
          onPress={() => !isNumericId && handleArtistPress(item.id)}
          activeOpacity={isNumericId ? 1 : 0.7}
          disabled={isNumericId}
        >
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={[styles.artistImage, isNumericId && { opacity: 0.6 }]}
            resizeMode='cover'
          />
          <Text style={[styles.artistName, isNumericId && { opacity: 0.6 }]} numberOfLines={1}>
            {decodeHtmlEntities(item.name)}
          </Text>
        </TouchableOpacity>
      );
    }

    // Default fallback
    return null;
  };

  // Import components dynamically
  const PlaylistDetailScreen = require('./PlaylistDetailScreen').default;
  const ArtistDetailScreen = require('./ArtistDetailScreen').default;

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

  if (viewState.mode === 'artist') {
    return (
      <ArtistDetailScreen
        artistId={viewState.artistId!}
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
      width: 150,
      marginRight: spacing.lg,
    },
    releaseImageContainer: {
      position: 'relative',
      marginBottom: spacing.sm,
    },
    releaseImage: {
      width: 150,
      height: 150,
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
      width: 150,
      marginRight: spacing.lg,
    },
    playlistImage: {
      width: 150,
      height: 150,
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
      width: 150,
      marginRight: spacing.lg,
    },
    chartImage: {
      width: 150,
      height: 150,
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
      width: 150,
    },
    artistImage: {
      width: 150,
      height: 150,
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
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    loadingContent: {
      backgroundColor: theme.card.background,
      padding: spacing.xxl,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,
      elevation: 8,
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: fontSize.base,
      color: theme.text.primary,
      fontWeight: fontWeight.semibold,
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
        {/* Render all modules dynamically */}
        {allModules
          .filter((module) => {
            // Filter out empty modules
            if (!module.items || module.items.length === 0) return false;

            // Normalize strings by removing all spaces, underscores, hyphens, and special characters
            const normalize = (str: string) =>
              str.toLowerCase().replace(/[_\s\-'']/g, '');

            const moduleKeyNormalized = normalize(module.key);
            const moduleTitleNormalized = normalize(module.title);

            // Filter out specific unwanted sections (normalized)
            const unwantedSections = [
              'trendingpodcasts',
              'radiostations',
              'whatshotinsingapore',
              'singapore',
              'whatshot'
            ];

            // Check if module key or title matches any unwanted section
            return !unwantedSections.some(unwanted =>
              moduleKeyNormalized.includes(unwanted) ||
              moduleTitleNormalized.includes(unwanted)
            );
          })
          .map((module, moduleIndex) => {
            return (
              <View key={`${module.key}-${moduleIndex}`} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{module.title}</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContainer}
                  nestedScrollEnabled={true}
                >
                  {module.items.slice(0, 20).map((item, index) =>
                    renderModuleItem(item, index, Math.min(module.items.length, 20), module.key)
                  )}
                </ScrollView>
              </View>
            );
          })}

        {/* Followed Artists */}
        {followedArtists.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Following</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
              nestedScrollEnabled={true}
            >
              {followedArtists.map((artist, index) => (
                <TouchableOpacity
                  key={artist.id}
                  style={[styles.artistCard, index === followedArtists.length - 1 && { marginRight: spacing.xl }]}
                  onPress={() => handleArtistPress(artist.id)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: getImageUrl(artist.image.find((img) => img.quality === '500x500')?.url || artist.image[0]?.url || '') }}
                    style={styles.artistImage}
                    resizeMode='cover'
                  />
                  <Text style={styles.artistName} numberOfLines={1}>
                    {decodeHtmlEntities(artist.name)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.paddingBottom} />
      </ScrollView>

      {/* Loading Overlay */}
      {isFetchingSong && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={theme.accent.primary} />
            <Text style={styles.loadingText}>Loading song...</Text>
          </View>
        </View>
      )}
    </View>
  );
}
