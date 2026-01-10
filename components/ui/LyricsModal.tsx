// components/ui/LyricsModal.tsx
import { useLyrics } from '@/hooks/useApiQueries';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface LyricsModalProps {
  visible: boolean;
  onClose: () => void;
  songId: string;
  songName: string;
  artistName: string;
  isPlaying: boolean;
  currentTime: number;
}

export default function LyricsModal({
  visible,
  onClose,
  songId,
  songName,
  artistName,
  isPlaying,
  currentTime,
}: LyricsModalProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const { data: lyricsData, isLoading, error } = useLyrics(songId, visible);

  // Auto-scroll lyrics (basic implementation)
  useEffect(() => {
    if (isPlaying && lyricsData?.data?.lyrics && visible) {
      // Simple auto-scroll based on time
      // This is a basic implementation - ideally you'd have timestamped lyrics
      const lyricsLength = lyricsData.data.lyrics.length;
      const estimatedPosition = (currentTime / 180) * lyricsLength; // Assume 3 min song

      if (scrollViewRef.current && estimatedPosition > 0) {
        scrollViewRef.current.scrollTo({
          y: estimatedPosition * 2, // Rough estimate for scroll position
          animated: true,
        });
      }
    }
  }, [currentTime, isPlaying, lyricsData, visible]);

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
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Lyrics</Text>
            <Text style={styles.headerSubtitle}>{songName}</Text>
            <Text style={styles.headerArtist}>{artistName}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading lyrics...</Text>
          </View>
        ) : error || !lyricsData?.success || !lyricsData?.data?.lyrics ? (
          <View style={styles.centerContainer}>
            <Ionicons name="musical-notes-outline" size={64} color="#6B7280" />
            <Text style={styles.noLyricsTitle}>No Lyrics Available</Text>
            <Text style={styles.noLyricsText}>
              Lyrics for this song are not available at the moment.
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.lyricsText}>{lyricsData.data.lyrics}</Text>

            {lyricsData.data.copyright && (
              <Text style={styles.copyrightText}>{lyricsData.data.copyright}</Text>
            )}
          </ScrollView>
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
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 2,
  },
  headerArtist: {
    fontSize: 14,
    color: '#B8B8D1',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#B8B8D1',
    marginTop: 16,
  },
  noLyricsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  noLyricsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  lyricsText: {
    fontSize: 18,
    lineHeight: 32,
    color: '#fff',
    textAlign: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
});
