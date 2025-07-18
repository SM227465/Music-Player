// components/ui/ProfileScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const profileOptions = [
    { icon: 'color-palette-outline', title: 'Theme', subtitle: 'Light / Dark / Auto' },
    { icon: 'musical-notes-outline', title: 'Audio Quality', subtitle: 'High (320kbps)' },
    { icon: 'help-circle-outline', title: 'Help & Support', subtitle: 'Contact us, FAQs' },
    { icon: 'information-circle-outline', title: 'About', subtitle: 'Version 1.0.0' },
  ];

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#533483']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name='person' size={32} color='#8B5CF6' />
            </View>
          </View>

          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@example.com</Text>

          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Premium Subscriber</Text>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.optionsContainer}>
          {profileOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.optionItem}>
              <View style={styles.optionIconContainer}>
                <Ionicons name={option.icon as any} size={24} color='#8B5CF6' />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <View style={styles.logoutIconContainer}>
            <Ionicons name='log-out-outline' size={24} color='#EF4444' />
          </View>
          <View style={styles.logoutContent}>
            <Text style={styles.logoutText}>Logout</Text>
            <Text style={styles.logoutSubtext}>Sign out of your account</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#B8B8D1',
    marginBottom: 15,
  },
  premiumBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  premiumText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    fontSize: 14,
    color: '#B8B8D1',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutContent: {
    flex: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 4,
  },
  logoutSubtext: {
    fontSize: 14,
    color: '#B8B8D1',
  },
});
