// components/ui/LyricsView.tsx
import { useLyrics } from '@/hooks/useApiQueries';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface LyricsViewProps {
  songId: string;
  isPlaying: boolean;
  currentTime: number;
}

export default function LyricsView({ songId, isPlaying, currentTime }: LyricsViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const { data: lyricsData, isLoading, error } = useLyrics(songId);

  // Auto-scroll lyrics (basic implementation)
  useEffect(() => {
    if (isPlaying && lyricsData?.data?.lyrics) {
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
  }, [currentTime, isPlaying, lyricsData]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading lyrics...</Text>
      </View>
    );
  }

  if (error || !lyricsData?.success || !lyricsData?.data?.lyrics) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="musical-notes-outline" size={64} color="#6B7280" />
        <Text style={styles.noLyricsTitle}>No Lyrics Available</Text>
        <Text style={styles.noLyricsText}>
          Lyrics for this song are not available at the moment.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.lyricsText}>{lyricsData.data.lyrics}</Text>

      {lyricsData.data.copyright && (
        <Text style={styles.copyrightText}>{lyricsData.data.copyright}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontSize: 16,
    lineHeight: 28,
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
