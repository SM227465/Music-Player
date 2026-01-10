// hooks/useJioSaavnQueries.ts
import { artistService } from '@/services/artist.service';
import { jioSaavnService } from '@/services/jiosaavn.service';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export const useNewReleases = () => {
  return useQuery({
    queryKey: ['newReleases'],
    queryFn: () => jioSaavnService.getNewReleases(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTopPlaylists = () => {
  return useQuery({
    queryKey: ['topPlaylists'],
    queryFn: () => jioSaavnService.getTopPlaylists(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTopCharts = () => {
  return useQuery({
    queryKey: ['topCharts'],
    queryFn: () => jioSaavnService.getTopCharts(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTopArtists = () => {
  return useQuery({
    queryKey: ['topArtists'],
    queryFn: () => jioSaavnService.getTopArtists(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePlaylistDetails = (playlistUrl: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['playlistDetails', playlistUrl],
    queryFn: () => jioSaavnService.getPlaylistDetails(playlistUrl, 0, 1000),
    enabled: enabled && !!playlistUrl,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const usePlaylistDetailsInfinite = (playlistUrl: string, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: ['playlistDetails', 'infinite', playlistUrl],
    queryFn: ({ pageParam = 0 }) => jioSaavnService.getPlaylistDetails(playlistUrl, pageParam, 50),
    getNextPageParam: (lastPage, allPages) => {
      const total = lastPage?.songCount || 0;
      const currentCount = allPages.reduce((acc, page) => acc + (page?.songs?.length || 0), 0);
      const hasMore = currentCount < total;
      return hasMore ? allPages.length : undefined;
    },
    enabled: enabled && !!playlistUrl,
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialPageParam: 0,
  });
};

export const useAlbumDetails = (albumUrl: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['albumDetails', albumUrl],
    queryFn: () => jioSaavnService.getAlbumDetails(albumUrl),
    enabled: enabled && !!albumUrl,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useArtistDetails = (artistId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['artistDetails', artistId],
    queryFn: () => artistService.getArtistDetails(artistId),
    enabled: enabled && !!artistId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Infinite scroll hooks for artist songs and albums
export const useArtistSongsInfinite = (
  artistId: string,
  sortBy: string = 'popularity',
  sortOrder: string = 'desc',
  enabled: boolean = true
) => {
  return useInfiniteQuery({
    queryKey: ['artistSongs', 'infinite', artistId, sortBy, sortOrder],
    queryFn: ({ pageParam = 0 }) => artistService.getArtistSongs(artistId, pageParam, sortBy, sortOrder),
    getNextPageParam: (lastPage, allPages) => {
      const songs = lastPage.data?.songs || [];
      const total = lastPage.data?.total || 0;
      const currentCount = allPages.reduce((acc, page) => acc + (page.data?.songs?.length || 0), 0);
      const hasMore = currentCount < total;
      return hasMore ? allPages.length : undefined;
    },
    enabled: enabled && !!artistId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialPageParam: 0,
  });
};

export const useArtistAlbumsInfinite = (
  artistId: string,
  sortBy: string = 'popularity',
  sortOrder: string = 'desc',
  enabled: boolean = true
) => {
  return useInfiniteQuery({
    queryKey: ['artistAlbums', 'infinite', artistId, sortBy, sortOrder],
    queryFn: ({ pageParam = 0 }) => artistService.getArtistAlbums(artistId, pageParam, sortBy, sortOrder),
    getNextPageParam: (lastPage, allPages) => {
      const albums = lastPage.data?.albums || [];
      const total = lastPage.data?.total || 0;
      const currentCount = allPages.reduce((acc, page) => acc + (page.data?.albums?.length || 0), 0);
      const hasMore = currentCount < total;
      return hasMore ? allPages.length : undefined;
    },
    enabled: enabled && !!artistId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialPageParam: 0,
  });
};

// Hook for fetching homepage data (new unified endpoint)
export const useHomepage = () => {
  return useQuery({
    queryKey: ['homepage'],
    queryFn: () => jioSaavnService.getHomepage(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for fetching all home data at once (using new unified homepage endpoint)
export const useHomeData = () => {
  const homepage = useHomepage();

  return {
    allModules: homepage.data?.allModules || [],
    trendingNow: homepage.data?.trendingNow || [],
    topCharts: homepage.data?.topCharts || [],
    newReleases: homepage.data?.newReleases || [],
    editorialPicks: homepage.data?.editorialPicks || [],
    isLoading: homepage.isLoading,
    isError: homepage.isError,
    refetch: homepage.refetch,
  };
};
