import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, MapPin, User, Camera, MessageCircle, CheckCircle2, Image, MessageSquare, Settings, Trash2, Plus, XCircle, Clock, Package, Users, Download, RotateCcw, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useActivityInteractions } from "@/hooks/useActivityInteractions";
import { useActivities } from "@/hooks/useActivities";
import { useActivityComments } from "@/hooks/useActivityComments";
import { useActivityPhotos } from "@/hooks/useActivityPhotos";
import { PhotoUploadModal } from "./PhotoUploadModal";
import { CommentModal } from "./CommentModal";
import { EmployeeCountModal } from "./EmployeeCountModal";
import { downloadActivityImages } from "@/utils/downloadUtils";
import { useQueryClient } from "@tanstack/react-query";
import { safeString } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { statusConfig, priorityConfig } from "@/config/activity";

interface ActivityCardProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "pending" | "in-progress" | "completed" | "delayed" | "not-completed";
  priority: "low" | "medium" | "high";
  responsible: string;
  discipline: string;
  startDate: string;
  endDate: string;
  location?: string;
  asset?: string;
  photos?: number;
  comments?: number;
  employeeCount?: Record<string, number>;
  week?: number;
  customId?: string;
}

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

// Fallback configurations with safe defaults
const getStatusConfig = (status: string) => {
  return statusConfig[status as keyof typeof statusConfig] || {
    label: "Desconhecido",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    color: "bg-gray-500"
  };
};

const getPriorityConfig = (priority: string) => {
  return priorityConfig[priority as keyof typeof priorityConfig] || {
    label: "Não definida",
    className: "bg-gray-100 text-gray-600",
    color: "bg-gray-500"
  };
};

