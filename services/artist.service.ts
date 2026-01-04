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
};
