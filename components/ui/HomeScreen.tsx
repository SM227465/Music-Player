// components/ui/HomeScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';

export default function HomeScreen() {
  const theme = useTheme();

  const trendingSongs = [
    { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', image: require('../../assets/images/react-logo.png') },
    { id: '2', title: 'Good Days', artist: 'SZA', image: require('../../assets/images/react-logo.png') },
  ];

  const newReleases = [
    { id: '1', title: 'Montero', artist: 'Lil Nas X', image: require('../../assets/images/react-logo.png') },
    { id: '2', title: 'Doja Cat', artist: 'Doja Cat', image: require('../../assets/images/react-logo.png') },
  ];

  const moodGenres = [
    { id: '1', title: 'Pop', image: require('../../assets/images/react-logo.png') },
    { id: '2', title: 'Rock', image: require('../../assets/images/react-logo.png') },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 60,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
    },
    greeting: {
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
    },
    subtitle: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
      marginTop: spacing.xs,
    },
    notificationButton: {
      width: iconSize.xl,
      height: iconSize.xl,
      borderRadius: borderRadius.full,
      backgroundColor: theme.card.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 4,
      elevation: 2,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xl,
    },
    section: {
      marginBottom: spacing.xxxl,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
    },
    seeAllText: {
      fontSize: fontSize.sm,
      color: theme.accent.primary,
      fontWeight: fontWeight.semibold,
    },
    horizontalScroll: {
      flexDirection: 'row',
      gap: spacing.lg,
    },
    trendingCard: {
      width: 160,
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,
      elevation: 3,
    },
    trendingImage: {
      width: 128,
      height: 128,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
    },
    playOverlay: {
      position: 'absolute',
      top: 70,
      right: 70,
      width: iconSize.xl,
      height: iconSize.xl,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    trendingInfo: {
      alignItems: 'center',
    },
    trendingTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    trendingArtist: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
    },
    releaseCard: {
      width: 140,
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 8,
      elevation: 3,
    },
    releaseImage: {
      width: 116,
      height: 116,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
    },
    releaseInfo: {
      alignItems: 'center',
    },
    releaseTitle: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    releaseArtist: {
      fontSize: fontSize.xs,
      color: theme.text.secondary,
    },
    genreCard: {
      width: 120,
      height: 80,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      position: 'relative',
    },
    genreImage: {
      width: '100%',
      height: '100%',
    },
    genreOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.background.overlay,
      padding: spacing.sm,
    },
    genreTitle: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.text.inverse,
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.subtitle}>Discover your favorite music</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name='notifications-outline' size={iconSize.md} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trending Songs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Songs</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalScroll}>
            {trendingSongs.map((song) => (
              <TouchableOpacity key={song.id} style={styles.trendingCard}>
                <Image source={song.image} style={styles.trendingImage} />
                <View style={styles.playOverlay}>
                  <Ionicons name='play' size={iconSize.md} color={theme.text.inverse} />
                </View>
                <View style={styles.trendingInfo}>
                  <Text style={styles.trendingTitle}>{song.title}</Text>
                  <Text style={styles.trendingArtist}>{song.artist}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* New Releases */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Releases</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalScroll}>
            {newReleases.map((release) => (
              <TouchableOpacity key={release.id} style={styles.releaseCard}>
                <Image source={release.image} style={styles.releaseImage} />
                <View style={styles.playOverlay}>
                  <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
                </View>
                <View style={styles.releaseInfo}>
                  <Text style={styles.releaseTitle}>{release.title}</Text>
                  <Text style={styles.releaseArtist}>{release.artist}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mood & Genres */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mood & Genres</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalScroll}>
            {moodGenres.map((genre) => (
              <TouchableOpacity key={genre.id} style={styles.genreCard}>
                <Image source={genre.image} style={styles.genreImage} />
                <View style={styles.genreOverlay}>
                  <Text style={styles.genreTitle}>{genre.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
