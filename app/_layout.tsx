import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import HomeScreen from '@/components/ui/HomeScreen';
import LibraryScreen from '@/components/ui/LibraryScreen';
import MiniPlayer from '@/components/ui/MiniPlayer';
import NavigationBar from '@/components/ui/NavigationBar';
import NowPlayingScreen from '@/components/ui/NowPlayingScreen';
import ProfileScreen from '@/components/ui/ProfileScreen';
import SearchScreen from '@/components/ui/SearchScreen';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    id: '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    artwork: 'https://i.scdn.co/image/ab67616d0000b27344d77c9b11c18035ad04b8f4',
    duration: 200000,
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  });

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen />;
      case 'library':
        return <LibraryScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style='light' />
        {renderScreen()}

        <MiniPlayer
          currentTrack={currentTrack}
          onExpand={() => setShowNowPlaying(true)}
          isVisible={!showNowPlaying && Boolean(currentTrack.id)}
        />

        <NowPlayingScreen currentTrack={currentTrack} onMinimize={() => setShowNowPlaying(false)} isVisible={showNowPlaying} />
        <NavigationBar activeTab={activeTab} onTabPress={setActiveTab} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
});
