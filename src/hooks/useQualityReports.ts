import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface QualityReport {
  id: string;
  cwp: string;
  tag_peca: string;
  eixo?: string;
  elevacao?: string;
  descricao?: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  fotos_count?: number;
}

export interface CreateQualityReportData {
  cwp: string;
  tag_peca: string;
  eixo?: string | null;
  elevacao?: string | null;
  descricao?: string | null;
  fotos?: File[];
}

export function useQualityReports() {
  return useQuery({
    queryKey: ['quality-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quality_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get photo counts separately
      const reportsWithPhotos = await Promise.all(
        (data || []).map(async (report) => {
          const { count } = await supabase
            .from('quality_report_photos')
            .select('*', { count: 'exact', head: true })
            .eq('quality_report_id', report.id);

          return {
            ...report,
            status: report.status as 'pending' | 'in_progress' | 'resolved',
            fotos_count: count || 0
          };
        })
      );

      return reportsWithPhotos;
    },
  });
}

export function useCreateQualityReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQualityReportData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: report, error } = await supabase
        .from('quality_reports')
        .insert({
          cwp: data.cwp,
          tag_peca: data.tag_peca,
          eixo: data.eixo,
          elevacao: data.elevacao,
          descricao: data.descricao,
          user_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Upload photos if provided
      if (data.fotos && data.fotos.length > 0) {
        for (const foto of data.fotos) {
          const fileName = `${user.id}/${report.id}/${Date.now()}-${foto.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('quality-report-photos')
            .upload(fileName, foto);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('quality-report-photos')
            .getPublicUrl(fileName);

          // Save photo record
          await supabase
            .from('quality_report_photos')
            .insert({
              quality_report_id: report.id,
              photo_url: publicUrl
            });
        }
      }

      return report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quality-reports'] });
    },
  });
}