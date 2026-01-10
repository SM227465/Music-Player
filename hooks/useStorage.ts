// hooks/useStorage.ts
import { useState, useEffect, useCallback } from 'react';
import { Song } from '@/types/searchSong';
import { ArtistResult } from '@/types/artistSearch';
import {
  favoritesService,
  playlistService,
  historyService,
  settingsService,
  queueService,
  followedArtistsService,
  apiConfigService,
  Playlist,
  HistoryItem,
  AppSettings,
  ApiConfig,
} from '@/services/storage.service';
import { downloadService, DownloadedSong } from '@/services/download.service';

// Hook for Favorites
export function useFavorites() {
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await favoritesService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addFavorite = useCallback(
    async (song: Song) => {
      try {
        await favoritesService.addFavorite(song);
        await loadFavorites();
      } catch (error) {
        console.error('Error adding favorite:', error);
      }
    },
    [loadFavorites]
  );

  const removeFavorite = useCallback(
    async (songId: string) => {
      try {
        await favoritesService.removeFavorite(songId);
        await loadFavorites();
      } catch (error) {
        console.error('Error removing favorite:', error);
      }
    },
    [loadFavorites]
  );

  const toggleFavorite = useCallback(
    async (song: Song) => {
      try {
        const isFav = await favoritesService.toggleFavorite(song);
        await loadFavorites();
        return isFav;
      } catch (error) {
        console.error('Error toggling favorite:', error);
        return false;
      }
    },
    [loadFavorites]
  );

  const isFavorite = useCallback(
    (songId: string) => {
      return favorites.some((fav) => fav.id === songId);
    },
    [favorites]
  );

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refresh: loadFavorites,
  };
}

// Hook for Playlists
export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      const data = await playlistService.getPlaylists();
      setPlaylists(data);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const createPlaylist = useCallback(
    async (name: string, description?: string) => {
      try {
        const playlist = await playlistService.createPlaylist(name, description);
        await loadPlaylists();
        return playlist;
      } catch (error) {
        console.error('Error creating playlist:', error);
        throw error;
      }
    },
    [loadPlaylists]
  );

  const updatePlaylist = useCallback(
    async (id: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>) => {
      try {
        await playlistService.updatePlaylist(id, updates);
        await loadPlaylists();
      } catch (error) {
        console.error('Error updating playlist:', error);
        throw error;
      }
    },
    [loadPlaylists]
  );

  const deletePlaylist = useCallback(
    async (id: string) => {
      try {
        await playlistService.deletePlaylist(id);
        await loadPlaylists();
      } catch (error) {
        console.error('Error deleting playlist:', error);
        throw error;
      }
    },
    [loadPlaylists]
  );

  const addSongToPlaylist = useCallback(
    async (playlistId: string, song: Song) => {
      try {
        await playlistService.addSongToPlaylist(playlistId, song);
        await loadPlaylists();
      } catch (error) {
        console.error('Error adding song to playlist:', error);
        throw error;
      }
    },
    [loadPlaylists]
  );

  const removeSongFromPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      try {
        await playlistService.removeSongFromPlaylist(playlistId, songId);
        await loadPlaylists();
      } catch (error) {
        console.error('Error removing song from playlist:', error);
        throw error;
      }
    },
    [loadPlaylists]
  );

  return {
    playlists,
    loading,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    refresh: loadPlaylists,
  };
}

// Hook for History
export function useHistory(limit: number = 50) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await historyService.getHistory(limit);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const addToHistory = useCallback(
    async (song: Song, duration?: number) => {
      try {
        await historyService.addToHistory(song, duration);
        await loadHistory();
      } catch (error) {
        console.error('Error adding to history:', error);
      }
    },
    [loadHistory]
  );

  const removeFromHistory = useCallback(
    async (songId: string) => {
      try {
        await historyService.removeFromHistory(songId);
        await loadHistory();
      } catch (error) {
        console.error('Error removing from history:', error);
      }
    },
    [loadHistory]
  );

  const clearHistory = useCallback(async () => {
    try {
      await historyService.clearHistory();
      await loadHistory();
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, [loadHistory]);

  return {
    history,
    loading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    refresh: loadHistory,
  };
}

// Hook for Settings
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      // Create a new object to ensure React detects the change
      setSettings({ ...data });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      try {
        await settingsService.updateSettings(updates);
        await loadSettings();
      } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
      }
    },
    [loadSettings]
  );

  const resetSettings = useCallback(async () => {
    try {
      await settingsService.resetSettings();
      await loadSettings();
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }, [loadSettings]);

  return {
    settings,
    loading,
    updateSettings,
    resetSettings,
    refresh: loadSettings,
  };
}

