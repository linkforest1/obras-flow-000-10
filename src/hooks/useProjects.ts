
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Erro ao carregar projetos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: { name: string; description?: string; status?: string }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [data, ...prev]);
      toast({
        title: "Projeto criado",
        description: `O projeto "${projectData.name}" foi criado com sucesso.`,
      });
      
      return data;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Erro ao criar projeto",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<{ name: string; description: string; status: string }>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setProjects(prev => prev.map(project => 
        project.id === id ? { ...project, ...updates } : project
      ));
      
      toast({
        title: "Projeto atualizado",
        description: "O projeto foi atualizado com sucesso.",
      });
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: "Erro ao atualizar projeto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    refetch: fetchProjects,
  };
};
