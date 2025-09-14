import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, MapPin, User, Download, ChevronLeft, ChevronRight, MessageCircle, Clock, CheckCircle2, XCircle, Share } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActivityInteractions } from '@/hooks/useActivityInteractions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { statusConfig, priorityConfig } from '@/config/activity';
interface ViewActivityPhotosModalProps {
  activityId: string;
  activityTitle: string;
  open: boolean;
  onClose: () => void;
}
export function ViewActivityPhotosModal({
  activityId,
  activityTitle,
  open,
  onClose
}: ViewActivityPhotosModalProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Fetch activity details with photos and comments
  const {
    data: activityDetails,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['activity-details', activityId],
    queryFn: async () => {
      const {
        data: activity,
        error: activityError
      } = await supabase.from('activities').select('*').eq('id', activityId).single();
      if (activityError) throw activityError;
      const {
        data: photos,
        error: photosError
      } = await supabase.from('activity_photos').select('*').eq('activity_id', activityId).order('created_at', {
        ascending: false
      });
      if (photosError) throw photosError;
      const {
        data: comments,
        error: commentsError
      } = await supabase.from('activity_comments').select(`
          *,
          profiles:user_id (full_name, email)
        `).eq('activity_id', activityId).order('created_at', {
        ascending: false
      });
      if (commentsError) throw commentsError;
      return {
        activity,
        photos: photos || [],
        comments: comments || []
      };
    },
    enabled: open && !!activityId
  });
  const {
    completeActivity,
    completeWithDelay,
    uncompleteActivity
  } = useActivityInteractions();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompletingWithDelay, setIsCompletingWithDelay] = useState(false);
  const [isUncompleting, setIsUncompleting] = useState(false);
  const handleCompleteTask = async () => {
    setIsCompleting(true);
    const success = await completeActivity(activityId);
    if (success) {
      refetch();
    }
    setIsCompleting(false);
  };
  const handleCompleteWithDelay = async () => {
    setIsCompletingWithDelay(true);
    const success = await completeWithDelay(activityId);
    if (success) {
      refetch();
    }
    setIsCompletingWithDelay(false);
  };
  const handleUncompleteTask = async () => {
    setIsUncompleting(true);
    const success = await uncompleteActivity(activityId);
    if (success) {
      refetch();
    }
    setIsUncompleting(false);
  };
  const handleWhatsAppShare = () => {
    let message = `⚙️ *ATIVIDADE - RELATÓRIO DETALHADO*\n\n`;
    message += `📌 *Título:* ${activityTitle}\n`;
    if (activityDetails?.activity?.status) {
      const statusLabel = statusConfig[activityDetails.activity.status as keyof typeof statusConfig]?.label || activityDetails.activity.status;
      message += `📊 *Status:* ${statusLabel}\n`;
    }
    if (activityDetails?.activity?.priority) {
      const priorityLabel = priorityConfig[activityDetails.activity.priority as keyof typeof priorityConfig]?.label || activityDetails.activity.priority;
      message += `🔥 *Prioridade:* ${priorityLabel}\n`;
    }
    if (activityDetails?.activity?.responsible_name) {
      message += `👤 *Responsável:* ${activityDetails.activity.responsible_name}\n`;
    }
    if (activityDetails?.activity?.location) {
      message += `📍 *Local:* ${activityDetails.activity.location}\n`;
    }
    if (activityDetails?.activity?.discipline) {
      message += `🔧 *Disciplina:* ${activityDetails.activity.discipline}\n`;
    }
    if (activityDetails?.activity?.asset) {
      message += `🏗️ *Ativo:* ${activityDetails.activity.asset}\n`;
    }
    if (activityDetails?.activity?.week) {
      message += `📅 *Semana:* ${activityDetails.activity.week}\n`;
    }
    if (activityDetails?.activity?.start_date || activityDetails?.activity?.end_date) {
      message += `📆 *Período:* `;
      if (activityDetails.activity.start_date) {
        message += new Date(activityDetails.activity.start_date).toLocaleDateString('pt-BR');
      }
      if (activityDetails.activity.start_date && activityDetails.activity.end_date) {
        message += ' - ';
      }
      if (activityDetails.activity.end_date) {
        message += new Date(activityDetails.activity.end_date).toLocaleDateString('pt-BR');
      }
      message += '\n';
    }
    if (activityDetails?.activity?.progress !== undefined) {
      message += `📈 *Progresso:* ${activityDetails.activity.progress}%\n`;
    }
    if (activityDetails?.activity?.description) {
      message += `\n📝 *Descrição:*\n${activityDetails.activity.description}\n`;
    }
    if (activityDetails?.photos && activityDetails.photos.length > 0) {
      message += `\n📸 *Fotos anexadas:* ${activityDetails.photos.length}\n`;
      message += `\n🔗 *Links para download das imagens:*\n`;
      activityDetails.photos.forEach((photo: any, index: number) => {
        message += `${index + 1}. ${photo.photo_url}\n`;
        if (photo.caption) {
          message += `   _Legenda: ${photo.caption}_\n`;
        }
      });
    }
    if (activityDetails?.comments && activityDetails.comments.length > 0) {
      message += `\n💬 *Comentários:* ${activityDetails.comments.length}\n`;
      message += `\n*Últimos comentários:*\n`;

      // Mostrar os 3 comentários mais recentes
      const recentComments = activityDetails.comments.slice(0, 3);
      recentComments.forEach((comment: any, index: number) => {
        const userName = comment.profiles?.full_name || 'Usuário';
        const commentDate = new Date(comment.created_at).toLocaleDateString('pt-BR');
        message += `${index + 1}. *${userName}* (${commentDate}): ${comment.comment_text}\n`;
      });
    }
    message += `\n🔗 *Sistema de Atividades Vale*`;
    message += `\n📱 Relatório gerado automaticamente`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };
  const handleDownloadImage = async (photoUrl: string, fileName?: string) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `atividade-${activityId}-foto-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    }
  };
  const nextPhoto = () => {
    if (activityDetails?.photos && selectedPhotoIndex < activityDetails.photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };
  const prevPhoto = () => {
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const activity = activityDetails?.activity;
  const status = activity?.status;
  const progress = activity?.progress;
  return <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          {/* Título da atividade */}
          <DialogTitle className="text-lg md:text-xl font-semibold pr-4 leading-tight break-words text-inherit">
            {activityTitle}
          </DialogTitle>
          
          {/* Botões de ação - agora em linha separada para mobile */}
          {activity && <div className="flex flex-wrap items-center gap-2 pt-3">
              <Button onClick={handleWhatsAppShare} className="bg-green-500 hover:bg-green-600 text-white h-9 flex-1 sm:flex-none min-w-0" size="sm">
                <Share className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Compartilhar</span>
              </Button>
              
              <TooltipProvider>
                {progress !== 100 && status !== 'not-completed' && status !== 'delayed' && <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleCompleteTask} size="sm" className="h-9 bg-vale-green hover:bg-vale-green/90 text-white flex-1 sm:flex-none min-w-0" disabled={isCompleting || isCompletingWithDelay || isUncompleting}>
                        <CheckCircle2 className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Concluir</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Concluir atividade</p>
                    </TooltipContent>
                  </Tooltip>}

                {progress !== 100 && status !== 'not-completed' && status !== 'delayed' && <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleCompleteWithDelay} size="sm" className="h-9 bg-yellow-500 hover:bg-yellow-600 text-white flex-1 sm:flex-none min-w-0" disabled={isCompleting || isCompletingWithDelay || isUncompleting}>
                        <Clock className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Com Atraso</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Concluir com atraso</p>
                    </TooltipContent>
                  </Tooltip>}

                {!['completed', 'not-completed', 'delayed'].includes(status) && <AlertDialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="h-9 bg-red-600 hover:bg-red-700 flex-1 sm:flex-none min-w-0" disabled={isCompleting || isCompletingWithDelay || isUncompleting}>
                            <XCircle className="w-4 h-4 text-white sm:mr-2" />
                            <span className="hidden sm:inline">Não Concluir</span>
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Marcar como não concluída</p>
                      </TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Marcar como Não Concluída?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Você deseja marcar essa atividade como não concluída? Você não poderá alterar novamente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUncompleteTask} className="bg-red-600 hover:bg-red-700" disabled={isUncompleting}>
                          {isUncompleting ? "Marcando..." : "Confirmar"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>}
              </TooltipProvider>
            </div>}
        </DialogHeader>

        {isLoading ? <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vale-blue"></div>
          </div> : <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1">
              {/* Informações da Atividade */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={statusConfig[activityDetails?.activity?.status as keyof typeof statusConfig]?.className}>
                    {statusConfig[activityDetails?.activity?.status as keyof typeof statusConfig]?.label}
                  </Badge>
                  <Badge variant="outline" className={priorityConfig[activityDetails?.activity?.priority as keyof typeof priorityConfig]?.className}>
                    {priorityConfig[activityDetails?.activity?.priority as keyof typeof priorityConfig]?.label}
                  </Badge>
                </div>

                {activityDetails?.activity?.description && <div>
                    <h3 className="font-medium mb-2 text-inherit">Descrição</h3>
                    <p className="text-sm break-words text-inherit">{activityDetails.activity.description}</p>
                  </div>}

                <div className="space-y-2">
                  {activityDetails?.activity?.responsible_name && <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words text-inherit">{activityDetails.activity.responsible_name}</span>
                    </div>}
                  
                  {activityDetails?.activity?.location && <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words">{activityDetails.activity.location}</span>
                    </div>}

                  {(activityDetails?.activity?.start_date || activityDetails?.activity?.end_date) && <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words">
                        {activityDetails.activity.start_date && new Date(activityDetails.activity.start_date).toLocaleDateString('pt-BR')}
                        {activityDetails.activity.start_date && activityDetails.activity.end_date && ' - '}
                        {activityDetails.activity.end_date && new Date(activityDetails.activity.end_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>}
                </div>

                {/* Progresso */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progresso</span>
                    <span className="text-sm text-vale-blue">{activityDetails?.activity?.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-vale-blue h-2 rounded-full transition-all duration-300" style={{
                  width: `${activityDetails?.activity?.progress || 0}%`
                }}></div>
                  </div>
                </div>

                {/* Comentários */}
                {activityDetails?.comments && activityDetails.comments.length > 0 && <div>
                    <h3 className="font-medium mb-2 flex items-center gap-2 text-inherit">
                      <MessageCircle className="w-4 h-4" />
                      Comentários ({activityDetails.comments.length})
                    </h3>
                    <ScrollArea className="h-32 border rounded p-2">
                      <div className="space-y-2">
                        {activityDetails.comments.map((comment: any) => <div key={comment.id} className="text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium break-words text-inherit">
                                {comment.profiles?.full_name || 'Usuário'}
                              </span>
                              <span className="text-xs text-inherit">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="break-words text-inherit">{comment.comment_text}</p>
                          </div>)}
                      </div>
                    </ScrollArea>
                  </div>}
              </div>

              {/* Visualização de Fotos */}
              <div className="space-y-4">
                {activityDetails?.photos && activityDetails.photos.length > 0 ? <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-inherit">
                        Fotos ({activityDetails.photos.length})
                      </h3>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadImage(activityDetails.photos[selectedPhotoIndex].photo_url, `atividade-${activityId}-foto-${selectedPhotoIndex + 1}.jpg`)}>
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                    </div>

                    <div className="relative">
                      <img src={activityDetails.photos[selectedPhotoIndex].photo_url} alt={activityDetails.photos[selectedPhotoIndex].caption || `Foto ${selectedPhotoIndex + 1}`} className="w-full h-64 rounded border object-cover" />
                      
                      {activityDetails.photos.length > 1 && <>
                          <Button size="sm" variant="outline" className="absolute left-2 top-1/2 transform -translate-y-1/2" onClick={prevPhoto} disabled={selectedPhotoIndex === 0}>
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="absolute right-2 top-1/2 transform -translate-y-1/2" onClick={nextPhoto} disabled={selectedPhotoIndex === activityDetails.photos.length - 1}>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </>}
                    </div>

                    {activityDetails.photos[selectedPhotoIndex].caption && <p className="text-sm text-gray-700 mt-2 break-words">
                        {activityDetails.photos[selectedPhotoIndex].caption}
                      </p>}

                    {activityDetails.photos.length > 1 && <div className="flex justify-center items-center gap-2 mt-4">
                        <span className="text-sm text-gray-500">
                          {selectedPhotoIndex + 1} de {activityDetails.photos.length}
                        </span>
                      </div>}

                    {/* Miniaturas */}
                    {activityDetails.photos.length > 1 && <div className="flex gap-2 overflow-x-auto pb-2">
                        {activityDetails.photos.map((photo: any, index: number) => <button key={photo.id} onClick={() => setSelectedPhotoIndex(index)} className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${index === selectedPhotoIndex ? 'border-vale-blue' : 'border-gray-200'}`}>
                            <img src={photo.photo_url} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover" />
                          </button>)}
                      </div>}
                  </div> : <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma foto disponível para esta atividade.</p>
                  </div>}
              </div>
            </div>
          </ScrollArea>}
      </DialogContent>
    </Dialog>;
}