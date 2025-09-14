
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useWeekFilter() {
  const { data: availableWeeks, isLoading } = useQuery({
    queryKey: ['available-weeks'],
    queryFn: async () => {
      console.log('Fetching available weeks from Supabase...');
      
      const { data, error } = await supabase
        .from('activities')
        .select('week')
        .not('week', 'is', null)
        .neq('week', '');

      if (error) {
        console.error('Error fetching weeks:', error);
        throw error;
      }

      // Extrair semanas únicas e ordenar do maior para o menor
      const weeks = [...new Set(data
        .map(activity => activity.week)
        .filter(week => week !== null && week !== undefined && week !== '')
        .map(week => Number(week))
        .filter(week => !isNaN(week))
      )].sort((a, b) => b - a); // Ordenar do maior para o menor
      
      console.log('Available weeks from database:', weeks);

      return weeks.map(week => ({
        value: String(week),
        label: `Semana ${week}`
      }));
    },
  });

  return {
    availableWeeks: availableWeeks || [],
    isLoading
  };
}
