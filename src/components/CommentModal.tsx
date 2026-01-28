
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { useActivityInteractions } from "@/hooks/useActivityInteractions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface CommentModalProps {
  open: boolean;
  onClose: () => void;
  activityId: string;
  activityTitle: string;
  editingCommentId?: string | null;
}

export function CommentModal({ open, onClose, activityId, activityTitle, editingCommentId }: CommentModalProps) {
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addComment } = useActivityInteractions();
  const { toast } = useToast();
  const { user } = useAuth();

  const isEditing = !!editingCommentId;

  useEffect(() => {
    console.log('CommentModal useEffect - isEditing:', isEditing, 'editingCommentId:', editingCommentId, 'open:', open);
    if (isEditing && editingCommentId && open) {
      loadCommentForEdit();
    } else if (!isEditing) {
      setComment('');
    }
  }, [editingCommentId, open, isEditing]);

  const loadCommentForEdit = async () => {
    if (!editingCommentId) return;
    
    console.log('Loading comment for edit with ID:', editingCommentId);
    try {
      const { data, error } = await supabase
        .from('activity_comments')
        .select('comment_text')
        .eq('id', editingCommentId)
        .single();

      if (error) throw error;
      console.log('Comment loaded successfully:', data);
      setComment(data.comment_text || '');
    } catch (error: any) {
      console.error('Error loading comment:', error);
      toast({
        title: "Erro ao carregar comentário",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    setIsLoading(true);
    try {
      if (isEditing && editingCommentId && !user) {
        toast({
          title: "Permissão necessária",
          description: "Você só pode editar seus próprios comentários.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      if (isEditing && editingCommentId) {
        // Update existing comment
        const { error } = await supabase
          .from('activity_comments')
          .update({ comment_text: comment.trim() })
          .eq('id', editingCommentId)
          .eq('user_id', user?.id || '');

        if (error) throw error;

        toast({
          title: "Comentário atualizado",
          description: "Seu comentário foi atualizado com sucesso.",
        });
      } else {
        // Add new comment
        const result = await addComment(activityId, comment.trim());
        if (!result) return;
      }

      setComment('');
      onClose();
    } catch (error: any) {
      console.error('Error saving comment:', error);
      toast({
        title: "Erro ao salvar comentário",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setComment('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => { if (!newOpen) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Comentário' : 'Adicionar Comentário'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{activityTitle}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="comment">Comentário</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Digite seu comentário sobre a atividade..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!comment.trim() || isLoading}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {isLoading 
                ? (isEditing ? 'Atualizando...' : 'Adicionando...') 
                : (isEditing ? 'Atualizar Comentário' : 'Adicionar Comentário')
              }
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isLoading}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
