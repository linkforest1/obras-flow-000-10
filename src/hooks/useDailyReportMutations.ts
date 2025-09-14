
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { DailyReportData } from '@/types/dailyReport';

export function useDailyReportMutations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createReport = useMutation({
    mutationFn: async (reportData: DailyReportData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating report with data:', reportData);

      const { data, error } = await supabase
        .from('daily_reports')
        .insert({
          ...reportData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating report:', error);
        throw error;
      }
      
      console.log('Report created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
      toast({
        title: 'Relatório criado com sucesso',
        description: 'O relatório diário foi adicionado.',
      });
    },
    onError: (error) => {
      console.error('Error creating report:', error);
      toast({
        title: 'Erro ao criar relatório',
        description: 'Ocorreu um erro ao criar o relatório. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const updateReport = useMutation({
    mutationFn: async ({ id, ...reportData }: DailyReportData & { id: string }) => {
      console.log('Updating report with ID:', id, 'and data:', reportData);
      
      const { data, error } = await supabase
        .from('daily_reports')
        .update(reportData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating report:', error);
        throw error;
      }
      
      console.log('Report updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
      toast({
        title: 'Relatório atualizado',
        description: 'O relatório foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error updating report:', error);
      toast({
        title: 'Erro ao atualizar relatório',
        description: 'Ocorreu um erro ao atualizar o relatório.',
        variant: 'destructive',
      });
    },
  });

  const addPhoto = useMutation({
    mutationFn: async ({ reportId, file, caption }: { reportId: string; file: File; caption?: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${reportId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('daily-report-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('daily-report-photos')
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from('daily_report_photos')
        .insert({
          daily_report_id: reportId,
          photo_url: publicUrl,
          caption,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
      toast({
        title: 'Foto adicionada',
        description: 'A foto foi adicionada ao relatório.',
      });
    },
    onError: (error) => {
      console.error('Error adding photo:', error);
      toast({
        title: 'Erro ao adicionar foto',
        description: 'Ocorreu um erro ao adicionar a foto.',
        variant: 'destructive',
      });
    },
  });

  return {
    createReport: createReport.mutate,
    updateReport: updateReport.mutate,
    addPhoto: addPhoto.mutate,
    isCreating: createReport.isPending,
    isUpdating: updateReport.isPending,
    isAddingPhoto: addPhoto.isPending,
  };
}
