// services/download.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paths, Directory, File } from 'expo-file-system';
import { Song } from '@/types/searchSong';

const DOWNLOADS_DIRECTORY = new Directory(Paths.document, 'downloads');
const DOWNLOADS_KEY = '@downloads';
const MAX_STORAGE_MB = 500; // 500MB storage limit

export interface DownloadedSong extends Song {
  localUri: string;
  downloadDate: string;
  fileSize: number;
}

export const downloadService = {
  // Initialize downloads directory
  async initializeDownloads(): Promise<void> {
    if (!DOWNLOADS_DIRECTORY.exists) {
      DOWNLOADS_DIRECTORY.create();
    }
  },

  // Get all downloaded songs
  async getDownloadedSongs(): Promise<DownloadedSong[]> {
    try {
      const data = await AsyncStorage.getItem(DOWNLOADS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting downloaded songs:', error);
      return [];
    }
  },

  // Check if a song is downloaded
  async isDownloaded(songId: string): Promise<boolean> {
    const downloads = await this.getDownloadedSongs();
    return downloads.some((song) => song.id === songId);
  },

  // Get downloaded song by ID
  async getDownloadedSong(songId: string): Promise<DownloadedSong | null> {
    const downloads = await this.getDownloadedSongs();
    return downloads.find((song) => song.id === songId) || null;
  },

  // Download a song
  async downloadSong(
    song: Song,
    audioUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<DownloadedSong> {
    try {
      await this.initializeDownloads();

      // Check storage limit
      const currentSize = await this.getTotalDownloadSize();
      const maxSizeBytes = MAX_STORAGE_MB * 1024 * 1024;

      if (currentSize > maxSizeBytes) {
        throw new Error('Storage limit reached. Please delete some downloads.');
      }

      const fileExtension = '.mp3';
      const fileName = `${song.id}${fileExtension}`;
      const file = new File(DOWNLOADS_DIRECTORY, fileName);

      // Download the file using the new API
      const downloadedFile = await File.downloadFileAsync(
        audioUrl,
        DOWNLOADS_DIRECTORY,
        {
          idempotent: true, // Overwrite if exists
        }
      );

      // Get file size
      const fileSize = downloadedFile.size || 0;

      // Create downloaded song object
      const downloadedSong: DownloadedSong = {
        ...song,
        localUri: downloadedFile.uri,
        downloadDate: new Date().toISOString(),
        fileSize,
      };

      // Save to AsyncStorage
      const downloads = await this.getDownloadedSongs();
      const updatedDownloads = [...downloads, downloadedSong];
      await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updatedDownloads));

      return downloadedSong;
    } catch (error) {
      console.error('Error downloading song:', error);
      throw error;
    }
  },

  // Delete a downloaded song
  async deleteSong(songId: string): Promise<void> {
    try {
      const downloads = await this.getDownloadedSongs();
      const song = downloads.find((s) => s.id === songId);

      if (song) {
        // Delete file using new API
        const file = new File(song.localUri);
        if (file.exists) {
          file.delete();
        }

        // Update AsyncStorage
        const updatedDownloads = downloads.filter((s) => s.id !== songId);
        await AsyncStorage.setItem(
          DOWNLOADS_KEY,
          JSON.stringify(updatedDownloads)
        );
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      throw error;
    }
  },

  // Clear all downloads
  async clearAllDownloads(): Promise<void> {
    try {
      // Delete directory using new API
      if (DOWNLOADS_DIRECTORY.exists) {
        DOWNLOADS_DIRECTORY.delete();
      }

      // Recreate directory
      await this.initializeDownloads();

      // Clear AsyncStorage
      await AsyncStorage.removeItem(DOWNLOADS_KEY);
    } catch (error) {
      console.error('Error clearing downloads:', error);
      throw error;
    }
  },

  // Get total download size
  async getTotalDownloadSize(): Promise<number> {
    try {
      const downloads = await this.getDownloadedSongs();
      return downloads.reduce((total, song) => total + song.fileSize, 0);
    } catch (error) {
      console.error('Error getting total download size:', error);
      return 0;
    }
  },

  // Format bytes to readable size
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Clean up old downloads (remove oldest if storage limit exceeded)
  async cleanupOldDownloads(): Promise<void> {
    try {
      const downloads = await this.getDownloadedSongs();
      const totalSize = await this.getTotalDownloadSize();
      const maxSizeBytes = MAX_STORAGE_MB * 1024 * 1024;

      if (totalSize > maxSizeBytes) {
        // Sort by download date (oldest first)
        const sortedDownloads = [...downloads].sort(
          (a, b) =>
            new Date(a.downloadDate).getTime() -
            new Date(b.downloadDate).getTime()
        );

        let currentSize = totalSize;
        const toDelete: string[] = [];

        // Delete oldest songs until we're under the limit
        for (const song of sortedDownloads) {
          if (currentSize <= maxSizeBytes * 0.8) break; // Keep 20% buffer
          toDelete.push(song.id);
          currentSize -= song.fileSize;
        }

        // Delete the songs
        for (const songId of toDelete) {
          await this.deleteSong(songId);
        }
      }
    } catch (error) {
      console.error('Error cleaning up downloads:', error);
    }
  },
};
