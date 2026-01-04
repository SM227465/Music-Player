// components/ui/NowPlayingIndicator.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@/constants/theme';

interface NowPlayingIndicatorProps {
  isPlaying: boolean;
}

export default function NowPlayingIndicator({ isPlaying }: NowPlayingIndicatorProps) {
  const theme = useTheme();
  const bar1 = useRef(new Animated.Value(0.3)).current;
  const bar2 = useRef(new Animated.Value(0.5)).current;
  const bar3 = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (isPlaying) {
      // Animate bars
      const animation = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(bar1, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(bar1, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(bar2, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(bar2, {
              toValue: 0.4,
              duration: 350,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(bar3, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
            Animated.timing(bar3, {
              toValue: 0.5,
              duration: 450,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      animation.start();

      return () => animation.stop();
    } else {
      // Pause state - set bars to static heights
      Animated.parallel([
        Animated.timing(bar1, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bar2, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bar3, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isPlaying, bar1, bar2, bar3]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: theme.accent.primary,
            transform: [{ scaleY: bar1 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: theme.accent.primary,
            transform: [{ scaleY: bar2 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: theme.accent.primary,
            transform: [{ scaleY: bar3 }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
    width: 16,
  },
  bar: {
    width: 3,
    height: 16,
    marginHorizontal: 1,
    borderRadius: 2,
  },
});
