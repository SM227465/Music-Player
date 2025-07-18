import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import HomeScreen from '@/components/ui/HomeScreen';
import LibraryScreen from '@/components/ui/LibraryScreen';
import NavigationBar from '@/components/ui/NavigationBar';
import ProfileScreen from '@/components/ui/ProfileScreen';
import SearchScreen from '@/components/ui/SearchScreen';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function RootLayout() {
  const [activeTab, setActiveTab] = useState('home');

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
    <View style={styles.container}>
      <StatusBar style='light' />
      {renderScreen()}
      <NavigationBar activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
});
