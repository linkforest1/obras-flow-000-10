import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TimelineActivity {
  ID: number;
  Atividade: string | null;
  Mes: string | null;
  status: 'concluido' | 'em-andamento' | 'nao-iniciado';
}

export function useTimeline() {
  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('timeline')
        .select('*')
        .order('ID', { ascending: true });

      if (error) {
        throw error;
      }

      setActivities((data || []).map(activity => ({
        ...activity,
        status: (activity.status as 'concluido' | 'em-andamento' | 'nao-iniciado') || 'nao-iniciado'
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar cronograma');
    } finally {
      setLoading(false);
    }
  };

  const updateActivityStatus = async (id: number, status: 'concluido' | 'em-andamento' | 'nao-iniciado') => {
    try {
      const { error } = await supabase
        .from('timeline')
        .update({ status })
        .eq('ID', id);

      if (error) throw error;

      // Atualizar estado local
      setActivities(prev => 
        prev.map(activity => 
          activity.ID === id ? { ...activity, status } : activity
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  return {
    activities,
    loading,
    error,
    updateActivityStatus,
    refetch: fetchTimeline
  };
}