export function ActivityCard({
  id,
  title,
  description,
  progress,
  status,
  priority,
  responsible,
  discipline,
  startDate,
  endDate,
  location,
  asset,
  photos = 0,
  comments = 0,
  employeeCount = {},
  week,
  customId
}: ActivityCardProps) {
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [showProgressEditor, setShowProgressEditor] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [showSubtasksOnCard, setShowSubtasksOnCard] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUncompleting, setIsUncompleting] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  
  const {
    completeActivity,
    updateProgress,
    uncompleteActivity,
    completeWithDelay
  } = useActivityInteractions();
  const {
    deleteActivity,
    refetch: refetchActivities
  } = useActivities();

  // Buscar último comentário da atividade
  const {
    data: lastCommentData,
    isLoading: isLoadingComment
  } = useActivityComments(id);
  const lastComment = lastCommentData?.[0];

  // Buscar fotos da atividade - usando como fonte única de verdade
  const {
    data: activityPhotos,
    isLoading: isLoadingPhotos,
    refetch: refetchPhotos
  } = useActivityPhotos(id);
  const actualPhotosCount = activityPhotos?.length || 0;
  const formattedStartDate = startDate ? new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR') : '';
  const formattedEndDate = endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR') : '';

  // Calcular total de funcionários
  const totalEmployees = Object.values(employeeCount).reduce((sum: number, count: any) => {
    return sum + (typeof count === 'number' ? count : 0);
  }, 0);

  // Get configurations with safe fallbacks
  const currentStatusConfig = getStatusConfig(status);
  const currentPriorityConfig = getPriorityConfig(priority);

  const calculateProgressFromSubtasks = () => {
    if (subtasks.length === 0) return currentProgress;
    const completedTasks = subtasks.filter(task => task.completed).length;
    return Math.round(completedTasks / subtasks.length * 100);
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    setSubtasks(prev => {
      const updated = prev.map(task => task.id === subtaskId ? {
        ...task,
        completed: !task.completed
      } : task);
      const newProgress = updated.length > 0 ? Math.round(updated.filter(t => t.completed).length / updated.length * 100) : currentProgress;
      setCurrentProgress(newProgress);
      updateProgress(id, newProgress);
      return updated;
    });
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const newTask: Subtask = {
        id: Date.now().toString(),
        text: newSubtask.trim(),
        completed: false
      };
      setSubtasks(prev => [...prev, newTask]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (subtaskId: string) => {
    setSubtasks(prev => {
      const updated = prev.filter(task => task.id !== subtaskId);
      const newProgress = updated.length > 0 ? Math.round(updated.filter(t => t.completed).length / updated.length * 100) : 0;
      setCurrentProgress(newProgress);
      updateProgress(id, newProgress);
      return updated;
    });
  };

  const handleCompleteTask = async () => {
    const success = await completeActivity(id);
    if (success) {
      setCurrentProgress(100);
      refetchActivities();
    }
  };

  const handleCompleteWithDelay = async () => {
    const success = await completeWithDelay(id);
    if (success) {
      setCurrentProgress(100);
      refetchActivities();
    }
  };

  const handleUncompleteTask = async () => {
    setIsUncompleting(true);
    const success = await uncompleteActivity(id);
    if (success) {
      refetchActivities();
    } else {
      setIsUncompleting(false);
    }
  };

  const handleDeleteActivity = async () => {
    setIsDeleting(true);
    try {
      await deleteActivity(id);
      // deleteActivity já chama refetchActivities internamente
    } catch (error) {
      setIsDeleting(false);
      toast({
        title: "Erro ao excluir atividade",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleAddImage = () => {
    setShowPhotoModal(true);
  };

  const handlePhotoModalClose = () => {
    setShowPhotoModal(false);
    // Invalidar cache e refetch para atualizar contadores
    queryClient.invalidateQueries({
      queryKey: ['activity-photos', id]
    });
    refetchPhotos();
    refetchActivities();
  };

  const handleAddComment = () => {
    setShowCommentModal(true);
  };

  const handleEditComment = (commentId: string) => {
    console.log('handleEditComment called with commentId:', commentId);
    setEditingCommentId(commentId);
    setShowCommentModal(true);
    console.log('editingCommentId set to:', commentId);
  };

  const handleCommentModalClose = () => {
    setShowCommentModal(false);
    setEditingCommentId(null);
    // Invalidar cache para atualizar comentários
    queryClient.invalidateQueries({
      queryKey: ['activity-comments', id]
    });
    queryClient.invalidateQueries({
      queryKey: ['all-activity-comments', id]
    });
    refetchActivities();
  };

  const handleProgressChange = (value: number[]) => {
    setCurrentProgress(value[0]);
  };

  const handleProgressSave = async () => {
    const success = await updateProgress(id, currentProgress);
    if (success) {
      setShowProgressEditor(false);
      toast({
        title: "Progresso atualizado",
        description: `Progresso da atividade "${title}" foi atualizado para ${currentProgress}%.`
      });
      refetchActivities();
    }
  };

  const handleEmployeeCountSave = (newEmployeeCount: Record<string, number>) => {
    console.log('Saving employee count for activity:', id, newEmployeeCount);
    toast({
      title: "Efetivo atualizado",
      description: "O efetivo de funcionários foi salvo com sucesso."
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent flip if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('[role="dialog"]')) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  const handleDownloadImage = async () => {
    if (isDownloading) return; // Prevent multiple simultaneous downloads

    setIsDownloading(true);
    try {
      // Refetch photos first to ensure we have the latest data
      await refetchPhotos();

      // Check if photos exist after refetch
      if (!activityPhotos || activityPhotos.length === 0) {
        toast({
          title: "Nenhuma foto encontrada",
          description: "Esta atividade não possui fotos para download.",
          variant: "destructive"
        });
        return;
      }
      await downloadActivityImages(id, title);
      toast({
        title: "Download iniciado",
        description: `Download das imagens da atividade "${title}" iniciado com sucesso.`
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Erro no download",
        description: error.message || "Erro ao fazer download das imagens.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Determine if download button should be disabled
  const isDownloadDisabled = isDownloading || isLoadingPhotos || actualPhotosCount === 0;

  return <TooltipProvider>
      <div className="relative w-full h-fit perspective-1000">
        <div className={cn("relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer", isFlipped && "rotate-y-180")} onClick={handleCardClick}>
          {/* Front Side */}
          <div className="backface-hidden">
            <Card className={cn("transition-all duration-200 w-full h-fit relative animate-fade-in", "hover:shadow-lg hover:scale-[1.02]", status === 'completed' && "bg-gray-50 dark:bg-gray-900/50", status === 'not-completed' && "bg-neutral-100 dark:bg-neutral-900 opacity-70")}>
              {/* Delete Button - Top Right Corner */}
              <div className="absolute top-3 right-3 z-10">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" disabled={isDeleting || status === 'not-completed'} onClick={e => e.stopPropagation()}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir atividade</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a atividade "{title}"? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteActivity} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                        {isDeleting ? "Excluindo..." : "Excluir"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <CardHeader className="pb-3 p-4 md:p-6 pr-12">
                <div className="space-y-3">
                  {/* Título no topo */}
                  <h3 className="font-bold text-lg md:text-xl text-foreground leading-tight mx-0 py-[10px]">
                    {title}
                  </h3>
                  
                  {/* Status, Prioridade e Progresso logo abaixo */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn("text-xs", currentStatusConfig.className)}>
                      {currentStatusConfig.label}
                    </Badge>
                    <Badge variant="outline" className={cn("text-xs", currentPriorityConfig.className)}>
                      {currentPriorityConfig.label}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-vale-blue">{currentProgress}%</span>
                      {['pending', 'in-progress', 'completed', 'delayed'].includes(status) && <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={e => {
                          e.stopPropagation();
                          setShowProgressEditor(!showProgressEditor);
                        }} disabled={status === 'not-completed'}>
                              <Settings className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar progresso</p>
                          </TooltipContent>
                        </Tooltip>}
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  {['pending', 'in-progress', 'completed', 'delayed'].includes(status) && <Progress value={currentProgress} className="h-2" />}

                  {/* Descrição */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                  
                  {/* Manual Progress Editor */}
                  {showProgressEditor && <div className="space-y-3 pt-2 border-t" onClick={e => e.stopPropagation()}>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Progresso Manual:</label>
                        <div className="space-y-2">
                          <Slider value={[currentProgress]} onValueChange={handleProgressChange} max={100} step={1} className="w-full" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span className="font-medium">{currentProgress}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Subtasks Management Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-muted-foreground">Subtarefas:</label>
                          <div className="flex items-center gap-2">
                            <Checkbox checked={showSubtasksOnCard} onCheckedChange={checked => setShowSubtasksOnCard(checked === true)} className="h-4 w-4" />
                            <span className="text-xs text-muted-foreground">Mostrar no cartão</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {subtasks.map(subtask => <div key={subtask.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                              <Checkbox checked={subtask.completed} onCheckedChange={() => handleSubtaskToggle(subtask.id)} className="h-4 w-4" />
                              <span className={cn("flex-1", subtask.completed && "line-through text-muted-foreground")}>
                                {subtask.text}
                              </span>
                              <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-500" onClick={() => removeSubtask(subtask.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>)}
                        </div>
                        <div className="flex gap-1">
                          <input type="text" value={newSubtask} onChange={e => setNewSubtask(e.target.value)} placeholder="Adicionar um item" className="flex-1 px-2 py-1 text-xs border rounded" onKeyPress={e => e.key === 'Enter' && addSubtask()} />
                          <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={addSubtask}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleProgressSave} className="flex-1">
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowProgressEditor(false)} className="flex-1">
                          Cancelar
                        </Button>
                      </div>
                    </div>}
                  
                  {/* Visible Subtasks on Card */}
                  {showSubtasksOnCard && subtasks.length > 0 && <div className="space-y-2 pt-2 border-t">
                      <div className="text-xs text-muted-foreground font-medium">Lista de verificação {subtasks.filter(t => t.completed).length}/{subtasks.length}</div>
                      <div className="space-y-1">
                        {subtasks.map(subtask => <div key={subtask.id} className="flex items-center gap-2 text-sm">
                            <Checkbox checked={subtask.completed} onCheckedChange={() => handleSubtaskToggle(subtask.id)} className="h-4 w-4" />
                            <span className={cn("flex-1 text-xs", subtask.completed && "line-through text-muted-foreground")}>
                              {subtask.text}
                            </span>
                          </div>)}
                      </div>
                    </div>}
                </div>
              </CardHeader>
              
              <CardContent className="p-4 md:p-6 pt-0 px-[16px] py-[30px]">
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{responsible} • {discipline}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{formattedStartDate} - {formattedEndDate}</span>
                  </div>
                  
                  {location && <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate text-xs sm:text-sm">{location}</span>
                    </div>}

                  {asset && <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate text-xs sm:text-sm">{asset}</span>
                    </div>}
                  
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Camera className="w-4 h-4" />
                      <span className="text-xs">{actualPhotosCount}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">{comments}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">{totalEmployees} funcionários</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Larger Icons */}
                <div className="flex justify-center gap-4 pt-3 border-t">
                  {currentProgress !== 100 && status !== 'not-completed' && status !== 'delayed' && <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={e => {
                      e.stopPropagation();
                      handleCompleteTask();
                    }} size="sm" className="h-10 w-10 p-0 bg-vale-green hover:bg-vale-green/90 text-white">
                          <CheckCircle2 className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Concluir atividade</p>
                      </TooltipContent>
                    </Tooltip>}

                  {currentProgress !== 100 && status !== 'not-completed' && status !== 'delayed' && <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={e => {
                      e.stopPropagation();
                      handleCompleteWithDelay();
                    }} size="sm" className="h-10 w-10 p-0 bg-yellow-500 hover:bg-yellow-600 text-white">
                          <Clock className="w-5 h-5" />
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
                            <Button size="sm" variant="destructive" className="h-10 w-10 p-0 bg-red-600 hover:bg-red-700" disabled={isUncompleting} onClick={e => e.stopPropagation()}>
                              <XCircle className="w-5 h-5 text-white" />
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
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={e => {
                      e.stopPropagation();
                      setShowEmployeeModal(true);
                    }} variant="outline" size="sm" className="h-10 w-10 p-0" disabled={status === 'not-completed'}>
                        <Users className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Gerenciar efetivo</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={e => {
                      e.stopPropagation();
                      handleAddImage();
                    }} variant="outline" size="sm" className="h-10 w-10 p-0" disabled={status === 'not-completed'}>
                        <Image className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Adicionar foto</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={e => {
                      e.stopPropagation();
                      handleAddComment();
                    }} variant="outline" size="sm" className="h-10 w-10 p-0" disabled={status === 'not-completed'}>
                        <MessageSquare className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Adicionar comentário</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <Card className={cn("transition-all duration-200 w-full h-full relative animate-fade-in", "hover:shadow-lg", status === 'completed' && "bg-gray-50 dark:bg-gray-900/50", status === 'not-completed' && "bg-neutral-100 dark:bg-neutral-900 opacity-70")}>
              {/* Back to front button */}
              <div className="absolute top-3 right-3 z-10">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={e => {
                e.stopPropagation();
                setIsFlipped(false);
              }}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <CardHeader className="pb-3 p-4 md:p-6 pr-12 px-0 py-0 my-0">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg md:text-xl text-foreground leading-tight">
                    Detalhes da Atividade
                  </h3>
                  
                     {/* Week and Custom ID Information */}
                   <div className="space-y-3 mx-0 my-0 px-[12px] py-[12px]">
                     <div className="grid grid-cols-2 gap-3">
                       <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                         <Calendar className="w-5 h-5 text-vale-blue" />
                         <div>
                           <p className="text-sm font-medium text-foreground">Semana</p>
                           <p className="text-lg font-bold text-vale-blue">
                             {week ? `Semana ${week}` : 'Não definida'}
                           </p>
                         </div>
                       </div>

                       {/* Custom ID Information */}
                       {customId && <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                           <Package className="w-5 h-5 text-vale-blue" />
                           <div>
                             <p className="text-sm font-medium text-foreground">ID Personalizado</p>
                             <p className="text-lg font-bold text-vale-blue">
                               {customId}
                             </p>
                           </div>
                         </div>}
                     </div>

                    {/* Last Comment */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Último Comentário</span>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg min-h-[60px] flex items-center relative">
                        {isLoadingComment ? <p className="text-sm text-muted-foreground italic">
                            Carregando comentário...
                          </p> : lastComment ? <div className="w-full">
                            <p className="text-sm text-foreground mb-2">
                              "{lastComment.comment_text}"
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                Por: {lastComment.profiles?.full_name || lastComment.profiles?.email || 'Usuário desconhecido'}
                              </span>
                              <span>
                                {new Date(lastComment.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                              </span>
                            </div>
                            {/* Edit Comment Button */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 h-7 w-7 p-0 opacity-80 hover:opacity-100 hover:bg-muted/50"
                                  onClick={e => {
                                    e.stopPropagation();
                                    console.log('Edit button clicked, lastComment.id:', lastComment.id);
                                    console.log('Debug - user?.id:', user?.id, 'lastComment.user_id:', lastComment.user_id, 'can edit:', user?.id === lastComment.user_id);
                                    handleEditComment(lastComment.id);
                                  }}
                                >
                                  <Edit className="w-3 h-3 text-vale-blue" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar comentário</p>
                              </TooltipContent>
                            </Tooltip>
                          </div> : <p className="text-sm text-muted-foreground italic">
                            Nenhum comentário ainda
                          </p>}
                      </div>
                    </div>

                    {/* Photos Download */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Fotos Anexadas</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm text-muted-foreground">
                          {isLoadingPhotos ? "Carregando fotos..." : actualPhotosCount > 0 ? `${actualPhotosCount} foto(s) anexada(s)` : "Nenhuma foto anexada"}
                        </span>
                        <Button variant="outline" size="sm" disabled={isDownloadDisabled} onClick={e => {
                        e.stopPropagation();
                        handleDownloadImage();
                      }} className="flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          {isDownloading ? "Baixando..." : "Download"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PhotoUploadModal open={showPhotoModal} onClose={handlePhotoModalClose} activityId={id} activityTitle={title} />

      <CommentModal 
        open={showCommentModal} 
        onClose={handleCommentModalClose} 
        activityId={id} 
        activityTitle={title}
        editingCommentId={editingCommentId}
      />

      <EmployeeCountModal open={showEmployeeModal} onClose={() => setShowEmployeeModal(false)} title={title} initialEmployeeCount={employeeCount} onSave={handleEmployeeCountSave} />
    </TooltipProvider>;
}