// Hook for Queue
export function useQueue() {
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    try {
      setLoading(true);
      const data = await queueService.getQueue();
      setQueue(data);
    } catch (error) {
      console.error('Error loading queue:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const setQueueSongs = useCallback(
    async (songs: Song[], startIndex: number = 0) => {
      try {
        await queueService.setQueue(songs);
        setCurrentIndex(startIndex);
        await loadQueue();
      } catch (error) {
        console.error('Error setting queue:', error);
      }
    },
    [loadQueue]
  );

  const addToQueue = useCallback(
    async (song: Song, position?: number) => {
      try {
        await queueService.addToQueue(song, position);
        await loadQueue();
      } catch (error) {
        console.error('Error adding to queue:', error);
      }
    },
    [loadQueue]
  );

  const removeFromQueue = useCallback(
    async (index: number) => {
      try {
        await queueService.removeFromQueue(index);
        if (index < currentIndex) {
          setCurrentIndex((prev) => Math.max(0, prev - 1));
        }
        await loadQueue();
      } catch (error) {
        console.error('Error removing from queue:', error);
      }
    },
    [currentIndex, loadQueue]
  );

  const clearQueue = useCallback(async () => {
    try {
      await queueService.clearQueue();
      setCurrentIndex(0);
      await loadQueue();
    } catch (error) {
      console.error('Error clearing queue:', error);
    }
  }, [loadQueue]);

  const playNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return queue[currentIndex + 1];
    }
    return null;
  }, [queue, currentIndex]);

  const playPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      return queue[currentIndex - 1];
    }
    return null;
  }, [queue, currentIndex]);

  const getCurrentSong = useCallback(() => {
    return queue[currentIndex] || null;
  }, [queue, currentIndex]);

  const hasNext = currentIndex < queue.length - 1;
  const hasPrevious = currentIndex > 0;

  return {
    queue,
    currentIndex,
    loading,
    setQueue: setQueueSongs,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playNext,
    playPrevious,
    getCurrentSong,
    hasNext,
    hasPrevious,
    refresh: loadQueue,
  };
}

