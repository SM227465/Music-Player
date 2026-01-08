// components/ui/AddToPlaylistModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '@/types/searchSong';
import { Playlist, playlistService } from '@/services/storage.service';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';
import { BlurView } from 'expo-blur';

interface AddToPlaylistModalProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
}

export default function AddToPlaylistModal({ visible, song, onClose }: AddToPlaylistModalProps) {
  const theme = useTheme();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

  useEffect(() => {
    if (visible) {
      loadPlaylists();
    }
  }, [visible]);

  const loadPlaylists = async () => {
    try {
      const allPlaylists = await playlistService.getPlaylists();
      setPlaylists(allPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    try {
      const newPlaylist = await playlistService.createPlaylist(
        newPlaylistName.trim(),
        newPlaylistDescription.trim() || undefined
      );

      if (song) {
        await playlistService.addSongToPlaylist(newPlaylist.id, song);
        Alert.alert('Success', `Added to "${newPlaylist.name}"`);
      }

      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreatePlaylist(false);
      loadPlaylists();
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
      Alert.alert('Error', 'Failed to create playlist');
    }
  };

  const handleAddToPlaylist = async (playlist: Playlist) => {
    if (!song) return;

    try {
      await playlistService.addSongToPlaylist(playlist.id, song);
      Alert.alert('Success', `Added to "${playlist.name}"`);
      onClose();
    } catch (error) {
      console.error('Error adding to playlist:', error);
      Alert.alert('Error', 'Failed to add song to playlist');
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.background.overlay,
    },
    modalContent: {
      backgroundColor: theme.card.background,
      borderTopLeftRadius: borderRadius.xxl,
      borderTopRightRadius: borderRadius.xxl,
      maxHeight: '80%',
      paddingBottom: spacing.xxxl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.primary,
    },
    headerTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.full,
      backgroundColor: theme.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
      marginHorizontal: spacing.xl,
      marginVertical: spacing.md,
      backgroundColor: theme.primary,
      borderRadius: borderRadius.lg,
    },
    createButtonText: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: '#fff',
      marginLeft: spacing.sm,
    },
    playlistsList: {
      paddingHorizontal: spacing.xl,
    },
    playlistItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
    },
    playlistIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      backgroundColor: theme.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    playlistInfo: {
      flex: 1,
    },
    playlistName: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    playlistCount: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
    },
    emptyText: {
      textAlign: 'center',
      padding: spacing.xxxl,
      color: theme.text.secondary,
      fontSize: fontSize.base,
    },
    createForm: {
      padding: spacing.xl,
    },
    input: {
      backgroundColor: theme.background.secondary,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      color: theme.text.primary,
      fontSize: fontSize.base,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    button: {
      flex: 1,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.background.secondary,
    },
    submitButton: {
      backgroundColor: theme.primary,
    },
    buttonText: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
    },
    cancelButtonText: {
      color: theme.text.primary,
    },
    submitButtonText: {
      color: '#fff',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {showCreatePlaylist ? 'Create Playlist' : 'Add to Playlist'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={iconSize.md} color={theme.text.primary} />
            </TouchableOpacity>
          </View>

          {showCreatePlaylist ? (
            <View style={styles.createForm}>
              <TextInput
                style={styles.input}
                placeholder="Playlist name"
                placeholderTextColor={theme.text.tertiary}
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                autoFocus
              />
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Description (optional)"
                placeholderTextColor={theme.text.tertiary}
                value={newPlaylistDescription}
                onChangeText={setNewPlaylistDescription}
                multiline
                numberOfLines={3}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowCreatePlaylist(false);
                    setNewPlaylistName('');
                    setNewPlaylistDescription('');
                  }}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleCreatePlaylist}
                >
                  <Text style={[styles.buttonText, styles.submitButtonText]}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreatePlaylist(true)}
              >
                <Ionicons name="add-circle" size={iconSize.md} color="#fff" />
                <Text style={styles.createButtonText}>Create New Playlist</Text>
              </TouchableOpacity>

              {playlists.length === 0 ? (
                <Text style={styles.emptyText}>No playlists yet. Create one!</Text>
              ) : (
                <FlatList
                  data={playlists}
                  keyExtractor={(item) => item.id}
                  style={styles.playlistsList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.playlistItem}
                      onPress={() => handleAddToPlaylist(item)}
                    >
                      <View style={styles.playlistIcon}>
                        <Ionicons name="musical-notes" size={iconSize.md} color={theme.text.secondary} />
                      </View>
                      <View style={styles.playlistInfo}>
                        <Text style={styles.playlistName}>{item.name}</Text>
                        <Text style={styles.playlistCount}>{item.songs.length} songs</Text>
                      </View>
                      <Ionicons name="add" size={iconSize.md} color={theme.text.secondary} />
                    </TouchableOpacity>
                  )}
                />
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
