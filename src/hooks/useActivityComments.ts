
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActivityComments = (activityId: string) => {
  return useQuery({
    queryKey: ['activity-comments', activityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_comments')
        .select(`
          id,
          comment_text,
          created_at,
          user_id,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data;
    },
    enabled: !!activityId,
  });
};

export const useAllActivityComments = (activityId: string) => {
  return useQuery({
    queryKey: ['all-activity-comments', activityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_comments')
        .select(`
          id,
          comment_text,
          created_at,
          user_id,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!activityId,
  });
};
