// components/ui/WelcomeScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';

interface WelcomeScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

export default function WelcomeScreen({ onNext, onSkip }: WelcomeScreenProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xxxl,
      paddingTop: 100,
      paddingBottom: 60,
      backgroundColor: theme.background.primary,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconContainer: {
      marginBottom: spacing.xxxxl,
      width: 100,
      height: 100,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary + '33',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    subtitle: {
      fontSize: fontSize.base,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 60,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: borderRadius.xs,
      backgroundColor: theme.border.secondary,
    },
    activeDot: {
      backgroundColor: theme.accent.primary,
      width: spacing.xxl,
    },
    nextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accent.primary,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xxxxl,
      borderRadius: borderRadius.full,
      alignSelf: 'center',
      minWidth: 120,
      gap: spacing.sm,
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    nextButtonText: {
      color: theme.text.inverse,
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
    },
    skipButton: {
      position: 'absolute',
      top: 50,
      right: spacing.xxxl,
      zIndex: 10,
    },
    skipButtonText: {
      color: theme.accent.primary,
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name='musical-notes' size={64} color={theme.accent.primary} />
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
        <Ionicons name='chevron-forward' size={iconSize.sm} color={theme.text.inverse} />
      </TouchableOpacity>
    </View>
  );
}