// Hook for Downloads
export function useDownloads() {
  const [downloads, setDownloads] = useState<DownloadedSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState<{
    [songId: string]: number;
  }>({});

  const loadDownloads = useCallback(async () => {
    try {
      setLoading(true);
      await downloadService.initializeDownloads();
      const data = await downloadService.getDownloadedSongs();
      setDownloads(data);
    } catch (error) {
      console.error('Error loading downloads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);

  const downloadSong = useCallback(
    async (song: Song, audioUrl: string) => {
      try {
        setDownloadProgress((prev) => ({ ...prev, [song.id]: 0 }));

        const downloaded = await downloadService.downloadSong(
          song,
          audioUrl,
          (progress) => {
            setDownloadProgress((prev) => ({ ...prev, [song.id]: progress }));
          }
        );

        await loadDownloads();
        setDownloadProgress((prev) => {
          const updated = { ...prev };
          delete updated[song.id];
          return updated;
        });

        return downloaded;
      } catch (error) {
        setDownloadProgress((prev) => {
          const updated = { ...prev };
          delete updated[song.id];
          return updated;
        });
        console.error('Error downloading song:', error);
        throw error;
      }
    },
    [loadDownloads]
  );

  const deleteSong = useCallback(
    async (songId: string) => {
      try {
        await downloadService.deleteSong(songId);
        await loadDownloads();
      } catch (error) {
        console.error('Error deleting song:', error);
        throw error;
      }
    },
    [loadDownloads]
  );

  const clearAllDownloads = useCallback(async () => {
    try {
      await downloadService.clearAllDownloads();
      await loadDownloads();
    } catch (error) {
      console.error('Error clearing downloads:', error);
      throw error;
    }
  }, [loadDownloads]);

  const isDownloaded = useCallback(
    (songId: string) => {
      return downloads.some((song) => song.id === songId);
    },
    [downloads]
  );

  const getDownloadedSong = useCallback(
    (songId: string) => {
      return downloads.find((song) => song.id === songId) || null;
    },
    [downloads]
  );

  const getTotalSize = useCallback(() => {
    return downloads.reduce((total, song) => total + song.fileSize, 0);
  }, [downloads]);

  return {
    downloads,
    loading,
    downloadProgress,
    downloadSong,
    deleteSong,
    clearAllDownloads,
    isDownloaded,
    getDownloadedSong,
    getTotalSize,
    formatBytes: downloadService.formatBytes,
    refresh: loadDownloads,
  };
}

// Hook for Followed Artists
export function useFollowedArtists() {
  const [followedArtists, setFollowedArtists] = useState<ArtistResult[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFollowedArtists = useCallback(async () => {
    try {
      setLoading(true);
      const data = await followedArtistsService.getFollowedArtists();
      setFollowedArtists(data);
    } catch (error) {
      console.error('Error loading followed artists:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFollowedArtists();
  }, [loadFollowedArtists]);

  const followArtist = useCallback(
    async (artist: ArtistResult) => {
      try {
        await followedArtistsService.followArtist(artist);
        await loadFollowedArtists();
      } catch (error) {
        console.error('Error following artist:', error);
      }
    },
    [loadFollowedArtists]
  );

  const unfollowArtist = useCallback(
    async (artistId: string) => {
      try {
        await followedArtistsService.unfollowArtist(artistId);
        await loadFollowedArtists();
      } catch (error) {
        console.error('Error unfollowing artist:', error);
      }
    },
    [loadFollowedArtists]
  );

  const toggleFollow = useCallback(
    async (artist: ArtistResult) => {
      try {
        const isFollowing = await followedArtistsService.toggleFollow(artist);
        await loadFollowedArtists();
        return isFollowing;
      } catch (error) {
        console.error('Error toggling follow:', error);
        return false;
      }
    },
    [loadFollowedArtists]
  );

  const isFollowing = useCallback(
    (artistId: string) => {
      return followedArtists.some((artist) => artist.id === artistId);
    },
    [followedArtists]
  );

  return {
    followedArtists,
    loading,
    followArtist,
    unfollowArtist,
    toggleFollow,
    isFollowing,
    refresh: loadFollowedArtists,
  };
}

// Hook for API Configuration
export function useApiConfig() {
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    assistanceApiUrl: apiConfigService.DEFAULT_ASSISTANCE_API,
    baseApiUrl: apiConfigService.DEFAULT_BASE_API,
  });
  const [loading, setLoading] = useState(true);

  const loadApiConfig = useCallback(async () => {
    try {
      setLoading(true);
      const config = await apiConfigService.getApiConfig();
      setApiConfig(config);
    } catch (error) {
      console.error('Error loading API config:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApiConfig();
  }, [loadApiConfig]);

  const updateApiConfig = useCallback(
    async (config: Partial<ApiConfig>) => {
      try {
        await apiConfigService.updateApiConfig(config);
        await loadApiConfig();
      } catch (error) {
        console.error('Error updating API config:', error);
        throw error;
      }
    },
    [loadApiConfig]
  );

  const resetToDefaults = useCallback(async () => {
    try {
      await apiConfigService.resetToDefaults();
      await loadApiConfig();
    } catch (error) {
      console.error('Error resetting API config:', error);
      throw error;
    }
  }, [loadApiConfig]);

  return {
    apiConfig,
    loading,
    updateApiConfig,
    resetToDefaults,
    refresh: loadApiConfig,
  };
}
