// hooks/useJioSaavnQueries.ts
import { useQuery } from '@tanstack/react-query';
import { jioSaavnService } from '@/services/jiosaavn.service';
import { artistService } from '@/services/artist.service';

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
    queryFn: () => jioSaavnService.getPlaylistDetails(playlistUrl),
    enabled: enabled && !!playlistUrl,
    staleTime: 1000 * 60 * 10, // 10 minutes
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

// Hook for fetching all home data at once
export const useHomeData = () => {
  const newReleases = useNewReleases();
  const topPlaylists = useTopPlaylists();
  const topCharts = useTopCharts();
  const topArtists = useTopArtists();

  return {
    newReleases: newReleases.data || [],
    playlists: topPlaylists.data || [],
    charts: topCharts.data || [],
    artists: topArtists.data || [],
    isLoading:
      newReleases.isLoading || topPlaylists.isLoading || topCharts.isLoading || topArtists.isLoading,
    isError: newReleases.isError || topPlaylists.isError || topCharts.isError || topArtists.isError,
    refetch: () => {
      newReleases.refetch();
      topPlaylists.refetch();
      topCharts.refetch();
      topArtists.refetch();
    },
  };
};
