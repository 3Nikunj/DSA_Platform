import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressService } from '../services/progressService';
import { toast } from 'react-hot-toast';

// Query keys for React Query
export const progressKeys = {
  all: ['progress'] as const,
  overview: () => [...progressKeys.all, 'overview'] as const,
  categories: () => [...progressKeys.all, 'categories'] as const,
  category: (id: string) => [...progressKeys.all, 'category', id] as const,
  insights: () => [...progressKeys.all, 'insights'] as const,
  timeTracking: (period: string) => [...progressKeys.all, 'time', period] as const,
  streak: () => [...progressKeys.all, 'streak'] as const,
  xpHistory: (period: string) => [...progressKeys.all, 'xp-history', period] as const,
  levelProgress: () => [...progressKeys.all, 'level-progress'] as const,
};

// Hook for getting overall progress overview
export const useProgressOverview = () => {
  return useQuery({
    queryKey: progressKeys.overview(),
    queryFn: progressService.getProgressStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Hook for getting all categories progress
export const useAllCategoriesProgress = () => {
  return useQuery({
    queryKey: progressKeys.categories(),
    queryFn: progressService.getAllCategoriesProgress,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Hook for getting specific category progress
export const useCategoryProgress = (categoryId: string) => {
  return useQuery({
    queryKey: progressKeys.category(categoryId),
    queryFn: () => progressService.getCategoryProgress(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Hook for getting progress insights
export const useProgressInsights = () => {
  return useQuery({
    queryKey: progressKeys.insights(),
    queryFn: progressService.getProgressInsights,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
};

// Hook for getting time tracking data
export const useTimeTracking = (period: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
  return useQuery({
    queryKey: progressKeys.timeTracking(period),
    queryFn: () => progressService.getTimeTracking(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Hook for getting streak data
export const useStreakData = () => {
  return useQuery({
    queryKey: progressKeys.streak(),
    queryFn: progressService.getStreakData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Hook for getting XP history
export const useXPHistory = (period: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
  return useQuery({
    queryKey: progressKeys.xpHistory(period),
    queryFn: () => progressService.getXPHistory(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Hook for getting level progress
export const useLevelProgress = () => {
  return useQuery({
    queryKey: progressKeys.levelProgress(),
    queryFn: progressService.getLevelProgress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Hook for updating algorithm progress
export const useUpdateAlgorithmProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ algorithmId, data }: {
      algorithmId: string;
      data: {
        status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
        timeSpent?: number;
        notes?: string;
      };
    }) => progressService.updateAlgorithmProgress(algorithmId, data),
    onSuccess: () => {
      // Invalidate and refetch progress data
      queryClient.invalidateQueries({ queryKey: progressKeys.overview() });
      queryClient.invalidateQueries({ queryKey: progressKeys.categories() });
      queryClient.invalidateQueries({ queryKey: progressKeys.insights() });
      
      toast.success('Progress updated successfully!');
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update progress';
      toast.error(errorMessage);
    },
  });
};

// Hook for time tracking
export const useTimeTracking_Actions = () => {
  const queryClient = useQueryClient();

  const startTracking = useMutation({
    mutationFn: (algorithmId: string) => progressService.startTimeTracking(algorithmId),
    onSuccess: () => {
      toast.success('Time tracking started!');
    },
    onError: () => {
      toast.error('Failed to start time tracking');
    },
  });

  const stopTracking = useMutation({
    mutationFn: (sessionId: string) => progressService.endTimeTracking(sessionId),
    onSuccess: () => {
      // Invalidate time tracking and progress data
      queryClient.invalidateQueries({ queryKey: progressKeys.timeTracking('daily') });
      queryClient.invalidateQueries({ queryKey: progressKeys.timeTracking('weekly') });
      queryClient.invalidateQueries({ queryKey: progressKeys.timeTracking('monthly') });
      queryClient.invalidateQueries({ queryKey: progressKeys.overview() });
      
      toast.success('Time tracking stopped!');
    },
    onError: () => {
      toast.error('Failed to stop time tracking');
    },
  });

  return {
    startTracking,
    stopTracking,
  };
};

// Utility hook for progress statistics
export const useProgressStats = () => {
  const { data: overview, isLoading: overviewLoading } = useProgressOverview();
  const { data: insights, isLoading: insightsLoading } = useProgressInsights();
  const { data: levelProgress, isLoading: levelLoading } = useLevelProgress();

  const isLoading = overviewLoading || insightsLoading || levelLoading;

  const stats = {
    // Basic stats
    totalSolved: overview?.totalSolved || 0,
    currentStreak: overview?.currentStreak || 0,
    longestStreak: overview?.longestStreak || 0,
    currentLevel: overview?.currentLevel || 1,
    experience: overview?.experience || 0,
    experienceToNextLevel: overview?.experienceToNextLevel || 0,
    
    // Progress stats
    completionRate: overview?.completionRate || 0,
    algorithmsCompleted: overview?.completedAlgorithms || 0,
    totalAlgorithms: overview?.totalAlgorithms || 0,
    
    // Performance stats from insights
    weeklyProgress: insights?.weeklyProgress || null,
    monthlyProgress: insights?.monthlyProgress || null,
    strengths: insights?.strengths || [],
    areasForImprovement: insights?.areasForImprovement || [],
    recommendations: insights?.recommendations || [],
    
    // Level progress
    progressToNextLevel: levelProgress?.xpToNextLevel || 0,
    xpForNextLevel: levelProgress?.xpToNextLevel || 0,
  };

  return {
    stats,
    isLoading,
    overview,
    insights,
    levelProgress,
  };
};