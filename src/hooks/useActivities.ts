
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchActivitiesFromDB, createActivityInDB, updateActivityInDB, deleteActivityFromDB, CreateActivityData } from '@/services/activityService';

export const useActivities = (projectId?: string) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await fetchActivitiesFromDB(projectId);
      setActivities(data);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Erro ao carregar atividades",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (activityData: CreateActivityData) => {
    try {
      const newActivity = await createActivityInDB(activityData);
      await fetchActivities(); // Refresh the list
      return newActivity;
    } catch (error: any) {
      console.error('Error creating activity:', error);
      toast({
        title: "Erro ao criar atividade",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateActivity = async (id: string, updates: any) => {
    try {
      await updateActivityInDB(id, updates);
      await fetchActivities(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating activity:', error);
      toast({
        title: "Erro ao atualizar atividade",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      await deleteActivityFromDB(id);
      await fetchActivities(); // Refresh the list
      toast({
        title: "Atividade excluída",
        description: "A atividade foi excluída com sucesso.",
      });
    } catch (error: any) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Erro ao excluir atividade",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [projectId]);

  return {
    activities,
    loading,
    createActivity,
    updateActivity,
    deleteActivity,
    refetch: fetchActivities,
    refetchActivities: fetchActivities, // Adicionar alias para compatibilidade
  };
};
