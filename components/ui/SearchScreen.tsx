// components/ui/SearchScreen.tsx
import { AlbumResult } from '@/types/albumSearch';
import { ArtistResult } from '@/types/artistSearch';
import { SongResult } from '@/types/globalSearch';
import { Song } from '@/types/searchSong';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useGlobalSearch,
  useSearchAlbums,
  useSearchArtists,
  useSearchSongs,
  useSearchSongsInfinite,
  useSearchAlbumsInfinite,
  useSearchArtistsInfinite,
} from '../../hooks/useApiQueries';

interface SearchScreenProps {
  onSongPress: (song: Song) => void;
  // onAlbumPress: (album: AlbumSearchResult) => void;
  // onArtistPress: (artist: ArtistSearchResult) => void;
}

export default function SearchScreen({ onSongPress /*, onAlbumPress, onArtistPress */ }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Songs');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: globalResults, isLoading: globalLoading } = useGlobalSearch(
    debouncedQuery,
    activeFilter === 'All' && debouncedQuery.length > 0
  );

  // Infinite scroll queries
  const {
    data: songInfiniteData,
    isLoading: songLoading,
    fetchNextPage: fetchNextSongs,
    hasNextPage: hasNextSongs,
    isFetchingNextPage: isFetchingNextSongs,
  } = useSearchSongsInfinite(debouncedQuery);

  const {
    data: albumInfiniteData,
    isLoading: albumLoading,
    fetchNextPage: fetchNextAlbums,
    hasNextPage: hasNextAlbums,
    isFetchingNextPage: isFetchingNextAlbums,
  } = useSearchAlbumsInfinite(debouncedQuery);

  const {
    data: artistInfiniteData,
    isLoading: artistLoading,
    fetchNextPage: fetchNextArtists,
    hasNextPage: hasNextArtists,
    isFetchingNextPage: isFetchingNextArtists,
  } = useSearchArtistsInfinite(debouncedQuery);

  // Flatten paginated data
  const songResults = songInfiniteData?.pages.flatMap((page) => page.data?.results || []) || [];
  const albumResults = albumInfiniteData?.pages.flatMap((page) => page.data?.results || []) || [];
  const artistResults = artistInfiniteData?.pages.flatMap((page) => page.data?.results || []) || [];

  const filters = ['All', 'Songs', 'Albums', 'Artists'];

  const getImageUrl = (images: any[] | undefined, quality: string = '500x500') => {
    if (!images || !Array.isArray(images)) return 'https://via.placeholder.com/300x300?text=No+Image';
    const image = images.find((img) => img.quality === quality) || images[0];
    return image?.url || 'https://via.placeholder.com/300x300?text=No+Image';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Render functions for individual search results
  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => onSongPress(item)}>
      <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          {item.artists.primary.map((artist) => artist.name).join(', ')}
        </Text>
        <Text style={styles.resultDuration}>{formatDuration(item.duration)}</Text>
      </View>
      <TouchableOpacity style={styles.playButton} onPress={() => onSongPress(item)}>
        <Ionicons name='play' size={20} color='#fff' />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: AlbumResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => /* onAlbumPress(item)*/ () => {}}>
      <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          {item.artists.primary.map((artist) => artist.name).join(', ')}
        </Text>
        <Text style={styles.resultDuration}>Album • {item.year}</Text>
      </View>
      <TouchableOpacity style={styles.playButton} onPress={() => /*onAlbumPress(item)*/ () => {}}>
        <Ionicons name='play' size={20} color='#fff' />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: ArtistResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => /* onArtistPress(item)*/ () => {}}>
      <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.artistImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.resultSubtitle}>Artist</Text>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render functions for global search results
  const renderGlobalSongItem = ({ item }: { item: SongResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => console.log('Global song pressed:', item.title)}>
      <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          {item.primaryArtists || item.singers}
        </Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name='play' size={20} color='#fff' />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGlobalAlbumItem = ({ item }: { item: AlbumResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => console.log('Global album pressed:', item.name)}>
      <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          {item.artists.primary.join(',')}
        </Text>
        <Text style={styles.resultDuration}>Album • {item.year}</Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name='play' size={20} color='#fff' />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGlobalArtistItem = ({ item }: { item: ArtistResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => console.log('Global artist pressed:', item.name)}>
      <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.artistImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.resultSubtitle}>Artist</Text>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPlaylistItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => console.log('Playlist pressed:', item.title)}>
      <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.resultSubtitle}>Playlist</Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name='play' size={20} color='#fff' />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const isLoading = globalLoading || songLoading || albumLoading || artistLoading;

  const renderLoadingFooter = (isFetching: boolean) => {
    if (!isFetching) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#8B5CF6" />
        <Text style={styles.loadingFooterText}>Loading more...</Text>
      </View>
    );
  };

  const handleEndReached = () => {
    switch (activeFilter) {
      case 'Songs':
        if (hasNextSongs && !isFetchingNextSongs) {
          fetchNextSongs();
        }
        break;
      case 'Albums':
        if (hasNextAlbums && !isFetchingNextAlbums) {
          fetchNextAlbums();
        }
        break;
      case 'Artists':
        if (hasNextArtists && !isFetchingNextArtists) {
          fetchNextArtists();
        }
        break;
    }
  };

  const getFilteredData = () => {
    switch (activeFilter) {
      case 'Songs':
        return songResults;
      case 'Albums':
        return albumResults;
      case 'Artists':
        return artistResults;
      default:
        return [];
    }
  };

  const renderFilteredItem = ({ item }: { item: any }) => {
    switch (activeFilter) {
      case 'Songs':
        return renderSongItem({ item });
      case 'Albums':
        return renderAlbumItem({ item });
      case 'Artists':
        return renderArtistItem({ item });
      default:
        return null;
    }
  };

  const getIsFetchingNext = () => {
    switch (activeFilter) {
      case 'Songs':
        return isFetchingNextSongs;
      case 'Albums':
        return isFetchingNextAlbums;
      case 'Artists':
        return isFetchingNextArtists;
      default:
        return false;
    }
  };

  const hasResults = () => {
    if (activeFilter === 'All' && globalResults?.data) {
      return (
        (globalResults.data.songs?.results && globalResults.data.songs.results.length > 0) ||
        (globalResults.data.albums?.results && globalResults.data.albums.results.length > 0) ||
        (globalResults.data.artists?.results && globalResults.data.artists.results.length > 0) ||
        (globalResults.data.playlists?.results && globalResults.data.playlists.results.length > 0)
      );
    }

    return (
      (activeFilter === 'Songs' && songResults.length > 0) ||
      (activeFilter === 'Albums' && albumResults.length > 0) ||
      (activeFilter === 'Artists' && artistResults.length > 0)
    );
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
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name='close-circle' size={20} color='#B8B8D1' />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {debouncedQuery.length > 0 ? (
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
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size='large' color='#8B5CF6' />
            </View>
          ) : activeFilter === 'All' && globalResults?.data ? (
            <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.results}>
                {/* Songs Section */}
                {globalResults.data.songs?.results && globalResults.data.songs.results.length > 0 && (
                  <View style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>Songs</Text>
                    <FlatList
                      data={globalResults.data.songs.results.slice(0, 5)}
                      renderItem={renderGlobalSongItem}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                      showsVerticalScrollIndicator={false}
                    />
                  </View>
                )}

                {/* Albums Section */}
                {globalResults.data.albums?.results && globalResults.data.albums.results.length > 0 && (
                  <View style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>Albums</Text>
                  </View>
                )}

                {/* Artists Section */}
                {globalResults.data.artists?.results && globalResults.data.artists.results.length > 0 && (
                  <View style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>Artists</Text>
                  </View>
                )}

                {/* Playlists Section */}
                {globalResults.data.playlists?.results && globalResults.data.playlists.results.length > 0 && (
                  <View style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>Playlists</Text>
                    <FlatList
                      data={globalResults.data.playlists.results.slice(0, 5)}
                      renderItem={renderPlaylistItem}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                      showsVerticalScrollIndicator={false}
                    />
                  </View>
                )}

                {/* No Results Message */}
                {!hasResults() && (
                  <View style={styles.noResults}>
                    <Ionicons name='search-outline' size={64} color='#6B7280' />
                    <Text style={styles.noResultsText}>No results found</Text>
                    <Text style={styles.noResultsSubtext}>Try different keywords or check your spelling</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          ) : (
            <FlatList
              data={getFilteredData()}
              renderItem={renderFilteredItem}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              style={styles.resultsContainer}
              contentContainerStyle={styles.results}
              showsVerticalScrollIndicator={false}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.3}
              ListFooterComponent={renderLoadingFooter(getIsFetchingNext())}
              ListEmptyComponent={
                !isLoading ? (
                  <View style={styles.noResults}>
                    <Ionicons name='search-outline' size={64} color='#6B7280' />
                    <Text style={styles.noResultsText}>No results found</Text>
                    <Text style={styles.noResultsSubtext}>Try different keywords or check your spelling</Text>
                  </View>
                ) : null
              }
            />
          )}
        </>
      ) : (
        /* Default State */
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Categories</Text>
            <View style={styles.categoriesGrid}>
              {[
                { title: 'Pop', color: '#FF6B6B' },
                { title: 'Rock', color: '#4ECDC4' },
                { title: 'Hip Hop', color: '#45B7D1' },
                { title: 'Jazz', color: '#96CEB4' },
                { title: 'Classical', color: '#FECA57' },
                { title: 'Electronic', color: '#FF9FF3' },
              ].map((category, index) => (
                <TouchableOpacity key={index} style={styles.categoryCard} onPress={() => setSearchQuery(category.title)}>
                  <LinearGradient colors={[category.color, category.color + '80']} style={styles.categoryGradient}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <View style={styles.recentSearches}>
              {['The Weeknd', 'Billie Eilish', 'Ed Sheeran', 'Taylor Swift'].map((search, index) => (
                <TouchableOpacity key={index} style={styles.recentSearchItem} onPress={() => setSearchQuery(search)}>
                  <Ionicons name='time-outline' size={16} color='#B8B8D1' />
                  <Text style={styles.recentSearchText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
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
  filterContainer: {
    paddingHorizontal: 20,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
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
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  results: {
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 30,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  artistImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#B8B8D1',
    marginBottom: 2,
  },
  resultDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  followText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
  },
  loader: {
    paddingVertical: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingFooterText: {
    fontSize: 14,
    color: '#B8B8D1',
    marginLeft: 8,
  },
});
