// components/ui/PlaylistDetailScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';
import { Song } from '@/types/searchSong';
import { usePlaylistDetails } from '@/hooks/useJioSaavnQueries';

interface PlaylistDetailScreenProps {
  playlistUrl: string;
  onBack: () => void;
  onSongPress?: (song: Song) => void;
  onPlayQueue?: (songs: Song[], startIndex: number) => void;
}


export default function PlaylistDetailScreen({ playlistUrl, onBack, onSongPress, onPlayQueue }: PlaylistDetailScreenProps) {
  const theme = useTheme();
  const { data: playlist, isLoading: loading, isError: error, refetch } = usePlaylistDetails(playlistUrl);

  const getImageUrl = (images: Array<{ quality: string; url: string }>, quality: string = '500x500') => {
    const image = images.find((img) => img.quality === quality) || images[0];
    return image?.url || '';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSongPress = (song: Song, index?: number) => {
    if (playlist && playlist.songs && onPlayQueue && index !== undefined) {
      // Play the entire queue starting from this song
      onPlayQueue(playlist.songs, index);
    } else if (onSongPress) {
      // Fallback to single song play
      onSongPress(song);
    }
  };

  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      if (onPlayQueue) {
        // Play the entire queue starting from the first song
        onPlayQueue(playlist.songs, 0);
      } else if (onSongPress) {
        // Fallback to playing just the first song
        onSongPress(playlist.songs[0]);
      }
    }
  };

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => handleSongPress(item, index)}
      activeOpacity={0.7}
    >
      <Text style={styles.songIndex}>{(index + 1).toString().padStart(2, '0')}</Text>
      <Image
        source={{ uri: getImageUrl(item.image, '150x150') }}
        style={styles.songImage}
        resizeMode='cover'
      />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.artists.primary.map((artist) => artist.name).join(', ')}
        </Text>
      </View>
      <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>
      <TouchableOpacity style={styles.songPlayButton} onPress={() => handleSongPress(item, index)}>
        <Ionicons name='play' size={iconSize.sm} color={theme.accent.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.sm,
    },
    backButton: {
      width: iconSize.xl,
      height: iconSize.xl,
      borderRadius: borderRadius.full,
      backgroundColor: theme.card.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    playlistInfo: {
      alignItems: 'center',
      paddingBottom: spacing.md,
    },
    playlistImage: {
      width: 140,
      height: 140,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      backgroundColor: theme.card.background,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,
      elevation: 4,
    },
    playlistName: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
      textAlign: 'center',
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.lg,
    },
    playlistDescription: {
      fontSize: fontSize.xs,
      color: theme.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.lg,
    },
    playlistMeta: {
      fontSize: fontSize.xs,
      color: theme.text.tertiary,
      textAlign: 'center',
    },
    playAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accent.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.full,
      marginTop: spacing.md,
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    playAllText: {
      color: theme.text.inverse,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      marginLeft: spacing.sm,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xxxxl,
    },
    errorText: {
      fontSize: fontSize.lg,
      color: theme.text.tertiary,
      marginTop: spacing.lg,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: spacing.xl,
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.md,
      backgroundColor: theme.accent.primary,
      borderRadius: borderRadius.md,
    },
    retryButtonText: {
      color: theme.text.inverse,
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
    },
    songsList: {
      flex: 1,
      paddingHorizontal: spacing.xl,
    },
    songsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.primary,
      marginBottom: spacing.sm,
    },
    songsHeaderText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.text.secondary,
    },
    songItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      marginBottom: spacing.xs,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    songIndex: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.text.tertiary,
      width: 30,
    },
    songImage: {
      width: 45,
      height: 45,
      borderRadius: borderRadius.sm,
      marginRight: spacing.sm,
      backgroundColor: theme.card.background,
    },
    songInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    songTitle: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: 2,
    },
    songArtist: {
      fontSize: fontSize.xs,
      color: theme.text.secondary,
    },
    songDuration: {
      fontSize: fontSize.sm,
      color: theme.text.tertiary,
      marginRight: spacing.md,
    },
    songPlayButton: {
      width: iconSize.xl,
      height: iconSize.xl,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary + '1A',
      justifyContent: 'center',
      alignItems: 'center',
    },
    listFooter: {
      height: 100,
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name='arrow-back' size={iconSize.md} color={theme.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.accent.primary} />
        </View>
      </View>
    );
  }

  if (error || !playlist) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name='arrow-back' size={iconSize.md} color={theme.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name='alert-circle-outline' size={64} color={theme.text.tertiary} />
          <Text style={styles.errorText}>Failed to load playlist. Please try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name='arrow-back' size={iconSize.md} color={theme.text.primary} />
        </TouchableOpacity>

        <View style={styles.playlistInfo}>
          <Image
            source={{ uri: getImageUrl(playlist.image) }}
            style={styles.playlistImage}
            resizeMode='cover'
          />
          <Text style={styles.playlistName}>{playlist.name}</Text>
          {playlist.description && (
            <Text style={styles.playlistDescription}>{playlist.description.replace(/&amp;/g, '&')}</Text>
          )}
          <Text style={styles.playlistMeta}>{playlist.songCount} songs</Text>

          <TouchableOpacity style={styles.playAllButton} onPress={handlePlayAll}>
            <Ionicons name='play' size={iconSize.md} color={theme.text.inverse} />
            <Text style={styles.playAllText}>Play All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.songsList}>
        <View style={styles.songsHeader}>
          <Text style={styles.songsHeaderText}>Songs</Text>
          <Text style={styles.songsHeaderText}>{playlist.songs.length} tracks</Text>
        </View>

        <FlatList
          data={playlist.songs}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={styles.listFooter} />}
        />
      </View>
    </View>
  );
}
