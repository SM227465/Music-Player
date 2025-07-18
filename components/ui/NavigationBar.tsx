// components/ui/NavigationBar.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NavigationBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function NavigationBar({ activeTab, onTabPress }: NavigationBarProps) {
  const tabs = [
    { key: 'home', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
    { key: 'search', label: 'Search', activeIcon: 'search', inactiveIcon: 'search-outline' },
    { key: 'library', label: 'Library', activeIcon: 'library', inactiveIcon: 'library-outline' },
    { key: 'profile', label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
  ] as const;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)}>
          <Ionicons
            name={activeTab === tab.key ? tab.activeIcon : tab.inactiveIcon}
            size={24}
            color={activeTab === tab.key ? '#8B5CF6' : '#6B7280'}
          />
          <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 15, 35, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#8B5CF6',
  },
});
