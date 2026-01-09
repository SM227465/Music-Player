// components/ui/SearchScreen.tsx
import { AlbumResult } from '@/types/albumSearch';
import { ArtistResult } from '@/types/artistSearch';
import { SongResult } from '@/types/globalSearch';
import { Song } from '@/types/searchSong';
import { Ionicons } from '@expo/vector-icons';
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
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';
import { decodeHtmlEntities } from '@/utils/htmlDecode';
import { Skeleton } from './SkeletonLoader';
import NowPlayingIndicator from './NowPlayingIndicator';

interface SearchScreenProps {
  onSongPress: (song: Song) => void;
  currentTrack?: Song | null;
  isPlaying?: boolean;
  // onAlbumPress: (album: AlbumSearchResult) => void;
  // onArtistPress: (artist: ArtistSearchResult) => void;
}

export default function SearchScreen({ onSongPress, currentTrack, isPlaying /*, onAlbumPress, onArtistPress */ }: SearchScreenProps) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Songs');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useRecentSearches(5);

  // Popular searches - dummy data (TODO: Replace with API data)
  const popularSearches = [
    'Arijit Singh',
    'Atif Aslam',
    'Shreya Ghoshal',
    'AR Rahman',
    'Neha Kakkar',
  ];

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      // Add to recent searches when user searches
      if (searchQuery.trim().length > 0) {
        addRecentSearch(searchQuery.trim());
      }
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

  // Check if a song is currently playing
  const isCurrentlyPlaying = (song: Song) => {
    return currentTrack?.id === song.id && isPlaying;
  };

  // Render functions for individual search results
  const renderSongItem = ({ item }: { item: Song }) => {
    const isPlayingNow = isCurrentlyPlaying(item);

    return (
      <TouchableOpacity style={styles.resultItem} onPress={() => onSongPress(item)}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.resultImage} />
          {currentTrack?.id === item.id && (
            <View style={styles.playingOverlay}>
              <NowPlayingIndicator isPlaying={!!isPlaying} />
            </View>
          )}
        </View>
        <View style={styles.resultInfo}>
          <Text style={[styles.resultTitle, isPlayingNow && { color: theme.accent.primary }]} numberOfLines={1}>
            {decodeHtmlEntities(item.name)}
          </Text>
          <Text style={styles.resultSubtitle} numberOfLines={1}>
            {item.artists.primary.map((artist) => decodeHtmlEntities(artist.name)).join(', ')}
          </Text>
          <Text style={styles.resultDuration}>{formatDuration(item.duration)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.playButton, isPlayingNow && { backgroundColor: theme.accent.secondary }]}
          onPress={() => onSongPress(item)}
        >
          <Ionicons
            name={isPlayingNow ? 'pause' : 'play'}
            size={iconSize.sm}
            color={theme.text.inverse}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderAlbumItem = ({ item }: { item: AlbumResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => /* onAlbumPress(item)*/ () => {}}>
      <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {decodeHtmlEntities(item.name)}
        </Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          {item.artists.primary.map((artist) => decodeHtmlEntities(artist.name)).join(', ')}
        </Text>
        <Text style={styles.resultDuration}>Album • {item.year}</Text>
      </View>
      <TouchableOpacity style={styles.playButton} onPress={() => /*onAlbumPress(item)*/ () => {}}>
        <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: ArtistResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => /* onArtistPress(item)*/ () => {}}>
      <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.artistImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {decodeHtmlEntities(item.name)}
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
    <TouchableOpacity style={styles.resultItem} onPress={() => {/* TODO: Navigate to song details */}}>
      <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {decodeHtmlEntities(item.title)}
        </Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          {decodeHtmlEntities(item.primaryArtists || item.singers)}
        </Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGlobalAlbumItem = ({ item }: { item: AlbumResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => {/* TODO: Navigate to album details */}}>
      <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {decodeHtmlEntities(item.name)}
        </Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          {item.artists.primary.map((artist) => decodeHtmlEntities(artist.name)).join(', ')}
        </Text>
        <Text style={styles.resultDuration}>Album • {item.year}</Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGlobalArtistItem = ({ item }: { item: ArtistResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => {/* TODO: Navigate to artist details */}}>
      <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.artistImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {decodeHtmlEntities(item.name)}
        </Text>
        <Text style={styles.resultSubtitle}>Artist</Text>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPlaylistItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => {/* TODO: Navigate to playlist details */}}>
      <Image source={{ uri: getImageUrl(item.image, '150x150') }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {decodeHtmlEntities(item.title)}
        </Text>
        <Text style={styles.resultSubtitle}>Playlist</Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const isLoading = globalLoading || songLoading || albumLoading || artistLoading;

  // Render skeleton loading for search results
  const renderSearchSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <Skeleton width={50} height={50} borderRadius={borderRadius.sm} />
          <View style={styles.skeletonInfo}>
            <Skeleton width="70%" height={14} style={{ marginBottom: spacing.xs }} />
            <Skeleton width="50%" height={12} style={{ marginBottom: spacing.xs }} />
            <Skeleton width="30%" height={10} />
          </View>
          <Skeleton width={iconSize.xl} height={iconSize.xl} borderRadius={borderRadius.full} />
        </View>
      ))}
    </View>
  );

  const renderLoadingFooter = (isFetching: boolean) => {
    if (!isFetching) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.accent.primary} />
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
    },
    headerTitle: {
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
    },
    searchContainer: {
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.xl,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,
      elevation: 3,
    },
    searchIcon: {
      marginRight: spacing.md,
    },
    searchInput: {
      flex: 1,
      color: theme.text.primary,
      fontSize: fontSize.base,
    },
    clearButton: {
      padding: spacing.xs,
    },
    filterContainer: {
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.xl,
    },
    filterTab: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.xl,
      marginRight: spacing.md,
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    activeFilterTab: {
      backgroundColor: theme.accent.primary,
      borderColor: theme.accent.primary,
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    filterText: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
      fontWeight: fontWeight.medium,
    },
    activeFilterText: {
      color: theme.text.inverse,
      fontWeight: fontWeight.semibold,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xl,
    },
    section: {
      marginBottom: spacing.xxxl,
    },
    sectionTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
      marginBottom: spacing.lg,
    },
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    categoryCard: {
      width: '48%',
      height: 100,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    categoryGradient: {
      flex: 1,
      padding: spacing.lg,
      justifyContent: 'center',
    },
    categoryTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.bold,
      color: theme.text.inverse,
    },
    recentSearches: {
      gap: spacing.md,
    },
    recentSearchItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 4,
      elevation: 2,
    },
    recentSearchText: {
      flex: 1,
      fontSize: fontSize.base,
      color: theme.text.primary,
      marginLeft: spacing.md,
      fontWeight: fontWeight.medium,
    },
    resultsContainer: {
      flex: 1,
      paddingHorizontal: spacing.xl,
    },
    results: {
      paddingBottom: 100,
    },
    categorySection: {
      marginBottom: spacing.xxxl,
    },
    resultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 4,
      elevation: 2,
    },
    imageContainer: {
      position: 'relative',
      marginRight: spacing.md,
    },
    resultImage: {
      width: 50,
      height: 50,
      borderRadius: borderRadius.sm,
    },
    playingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    artistImage: {
      width: 50,
      height: 50,
      borderRadius: borderRadius.full,
      marginRight: spacing.md,
    },
    resultInfo: {
      flex: 1,
    },
    resultTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    resultSubtitle: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
      marginBottom: 2,
    },
    resultDuration: {
      fontSize: fontSize.xs,
      color: theme.text.tertiary,
    },
    playButton: {
      width: iconSize.xl,
      height: iconSize.xl,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    followButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.accent.primary,
    },
    followText: {
      color: theme.accent.primary,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
    },
    loader: {
      paddingVertical: spacing.xxxxl,
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
      fontSize: fontSize.lg,
      color: theme.text.tertiary,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      fontWeight: fontWeight.medium,
    },
    noResultsSubtext: {
      fontSize: fontSize.sm,
      color: theme.text.tertiary,
      textAlign: 'center',
    },
    loadingFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl,
      gap: spacing.sm,
    },
    loadingFooterText: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
      marginLeft: spacing.sm,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    clearText: {
      fontSize: fontSize.sm,
      color: theme.accent.primary,
      fontWeight: fontWeight.semibold,
    },
    removeButton: {
      padding: spacing.xs,
      marginLeft: spacing.sm,
    },
    skeletonContainer: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
    },
    skeletonItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    skeletonInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name='search' size={iconSize.sm} color={theme.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder='Search for songs, artists, albums...'
            placeholderTextColor={theme.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name='close-circle' size={iconSize.sm} color={theme.text.secondary} />
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
            renderSearchSkeleton()
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
                    <Ionicons name='search-outline' size={64} color={theme.text.tertiary} />
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
                    <Ionicons name='search-outline' size={64} color={theme.text.tertiary} />
                    <Text style={styles.noResultsText}>No results found</Text>
                    <Text style={styles.noResultsSubtext}>Try different keywords or check your spelling</Text>
                  </View>
                ) : null
              }
            />
          )}
        </>
      ) : (
        /* Default State - Recent & Popular Searches */
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={() => clearRecentSearches()}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.recentSearches}>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity key={index} style={styles.recentSearchItem} onPress={() => setSearchQuery(search)}>
                    <Ionicons name='time-outline' size={iconSize.sm} color={theme.text.secondary} />
                    <Text style={styles.recentSearchText}>{search}</Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(search);
                      }}
                      style={styles.removeButton}
                    >
                      <Ionicons name='close' size={iconSize.xs} color={theme.text.tertiary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Popular Searches */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Searches</Text>
            <View style={styles.recentSearches}>
              {popularSearches.map((search, index) => (
                <TouchableOpacity key={index} style={styles.recentSearchItem} onPress={() => setSearchQuery(search)}>
                  <Ionicons name='trending-up' size={iconSize.sm} color={theme.accent.primary} />
                  <Text style={styles.recentSearchText}>{search}</Text>
                  <Ionicons name='chevron-forward' size={iconSize.xs} color={theme.text.tertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
