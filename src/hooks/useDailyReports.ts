
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DailyReport } from '@/types/dailyReport';
import { useDailyReportMutations } from './useDailyReportMutations';

export function useDailyReports() {
  const { user } = useAuth();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['daily-reports'],
    queryFn: async (): Promise<DailyReport[]> => {
      console.log('Fetching daily reports for user:', user?.id);
      
      const { data: reportsData, error: reportsError } = await supabase
        .from('daily_reports')
        .select(`
          *,
          daily_report_photos (*)
        `)
        .order('report_date', { ascending: false });

      if (reportsError) {
        console.error('Error fetching daily reports:', reportsError);
        throw reportsError;
      }
      
      console.log('Fetched daily reports:', reportsData);

      if (!reportsData || reportsData.length === 0) {
        return [];
      }

      const userIds = [...new Set(reportsData.map(report => report.user_id))];
      const activityIds = reportsData
        .filter(report => report.activity_id)
        .map(report => report.activity_id);

      let profilesData = [];
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          profilesData = profiles || [];
        }
      }

      let activitiesData = [];
      if (activityIds.length > 0) {
        const { data: activities, error: activitiesError } = await supabase
          .from('activities')
          .select('id, title')
          .in('id', activityIds);

        if (activitiesError) {
          console.error('Error fetching activities:', activitiesError);
        } else {
          activitiesData = activities || [];
        }
      }

      return reportsData.map(report => {
        const authorProfile = profilesData.find(profile => profile.id === report.user_id);
        
        return {
          ...report,
          activities: report.activity_id 
            ? activitiesData.find(activity => activity.id === report.activity_id) || null
            : null,
          author: authorProfile ? {
            name: authorProfile.full_name || 'Usuário',
            role: authorProfile.role || 'fiscal'
          } : null
        };
      });
    },
    enabled: !!user,
  });

  const mutations = useDailyReportMutations();

  return {
    reports,
    isLoading,
    ...mutations,
  };
}
