// components/ui/HomeScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';

interface Release {
  id: string;
  title: string;
  url: string;
  image: string;
  subtitle: string;
}

interface Playlist {
  id: string;
  title: string;
  url: string;
  image: string;
  subtitle: string;
  followers: string;
}

interface Chart {
  id: string;
  title: string;
  url: string;
  image: string;
  subtitle: string;
}

interface Artist {
  id: string;
  name: string;
  url: string;
  image: string;
  fans: string;
}

export default function HomeScreen() {
  const theme = useTheme();
  const [newReleases, setNewReleases] = useState<Release[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [releasesRes, playlistsRes, chartsRes, artistsRes] = await Promise.all([
        fetch('https://jiosaavn-scraper.onrender.com/api/jiosaavn/new-releases'),
        fetch('https://jiosaavn-scraper.onrender.com/api/jiosaavn/top-playlists'),
        fetch('https://jiosaavn-scraper.onrender.com/api/jiosaavn/top-charts'),
        fetch('https://jiosaavn-scraper.onrender.com/api/jiosaavn/top-artists'),
      ]);

      const [releasesData, playlistsData, chartsData, artistsData] = await Promise.all([
        releasesRes.json(),
        playlistsRes.json(),
        chartsRes.json(),
        artistsRes.json(),
      ]);

      if (releasesData.success) setNewReleases(releasesData.data.slice(0, 10));
      if (playlistsData.success) setPlaylists(playlistsData.data.slice(0, 10));
      if (chartsData.success) setCharts(chartsData.data.slice(0, 10));
      if (artistsData.success) setArtists(artistsData.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getImageUrl = (url: string, quality: string = '500x500') => {
    return url.replace('150x150', quality);
  };

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
      paddingBottom: spacing.lg,
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
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    section: {
      marginBottom: spacing.xxxl,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.xl,
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
    scrollContainer: {
      paddingHorizontal: spacing.xl,
    },
    releaseCard: {
      width: 160,
      marginRight: spacing.md,
    },
    releaseImageContainer: {
      position: 'relative',
      marginBottom: spacing.sm,
    },
    releaseImage: {
      width: 160,
      height: 160,
      borderRadius: borderRadius.lg,
      backgroundColor: theme.card.background,
    },
    playButton: {
      position: 'absolute',
      bottom: spacing.sm,
      right: spacing.sm,
      width: iconSize.xxl,
      height: iconSize.xxl,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 6,
    },
    releaseTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    releaseSubtitle: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
    },
    playlistCard: {
      width: 180,
      marginRight: spacing.md,
    },
    playlistImage: {
      width: 180,
      height: 180,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.sm,
      backgroundColor: theme.card.background,
    },
    playlistTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    playlistFollowers: {
      fontSize: fontSize.xs,
      color: theme.text.tertiary,
    },
    chartCard: {
      width: 140,
      marginRight: spacing.md,
    },
    chartImage: {
      width: 140,
      height: 140,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      backgroundColor: theme.card.background,
    },
    chartTitle: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      textAlign: 'center',
    },
    artistCard: {
      alignItems: 'center',
      marginRight: spacing.lg,
    },
    artistImage: {
      width: 120,
      height: 120,
      borderRadius: borderRadius.full,
      marginBottom: spacing.sm,
      borderWidth: 3,
      borderColor: theme.accent.primary + '30',
      backgroundColor: theme.card.background,
    },
    artistName: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      textAlign: 'center',
      width: 120,
    },
    paddingBottom: {
      height: 100,
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.subtitle}>Loading your music...</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.accent.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subtitle}>Discover your favorite music</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name='notifications-outline' size={iconSize.md} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent.primary}
            colors={[theme.accent.primary]}
          />
        }
      >
        {/* New Releases */}
        {newReleases.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Releases</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
            >
              {newReleases.map((release) => (
                <TouchableOpacity key={release.id} style={styles.releaseCard}>
                  <View style={styles.releaseImageContainer}>
                    <Image
                      source={{ uri: getImageUrl(release.image) }}
                      style={styles.releaseImage}
                      resizeMode='cover'
                    />
                    <TouchableOpacity style={styles.playButton}>
                      <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.releaseTitle} numberOfLines={1}>
                    {release.title}
                  </Text>
                  {release.subtitle && (
                    <Text style={styles.releaseSubtitle} numberOfLines={1}>
                      {release.subtitle}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Top Playlists */}
        {playlists.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Playlists</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
            >
              {playlists.map((playlist) => (
                <TouchableOpacity key={playlist.id} style={styles.playlistCard}>
                  <View style={styles.releaseImageContainer}>
                    <Image
                      source={{ uri: getImageUrl(playlist.image) }}
                      style={styles.playlistImage}
                      resizeMode='cover'
                    />
                    <TouchableOpacity style={styles.playButton}>
                      <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.playlistTitle} numberOfLines={2}>
                    {playlist.title}
                  </Text>
                  {playlist.followers && (
                    <Text style={styles.playlistFollowers}>{playlist.followers}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Top Charts */}
        {charts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Charts</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
            >
              {charts.map((chart) => (
                <TouchableOpacity key={chart.id} style={styles.chartCard}>
                  <View style={styles.releaseImageContainer}>
                    <Image
                      source={{ uri: getImageUrl(chart.image) }}
                      style={styles.chartImage}
                      resizeMode='cover'
                    />
                    <TouchableOpacity style={styles.playButton}>
                      <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.chartTitle} numberOfLines={2}>
                    {chart.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Top Artists */}
        {artists.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Artists</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
            >
              {artists.map((artist) => (
                <TouchableOpacity key={artist.id} style={styles.artistCard}>
                  <Image
                    source={{ uri: getImageUrl(artist.image) }}
                    style={styles.artistImage}
                    resizeMode='cover'
                  />
                  <Text style={styles.artistName} numberOfLines={1}>
                    {artist.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.paddingBottom} />
      </ScrollView>
    </View>
  );
}
