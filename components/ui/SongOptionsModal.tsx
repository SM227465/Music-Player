// components/ui/SongOptionsModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '@/types/searchSong';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';
import AddToPlaylistModal from './AddToPlaylistModal';

interface SongOptionsModalProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
  onAddToFavorites?: () => void;
  isFavorite?: boolean;
}

interface MenuOption {
  id: string;
  label: string;
  icon: string;
  color?: string;
  onPress: () => void;
}

export default function SongOptionsModal({
  visible,
  song,
  onClose,
  onAddToFavorites,
  isFavorite = false,
}: SongOptionsModalProps) {
  const theme = useTheme();
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  const handleShare = async () => {
    if (!song) return;

    try {
      await Share.share({
        message: `Check out ${song.name} by ${song.primaryArtists || 'Unknown Artist'}`,
        title: song.name,
      });
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddToPlaylist = () => {
    onClose();
    setTimeout(() => setShowAddToPlaylist(true), 300);
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    Alert.alert('Download', 'Download functionality coming soon!');
    onClose();
  };

  const handleViewArtist = () => {
    // TODO: Navigate to artist page
    Alert.alert('View Artist', 'Artist page navigation coming soon!');
    onClose();
  };

  const handleViewAlbum = () => {
    // TODO: Navigate to album page
    Alert.alert('View Album', 'Album page navigation coming soon!');
    onClose();
  };

  const menuOptions: MenuOption[] = [
    {
      id: 'favorite',
      label: isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
      icon: isFavorite ? 'heart' : 'heart-outline',
      color: isFavorite ? '#ef4444' : undefined,
      onPress: () => {
        onAddToFavorites?.();
        onClose();
      },
    },
    {
      id: 'playlist',
      label: 'Add to Playlist',
      icon: 'list',
      onPress: handleAddToPlaylist,
    },
    {
      id: 'download',
      label: 'Download',
      icon: 'download-outline',
      onPress: handleDownload,
    },
    {
      id: 'share',
      label: 'Share',
      icon: 'share-social-outline',
      onPress: handleShare,
    },
    {
      id: 'artist',
      label: 'View Artist',
      icon: 'person-outline',
      onPress: handleViewArtist,
    },
    {
      id: 'album',
      label: 'View Album',
      icon: 'albums-outline',
      onPress: handleViewAlbum,
    },
  ];

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
      paddingBottom: spacing.xxxl,
    },
    header: {
      padding: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.primary,
    },
    songInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    songImage: {
      width: 56,
      height: 56,
      borderRadius: borderRadius.md,
      backgroundColor: theme.background.secondary,
      marginRight: spacing.md,
    },
    songDetails: {
      flex: 1,
    },
    songName: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    songArtist: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
    },
    menuList: {
      padding: spacing.md,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.xs,
    },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: theme.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    menuLabel: {
      flex: 1,
      fontSize: fontSize.base,
      color: theme.text.primary,
      fontWeight: fontWeight.medium,
    },
    cancelButton: {
      margin: spacing.lg,
      padding: spacing.lg,
      backgroundColor: theme.background.secondary,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
    },
  });

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              {song && (
                <View style={styles.header}>
                  <View style={styles.songInfo}>
                    <View style={styles.songImage} />
                    <View style={styles.songDetails}>
                      <Text style={styles.songName} numberOfLines={1}>
                        {song.name}
                      </Text>
                      <Text style={styles.songArtist} numberOfLines={1}>
                        {song.primaryArtists || 'Unknown Artist'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.menuList}>
                {menuOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.menuItem}
                    onPress={option.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuIcon}>
                      <Ionicons
                        name={option.icon as any}
                        size={iconSize.md}
                        color={option.color || theme.text.secondary}
                      />
                    </View>
                    <Text style={[styles.menuLabel, option.color && { color: option.color }]}>
                      {option.label}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={iconSize.sm}
                      color={theme.text.tertiary}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <AddToPlaylistModal
        visible={showAddToPlaylist}
        song={song}
        onClose={() => setShowAddToPlaylist(false)}
      />
    </>
  );
}
