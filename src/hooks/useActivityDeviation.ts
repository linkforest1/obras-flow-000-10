import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useActivityDeviation(activityId: string) {
  return useQuery({
    queryKey: ['activity-deviation', activityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('id, deviation_type')
        .eq('activity_id', activityId)
        .not('deviation_type', 'is', null)
        .not('deviation_type', 'eq', '')
        .limit(1);

      if (error) {
        console.error('Error fetching activity deviation:', error);
        throw error;
      }

      return data && data.length > 0;
    },
    enabled: !!activityId,
  });
}