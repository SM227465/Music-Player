// app/(tabs)/_layout.tsx
import HomeScreen from '@/components/ui/HomeScreen';
import LibraryScreen from '@/components/ui/LibraryScreen';
import MiniPlayer from '@/components/ui/MiniPlayer';
import NavigationBar from '@/components/ui/NavigationBar';
import NowPlayingScreen from '@/components/ui/NowPlayingScreen';
import ProfileScreen from '@/components/ui/ProfileScreen';
import SearchScreen from '@/components/ui/SearchScreen';
import SignInScreen from '@/components/ui/SignInScreen';
import WelcomeScreen from '@/components/ui/WelcomeScreen';
import { useAudioPlayerBackground } from '@/hooks/useAudioPlayerBackground';
import { Song } from '@/types/searchSong';
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ErrorBoundary } from 'react-error-boundary';
import SplashScreen from './index';
import { useTheme } from '@/constants/theme';

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

function MainApp() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const audioPlayer = useAudioPlayerBackground();

  const handleSongPress = async (song: Song) => {
    await audioPlayer.playAudio(song);
    setShowNowPlaying(true);
  };

  const handlePlayQueue = async (songs: Song[], startIndex: number) => {
    await audioPlayer.playQueue(songs, startIndex);
    setShowNowPlaying(true);
  };

  const handleCloseMiniPlayer = async () => {
    await audioPlayer.stopAndClear();
    setShowNowPlaying(false);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onSongPress={handleSongPress}
            onPlayQueue={handlePlayQueue}
            currentTrack={audioPlayer.currentTrack}
            isPlaying={audioPlayer.isPlaying}
            onTogglePlayPause={audioPlayer.togglePlayPause}
          />
        );
      case 'search':
        return <SearchScreen onSongPress={handleSongPress} />;
      case 'library':
        return <LibraryScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return (
          <HomeScreen
            onSongPress={handleSongPress}
            onPlayQueue={handlePlayQueue}
            currentTrack={audioPlayer.currentTrack}
            isPlaying={audioPlayer.isPlaying}
            onTogglePlayPause={audioPlayer.togglePlayPause}
          />
        );
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setActiveTab('home')}>
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        {renderScreen()}

        {audioPlayer.currentTrack && (
          <MiniPlayer
            currentTrack={audioPlayer.currentTrack}
            onExpand={() => setShowNowPlaying(true)}
            isVisible={!showNowPlaying}
            audioPlayer={audioPlayer}
            onClose={handleCloseMiniPlayer}
            onNext={audioPlayer.queue.length > 1 ? audioPlayer.playNext : undefined}
            onPrevious={audioPlayer.currentIndex > 0 ? audioPlayer.playPrevious : undefined}
          />
        )}

        {audioPlayer.currentTrack && (
          <NowPlayingScreen
            currentTrack={audioPlayer.currentTrack}
            onMinimize={() => setShowNowPlaying(false)}
            isVisible={showNowPlaying}
            audioPlayer={audioPlayer}
          />
        )}
        {!showNowPlaying && <NavigationBar activeTab={activeTab} onTabPress={setActiveTab} />}
      </View>
    </ErrorBoundary>
  );
}

export default function TabLayout() {
  const [currentScreen, setCurrentScreen] = useState('splash');

  const handleSkipToMain = () => {
    setCurrentScreen('main');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'welcome':
        return <WelcomeScreen onNext={() => setCurrentScreen('signin')} onSkip={handleSkipToMain} />;
      case 'signin':
        return <SignInScreen onSkip={handleSkipToMain} />;
      case 'main':
        return <MainApp />;
      default:
        return <SplashScreen />;
    }
  };

  // Auto-navigate from splash to welcome after 3 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (currentScreen === 'splash') {
        setCurrentScreen('welcome');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentScreen]);

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
