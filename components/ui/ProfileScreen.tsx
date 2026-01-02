// components/ui/ProfileScreen.tsx
import { useSettings } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { settings, loading, updateSettings } = useSettings();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);

  if (loading || !settings) {
    return (
      <LinearGradient colors={['#0f0f23', '#1a1a2e', '#533483']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </LinearGradient>
    );
  }

  const handleThemeChange = async (theme: 'light' | 'dark' | 'auto') => {
    try {
      await updateSettings({ theme });
      setShowThemeModal(false);
    } catch (error) {
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
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#533483']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color="#8B5CF6" />
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
              <Ionicons name="musical-notes" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Audio Quality</Text>
              <Text style={styles.optionSubtitle}>{settings.audioQuality}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B8B8D1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={() => setShowQualityModal(true)}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="download" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Download Quality</Text>
              <Text style={styles.optionSubtitle}>{settings.downloadQuality}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B8B8D1" />
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <TouchableOpacity style={styles.optionItem} onPress={() => setShowThemeModal(true)}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="color-palette" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Theme</Text>
              <Text style={styles.optionSubtitle}>{getThemeLabel()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B8B8D1" />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity style={styles.optionItem} onPress={handleToggleHaptics}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="phone-portrait" size={24} color="#8B5CF6" />
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
              <Ionicons name="notifications" size={24} color="#8B5CF6" />
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
              <Ionicons name="information-circle" size={24} color="#8B5CF6" />
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
              <Ionicons name="sunny" size={24} color={settings.theme === 'light' ? '#8B5CF6' : '#fff'} />
              <Text style={[styles.modalOptionText, settings.theme === 'light' && styles.modalOptionTextActive]}>Light</Text>
              {settings.theme === 'light' && <Ionicons name="checkmark" size={24} color="#8B5CF6" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, settings.theme === 'dark' && styles.modalOptionActive]}
              onPress={() => handleThemeChange('dark')}
            >
              <Ionicons name="moon" size={24} color={settings.theme === 'dark' ? '#8B5CF6' : '#fff'} />
              <Text style={[styles.modalOptionText, settings.theme === 'dark' && styles.modalOptionTextActive]}>Dark</Text>
              {settings.theme === 'dark' && <Ionicons name="checkmark" size={24} color="#8B5CF6" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, settings.theme === 'auto' && styles.modalOptionActive]}
              onPress={() => handleThemeChange('auto')}
            >
              <Ionicons name="phone-portrait" size={24} color={settings.theme === 'auto' ? '#8B5CF6' : '#fff'} />
              <Text style={[styles.modalOptionText, settings.theme === 'auto' && styles.modalOptionTextActive]}>Auto</Text>
              {settings.theme === 'auto' && <Ionicons name="checkmark" size={24} color="#8B5CF6" />}
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
                <Ionicons name="musical-note" size={24} color={settings.audioQuality === quality ? '#8B5CF6' : '#fff'} />
                <Text style={[styles.modalOptionText, settings.audioQuality === quality && styles.modalOptionTextActive]}>
                  {quality}
                </Text>
                {settings.audioQuality === quality && <Ionicons name="checkmark" size={24} color="#8B5CF6" />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowQualityModal(false)}>
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

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
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#B8B8D1',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#B8B8D1',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#8B5CF6',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  paddingBottom: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalOptionActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  modalOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  modalOptionTextActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
