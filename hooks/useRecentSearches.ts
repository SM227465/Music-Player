// hooks/useRecentSearches.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recentSearchesService } from '@/services/storage.service';

export const useRecentSearches = (limit: number = 5) => {
  const queryClient = useQueryClient();

  const { data: recentSearches = [], isLoading } = useQuery({
    queryKey: ['recentSearches', limit],
    queryFn: () => recentSearchesService.getRecentSearches(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes - searches don't change often
  });

  const addSearchMutation = useMutation({
    mutationFn: (query: string) => recentSearchesService.addRecentSearch(query),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentSearches'] });
    },
  });

  const removeSearchMutation = useMutation({
    mutationFn: (query: string) => recentSearchesService.removeRecentSearch(query),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentSearches'] });
    },
  });

  const clearSearchesMutation = useMutation({
    mutationFn: () => recentSearchesService.clearRecentSearches(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentSearches'] });
    },
  });

  return {
    recentSearches,
    isLoading,
    addRecentSearch: addSearchMutation.mutate,
    removeRecentSearch: removeSearchMutation.mutate,
    clearRecentSearches: clearSearchesMutation.mutate,
  };
};
