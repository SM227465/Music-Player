// services/artist.service.ts
import { apiClient } from '@/configs/axios.config';
import { ArtistDetailResponse } from '@/types/artistDetails';

export const artistService = {
  // Get artist details by ID
  getArtistDetails: async (artistId: string): Promise<ArtistDetailResponse> => {
    const response = await apiClient.get(`/artists/${artistId}`);
    return response.data;
  },

  // Get artist details by URL link
  getArtistDetailsByLink: async (link: string): Promise<ArtistDetailResponse> => {
    const response = await apiClient.get('/artists', {
      params: { link }
    });
    return response.data;
  },

  // Get artist songs with pagination
  getArtistSongs: async (
    artistId: string,
    page: number = 0,
    sortBy: string = 'popularity',
    sortOrder: string = 'desc'
  ): Promise<any> => {
    const response = await apiClient.get(`/artists/${artistId}/songs`, {
      params: { page, sortBy, sortOrder }
    });
    return response.data;
  },

  // Get artist albums with pagination
  getArtistAlbums: async (
    artistId: string,
    page: number = 0,
    sortBy: string = 'popularity',
    sortOrder: string = 'desc'
  ): Promise<any> => {
    const response = await apiClient.get(`/artists/${artistId}/albums`, {
      params: { page, sortBy, sortOrder }
    });
    return response.data;
  },
};
