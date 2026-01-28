import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useActivityDeviations(activityId: string) {
  return useQuery({
    queryKey: ['activity-deviations', activityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('id, deviation_type')
        .eq('activity_id', activityId)
        .not('deviation_type', 'is', null)
        .neq('deviation_type', '');

      if (error) {
        console.error('Error fetching activity deviations:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!activityId,
  });
}

// Hook to check if activity has deviations
export function useHasActivityDeviations(activityId: string) {
  const { data: deviations, isLoading } = useActivityDeviations(activityId);
  return {
    hasDeviations: (deviations?.length || 0) > 0,
    deviationCount: deviations?.length || 0,
    isLoading
  };
}