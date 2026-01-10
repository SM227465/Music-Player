// components/ui/ProfileScreen.tsx
import { useSettings, useApiConfig } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const { settings, loading, updateSettings } = useSettings();
  const { apiConfig, loading: apiLoading, updateApiConfig, resetToDefaults } = useApiConfig();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showApiConfigModal, setShowApiConfigModal] = useState(false);
  const [editingAssistanceApi, setEditingAssistanceApi] = useState(false);
  const [editingBaseApi, setEditingBaseApi] = useState(false);
  const [tempAssistanceApi, setTempAssistanceApi] = useState('');
  const [tempBaseApi, setTempBaseApi] = useState('');

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
    apiInput: {
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      color: theme.text.primary,
      fontSize: fontSize.sm,
      borderWidth: 1,
      borderColor: theme.border.primary,
      marginBottom: spacing.md,
    },
    apiInputDisabled: {
      opacity: 0.6,
    },
    apiButtonRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    apiButton: {
      flex: 1,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: theme.accent.primary,
      alignItems: 'center',
    },
    apiButtonSecondary: {
      backgroundColor: theme.card.background,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    apiButtonText: {
      color: theme.text.inverse,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
    apiButtonTextSecondary: {
      color: theme.text.primary,
    },
    warningContainer: {
      backgroundColor: theme.accent.warning + '15',
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: theme.accent.warning + '40',
    },
    warningText: {
      color: theme.accent.warning,
      fontSize: fontSize.sm,
      lineHeight: 20,
    },
    resetButton: {
      width: '100%',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    resetButtonText: {
      color: theme.text.inverse,
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
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

  const handleEditAssistanceApi = () => {
    Alert.alert(
      'Warning',
      'Changing API URLs may cause the app to malfunction. Only proceed if you know what you are doing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            setTempAssistanceApi(apiConfig.assistanceApiUrl);
            setEditingAssistanceApi(true);
          },
        },
      ]
    );
  };

  const handleEditBaseApi = () => {
    Alert.alert(
      'Warning',
      'Changing API URLs may cause the app to malfunction. Only proceed if you know what you are doing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            setTempBaseApi(apiConfig.baseApiUrl);
            setEditingBaseApi(true);
          },
        },
      ]
    );
  };

  const handleSaveAssistanceApi = async () => {
    try {
      await updateApiConfig({ assistanceApiUrl: tempAssistanceApi });
      setEditingAssistanceApi(false);
      Alert.alert('Success', 'Assistance API URL updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update API URL');
    }
  };

  const handleSaveBaseApi = async () => {
    try {
      await updateApiConfig({ baseApiUrl: tempBaseApi });
      setEditingBaseApi(false);
      Alert.alert('Success', 'Base API URL updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update API URL');
    }
  };

  const handleResetApiConfig = () => {
    Alert.alert(
      'Reset API Configuration',
      'Are you sure you want to reset all API URLs to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetToDefaults();
              setEditingAssistanceApi(false);
              setEditingBaseApi(false);
              Alert.alert('Success', 'API configuration reset to defaults');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset configuration');
            }
          },
        },
      ]
    );
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

        {/* API Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>

          <TouchableOpacity style={styles.optionItem} onPress={() => setShowApiConfigModal(true)}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="server" size={iconSize.md} color={theme.accent.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Manage API URLs</Text>
              <Text style={styles.optionSubtitle}>Configure backend services</Text>
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

      {/* API Configuration Modal */}
      <Modal visible={showApiConfigModal} transparent animationType="fade" onRequestClose={() => setShowApiConfigModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>API Configuration</Text>

            {/* Warning */}
            <View style={[styles.warningContainer, { backgroundColor: '#FFA500' + '15', borderColor: '#FFA500' + '40' }]}>
              <Text style={[styles.warningText, { color: '#FFA500' }]}>
                ⚠️ Only modify these settings if you know what you are doing. Incorrect values may cause the app to malfunction.
              </Text>
            </View>

            {/* Assistance API */}
            <Text style={[styles.optionTitle, { marginBottom: spacing.sm }]}>Assistance API URL</Text>
            <View style={{ marginBottom: spacing.lg }}>
              <TextInput
                style={[styles.apiInput, !editingAssistanceApi && styles.apiInputDisabled]}
                value={editingAssistanceApi ? tempAssistanceApi : apiConfig.assistanceApiUrl}
                onChangeText={setTempAssistanceApi}
                editable={editingAssistanceApi}
                placeholder="Enter Assistance API URL"
                placeholderTextColor={theme.text.tertiary}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.apiButtonRow}>
                {!editingAssistanceApi ? (
                  <TouchableOpacity style={styles.apiButton} onPress={handleEditAssistanceApi}>
                    <Text style={styles.apiButtonText}>Edit</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity style={[styles.apiButton, styles.apiButtonSecondary]} onPress={() => setEditingAssistanceApi(false)}>
                      <Text style={[styles.apiButtonText, styles.apiButtonTextSecondary]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.apiButton} onPress={handleSaveAssistanceApi}>
                      <Text style={styles.apiButtonText}>Save</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            {/* Base API */}
            <Text style={[styles.optionTitle, { marginBottom: spacing.sm }]}>Base API URL</Text>
            <View style={{ marginBottom: spacing.lg }}>
              <TextInput
                style={[styles.apiInput, !editingBaseApi && styles.apiInputDisabled]}
                value={editingBaseApi ? tempBaseApi : apiConfig.baseApiUrl}
                onChangeText={setTempBaseApi}
                editable={editingBaseApi}
                placeholder="Enter Base API URL"
                placeholderTextColor={theme.text.tertiary}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.apiButtonRow}>
                {!editingBaseApi ? (
                  <TouchableOpacity style={styles.apiButton} onPress={handleEditBaseApi}>
                    <Text style={styles.apiButtonText}>Edit</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity style={[styles.apiButton, styles.apiButtonSecondary]} onPress={() => setEditingBaseApi(false)}>
                      <Text style={[styles.apiButtonText, styles.apiButtonTextSecondary]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.apiButton} onPress={handleSaveBaseApi}>
                      <Text style={styles.apiButtonText}>Save</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            {/* Reset and Close buttons */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                {
                  backgroundColor: theme.accent.error || '#FF3B30',
                }
              ]}
              onPress={handleResetApiConfig}
            >
              <Text style={styles.resetButtonText}>Reset to Defaults</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => {
              setShowApiConfigModal(false);
              setEditingAssistanceApi(false);
              setEditingBaseApi(false);
            }}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
