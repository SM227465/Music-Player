// components/ui/ArtistDetailScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';
import { Song } from '@/types/searchSong';
import { useArtistDetails } from '@/hooks/useJioSaavnQueries';
import { decodeHtmlEntities } from '../../utils/htmlDecode';
import NowPlayingIndicator from './NowPlayingIndicator';
import { TopSong } from '@/types/artistDetails';
import { ArtistDetailSkeleton } from './SkeletonLoader';

interface ArtistDetailScreenProps {
  artistId: string;
  onBack: () => void;
  onSongPress?: (song: Song) => void;
  onPlayQueue?: (songs: Song[], startIndex: number) => void;
  currentTrack?: Song | null;
  isPlaying?: boolean;
  onTogglePlayPause?: () => void;
}

export default function ArtistDetailScreen({
  artistId,
  onBack,
  onSongPress,
  onPlayQueue,
  currentTrack,
  isPlaying,
  onTogglePlayPause,
}: ArtistDetailScreenProps) {
  const theme = useTheme();
  const { data: artistResponse, isLoading, isError } = useArtistDetails(artistId);
  const [showFullBio, setShowFullBio] = useState(false);

  const artist = artistResponse?.data;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingBottom: spacing.lg,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: theme.card.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: fontSize.base,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    errorText: {
      marginTop: spacing.lg,
      marginBottom: spacing.xl,
      fontSize: fontSize.base,
      textAlign: 'center',
    },
    retryButton: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.full,
    },
    retryButtonText: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
    },
    artistInfo: {
      alignItems: 'center',
      paddingBottom: spacing.xl,
    },
    artistImage: {
      width: 160,
      height: 160,
      borderRadius: borderRadius.full,
      marginBottom: spacing.lg,
    },
    artistName: {
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    verifiedContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    verifiedText: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
      marginRight: spacing.xs,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.md,
      gap: spacing.xl,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
    },
    statLabel: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
      marginTop: spacing.xs,
    },
    bioContainer: {
      paddingBottom: spacing.lg,
    },
    bioTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
      marginBottom: spacing.md,
    },
    bioText: {
      fontSize: fontSize.base,
      color: theme.text.secondary,
      lineHeight: 24,
    },
    showMoreButton: {
      marginTop: spacing.sm,
    },
    showMoreText: {
      fontSize: fontSize.base,
      color: theme.accent.primary,
      fontWeight: fontWeight.semibold,
    },
    topSongsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    topSongsTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
    },
    playAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.accent.primary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.full,
    },
    playAllText: {
      color: theme.text.inverse,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      marginLeft: spacing.xs,
    },
    songsList: {
      paddingHorizontal: spacing.xl,
    },
    songItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.primary,
    },
    songIndexContainer: {
      width: 32,
      alignItems: 'center',
      marginRight: spacing.md,
    },
    songIndex: {
      fontSize: fontSize.sm,
      color: theme.text.tertiary,
      fontWeight: fontWeight.medium,
    },
    songImage: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.sm,
      marginRight: spacing.md,
    },
    songInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    songTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    songArtist: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
    },
    songDuration: {
      fontSize: fontSize.sm,
      color: theme.text.tertiary,
      marginRight: spacing.md,
    },
    songPlayButton: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const getImageUrl = (images: Array<{ quality: string; url: string }>, quality: string = '500x500') => {
    const image = images.find((img) => img.quality === quality) || images[0];
    return image?.url || '';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const convertTopSongToSong = (topSong: TopSong): Song => {
    return {
      id: topSong.id,
      name: topSong.name,
      type: topSong.type,
      year: topSong.year,
      releaseDate: topSong.releaseDate,
      duration: topSong.duration,
      label: topSong.label,
      explicitContent: topSong.explicitContent,
      playCount: topSong.playCount ?? 0,
      language: topSong.language,
      hasLyrics: topSong.hasLyrics,
      lyricsId: topSong.lyricsId,
      url: topSong.url,
      copyright: topSong.copyright,
      album: topSong.album,
      artists: topSong.artists,
      image: topSong.image,
      downloadUrl: topSong.downloadUrl,
    };
  };

  const handleSongPress = (topSong: TopSong, index?: number) => {
    const song = convertTopSongToSong(topSong);

    if (artist && artist.topSongs && onPlayQueue && index !== undefined) {
      const songs = artist.topSongs.map(convertTopSongToSong);
      onPlayQueue(songs, index);
    } else if (onSongPress) {
      onSongPress(song);
    }
  };

  const handlePlayAll = () => {
    if (artist && artist.topSongs && artist.topSongs.length > 0) {
      const songs = artist.topSongs.map(convertTopSongToSong);
      if (onPlayQueue) {
        onPlayQueue(songs, 0);
      } else if (onSongPress) {
        onSongPress(songs[0]);
      }
    }
  };

  const renderSongItem = ({ item, index }: { item: TopSong; index: number }) => {
    const isCurrentTrack = currentTrack?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.songItem, isCurrentTrack && { backgroundColor: theme.accent.primary + '15', borderColor: theme.accent.primary + '40' }]}
        onPress={() => handleSongPress(item, index)}
        activeOpacity={0.7}
      >
        <View style={styles.songIndexContainer}>
          {isCurrentTrack ? (
            <NowPlayingIndicator isPlaying={isPlaying ?? false} />
          ) : (
            <Text style={styles.songIndex}>{(index + 1).toString().padStart(2, '0')}</Text>
          )}
        </View>
        <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.songImage} resizeMode='cover' />
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, isCurrentTrack && { color: theme.accent.primary }]} numberOfLines={1}>
            {decodeHtmlEntities(item.name)}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {decodeHtmlEntities(item.album.name)}
          </Text>
        </View>
        <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>
        <TouchableOpacity
          style={styles.songPlayButton}
          onPress={(e) => {
            e.stopPropagation();
            if (isCurrentTrack && onTogglePlayPause) {
              onTogglePlayPause();
            } else {
              handleSongPress(item, index);
            }
          }}
        >
          <Ionicons
            name={isCurrentTrack ? (isPlaying ? 'pause' : 'play') : 'play'}
            size={iconSize.sm}
            color={theme.accent.primary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <ArtistDetailSkeleton />;
  }

  if (isError || !artist) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={[styles.header, { paddingTop: 60 }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name='arrow-back' size={iconSize.md} color={theme.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name='alert-circle-outline' size={64} color={theme.text.tertiary} />
          <Text style={[styles.errorText, { color: theme.text.secondary }]}>Failed to load artist details</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.accent.primary }]}
            onPress={() => {}}
          >
            <Text style={[styles.retryButtonText, { color: theme.text.inverse }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const introBio = artist.bio.find(b => b.title === 'Introduction');

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <FlatList
        data={artist.topSongs}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: spacing.xl }}
        ListHeaderComponent={
          <>
            <View style={[styles.header, { paddingTop: 60 }]}>
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Ionicons name='arrow-back' size={iconSize.md} color={theme.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.artistInfo}>
              <Image
                source={{ uri: getImageUrl(artist.image, '500x500') }}
                style={styles.artistImage}
                resizeMode='cover'
              />
              <Text style={styles.artistName}>{decodeHtmlEntities(artist.name)}</Text>
              {artist.isVerified && (
                <View style={styles.verifiedContainer}>
                  <Text style={styles.verifiedText}>Verified Artist</Text>
                  <Ionicons name='checkmark-circle' size={iconSize.sm} color={theme.accent.primary} />
                </View>
              )}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatFollowers(artist.followerCount)}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                {artist.fanCount && (
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formatFollowers(parseInt(artist.fanCount))}</Text>
                    <Text style={styles.statLabel}>Fans</Text>
                  </View>
                )}
              </View>
            </View>

            {introBio && (
              <View style={styles.bioContainer}>
                <Text style={styles.bioTitle}>About</Text>
                <Text style={styles.bioText} numberOfLines={showFullBio ? undefined : 4}>
                  {decodeHtmlEntities(introBio.text)}
                </Text>
                {introBio.text.length > 150 && (
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setShowFullBio(!showFullBio)}
                  >
                    <Text style={styles.showMoreText}>{showFullBio ? 'Show less' : 'Show more'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.topSongsHeader}>
              <Text style={styles.topSongsTitle}>Top Songs</Text>
              <TouchableOpacity style={styles.playAllButton} onPress={handlePlayAll}>
                <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
                <Text style={styles.playAllText}>Play All</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />
    </View>
  );
}
