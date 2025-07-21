import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import HomeScreen from '@/components/ui/HomeScreen';
import LibraryScreen from '@/components/ui/LibraryScreen';
import MiniPlayer from '@/components/ui/MiniPlayer';
import NavigationBar from '@/components/ui/NavigationBar';
import NowPlayingScreen from '@/components/ui/NowPlayingScreen';
import ProfileScreen from '@/components/ui/ProfileScreen';
import SearchScreen from '@/components/ui/SearchScreen';
import { Album, Artist, Playlist } from '@/types/music';
import { Song } from '@/types/searchSong';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);

  const handleSongPress = (song: Song) => {
    // console.log('is it here', song);

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
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style='light' />
          {renderScreen()}

          {currentTrack && (
            <MiniPlayer
              currentTrack={{
                id: currentTrack.id,
                title: currentTrack.name,
                artist: currentTrack.artists.primary.map((a) => a.name).join(', '),
                artwork: currentTrack.image[0]?.url || '',
              }}
              onExpand={() => setShowNowPlaying(true)}
              isVisible={!showNowPlaying}
            />
          )}

          {currentTrack && (
            <NowPlayingScreen
              currentTrack={{
                id: currentTrack.id,
                title: currentTrack.name,
                artist: currentTrack.artists.primary.map((a) => a.name).join(', '),
                album: currentTrack.album.name,
                artwork: currentTrack.image[0]?.url || '',
                duration: currentTrack.duration,
                uri: currentTrack.downloadUrl[0]?.url || '',
              }}
              onMinimize={() => setShowNowPlaying(false)}
              isVisible={showNowPlaying}
            />
          )}
          {!showNowPlaying && <NavigationBar activeTab={activeTab} onTabPress={setActiveTab} />}
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
});
