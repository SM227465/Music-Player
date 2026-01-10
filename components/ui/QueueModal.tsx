// components/ui/QueueModal.tsx
import { Song } from '@/types/searchSong';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface QueueModalProps {
  visible: boolean;
  onClose: () => void;
  queue: Song[];
  currentIndex: number;
  onSongPress: (song: Song, index: number) => void;
  onRemoveSong: (index: number) => void;
  onClearQueue: () => void;
}

export default function QueueModal({
  visible,
  onClose,
  queue,
  currentIndex,
  onSongPress,
  onRemoveSong,
  onClearQueue,
}: QueueModalProps) {
  const getImageUrl = (images: any[], quality: string = '150x150') => {
    if (!images || !Array.isArray(images)) return null;
    const image = images.find((img) => img.quality === quality) || images[0];
    return image?.url || null;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
    const isCurrentSong = index === currentIndex;
    const isUpcoming = index > currentIndex;
    const isPrevious = index < currentIndex;

    return (
      <TouchableOpacity
        style={[styles.songItem, isCurrentSong && styles.currentSongItem]}
        onPress={() => onSongPress(item, index)}
      >
        <View style={styles.songContent}>
          {isCurrentSong && (
            <View style={styles.playingIndicator}>
              <Ionicons name="musical-notes" size={16} color="#1DB954" />
            </View>
          )}
          <Image
            source={{ uri: getImageUrl(item.image) || '' }}
            style={[styles.songImage, isCurrentSong && styles.currentSongImage]}
          />
          <View style={styles.songInfo}>
            <Text
              style={[styles.songTitle, isCurrentSong && styles.currentSongTitle]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={styles.songArtist} numberOfLines={1}>
              {item.artists.primary.map((artist) => artist.name).join(', ')}
            </Text>
            <View style={styles.songMeta}>
              {isPrevious && (
                <Text style={styles.metaText}>Played</Text>
              )}
              {isCurrentSong && (
                <Text style={[styles.metaText, styles.nowPlayingText]}>Now Playing</Text>
              )}
              {isUpcoming && (
                <Text style={styles.metaText}>
                  Up next #{index - currentIndex}
                </Text>
              )}
              <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemoveSong(index)}
        >
          <Ionicons name="close-circle" size={24} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Queue</Text>
            <Text style={styles.headerSubtitle}>
              {queue.length} song{queue.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.headerButtons}>
            {queue.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={onClearQueue}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Queue List */}
        {queue.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={64} color="#6B7280" />
            <Text style={styles.emptyStateTitle}>Queue is empty</Text>
            <Text style={styles.emptyStateText}>
              Add songs to start building your queue
            </Text>
          </View>
        ) : (
          <FlatList
            data={queue}
            renderItem={renderSongItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#B8B8D1',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  clearButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentSongItem: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    borderColor: 'rgba(29, 185, 84, 0.3)',
  },
  songContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playingIndicator: {
    marginRight: 8,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  currentSongImage: {
    borderWidth: 2,
    borderColor: '#1DB954',
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
  currentSongTitle: {
    color: '#1DB954',
  },
  songArtist: {
    fontSize: 13,
    color: '#B8B8D1',
    marginBottom: 4,
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  nowPlayingText: {
    color: '#1DB954',
    fontWeight: '600',
  },
  duration: {
    fontSize: 11,
    color: '#6B7280',
  },
  removeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});
