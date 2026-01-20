// components/ui/CircularCountdownButton.tsx
import { useTheme, iconSize } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';

interface CircularCountdownButtonProps {
  size: number;
  isPlaying: boolean;
  isLoading?: boolean;
  showCountdown: boolean;
  countdownSeconds?: number;
  onPress: () => void;
  onCountdownComplete: () => void;
  onCountdownCancel: () => void;
}

export default function CircularCountdownButton({
  size,
  isPlaying,
  isLoading = false,
  showCountdown,
  countdownSeconds = 3,
  onPress,
  onCountdownComplete,
  onCountdownCancel,
}: CircularCountdownButtonProps) {
  const theme = useTheme();
  const [countdown, setCountdown] = useState(countdownSeconds);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const shouldCompleteRef = useRef(false);
  const onCountdownCompleteRef = useRef(onCountdownComplete);

  // Keep callback ref updated
  useEffect(() => {
    onCountdownCompleteRef.current = onCountdownComplete;
  }, [onCountdownComplete]);

  // Handle countdown completion outside of setState
  useEffect(() => {
    if (shouldCompleteRef.current && countdown === 0) {
      shouldCompleteRef.current = false;
      onCountdownCompleteRef.current();
    }
  }, [countdown]);

  const strokeWidth = 4;
  const innerSize = size - strokeWidth * 2;

  const startCountdown = useCallback(() => {
    // Clear any existing interval
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }

    setCountdown(countdownSeconds);
    rotateAnim.setValue(0);

    // Start countdown timer
    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
          }
          shouldCompleteRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start rotation animation for visual feedback
    animationRef.current = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    animationRef.current.start();
  }, [countdownSeconds, rotateAnim]);

  const stopCountdown = useCallback(() => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    if (animationRef.current) {
      animationRef.current.stop();
    }
    rotateAnim.setValue(0);
    setCountdown(countdownSeconds);
  }, [countdownSeconds, rotateAnim]);

  useEffect(() => {
    if (showCountdown) {
      startCountdown();
    } else {
      stopCountdown();
    }

    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, [showCountdown, startCountdown, stopCountdown]);

  const handlePress = () => {
    if (showCountdown) {
      // Cancel countdown and play next immediately
      stopCountdown();
      onCountdownComplete();
    } else {
      onPress();
    }
  };

  const handleLongPress = () => {
    if (showCountdown) {
      stopCountdown();
      onCountdownCancel();
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressRing: {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: strokeWidth,
      borderColor: theme.player.progressBackground,
    },
    progressRingActive: {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: strokeWidth,
      borderColor: 'transparent',
      borderTopColor: theme.accent.primary,
      borderRightColor: theme.accent.primary,
    },
    button: {
      width: innerSize,
      height: innerSize,
      borderRadius: innerSize / 2,
      backgroundColor: theme.accent.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    countdownBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.accent.error,
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.background.primary,
      zIndex: 10,
    },
    countdownNumber: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });

  const iconSizeValue = size > 60 ? iconSize.xl : iconSize.md;

  return (
    <View style={styles.container}>
      {showCountdown && (
        <>
          <View style={styles.progressRing} />
          <Animated.View
            style={[
              styles.progressRingActive,
              { transform: [{ rotate: spin }] },
            ]}
          />
        </>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.text.inverse} />
        ) : (
          <Ionicons
            name={showCountdown ? 'play-forward' : (isPlaying ? 'pause' : 'play')}
            size={iconSizeValue}
            color={theme.text.inverse}
          />
        )}
      </TouchableOpacity>
      {showCountdown && (
        <View style={styles.countdownBadge}>
          <Text style={styles.countdownNumber}>{countdown}</Text>
        </View>
      )}
    </View>
  );
}
