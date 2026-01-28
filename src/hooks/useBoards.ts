
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useBoards = () => {
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBoards = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoards(data || []);
    } catch (error: any) {
      console.error('Error fetching boards:', error);
      toast({
        title: "Erro ao carregar disciplinas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (name: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('boards')
        .insert([{ name, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setBoards(prev => [data, ...prev]);
      toast({
        title: "Disciplina criada",
        description: `A disciplina "${name}" foi criada com sucesso.`,
      });
      
      return data;
    } catch (error: any) {
      console.error('Error creating board:', error);
      toast({
        title: "Erro ao criar disciplina",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateBoard = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('boards')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
      
      setBoards(prev => prev.map(board => 
        board.id === id ? { ...board, name } : board
      ));
      
      toast({
        title: "Disciplina atualizada",
        description: "A disciplina foi atualizada com sucesso.",
      });
    } catch (error: any) {
      console.error('Error updating board:', error);
      toast({
        title: "Erro ao atualizar disciplina",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteBoard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBoards(prev => prev.filter(board => board.id !== id));
      toast({
        title: "Disciplina removida",
        description: "A disciplina foi removida com sucesso.",
      });
    } catch (error: any) {
      console.error('Error deleting board:', error);
      toast({
        title: "Erro ao remover disciplina",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [user]);

  return {
    boards,
    loading,
    createBoard,
    updateBoard,
    deleteBoard,
    refetch: fetchBoards,
  };
};
