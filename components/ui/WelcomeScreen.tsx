// components/ui/WelcomeScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WelcomeScreenProps {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#533483']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name='musical-notes' size={64} color='#8B5CF6' />
        </View>

        <Text style={styles.title}>Welcome to Melodify</Text>
        <Text style={styles.subtitle}>
          Your personal music companion with{'\n'}
          millions of songs at your fingertips.
        </Text>

        <View style={styles.pagination}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextButtonText}>Next</Text>
        <Ionicons name='chevron-forward' size={20} color='#fff' />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 100,
    paddingBottom: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8B8D1',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A4A6A',
  },
  activeDot: {
    backgroundColor: '#8B5CF6',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: 'center',
    minWidth: 120,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
