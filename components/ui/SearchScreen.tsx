// components/ui/SearchScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const recentSearches = ['The Weeknd', 'Taylor Swift - 1989', 'Chill Vibes Playlist', 'Dance Pop'];

  const trendingSearches = ['Blinding Lights', 'Good 4 U', 'Stay', 'Levitating', 'Peaches'];

  const searchCategories = [
    { id: '1', title: 'Pop', color: '#FF6B6B', image: require('../../assets/images/react-logo.png') },
    { id: '2', title: 'Rock', color: '#4ECDC4', image: require('../../assets/images/react-logo.png') },
    { id: '3', title: 'Hip Hop', color: '#45B7D1', image: require('../../assets/images/react-logo.png') },
    { id: '4', title: 'Jazz', color: '#96CEB4', image: require('../../assets/images/react-logo.png') },
    { id: '5', title: 'Classical', color: '#FECA57', image: require('../../assets/images/react-logo.png') },
    { id: '6', title: 'Electronic', color: '#FF9FF3', image: require('../../assets/images/react-logo.png') },
  ];

  const filters = ['All', 'Songs', 'Artists', 'Albums', 'Playlists'];

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#533483']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name='search' size={20} color='#B8B8D1' style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder='Search for songs, artists, albums...'
            placeholderTextColor='#6B7280'
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name='close-circle' size={20} color='#B8B8D1' />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchQuery.length === 0 ? (
          // Default Search State
          <>
            {/* Recent Searches */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.recentSearches}>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity key={index} style={styles.recentSearchItem} onPress={() => handleRecentSearch(search)}>
                    <Ionicons name='time-outline' size={16} color='#B8B8D1' />
                    <Text style={styles.recentSearchText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Trending Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Searches</Text>
              <View style={styles.trendingContainer}>
                {trendingSearches.map((trend, index) => (
                  <TouchableOpacity key={index} style={styles.trendingItem} onPress={() => handleRecentSearch(trend)}>
                    <Ionicons name='trending-up' size={16} color='#8B5CF6' />
                    <Text style={styles.trendingText}>{trend}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Browse Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse All</Text>
              <View style={styles.categoriesGrid}>
                {searchCategories.map((category) => (
                  <TouchableOpacity key={category.id} style={styles.categoryCard}>
                    <LinearGradient colors={[category.color, category.color + '80']} style={styles.categoryGradient}>
                      <Text style={styles.categoryTitle}>{category.title}</Text>
                      <Image source={category.image} style={styles.categoryImage} />
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          // Search Results State
          <>
            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {filters.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterTab, activeFilter === filter && styles.activeFilterTab]}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Search Results */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Results for "{searchQuery}"</Text>
              <View style={styles.noResults}>
                <Ionicons name='search-outline' size={64} color='#6B7280' />
                <Text style={styles.noResultsText}>No results found</Text>
                <Text style={styles.noResultsSubtext}>Try different keywords or check your spelling</Text>
              </View>
            </View>
          </>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
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
    marginBottom: 16,
  },
  clearAllText: {
    fontSize: 14,
    color: '#8B5CF6',
  },
  recentSearches: {
    gap: 12,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  recentSearchText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  trendingContainer: {
    gap: 8,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  trendingText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    position: 'relative',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoryImage: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 60,
    height: 60,
    opacity: 0.7,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeFilterTab: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterText: {
    fontSize: 14,
    color: '#B8B8D1',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  noResults: {
    alignItems: 'center',
    paddingTop: 60,
  },
  noResultsText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
