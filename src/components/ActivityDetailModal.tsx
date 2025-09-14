
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, MessageSquare, Calendar, MapPin, User, IdCard, Building, Wrench, Package, Clock, TrendingUp } from "lucide-react";
import { AddPhotoModal } from "@/components/AddPhotoModal";
import { CommentModal } from "@/components/CommentModal";
import { format, parseISO } from 'date-fns';
import { statusConfig, priorityConfig } from "@/config/activity";

interface ActivityDetailModalProps {
  open: boolean;
  onClose: () => void;
  activity: any;
}

export function ActivityDetailModal({ open, onClose, activity }: ActivityDetailModalProps) {
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  if (!activity) return null;

  const statusKey = activity.status as keyof typeof statusConfig;
  const priorityKey = activity.priority as keyof typeof priorityConfig;
  
  const statusInfo = statusConfig[statusKey] || statusConfig.pending;
  const priorityInfo = priorityConfig[priorityKey] || priorityConfig.medium;

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-foreground mb-4">
            {activity.title}
          </DialogTitle>
          
          {/* Status e Prioridade */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge className={`${statusInfo.className} text-sm px-3 py-1`}>
              {statusInfo.label}
            </Badge>
            <Badge className={`${priorityInfo.className} text-sm px-3 py-1`}>
              {priorityInfo.label}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Descrição */}
          {activity.description && (
            <div className="bg-muted/50 rounded-lg p-4 border">
              <p className="text-muted-foreground leading-relaxed">{activity.description}</p>
            </div>
          )}

          {/* Grid de Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Semana */}
            <div className="bg-card rounded-lg border p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-vale-blue" />
                <span className="text-sm font-medium text-muted-foreground">Semana</span>
              </div>
              <div className="text-2xl font-bold text-vale-blue">
                Semana {activity.week || 'N/A'}
              </div>
            </div>

            {/* ID Personalizado */}
            <div className="bg-card rounded-lg border p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <IdCard className="w-5 h-5 text-vale-blue" />
                <span className="text-sm font-medium text-muted-foreground">ID Personalizado</span>
              </div>
              <div className="text-2xl font-bold text-vale-blue">
                {activity.custom_id || activity.customId || '110'}
              </div>
            </div>
          </div>

          {/* Progresso */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-vale-blue" />
              <span className="text-sm font-medium text-muted-foreground">Progresso</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-muted rounded-full h-3">
                <div 
                  className="bg-vale-blue h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${activity.progress || 0}%` }}
                ></div>
              </div>
              <span className="text-xl font-bold text-vale-blue min-w-[60px]">
                {activity.progress || 0}%
              </span>
            </div>
          </div>

          {/* Grid de Informações Secundárias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Responsável */}
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Responsável</span>
              </div>
              <p className="font-medium text-foreground">{activity.responsible || 'Não definido'}</p>
            </div>

            {/* Local */}
            {activity.location && (
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Local</span>
                </div>
                <p className="font-medium text-foreground">{activity.location}</p>
              </div>
            )}

            {/* Disciplina */}
            {activity.discipline && (
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Disciplina</span>
                </div>
                <p className="font-medium text-foreground">{activity.discipline}</p>
              </div>
            )}

            {/* Ativo */}
            {activity.asset && (
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Ativo</span>
                </div>
                <p className="font-medium text-foreground">{activity.asset}</p>
              </div>
            )}

            {/* Data de Início */}
            {activity.startDate && (
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Data de Início</span>
                </div>
                <p className="font-medium text-foreground">{formatDate(activity.startDate)}</p>
              </div>
            )}

            {/* Data de Fim */}
            {activity.endDate && (
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Data de Fim</span>
                </div>
                <p className="font-medium text-foreground">{formatDate(activity.endDate)}</p>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={() => setShowAddPhotoModal(true)} className="bg-vale-blue hover:bg-vale-blue/90">
              <Camera className="w-4 h-4 mr-2" />
              Adicionar Foto
            </Button>
            <Button variant="outline" onClick={() => setShowCommentModal(true)}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Comentar
            </Button>
          </div>
        </div>

        {showAddPhotoModal && (
          <AddPhotoModal
            open={showAddPhotoModal}
            onClose={() => setShowAddPhotoModal(false)}
            reportId={activity.id}
            reportTitle={activity.title}
          />
        )}

        {showCommentModal && (
          <CommentModal
            open={showCommentModal}
            onClose={() => setShowCommentModal(false)}
            activityId={activity.id}
            activityTitle={activity.title}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
