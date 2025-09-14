
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActivityPhotos = (activityId: string) => {
  return useQuery({
    queryKey: ['activity-photos', activityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_photos')
        .select('*')
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!activityId,
    staleTime: 0, // Always refetch when needed
    refetchOnWindowFocus: true,
  });
};
