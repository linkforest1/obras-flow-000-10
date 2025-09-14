
import { supabase } from '@/integrations/supabase/client';

export type CreateActivityData = {
    title: string;
    description?: string;
    discipline?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    priority?: string;
    responsible_name?: string;
    asset?: string;
    week?: string;
    employee_count?: Record<string, number>;
    custom_id?: string;
    pacote?: string;
};

export const fetchActivitiesFromDB = async (projectId?: string) => {
  let query = supabase
    .from('activities')
    .select(`
      *,
      project:projects(name),
      photos:activity_photos(id, photo_url),
      comments:activity_comments(id)
    `)
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) throw error;

  console.log('Raw data from database:', data);

  const transformedData = (data || []).map(activity => {
    console.log('Processing activity:', activity.id, 'responsible_name:', activity.responsible_name, 'custom_id:', activity.custom_id);
    
    return {
      id: activity.id,
      customId: activity.custom_id || '',
      custom_id: activity.custom_id || '', // Adicionar mapeamento direto
      title: activity.title,
      description: activity.description || '',
      progress: activity.progress || 0,
      status: activity.status || 'pending',
      priority: activity.priority || 'medium',
      responsible: activity.responsible_name || 'Não especificado',
      discipline: activity.discipline || '',
      startDate: activity.start_date,
      endDate: activity.end_date,
      location: activity.location || '',
      asset: activity.asset || '',
      week: activity.week || '',
      pacote: activity.pacote || 'Pacote 1',
      photos: activity.photos?.length || 0,
      photoUrls: activity.photos?.map((photo: any) => photo.photo_url) || [],
      comments: activity.comments?.length || 0,
      employeeCount: activity.employee_count as Record<string, number> || {},
    };
  });
  
  console.log('Transformed data:', transformedData);
  return transformedData;
};

export const createActivityInDB = async (activityData: CreateActivityData) => {
  const defaultProjectId = '00000000-0000-0000-0000-000000000001';
  
  const { data, error } = await supabase
    .from('activities')
    .insert([{
      project_id: defaultProjectId,
      title: activityData.title,
      description: activityData.description,
      discipline: activityData.discipline,
      location: activityData.location,
      start_date: activityData.start_date,
      end_date: activityData.end_date,
      priority: activityData.priority || 'medium',
      status: 'pending',
      progress: 0,
      responsible_name: activityData.responsible_name,
      asset: activityData.asset,
      week: activityData.week,
      employee_count: activityData.employee_count || {},
      custom_id: activityData.custom_id || null,
      pacote: activityData.pacote || 'Pacote 1',
    }])
    .select()
    .single();

  if (error) throw error;
  
  return data;
};

export const updateActivityInDB = async (id: string, updates: any) => {
  const { error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

export const updateActivityEmployeeCount = async (id: string, employeeCount: Record<string, number>) => {
  const { error } = await supabase
    .from('activities')
    .update({ employee_count: employeeCount })
    .eq('id', id);

  if (error) throw error;
};

export const deleteActivityFromDB = async (id: string) => {
  const { error: commentsError } = await supabase
    .from('activity_comments')
    .delete()
    .eq('activity_id', id);

  if (commentsError) {
    console.error('Erro ao deletar comentários:', commentsError);
  }

  const { error: photosError } = await supabase
    .from('activity_photos')
    .delete()
    .eq('activity_id', id);

  if (photosError) {
    console.error('Erro ao deletar fotos:', photosError);
  }

  const { error: subtasksError } = await supabase
    .from('activity_subtasks')
    .delete()
    .eq('activity_id', id);

  if (subtasksError) {
    console.error('Erro ao deletar subtarefas:', subtasksError);
  }

  const { error: assignmentsError } = await supabase
    .from('activity_assignments')
    .delete()
    .eq('activity_id', id);

  if (assignmentsError) {
    console.error('Erro ao deletar atribuições:', assignmentsError);
  }

  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
