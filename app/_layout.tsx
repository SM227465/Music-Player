import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import HomeScreen from '@/components/ui/HomeScreen';
import LibraryScreen from '@/components/ui/LibraryScreen';
import MiniPlayer from '@/components/ui/MiniPlayer';
import NavigationBar from '@/components/ui/NavigationBar';
import NowPlayingScreen from '@/components/ui/NowPlayingScreen';
import ProfileScreen from '@/components/ui/ProfileScreen';
import SearchScreen from '@/components/ui/SearchScreen';
import { useCustomAudioPlayer } from '@/hooks/useAudioPlayer';
import { Album, Artist, Playlist } from '@/types/music';
import { Song } from '@/types/searchSong';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from 'react-error-boundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <TouchableOpacity style={styles.errorButton} onPress={resetErrorBoundary}>
        <Text style={styles.errorButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const audioPlayer = useCustomAudioPlayer();

  const handleSongPress = (song: Song) => {
    setCurrentTrack(song);
    setShowNowPlaying(true);
  };

  const handleAlbumPress = (album: Album) => {
    // Navigate to album details or play first song
    if (album.songs && album.songs.length > 0) {
      // handleSongPress(album.songs[0]);
    }
  };

  const handleArtistPress = (artist: Artist) => {
    // Navigate to artist details
    console.log('Navigate to artist:', artist.name);
  };

  const handlePlaylistPress = (playlist: Playlist) => {
    // Navigate to playlist details or play first song
    if (playlist.songs && playlist.songs.length > 0) {
      // handleSongPress(playlist.songs[0]);
    }
  };

  const handleCloseMiniPlayer = async () => {
    await audioPlayer.stopAndClear();
    setCurrentTrack(null);
    setShowNowPlaying(false);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return (
          <SearchScreen onSongPress={handleSongPress} /* onAlbumPress={handleAlbumPress} onArtistPress={handleArtistPress} */ />
        );
      case 'library':
        return <LibraryScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setActiveTab('home')}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <View style={styles.container}>
            <StatusBar style='light' />
            {renderScreen()}

            {currentTrack && (
              <MiniPlayer
                currentTrack={currentTrack}
                onExpand={() => setShowNowPlaying(true)}
                isVisible={!showNowPlaying}
                audioPlayer={audioPlayer}
                onClose={handleCloseMiniPlayer}
              />
            )}

            {currentTrack && (
              <NowPlayingScreen
                currentTrack={currentTrack}
                onMinimize={() => setShowNowPlaying(false)}
                isVisible={showNowPlaying}
                audioPlayer={audioPlayer}
              />
            )}
            {!showNowPlaying && <NavigationBar activeTab={activeTab} onTabPress={setActiveTab} />}
          </View>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#B8B8D1',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
