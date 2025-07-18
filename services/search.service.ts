// services/apiService.ts
import { apiClient } from '@/configs/axios.config';

export const searchService = {
  // Global search
  globalSearch: async (query: string) => {
    const response = await apiClient.get(`/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Search songs
  searchSongs: async (query: string, page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  },

  // Search albums
  searchAlbums: async (query: string, page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  },

  // Search artists
  searchArtists: async (query: string, page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  },

  /*

  // Get song details
  getSongDetails: async (songId: string) => {
    const response = await apiClient.get(`/songs/${songId}`);
    return response.data;
  },

  // Get album details
  getAlbumDetails: async (albumId: string) => {
    const response = await apiClient.get(`/albums/${albumId}`);
    return response.data;
  },

  // Get artist details
  getArtistDetails: async (artistId: string) => {
    const response = await apiClient.get(`/artists/${artistId}`);
    return response.data;
  },

  // Get trending songs
  getTrendingSongs: async () => {
    const response = await apiClient.get('/trending/songs');
    return response.data;
  },

  // Get new releases
  getNewReleases: async () => {
    const response = await apiClient.get('/albums/new-releases');
    return response.data;
  },

  // Get top charts
  getTopCharts: async () => {
    const response = await apiClient.get('/charts');
    return response.data;
  },

  // Get featured playlists
  getFeaturedPlaylists: async () => {
    const response = await apiClient.get('/playlists/featured');
    return response.data;
  },

  // Get playlist details
  getPlaylistDetails: async (playlistId: string) => {
    const response = await apiClient.get(`/playlists/${playlistId}`);
    return response.data;
  },
  */
};
