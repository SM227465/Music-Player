// hooks/useApiQueries.ts
import { searchService } from '@/services/search.service';
import { songService } from '@/services/song.service';
import { lyricsService } from '@/services/lyrics.service';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

// Search hooks
export const useGlobalSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search', 'global', query],
    queryFn: () => searchService.globalSearch(query),
    enabled: enabled && query.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Infinite scroll hooks for search
export const useSearchSongsInfinite = (query: string) => {
  return useInfiniteQuery({
    queryKey: ['search', 'songs', 'infinite', query],
    queryFn: ({ pageParam = 1 }) => searchService.searchSongs(query, pageParam, 10),
    getNextPageParam: (lastPage, allPages) => {
      // Check if there are more results - if we got less than 10 results, it's the last page
      const results = lastPage.data?.results || [];
      const hasMore = results.length === 10;
      return hasMore ? allPages.length + 1 : undefined;
    },
    enabled: query.length > 2,
    staleTime: 5 * 60 * 1000,
    initialPageParam: 1,
  });
};

export const useSearchAlbumsInfinite = (query: string) => {
  return useInfiniteQuery({
    queryKey: ['search', 'albums', 'infinite', query],
    queryFn: ({ pageParam = 1 }) => searchService.searchAlbums(query, pageParam, 10),
    getNextPageParam: (lastPage, allPages) => {
      const results = lastPage.data?.results || [];
      const hasMore = results.length === 10;
      return hasMore ? allPages.length + 1 : undefined;
    },
    enabled: query.length > 2,
    staleTime: 5 * 60 * 1000,
    initialPageParam: 1,
  });
};

export const useSearchArtistsInfinite = (query: string) => {
  return useInfiniteQuery({
    queryKey: ['search', 'artists', 'infinite', query],
    queryFn: ({ pageParam = 1 }) => searchService.searchArtists(query, pageParam, 10),
    getNextPageParam: (lastPage, allPages) => {
      const results = lastPage.data?.results || [];
      const hasMore = results.length === 10;
      return hasMore ? allPages.length + 1 : undefined;
    },
    enabled: query.length > 2,
    staleTime: 5 * 60 * 1000,
    initialPageParam: 1,
  });
};

// Legacy single-page hooks (kept for backward compatibility)
export const useSearchSongs = (query: string, page: number = 1) => {
  return useQuery({
    queryKey: ['search', 'songs', query, page],
    queryFn: () => searchService.searchSongs(query, page),
    enabled: query.length > 2,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchAlbums = (query: string, page: number = 1) => {
  return useQuery({
    queryKey: ['search', 'albums', query, page],
    queryFn: () => searchService.searchAlbums(query, page),
    enabled: query.length > 2,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchArtists = (query: string, page: number = 1) => {
  return useQuery({
    queryKey: ['search', 'artists', query, page],
    queryFn: () => searchService.searchArtists(query, page),
    enabled: query.length > 2,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSongDetails = (songId: string) => {
  return useQuery({
    queryKey: ['song-details', songId],
    queryFn: () => songService.getSongDetails(songId),
    enabled: !!songId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useLyrics = (songId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['lyrics', songId],
    queryFn: () => lyricsService.getLyrics(songId),
    enabled: enabled && !!songId,
    staleTime: 60 * 60 * 1000, // 1 hour - lyrics don't change
  });
};

/*
// Content hooks
export const useTrendingSongs = () => {
  return useQuery({
    queryKey: ['trending', 'songs'],
    queryFn: apiService.getTrendingSongs,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useNewReleases = () => {
  return useQuery({
    queryKey: ['new-releases'],
    queryFn: apiService.getNewReleases,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useTopCharts = () => {
  return useQuery({
    queryKey: ['top-charts'],
    queryFn: apiService.getTopCharts,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useFeaturedPlaylists = () => {
  return useQuery({
    queryKey: ['featured-playlists'],
    queryFn: apiService.getFeaturedPlaylists,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// Detail hooks
export const useSongDetails = (songId: string) => {
  return useQuery({
    queryKey: ['song', songId],
    queryFn: () => apiService.getSongDetails(songId),
    enabled: !!songId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useAlbumDetails = (albumId: string) => {
  return useQuery({
    queryKey: ['album', albumId],
    queryFn: () => apiService.getAlbumDetails(albumId),
    enabled: !!albumId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useArtistDetails = (artistId: string) => {
  return useQuery({
    queryKey: ['artist', artistId],
    queryFn: () => apiService.getArtistDetails(artistId),
    enabled: !!artistId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const usePlaylistDetails = (playlistId: string) => {
  return useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: () => apiService.getPlaylistDetails(playlistId),
    enabled: !!playlistId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};
*/
