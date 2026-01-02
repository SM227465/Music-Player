// components/ui/LibraryScreen.tsx
import { useFavorites, usePlaylists, useHistory, useDownloads } from '@/hooks/useStorage';
import { Song } from '@/types/searchSong';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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

export default function LibraryScreen() {
  const [activeTab, setActiveTab] = useState('Favorites');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { favorites, loading: favoritesLoading, refresh: refreshFavorites } = useFavorites();
  const { playlists, createPlaylist, deletePlaylist, loading: playlistsLoading, refresh: refreshPlaylists } = usePlaylists();
  const { history, loading: historyLoading, refresh: refreshHistory } = useHistory(20);
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

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.songItem}>
      <Image source={{ uri: getImageUrl(item.image, '150x150') || '' }} style={styles.songImage} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.artists.primary.map((artist) => artist.name).join(', ')}
        </Text>
      </View>
      <TouchableOpacity style={styles.playIconButton}>
        <Ionicons name='play' size={20} color='#8B5CF6' />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFavorites = () => {
    if (favoritesLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#8B5CF6' />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      );
    }

    if (favorites.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name='heart-outline' size={64} color='#6B7280' />
          <Text style={styles.emptyStateTitle}>No favorites yet</Text>
          <Text style={styles.emptyStateText}>Songs you like will appear here</Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{favorites.length} Liked Songs</Text>
          <Text style={styles.listSubtitle}>{getTotalDuration(favorites)}</Text>
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
              tintColor="#8B5CF6"
              colors={['#8B5CF6']}
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
          <ActivityIndicator size='large' color='#8B5CF6' />
          <Text style={styles.loadingText}>Loading playlists...</Text>
        </View>
      );
    }

    if (playlists.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name='musical-notes-outline' size={64} color='#6B7280' />
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
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
          />
        }
      >
        {playlists.map((playlist) => (
          <TouchableOpacity key={playlist.id} style={styles.playlistItem}>
            <View style={styles.playlistImageContainer}>
              {playlist.songs.length > 0 && getImageUrl(playlist.songs[0].image) ? (
                <Image source={{ uri: getImageUrl(playlist.songs[0].image) || '' }} style={styles.playlistImage} />
              ) : (
                <View style={[styles.playlistImage, styles.placeholderImage]}>
                  <Ionicons name='musical-notes' size={32} color='#8B5CF6' />
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
              <Ionicons name='trash-outline' size={20} color='#EF4444' />
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
          <ActivityIndicator size='large' color='#8B5CF6' />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      );
    }

    if (history.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name='time-outline' size={64} color='#6B7280' />
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
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
          />
        }
      >
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Recently Played</Text>
          <Text style={styles.listSubtitle}>{history.length} songs</Text>
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
              <Ionicons name='play' size={20} color='#8B5CF6' />
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
          <ActivityIndicator size='large' color='#8B5CF6' />
          <Text style={styles.loadingText}>Loading downloads...</Text>
        </View>
      );
    }

    if (downloads.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name='download-outline' size={64} color='#6B7280' />
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
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
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
              <Ionicons name='trash-outline' size={20} color='#EF4444' />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <View style={styles.paddingBottom} />
      </ScrollView>
    );
  };

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#533483']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        {activeTab === 'Playlists' && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowCreatePlaylist(true)}>
            <Ionicons name='add' size={24} color='#fff' />
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
              placeholderTextColor='#6B7280'
              value={playlistName}
              onChangeText={setPlaylistName}
              autoFocus
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder='Description (optional)'
              placeholderTextColor='#6B7280'
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
    </LinearGradient>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    color: '#B8B8D1',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
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
    color: '#B8B8D1',
    marginTop: 12,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listHeader: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#B8B8D1',
  },
  listContent: {
    paddingBottom: 100,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 13,
    color: '#B8B8D1',
  },
  playedAt: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  playIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  playlistImageContainer: {
    marginRight: 16,
  },
  playlistImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  playlistDescription: {
    fontSize: 13,
    color: '#B8B8D1',
    marginBottom: 4,
  },
  playlistDetails: {
    fontSize: 13,
    color: '#6B7280',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  downloadsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  downloadInfo: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  paddingBottom: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
