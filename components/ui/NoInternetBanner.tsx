// components/ui/NoInternetBanner.tsx
import { useTheme, spacing, fontSize, fontWeight } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NoInternetBannerProps {
  isVisible: boolean;
}

export default function NoInternetBanner({ isVisible }: NoInternetBannerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, slideAnim]);

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      paddingTop: insets.top,
      backgroundColor: '#E53935',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    text: {
      color: '#FFFFFF',
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={18} color="#FFFFFF" />
        <Text style={styles.text}>No internet connection</Text>
      </View>
    </Animated.View>
  );
}
