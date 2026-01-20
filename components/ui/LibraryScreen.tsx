// components/ui/LibraryScreen.tsx
import { useFavorites, usePlaylists, useHistory, useDownloads, useQueue } from '@/hooks/useStorage';
import { Song } from '@/types/searchSong';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';
import NowPlayingIndicator from './NowPlayingIndicator';

interface LibraryScreenProps {
  onSongPress?: (song: Song, playlistSongs?: Song[]) => void;
  onPlayQueue?: (songs: Song[], startIndex: number) => void;
  currentTrack?: Song | null;
  isPlaying?: boolean;
  onTogglePlayPause?: () => void;
}

export default function LibraryScreen({ onSongPress, onPlayQueue, currentTrack, isPlaying, onTogglePlayPause }: LibraryScreenProps) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('Favorites');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const { favorites, loading: favoritesLoading, refresh: refreshFavorites } = useFavorites();
  const { playlists, createPlaylist, deletePlaylist, removeSongFromPlaylist, loading: playlistsLoading, refresh: refreshPlaylists } = usePlaylists();
  const { history, loading: historyLoading, clearHistory, refresh: refreshHistory } = useHistory(20);
  const { downloads, deleteSong, getTotalSize, formatBytes, loading: downloadsLoading, refresh: refreshDownloads } = useDownloads();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      switch (activeTab) {
        case 'Favorites':
          await refreshFavorites();
          break;
        case 'Playlists':
          await refreshPlaylists();
          break;
        case 'History':
          await refreshHistory();
          break;
        case 'Downloads':
          await refreshDownloads();
          break;
      }
    } finally {
      setRefreshing(false);
    }
  };

  const tabs = ['Favorites', 'Playlists', 'History', 'Downloads'];

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    try {
      await createPlaylist(playlistName.trim(), playlistDescription.trim() || undefined);
      setPlaylistName('');
      setPlaylistDescription('');
      setShowCreatePlaylist(false);
      Alert.alert('Success', 'Playlist created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create playlist');
    }
  };

  const handleDeletePlaylist = (playlistId: string, playlistName: string) => {
    Alert.alert('Delete Playlist', `Are you sure you want to delete "${playlistName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePlaylist(playlistId);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete playlist');
          }
        },
      },
    ]);
  };

  const handleRemoveSongFromPlaylist = (playlistId: string, songId: string, songName: string) => {
    Alert.alert('Remove Song', `Remove "${songName}" from this playlist?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeSongFromPlaylist(playlistId, songId);
          } catch (error) {
            Alert.alert('Error', 'Failed to remove song from playlist');
          }
        },
      },
    ]);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTotalDuration = (songs: Song[]) => {
    const total = songs.reduce((acc, song) => acc + song.duration, 0);
    return formatDuration(total);
  };

  const getImageUrl = (images: any[], quality: string = '500x500') => {
    if (!images || !Array.isArray(images)) return null;
    const image = images.find((img) => img.quality === quality) || images[0];
    return image?.url || null;
  };

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
      paddingBottom: spacing.xl,
    },
    headerTitle: {
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
    },
    addButton: {
      width: iconSize.xl,
      height: iconSize.xl,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    tabContainer: {
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.xl,
    },
    tab: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.xl,
      marginRight: spacing.md,
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    activeTab: {
      backgroundColor: theme.accent.primary,
      borderColor: theme.accent.primary,
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    tabText: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
      fontWeight: fontWeight.medium,
    },
    activeTabText: {
      color: theme.text.inverse,
      fontWeight: fontWeight.semibold,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: theme.text.secondary,
      marginTop: spacing.md,
      fontSize: fontSize.sm,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 60,
      paddingHorizontal: spacing.xxxxl,
    },
    emptyStateTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    emptyStateText: {
      fontSize: fontSize.sm,
      color: theme.text.tertiary,
      textAlign: 'center',
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: spacing.xl,
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    listTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    listSubtitle: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
    },
    clearHistoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card.background,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.accent.error,
      gap: spacing.xs,
    },
    clearHistoryText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: theme.accent.error,
    },
    listContent: {
      paddingBottom: 100,
    },
    songItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 4,
      elevation: 2,
    },
    songImage: {
      width: 50,
      height: 50,
      borderRadius: borderRadius.sm,
      marginRight: spacing.md,
      backgroundColor: theme.card.background,
    },
    songInfo: {
      flex: 1,
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
    playedAt: {
      fontSize: fontSize.xs,
      color: theme.text.tertiary,
      marginTop: 2,
    },
    playIconButton: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary + '33',
      justifyContent: 'center',
      alignItems: 'center',
    },
    songItemPlaying: {
      backgroundColor: theme.accent.primary + '15',
      borderColor: theme.accent.primary + '40',
    },
    songTitlePlaying: {
      color: theme.accent.primary,
    },
    nowPlayingContainer: {
      marginRight: spacing.sm,
    },
    playAllButtonContainer: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.primary,
    },
    playAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accent.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.full,
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
    playlistsContainer: {
      flex: 1,
      paddingHorizontal: spacing.xl,
    },
    playlistItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 4,
      elevation: 2,
    },
    playlistImageContainer: {
      marginRight: spacing.lg,
    },
    playlistImage: {
      width: 64,
      height: 64,
      borderRadius: borderRadius.md,
      backgroundColor: theme.card.background,
    },
    placeholderImage: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    playlistInfo: {
      flex: 1,
    },
    playlistTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    playlistDescription: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
      marginBottom: spacing.xs,
    },
    playlistDetails: {
      fontSize: fontSize.sm,
      color: theme.text.tertiary,
    },
    deleteButton: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.error + '1A',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.sm,
    },
    historyContainer: {
      flex: 1,
      paddingHorizontal: spacing.xl,
    },
    downloadsContainer: {
      flex: 1,
      paddingHorizontal: spacing.xl,
    },
    downloadInfo: {
      fontSize: fontSize.xs,
      color: theme.text.tertiary,
      marginTop: 2,
    },
    removeSongButton: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.error + '1A',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.sm,
    },
    paddingBottom: {
      height: 100,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.background.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '85%',
      backgroundColor: theme.background.elevated,
      borderRadius: borderRadius.xl,
      padding: spacing.xxl,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: theme.shadow.opacity * 2,
      shadowRadius: 16,
      elevation: 8,
    },
    modalTitle: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
    input: {
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      color: theme.text.primary,
      fontSize: fontSize.base,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    cancelButton: {
      flex: 1,
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    cancelButtonText: {
      color: theme.text.primary,
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      textAlign: 'center',
    },
    createButton: {
      flex: 1,
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      backgroundColor: theme.accent.primary,
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    createButtonText: {
      color: theme.text.inverse,
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      textAlign: 'center',
    },
  });

  const renderSongItem = ({ item, index }: { item: Song; index?: number }) => {
    const isCurrentTrack = currentTrack?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.songItem, isCurrentTrack && styles.songItemPlaying]}
        onPress={() => onSongPress && onSongPress(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: getImageUrl(item.image, '150x150') || '' }} style={styles.songImage} />
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, isCurrentTrack && styles.songTitlePlaying]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artists.primary.map((artist) => artist.name).join(', ')}
          </Text>
        </View>
        {isCurrentTrack ? (
          <View style={styles.nowPlayingContainer}>
            <NowPlayingIndicator isPlaying={isPlaying ?? false} />
          </View>
        ) : null}
        <TouchableOpacity
          style={styles.playIconButton}
          onPress={(e) => {
            e.stopPropagation();
            if (isCurrentTrack && onTogglePlayPause) {
              onTogglePlayPause();
            } else if (onSongPress) {
              onSongPress(item);
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

  const renderFavorites = () => {
    if (favoritesLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.accent.primary} />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      );
    }

    if (favorites.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name='heart-outline' size={64} color={theme.text.tertiary} />
          <Text style={styles.emptyStateTitle}>No favorites yet</Text>
          <Text style={styles.emptyStateText}>Songs you like will appear here</Text>
        </View>
      );
    }

    const handlePlayAll = () => {
      if (favorites.length > 0) {
        if (onPlayQueue) {
          onPlayQueue(favorites, 0);
        } else if (onSongPress) {
          onSongPress(favorites[0]);
        }
      }
    };

    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{favorites.length} Liked Songs</Text>
          <Text style={styles.listSubtitle}>{getTotalDuration(favorites)}</Text>
        </View>
        <View style={styles.playAllButtonContainer}>
          <TouchableOpacity style={styles.playAllButton} onPress={handlePlayAll}>
            <Ionicons name='play' size={iconSize.md} color={theme.text.inverse} />
            <Text style={styles.playAllText}>Play All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={favorites}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.accent.primary}
              colors={[theme.accent.primary]}
            />
          }
        />
      </View>
    );
  };

  const renderPlaylists = () => {
    if (playlistsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.accent.primary} />
          <Text style={styles.loadingText}>Loading playlists...</Text>
        </View>
      );
    }

    if (playlists.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name='musical-notes-outline' size={64} color={theme.text.tertiary} />
          <Text style={styles.emptyStateTitle}>No playlists yet</Text>
          <Text style={styles.emptyStateText}>Create your first playlist</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.playlistsContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent.primary}
            colors={[theme.accent.primary]}
          />
        }
      >
        {playlists.map((playlist) => (
          <TouchableOpacity
            key={playlist.id}
            style={styles.playlistItem}
            onPress={() => setSelectedPlaylistId(playlist.id)}
          >
            <View style={styles.playlistImageContainer}>
              {playlist.songs.length > 0 && getImageUrl(playlist.songs[0].image) ? (
                <Image source={{ uri: getImageUrl(playlist.songs[0].image) || '' }} style={styles.playlistImage} />
              ) : (
                <View style={[styles.playlistImage, styles.placeholderImage]}>
                  <Ionicons name='musical-notes' size={iconSize.xl} color={theme.accent.primary} />
                </View>
              )}
            </View>
            <View style={styles.playlistInfo}>
              <Text style={styles.playlistTitle}>{playlist.name}</Text>
              {playlist.description && <Text style={styles.playlistDescription}>{playlist.description}</Text>}
              <Text style={styles.playlistDetails}>
                {playlist.songs.length} songs{playlist.songs.length > 0 && ` • ${getTotalDuration(playlist.songs)}`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePlaylist(playlist.id, playlist.name)}
            >
              <Ionicons name='trash-outline' size={iconSize.sm} color={theme.accent.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <View style={styles.paddingBottom} />
      </ScrollView>
    );
  };

  const renderHistory = () => {
    if (historyLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.accent.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      );
    }

    if (history.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name='time-outline' size={64} color={theme.text.tertiary} />
          <Text style={styles.emptyStateTitle}>No history yet</Text>
          <Text style={styles.emptyStateText}>Songs you play will appear here</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.historyContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent.primary}
            colors={[theme.accent.primary]}
          />
        }
      >
        <View style={styles.listHeader}>
          <View>
            <Text style={styles.listTitle}>Recently Played</Text>
            <Text style={styles.listSubtitle}>{history.length} songs</Text>
          </View>
          <TouchableOpacity
            style={styles.clearHistoryButton}
            onPress={() => {
              Alert.alert(
                'Clear History',
                'Are you sure you want to clear your listening history? This action cannot be undone.',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await clearHistory();
                        Alert.alert('Success', 'History cleared successfully');
                      } catch (error) {
                        Alert.alert('Error', 'Failed to clear history');
                      }
                    },
                  },
                ],
              );
            }}
          >
            <Ionicons name='trash-outline' size={20} color={theme.accent.error} />
            <Text style={styles.clearHistoryText}>Clear</Text>
          </TouchableOpacity>
        </View>
        {history.map((item, index) => (
          <TouchableOpacity key={`${item.song.id}-${index}`} style={styles.songItem}>
            <Image
              source={{ uri: getImageUrl(item.song.image, '150x150') || '' }}
              style={styles.songImage}
            />
            <View style={styles.songInfo}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {item.song.name}
              </Text>
              <Text style={styles.songArtist} numberOfLines={1}>
                {item.song.artists.primary.map((artist) => artist.name).join(', ')}
              </Text>
              <Text style={styles.playedAt}>
                {new Date(item.playedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <TouchableOpacity style={styles.playIconButton}>
              <Ionicons name='play' size={iconSize.sm} color={theme.accent.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <View style={styles.paddingBottom} />
      </ScrollView>
    );
  };

  const handleDeleteDownload = (songId: string, songName: string) => {
    Alert.alert('Delete Download', `Are you sure you want to delete "${songName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSong(songId);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete download');
          }
        },
      },
    ]);
  };

  const renderDownloads = () => {
    if (downloadsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.accent.primary} />
          <Text style={styles.loadingText}>Loading downloads...</Text>
        </View>
      );
    }

    if (downloads.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name='download-outline' size={64} color={theme.text.tertiary} />
          <Text style={styles.emptyStateTitle}>No downloads yet</Text>
          <Text style={styles.emptyStateText}>Download songs for offline playback</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.downloadsContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent.primary}
            colors={[theme.accent.primary]}
          />
        }
      >
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Downloaded</Text>
          <Text style={styles.listSubtitle}>
            {downloads.length} songs • {formatBytes(getTotalSize())}
          </Text>
        </View>
        {downloads.map((song) => (
          <TouchableOpacity key={song.id} style={styles.songItem}>
            <Image
              source={{ uri: getImageUrl(song.image, '150x150') || '' }}
              style={styles.songImage}
            />
            <View style={styles.songInfo}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {song.name}
              </Text>
              <Text style={styles.songArtist} numberOfLines={1}>
                {song.artists.primary.map((artist) => artist.name).join(', ')}
              </Text>
              <Text style={styles.downloadInfo}>
                {formatBytes(song.fileSize)} • {new Date(song.downloadDate).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteDownload(song.id, song.name)}
            >
              <Ionicons name='trash-outline' size={iconSize.sm} color={theme.accent.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <View style={styles.paddingBottom} />
      </ScrollView>
    );
  };

  // Get selected playlist
  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

  // Render song item for playlist detail with remove button
  const renderPlaylistSongItem = ({ item, index }: { item: Song; index: number }) => {
    const isCurrentTrack = currentTrack?.id === item.id;

    // Handler to play single song with playlist context for auto-play feature
    const handlePlaySingleSong = () => {
      if (onSongPress && selectedPlaylist) {
        onSongPress(item, selectedPlaylist.songs);
      } else if (onSongPress) {
        onSongPress(item);
      }
    };

    return (
      <TouchableOpacity
        style={[styles.songItem, isCurrentTrack && styles.songItemPlaying]}
        onPress={handlePlaySingleSong}
        activeOpacity={0.7}
      >
        <Image source={{ uri: getImageUrl(item.image, '150x150') || '' }} style={styles.songImage} />
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, isCurrentTrack && styles.songTitlePlaying]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artists.primary.map((artist) => artist.name).join(', ')}
          </Text>
        </View>
        {isCurrentTrack ? (
          <View style={styles.nowPlayingContainer}>
            <NowPlayingIndicator isPlaying={isPlaying ?? false} />
          </View>
        ) : null}
        <TouchableOpacity
          style={styles.playIconButton}
          onPress={(e) => {
            e.stopPropagation();
            if (isCurrentTrack && onTogglePlayPause) {
              onTogglePlayPause();
            } else {
              handlePlaySingleSong();
            }
          }}
        >
          <Ionicons
            name={isCurrentTrack ? (isPlaying ? 'pause' : 'play') : 'play'}
            size={iconSize.sm}
            color={theme.accent.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeSongButton}
          onPress={() => selectedPlaylistId && handleRemoveSongFromPlaylist(selectedPlaylistId, item.id, item.name)}
        >
          <Ionicons name='close' size={iconSize.sm} color={theme.accent.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // If a playlist is selected, show playlist songs
  if (selectedPlaylist) {
    const handlePlayAllPlaylist = () => {
      if (selectedPlaylist.songs.length > 0) {
        if (onPlayQueue) {
          onPlayQueue(selectedPlaylist.songs, 0);
        } else if (onSongPress) {
          onSongPress(selectedPlaylist.songs[0]);
        }
      }
    };

    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedPlaylistId(null)} style={{ marginRight: spacing.lg }}>
            <Ionicons name='arrow-back' size={iconSize.lg} color={theme.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {selectedPlaylist.name}
          </Text>
        </View>

        {/* Playlist Info */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            {selectedPlaylist.description && (
              <Text style={styles.playlistDescription}>{selectedPlaylist.description}</Text>
            )}
            <Text style={styles.listSubtitle}>
              {selectedPlaylist.songs.length} songs
              {selectedPlaylist.songs.length > 0 && ` • ${getTotalDuration(selectedPlaylist.songs)}`}
            </Text>
          </View>

          {/* Songs List */}
          {selectedPlaylist.songs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name='musical-notes-outline' size={64} color={theme.text.tertiary} />
              <Text style={styles.emptyStateTitle}>No songs in playlist</Text>
              <Text style={styles.emptyStateText}>Add songs to this playlist</Text>
            </View>
          ) : (
            <>
              <View style={styles.playAllButtonContainer}>
                <TouchableOpacity style={styles.playAllButton} onPress={handlePlayAllPlaylist}>
                  <Ionicons name='play' size={iconSize.md} color={theme.text.inverse} />
                  <Text style={styles.playAllText}>Play All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={selectedPlaylist.songs}
                renderItem={renderPlaylistSongItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        {activeTab === 'Playlists' && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowCreatePlaylist(true)}>
            <Ionicons name='add' size={iconSize.md} color={theme.text.inverse} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'Favorites' && renderFavorites()}
        {activeTab === 'Playlists' && renderPlaylists()}
        {activeTab === 'History' && renderHistory()}
        {activeTab === 'Downloads' && renderDownloads()}
      </View>

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreatePlaylist}
        transparent
        animationType='fade'
        onRequestClose={() => setShowCreatePlaylist(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Playlist</Text>

            <TextInput
              style={styles.input}
              placeholder='Playlist name'
              placeholderTextColor={theme.text.tertiary}
              value={playlistName}
              onChangeText={setPlaylistName}
              autoFocus
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder='Description (optional)'
              placeholderTextColor={theme.text.tertiary}
              value={playlistDescription}
              onChangeText={setPlaylistDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCreatePlaylist(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={handleCreatePlaylist}>
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
