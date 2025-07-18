// components/ui/LibraryScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LibraryScreen() {
  const [activeTab, setActiveTab] = useState('Playlists');

  const playlists = [
    {
      id: '1',
      title: 'My Favorites',
      songCount: 30,
      duration: '1h 45m',
      image: require('../../assets/images/react-logo.png'),
    },
    {
      id: '2',
      title: 'Workout Mix',
      songCount: 18,
      duration: '58m',
      image: require('../../assets/images/react-logo.png'),
    },
    {
      id: '3',
      title: 'Road Trip',
      songCount: 42,
      duration: '2h 12m',
      image: require('../../assets/images/react-logo.png'),
    },
  ];

  const tabs = ['Playlists', 'Albums', 'Artists'];

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#533483']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name='add' size={24} color='#fff' />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'Playlists' && (
          <View style={styles.playlistsContainer}>
            {playlists.map((playlist) => (
              <TouchableOpacity key={playlist.id} style={styles.playlistItem}>
                <Image source={playlist.image} style={styles.playlistImage} />
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistTitle}>{playlist.title}</Text>
                  <Text style={styles.playlistDetails}>
                    {playlist.songCount} songs • {playlist.duration}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'Albums' && (
          <View style={styles.emptyState}>
            <Ionicons name='albums-outline' size={64} color='#6B7280' />
            <Text style={styles.emptyStateText}>No albums yet</Text>
          </View>
        )}

        {activeTab === 'Artists' && (
          <View style={styles.emptyState}>
            <Ionicons name='people-outline' size={64} color='#6B7280' />
            <Text style={styles.emptyStateText}>No artists yet</Text>
          </View>
        )}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabContainer: {
    flexDirection: 'row',
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
    paddingHorizontal: 20,
  },
  playlistsContainer: {
    paddingBottom: 100,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  playlistImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
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
  playlistDetails: {
    fontSize: 14,
    color: '#B8B8D1',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
});
