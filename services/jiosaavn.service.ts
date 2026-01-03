// services/jiosaavn.service.ts

const BASE_URL = 'https://jiosaavn-scraper.onrender.com/api/jiosaavn';
const SUMIT_API_URL = 'https://saavn.sumit.co/api';

export interface Release {
  id: string;
  title: string;
  url: string;
  image: string;
  subtitle: string;
}

export interface Playlist {
  id: string;
  title: string;
  url: string;
  image: string;
  subtitle: string;
  followers: string;
}

export interface Chart {
  id: string;
  title: string;
  url: string;
  image: string;
  subtitle: string;
}

export interface Artist {
  id: string;
  name: string;
  url: string;
  image: string;
  fans: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

class JioSaavnService {
  async getNewReleases(): Promise<Release[]> {
    try {
      const response = await fetch(`${BASE_URL}/new-releases`);
      const data: ApiResponse<Release[]> = await response.json();

      if (data.success) {
        return data.data;
      }
      throw new Error('Failed to fetch new releases');
    } catch (error) {
      console.error('Error fetching new releases:', error);
      throw error;
    }
  }

  async getTopPlaylists(): Promise<Playlist[]> {
    try {
      const response = await fetch(`${BASE_URL}/top-playlists`);
      const data: ApiResponse<Playlist[]> = await response.json();

      if (data.success) {
        return data.data;
      }
      throw new Error('Failed to fetch top playlists');
    } catch (error) {
      console.error('Error fetching top playlists:', error);
      throw error;
    }
  }

  async getTopCharts(): Promise<Chart[]> {
    try {
      const response = await fetch(`${BASE_URL}/top-charts`);
      const data: ApiResponse<Chart[]> = await response.json();

      if (data.success) {
        return data.data;
      }
      throw new Error('Failed to fetch top charts');
    } catch (error) {
      console.error('Error fetching top charts:', error);
      throw error;
    }
  }

  async getTopArtists(): Promise<Artist[]> {
    try {
      const response = await fetch(`${BASE_URL}/top-artists`);
      const data: ApiResponse<Artist[]> = await response.json();

      if (data.success) {
        return data.data;
      }
      throw new Error('Failed to fetch top artists');
    } catch (error) {
      console.error('Error fetching top artists:', error);
      throw error;
    }
  }

  async getPlaylistDetails(playlistUrl: string): Promise<any> {
    try {
      const response = await fetch(
        `${SUMIT_API_URL}/playlists?link=${encodeURIComponent(playlistUrl)}`
      );
      const data: ApiResponse<any> = await response.json();

      if (data.success) {
        return data.data;
      }
      throw new Error('Failed to fetch playlist details');
    } catch (error) {
      console.error('Error fetching playlist details:', error);
      throw error;
    }
  }

  async getAlbumDetails(albumUrl: string): Promise<any> {
    try {
      const response = await fetch(
        `${SUMIT_API_URL}/albums?link=${encodeURIComponent(albumUrl)}`
      );
      const data: ApiResponse<any> = await response.json();

      if (data.success) {
        return data.data;
      }
      throw new Error('Failed to fetch album details');
    } catch (error) {
      console.error('Error fetching album details:', error);
      throw error;
    }
  }
}

export const jioSaavnService = new JioSaavnService();
