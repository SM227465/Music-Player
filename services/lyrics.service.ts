// services/lyrics.service.ts
import { apiClient } from '@/configs/axios.config';

export interface LyricsResponse {
  success: boolean;
  data?: {
    lyrics: string;
    copyright?: string;
    snippet?: string;
  };
}

export const lyricsService = {
  // Get lyrics by song ID
  getLyrics: async (songId: string): Promise<LyricsResponse> => {
    try {
      const response = await apiClient.get(`/songs/${songId}/lyrics`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lyrics:', error);
      return { success: false };
    }
  },
};
