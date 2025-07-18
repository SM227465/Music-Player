// components/ui/HomeScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const trendingSongs = [
    { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', image: require('../../assets/images/react-logo.png') },
    { id: '2', title: 'Good Days', artist: 'SZA', image: require('../../assets/images/react-logo.png') },
  ];

  const newReleases = [
    { id: '1', title: 'Montero', artist: 'Lil Nas X', image: require('../../assets/images/react-logo.png') },
    { id: '2', title: 'Doja Cat', artist: 'Doja Cat', image: require('../../assets/images/react-logo.png') },
  ];

  const moodGenres = [
    { id: '1', title: 'Pop', image: require('../../assets/images/react-logo.png') },
    { id: '2', title: 'Rock', image: require('../../assets/images/react-logo.png') },
  ];

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#533483']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.subtitle}>Discover your favorite music</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name='notifications-outline' size={24} color='#fff' />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trending Songs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Songs</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalScroll}>
            {trendingSongs.map((song) => (
              <TouchableOpacity key={song.id} style={styles.trendingCard}>
                <Image source={song.image} style={styles.trendingImage} />
                <View style={styles.playOverlay}>
                  <Ionicons name='play' size={24} color='#fff' />
                </View>
                <View style={styles.trendingInfo}>
                  <Text style={styles.trendingTitle}>{song.title}</Text>
                  <Text style={styles.trendingArtist}>{song.artist}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* New Releases */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Releases</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalScroll}>
            {newReleases.map((release) => (
              <TouchableOpacity key={release.id} style={styles.releaseCard}>
                <Image source={release.image} style={styles.releaseImage} />
                <View style={styles.playOverlay}>
                  <Ionicons name='play' size={20} color='#fff' />
                </View>
                <View style={styles.releaseInfo}>
                  <Text style={styles.releaseTitle}>{release.title}</Text>
                  <Text style={styles.releaseArtist}>{release.artist}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mood & Genres */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mood & Genres</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalScroll}>
            {moodGenres.map((genre) => (
              <TouchableOpacity key={genre.id} style={styles.genreCard}>
                <Image source={genre.image} style={styles.genreImage} />
                <View style={styles.genreOverlay}>
                  <Text style={styles.genreTitle}>{genre.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#B8B8D1',
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAllText: {
    fontSize: 14,
    color: '#8B5CF6',
  },
  horizontalScroll: {
    flexDirection: 'row',
    gap: 16,
  },
  trendingCard: {
    width: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  trendingImage: {
    width: 128,
    height: 128,
    borderRadius: 12,
    marginBottom: 12,
  },
  playOverlay: {
    position: 'absolute',
    top: 70,
    right: 70,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingInfo: {
    alignItems: 'center',
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  trendingArtist: {
    fontSize: 14,
    color: '#B8B8D1',
  },
  releaseCard: {
    width: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  releaseImage: {
    width: 116,
    height: 116,
    borderRadius: 12,
    marginBottom: 8,
  },
  releaseInfo: {
    alignItems: 'center',
  },
  releaseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  releaseArtist: {
    fontSize: 12,
    color: '#B8B8D1',
  },
  genreCard: {
    width: 120,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  genreImage: {
    width: '100%',
    height: '100%',
  },
  genreOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
  },
  genreTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
