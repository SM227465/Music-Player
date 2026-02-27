// components/ui/NoInternetBanner.tsx
import { spacing, fontSize, fontWeight } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NoInternetBannerProps {
  isVisible: boolean;
}

export default function NoInternetBanner({ isVisible }: NoInternetBannerProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const [showConnected, setShowConnected] = useState(false);
  const prevIsVisible = useRef(isVisible);

  useEffect(() => {
    // Check if connection was just restored (was offline, now online)
    if (prevIsVisible.current === true && isVisible === false) {
      // Connection restored - show green banner
      setShowConnected(true);

      // Hide green banner after 3 seconds
      const timer = setTimeout(() => {
        setShowConnected(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    prevIsVisible.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    const shouldShow = isVisible || showConnected;
    Animated.timing(slideAnim, {
      toValue: shouldShow ? 0 : -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, showConnected, slideAnim]);

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      paddingTop: insets.top,
      backgroundColor: showConnected ? '#4CAF50' : '#E53935',
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
        <Ionicons
          name={showConnected ? "checkmark-circle" : "cloud-offline"}
          size={18}
          color="#FFFFFF"
        />
        <Text style={styles.text}>
          {showConnected ? "Connected to internet" : "No internet connection"}
        </Text>
      </View>
    </Animated.View>
  );
}
