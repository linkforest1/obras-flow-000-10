import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useActivityInteractions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (activityId: string, file: File, caption?: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para adicionar fotos.",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${activityId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('activity-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('activity-photos')
        .getPublicUrl(fileName);

      // Save photo record to database
      const { data, error } = await supabase
        .from('activity_photos')
        .insert([{
          activity_id: activityId,
          user_id: user.id,
          photo_url: publicUrl,
          caption: caption || null,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Foto adicionada",
        description: "A foto foi enviada com sucesso.",
      });

      return data;
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Erro ao enviar foto",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const addComment = async (activityId: string, commentText: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comentar.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('activity_comments')
        .insert([{
          activity_id: activityId,
          user_id: user.id,
          comment_text: commentText,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi salvo com sucesso.",
      });

      return data;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro ao adicionar comentário",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const sendWhatsAppMessage = (activity: any, imageUrl?: string) => {
    console.log('Enviando mensagem WhatsApp para atividade:', activity.title);
    console.log('URL da imagem:', imageUrl);
    
    const message = `
🔧 *Nova Atividade Cadastrada*

📋 *Título:* ${activity.title}
📝 *Descrição:* ${activity.description || 'Sem descrição'}
👷 *Responsável:* ${activity.responsible}
📍 *Local:* ${activity.location || 'Não especificado'}
📅 *Período:* ${activity.startDate} - ${activity.endDate}
⚙️ *Disciplina:* ${activity.discipline || 'Não especificado'}
🏗️ *Ativo:* ${activity.asset || 'Não especificado'}
📊 *Semana:* ${activity.week || 'Não especificado'}

✅ Atividade registrada no sistema

${imageUrl ? `📸 *Link para download da imagem:*\n${imageUrl}\n\n` : ''}
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    console.log('Mensagem WhatsApp preparada:', message);
    console.log('URL WhatsApp:', whatsappUrl);
    
    window.open(whatsappUrl, '_blank');
  };

  const uncompleteActivity = async (activityId: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para executar esta ação.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('activities')
        .update({ 
          status: 'not-completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId);

      if (error) throw error;

      toast({
        title: "Atividade marcada como não concluída",
      });

      return true;
    } catch (error: any) {
      console.error('Error uncompleting activity:', error);
      toast({
        title: "Erro ao marcar atividade",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const completeActivity = async (activityId: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para concluir atividades.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('activities')
        .update({ 
          progress: 100,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId);

      if (error) throw error;

      toast({
        title: "Atividade concluída",
        description: "A atividade foi marcada como concluída com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error('Error completing activity:', error);
      toast({
        title: "Erro ao concluir atividade",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const completeWithDelay = async (activityId: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para executar esta ação.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('activities')
        .update({ 
          status: 'delayed',
          progress: 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId);

      if (error) throw error;

      toast({
        title: "Atividade concluída com atraso",
      });

      return true;
    } catch (error: any) {
      console.error('Error completing activity with delay:', error);
      toast({
        title: "Erro ao marcar atividade",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateProgress = async (activityId: string, progress: number) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para atualizar o progresso.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const status = progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'pending';
      const { error } = await supabase
        .from('activities')
        .update({ 
          progress,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId);

      if (error) throw error;

      return true;
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast({
        title: "Erro ao atualizar progresso",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadPhoto,
    addComment,
    completeActivity,
    uncompleteActivity,
    updateProgress,
    uploading,
    completeWithDelay,
    sendWhatsAppMessage,
  };
};
