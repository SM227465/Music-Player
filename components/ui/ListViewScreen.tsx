// components/ui/ListViewScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme, spacing, borderRadius, fontSize, fontWeight, iconSize } from '@/constants/theme';
import { useListData } from '@/hooks/useJioSaavnQueries';

interface ListViewItem {
  id: string;
  title: string;
  url: string;
  image: string;
  subtitle?: string;
  followers?: string;
}

interface ListViewScreenProps {
  title: string;
  apiUrl: string;
  onBack: () => void;
  onItemPress?: (item: ListViewItem) => void;
}

export default function ListViewScreen({ title, apiUrl, onBack, onItemPress }: ListViewScreenProps) {
  const theme = useTheme();
  const { data: items, isLoading: loading, isError: error, refetch } = useListData(apiUrl);

  const getImageUrl = (url: string, quality: string = '500x500') => {
    return url.replace('150x150', quality);
  };

  const renderItem = ({ item }: { item: ListViewItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => onItemPress?.(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: getImageUrl(item.image) }}
        style={styles.itemImage}
        resizeMode='cover'
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        )}
        {item.followers && (
          <Text style={styles.itemFollowers}>{item.followers}</Text>
        )}
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name='play' size={iconSize.sm} color={theme.text.inverse} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 60,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.primary,
    },
    backButton: {
      width: iconSize.xl,
      height: iconSize.xl,
      borderRadius: borderRadius.full,
      backgroundColor: theme.card.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    headerTitle: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: theme.text.primary,
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xxxxl,
    },
    errorText: {
      fontSize: fontSize.lg,
      color: theme.text.tertiary,
      marginTop: spacing.lg,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: spacing.xl,
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.md,
      backgroundColor: theme.accent.primary,
      borderRadius: borderRadius.md,
    },
    retryButtonText: {
      color: theme.text.inverse,
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
    },
    itemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card.background,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 4,
      elevation: 2,
    },
    itemImage: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.md,
      backgroundColor: theme.card.background,
    },
    itemInfo: {
      flex: 1,
      marginLeft: spacing.lg,
      marginRight: spacing.md,
    },
    itemTitle: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    itemSubtitle: {
      fontSize: fontSize.sm,
      color: theme.text.secondary,
      marginBottom: spacing.xs,
    },
    itemFollowers: {
      fontSize: fontSize.xs,
      color: theme.text.tertiary,
    },
    playButton: {
      width: iconSize.xxl,
      height: iconSize.xxl,
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.accent.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    listFooter: {
      height: 100,
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name='arrow-back' size={iconSize.md} color={theme.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.accent.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name='arrow-back' size={iconSize.md} color={theme.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name='alert-circle-outline' size={64} color={theme.text.tertiary} />
          <Text style={styles.errorText}>Failed to load data. Please try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name='arrow-back' size={iconSize.md} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <FlatList
        data={items || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={styles.listFooter} />}
      />
    </View>
  );
}
