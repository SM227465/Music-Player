// components/ui/ProfileScreen.tsx
import { useSettings } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const { settings, loading, updateSettings } = useSettings();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: spacing.xl,
    },
    header: {
      paddingTop: 60,
      paddingBottom: spacing.xl,
    },
    headerTitle: {
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
    },
    profileCard: {
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.xl,
      padding: spacing.xxxl,
      alignItems: 'center',
      marginBottom: spacing.xxxl,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,
      elevation: 3,
    },
    avatarContainer: {
      marginBottom: spacing.xl,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary + '33',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.accent.primary,
    },
    userName: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    userEmail: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
    },
    section: {
      marginBottom: spacing.xxxl,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.md,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 4,
      elevation: 2,
    },
    optionIconContainer: {
      width: iconSize.xl,
      height: iconSize.xl,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary + '33',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    optionSubtitle: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
    },
    toggle: {
      width: 50,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.border.secondary,
      padding: 2,
      justifyContent: 'center',
    },
    toggleActive: {
      backgroundColor: theme.accent.primary,
    },
    toggleThumb: {
      width: 24,
      height: 24,
      borderRadius: borderRadius.full,
      backgroundColor: theme.text.inverse,
    },
    toggleThumbActive: {
      alignSelf: 'flex-end',
    },
    paddingBottom: {
      height: 100,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.background.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '85%',
      backgroundColor: theme.background.elevated,
      borderRadius: borderRadius.xl,
      padding: spacing.xxl,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: theme.shadow.opacity * 2,
      shadowRadius: 16,
      elevation: 8,
    },
    modalTitle: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
    modalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    modalOptionActive: {
      backgroundColor: theme.accent.primary + '33',
      borderColor: theme.accent.primary,
    },
    modalOptionText: {
      flex: 1,
      fontSize: fontSize.base,
      color: theme.text.primary,
      marginLeft: spacing.md,
    },
    modalOptionTextActive: {
      color: theme.accent.primary,
      fontWeight: fontWeight.semibold,
    },
    modalCloseButton: {
      marginTop: spacing.sm,
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    modalCloseButtonText: {
      color: theme.text.primary,
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      textAlign: 'center',
    },
  });

  if (loading || !settings) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent.primary} />
        </View>
      </View>
    );
  }

  const handleThemeChange = async (themeValue: 'light' | 'dark' | 'auto') => {
    try {
      await updateSettings({ theme: themeValue });
      setShowThemeModal(false);
    } catch (error) {
      console.error('Error updating theme:', error);
      Alert.alert('Error', 'Failed to update theme');
    }
  };

  const handleQualityChange = async (quality: any) => {
    try {
      await updateSettings({ audioQuality: quality });
      setShowQualityModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update quality');
    }
  };

  const handleToggleHaptics = async () => {
    try {
      await updateSettings({ enableHaptics: !settings.enableHaptics });
    } catch (error) {
      Alert.alert('Error', 'Failed to update haptics');
    }
  };

  const handleToggleNotifications = async () => {
    try {
      await updateSettings({ enableNotifications: !settings.enableNotifications });
    } catch (error) {
      Alert.alert('Error', 'Failed to update notifications');
    }
  };

  const getThemeLabel = () => {
    switch (settings.theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'Auto';
      default:
        return 'Auto';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={iconSize.xl} color={theme.accent.primary} />
            </View>
          </View>

          <Text style={styles.userName}>Music Lover</Text>
          <Text style={styles.userEmail}>Enjoy your favorite tunes</Text>
        </View>

        {/* Audio Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>

          <TouchableOpacity style={styles.optionItem} onPress={() => setShowQualityModal(true)}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="musical-notes" size={iconSize.md} color={theme.accent.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Audio Quality</Text>
              <Text style={styles.optionSubtitle}>{settings.audioQuality}</Text>
            </View>
            <Ionicons name="chevron-forward" size={iconSize.sm} color={theme.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={() => setShowQualityModal(true)}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="download" size={iconSize.md} color={theme.accent.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Download Quality</Text>
              <Text style={styles.optionSubtitle}>{settings.downloadQuality}</Text>
            </View>
            <Ionicons name="chevron-forward" size={iconSize.sm} color={theme.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <TouchableOpacity style={styles.optionItem} onPress={() => setShowThemeModal(true)}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="color-palette" size={iconSize.md} color={theme.accent.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Theme</Text>
              <Text style={styles.optionSubtitle}>{getThemeLabel()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={iconSize.sm} color={theme.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity style={styles.optionItem} onPress={handleToggleHaptics}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="phone-portrait" size={iconSize.md} color={theme.accent.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Haptic Feedback</Text>
              <Text style={styles.optionSubtitle}>Vibration on touch</Text>
            </View>
            <View style={[styles.toggle, settings.enableHaptics && styles.toggleActive]}>
              <View style={[styles.toggleThumb, settings.enableHaptics && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={handleToggleNotifications}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="notifications" size={iconSize.md} color={theme.accent.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Notifications</Text>
              <Text style={styles.optionSubtitle}>App notifications</Text>
            </View>
            <View style={[styles.toggle, settings.enableNotifications && styles.toggleActive]}>
              <View style={[styles.toggleThumb, settings.enableNotifications && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.optionItem}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="information-circle" size={iconSize.md} color={theme.accent.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Version</Text>
              <Text style={styles.optionSubtitle}>1.0.0</Text>
            </View>
          </View>
        </View>

        <View style={styles.paddingBottom} />
      </ScrollView>

      {/* Theme Modal */}
      <Modal visible={showThemeModal} transparent animationType="fade" onRequestClose={() => setShowThemeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Theme</Text>

            <TouchableOpacity
              style={[styles.modalOption, settings.theme === 'light' && styles.modalOptionActive]}
              onPress={() => handleThemeChange('light')}
            >
              <Ionicons name="sunny" size={iconSize.md} color={settings.theme === 'light' ? theme.accent.primary : theme.text.primary} />
              <Text style={[styles.modalOptionText, settings.theme === 'light' && styles.modalOptionTextActive]}>Light</Text>
              {settings.theme === 'light' && <Ionicons name="checkmark" size={iconSize.md} color={theme.accent.primary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, settings.theme === 'dark' && styles.modalOptionActive]}
              onPress={() => handleThemeChange('dark')}
            >
              <Ionicons name="moon" size={iconSize.md} color={settings.theme === 'dark' ? theme.accent.primary : theme.text.primary} />
              <Text style={[styles.modalOptionText, settings.theme === 'dark' && styles.modalOptionTextActive]}>Dark</Text>
              {settings.theme === 'dark' && <Ionicons name="checkmark" size={iconSize.md} color={theme.accent.primary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, settings.theme === 'auto' && styles.modalOptionActive]}
              onPress={() => handleThemeChange('auto')}
            >
              <Ionicons name="phone-portrait" size={iconSize.md} color={settings.theme === 'auto' ? theme.accent.primary : theme.text.primary} />
              <Text style={[styles.modalOptionText, settings.theme === 'auto' && styles.modalOptionTextActive]}>Auto</Text>
              {settings.theme === 'auto' && <Ionicons name="checkmark" size={iconSize.md} color={theme.accent.primary} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowThemeModal(false)}>
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Quality Modal */}
      <Modal visible={showQualityModal} transparent animationType="fade" onRequestClose={() => setShowQualityModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Audio Quality</Text>

            {['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'].map((quality) => (
              <TouchableOpacity
                key={quality}
                style={[styles.modalOption, settings.audioQuality === quality && styles.modalOptionActive]}
                onPress={() => handleQualityChange(quality)}
              >
                <Ionicons name="musical-note" size={iconSize.md} color={settings.audioQuality === quality ? theme.accent.primary : theme.text.primary} />
                <Text style={[styles.modalOptionText, settings.audioQuality === quality && styles.modalOptionTextActive]}>
                  {quality}
                </Text>
                {settings.audioQuality === quality && <Ionicons name="checkmark" size={iconSize.md} color={theme.accent.primary} />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowQualityModal(false)}>
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
