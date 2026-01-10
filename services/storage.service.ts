// services/storage.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '@/types/searchSong';
import { ArtistResult } from '@/types/artistSearch';

// Storage keys
const STORAGE_KEYS = {
  FAVORITES: '@music_app:favorites',
  PLAYLISTS: '@music_app:playlists',
  HISTORY: '@music_app:history',
  SETTINGS: '@music_app:settings',
  QUEUE: '@music_app:queue',
  RECENT_SEARCHES: '@music_app:recent_searches',
  FOLLOWED_ARTISTS: '@music_app:followed_artists',
  API_CONFIG: '@music_app:api_config',
} as const;

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songs: Song[];
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
}

export interface HistoryItem {
  song: Song;
  playedAt: string;
  duration?: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  audioQuality: '320kbps' | '160kbps' | '96kbps' | '48kbps' | '12kbps';
  downloadQuality: '320kbps' | '160kbps' | '96kbps';
  enableNotifications: boolean;
  enableHaptics: boolean;
  sleepTimerDuration?: number;
  crossfadeDuration: number;
}

export interface ApiConfig {
  assistanceApiUrl: string;
  baseApiUrl: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  audioQuality: '320kbps',
  downloadQuality: '320kbps',
  enableNotifications: true,
  enableHaptics: true,
  crossfadeDuration: 0,
};

