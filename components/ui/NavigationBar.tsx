// components/ui/NavigationBar.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing, fontSize, iconSize } from '@/constants/theme';

interface NavigationBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function NavigationBar({ activeTab, onTabPress }: NavigationBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const tabs = [
    { key: 'home', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
    { key: 'search', label: 'Search', activeIcon: 'search', inactiveIcon: 'search-outline' },
    { key: 'library', label: 'Library', activeIcon: 'library', inactiveIcon: 'library-outline' },
    { key: 'profile', label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
  ] as const;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.background.elevated,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: Math.max(insets.bottom, spacing.md),
      borderTopWidth: 1,
      borderTopColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,
      elevation: 8,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    tabLabel: {
      fontSize: fontSize.xs,
      color: theme.text.secondary,
      marginTop: spacing.xs,
    },
    activeTabLabel: {
      color: theme.accent.primary,
    },
  });

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)}>
          <Ionicons
            name={activeTab === tab.key ? tab.activeIcon : tab.inactiveIcon}
            size={iconSize.md}
            color={activeTab === tab.key ? theme.accent.primary : theme.text.secondary}
          />
          <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