// Favorites Management
export const favoritesService = {
  async getFavorites(): Promise<Song[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  async addFavorite(song: Song): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const exists = favorites.some((fav) => fav.id === song.id);

      if (!exists) {
        favorites.unshift(song);
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },

  async removeFavorite(songId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter((fav) => fav.id !== songId);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  },

  async isFavorite(songId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some((fav) => fav.id === songId);
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  },

  async toggleFavorite(song: Song): Promise<boolean> {
    try {
      const isFav = await this.isFavorite(song.id);
      if (isFav) {
        await this.removeFavorite(song.id);
        return false;
      } else {
        await this.addFavorite(song);
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },
};

// Playlist Management
export const playlistService = {
  async getPlaylists(): Promise<Playlist[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting playlists:', error);
      return [];
    }
  },

  async getPlaylist(id: string): Promise<Playlist | null> {
    try {
      const playlists = await this.getPlaylists();
      return playlists.find((p) => p.id === id) || null;
    } catch (error) {
      console.error('Error getting playlist:', error);
      return null;
    }
  },

  async createPlaylist(name: string, description?: string): Promise<Playlist> {
    try {
      const playlists = await this.getPlaylists();
      const newPlaylist: Playlist = {
        id: `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        songs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      playlists.push(newPlaylist);
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
      return newPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  },

  async updatePlaylist(id: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const playlists = await this.getPlaylists();
      const index = playlists.findIndex((p) => p.id === id);

      if (index !== -1) {
        playlists[index] = {
          ...playlists[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw error;
    }
  },

  async deletePlaylist(id: string): Promise<void> {
    try {
      const playlists = await this.getPlaylists();
      const filtered = playlists.filter((p) => p.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  },

  async addSongToPlaylist(playlistId: string, song: Song): Promise<void> {
    try {
      const playlist = await this.getPlaylist(playlistId);
      if (!playlist) {
        throw new Error('Playlist not found');
      }

      const songExists = playlist.songs.some((s) => s.id === song.id);
      if (!songExists) {
        playlist.songs.push(song);
        await this.updatePlaylist(playlistId, { songs: playlist.songs });
      }
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      throw error;
    }
  },

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    try {
      const playlist = await this.getPlaylist(playlistId);
      if (!playlist) {
        throw new Error('Playlist not found');
      }

      const filteredSongs = playlist.songs.filter((s) => s.id !== songId);
      await this.updatePlaylist(playlistId, { songs: filteredSongs });
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      throw error;
    }
  },

  async reorderSongs(playlistId: string, songs: Song[]): Promise<void> {
    try {
      await this.updatePlaylist(playlistId, { songs });
    } catch (error) {
      console.error('Error reordering songs:', error);
      throw error;
    }
  },
};

// History Management
export const historyService = {
  async getHistory(limit: number = 50): Promise<HistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      const history: HistoryItem[] = data ? JSON.parse(data) : [];
      return history.slice(0, limit);
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  },

  async addToHistory(song: Song, duration?: number): Promise<void> {
    try {
      const history = await this.getHistory();

      // Remove duplicate if exists
      const filtered = history.filter((item) => item.song.id !== song.id);

      // Add to beginning
      const newItem: HistoryItem = {
        song,
        playedAt: new Date().toISOString(),
        duration,
      };

      filtered.unshift(newItem);

      // Keep only last 100 items
      const trimmed = filtered.slice(0, 100);

      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error adding to history:', error);
      throw error;
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  },

  async removeFromHistory(songId: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const filtered = history.filter((item) => item.song.id !== songId);
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from history:', error);
      throw error;
    }
  },
};

// Settings Management
export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  async resetSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  },
};

// Queue Management
export const queueService = {
  async getQueue(): Promise<Song[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting queue:', error);
      return [];
    }
  },

  async setQueue(songs: Song[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(songs));
    } catch (error) {
      console.error('Error setting queue:', error);
      throw error;
    }
  },

  async addToQueue(song: Song, position?: number): Promise<void> {
    try {
      const queue = await this.getQueue();

      if (position !== undefined && position >= 0 && position <= queue.length) {
        queue.splice(position, 0, song);
      } else {
        queue.push(song);
      }

      await this.setQueue(queue);
    } catch (error) {
      console.error('Error adding to queue:', error);
      throw error;
    }
  },

  async removeFromQueue(index: number): Promise<void> {
    try {
      const queue = await this.getQueue();
      queue.splice(index, 1);
      await this.setQueue(queue);
    } catch (error) {
      console.error('Error removing from queue:', error);
      throw error;
    }
  },

  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.QUEUE);
    } catch (error) {
      console.error('Error clearing queue:', error);
      throw error;
    }
  },

  async reorderQueue(songs: Song[]): Promise<void> {
    try {
      await this.setQueue(songs);
    } catch (error) {
      console.error('Error reordering queue:', error);
      throw error;
    }
  },
};

// Recent Searches Management
export const recentSearchesService = {
  async getRecentSearches(limit: number = 5): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      const searches: string[] = data ? JSON.parse(data) : [];
      return searches.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  },

  async addRecentSearch(query: string): Promise<void> {
    try {
      if (!query.trim()) return;

      const searches = await this.getAllSearches();

      // Remove duplicate if exists
      const filtered = searches.filter((search) => search.toLowerCase() !== query.toLowerCase());

      // Add new search at the beginning
      filtered.unshift(query.trim());

      // Keep only last 20 searches
      const limited = filtered.slice(0, 20);

      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(limited));
    } catch (error) {
      console.error('Error adding recent search:', error);
      throw error;
    }
  },

  async getAllSearches(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all searches:', error);
      return [];
    }
  },

  async removeRecentSearch(query: string): Promise<void> {
    try {
      const searches = await this.getAllSearches();
      const filtered = searches.filter((search) => search !== query);
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing recent search:', error);
      throw error;
    }
  },

  async clearRecentSearches(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
      throw error;
    }
  },
};

// Followed Artists Management
export const followedArtistsService = {
  async getFollowedArtists(): Promise<ArtistResult[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FOLLOWED_ARTISTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting followed artists:', error);
      return [];
    }
  },

  async followArtist(artist: ArtistResult): Promise<void> {
    try {
      const followedArtists = await this.getFollowedArtists();
      const exists = followedArtists.some((a) => a.id === artist.id);

      if (!exists) {
        followedArtists.unshift(artist);
        await AsyncStorage.setItem(STORAGE_KEYS.FOLLOWED_ARTISTS, JSON.stringify(followedArtists));
      }
    } catch (error) {
      console.error('Error following artist:', error);
      throw error;
    }
  },

  async unfollowArtist(artistId: string): Promise<void> {
    try {
      const followedArtists = await this.getFollowedArtists();
      const filtered = followedArtists.filter((a) => a.id !== artistId);
      await AsyncStorage.setItem(STORAGE_KEYS.FOLLOWED_ARTISTS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error unfollowing artist:', error);
      throw error;
    }
  },

  async isFollowing(artistId: string): Promise<boolean> {
    try {
      const followedArtists = await this.getFollowedArtists();
      return followedArtists.some((a) => a.id === artistId);
    } catch (error) {
      console.error('Error checking if following artist:', error);
      return false;
    }
  },

  async toggleFollow(artist: ArtistResult): Promise<boolean> {
    try {
      const isFollowing = await this.isFollowing(artist.id);
      if (isFollowing) {
        await this.unfollowArtist(artist.id);
        return false;
      } else {
        await this.followArtist(artist);
        return true;
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      throw error;
    }
  },
};

// API Configuration Management
export const apiConfigService = {
  // Default API URLs
  DEFAULT_ASSISTANCE_API: 'https://jiosaavn-scraper.onrender.com/api/jiosaavn',
  DEFAULT_BASE_API: 'https://saavn.sumit.co/api',

  async getApiConfig(): Promise<ApiConfig> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.API_CONFIG);
      if (data) {
        return JSON.parse(data);
      }
      // Return defaults if not configured
      return {
        assistanceApiUrl: this.DEFAULT_ASSISTANCE_API,
        baseApiUrl: this.DEFAULT_BASE_API,
      };
    } catch (error) {
      console.error('Error getting API config:', error);
      return {
        assistanceApiUrl: this.DEFAULT_ASSISTANCE_API,
        baseApiUrl: this.DEFAULT_BASE_API,
      };
    }
  },

  async updateApiConfig(config: Partial<ApiConfig>): Promise<void> {
    try {
      const current = await this.getApiConfig();
      const updated = { ...current, ...config };
      await AsyncStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating API config:', error);
      throw error;
    }
  },

  async resetToDefaults(): Promise<void> {
    try {
      const defaultConfig: ApiConfig = {
        assistanceApiUrl: this.DEFAULT_ASSISTANCE_API,
        baseApiUrl: this.DEFAULT_BASE_API,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(defaultConfig));
    } catch (error) {
      console.error('Error resetting API config:', error);
      throw error;
    }
  },
};

// Utility functions
export const storageService = {
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all storage:', error);
      throw error;
    }
  },

  async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  },
};
