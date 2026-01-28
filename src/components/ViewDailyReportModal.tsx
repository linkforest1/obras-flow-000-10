
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building, AlertTriangle, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReportHeader } from "./ViewDailyReportModal/ReportHeader";
import { ReportPhotos } from "./ViewDailyReportModal/ReportPhotos";

interface ViewDailyReportModalProps {
  report: {
    id: string;
    title: string;
    description?: string;
    asset?: string;
    report_date: string;
    created_at: string;
    deviation_type?: string;
    responsible?: string;
    activities?: {
      title: string;
    } | null;
    daily_report_photos: Array<{
      id: string;
      photo_url: string;
      caption?: string;
    }>;
  };
  open: boolean;
  onClose: () => void;
}

const deviationTypeLabels: {
  [key: string]: string;
} = {
  'falta-materiais': 'Falta de materiais',
  'absenteismo': 'Absenteísmo (falta)',
  'problema-equipamento': 'Problema com equipamento',
  'baixa-produtividade': 'Baixa produtividade',
  'burocracia': 'Burocracia',
  'outros': 'Outros'
};

export function ViewDailyReportModal({
  report,
  open,
  onClose
}: ViewDailyReportModalProps) {
  const formatDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR
    });
  };

  const handleWhatsAppShare = () => {
    let message = `📋 *RELATÓRIO DE DESVIO DA PROGRAMAÇÃO*\n\n`;
    message += `📌 *Título:* ${report.title}\n`;
    message += `📅 *Data:* ${formatDate(report.report_date)}\n`;
    
    if (report.asset) {
      message += `🏢 *Ativo:* ${report.asset}\n`;
    }
    
    if (report.responsible) {
      message += `👤 *Responsável:* ${report.responsible}\n`;
    }
    
    if (report.activities?.title) {
      message += `⚙️ *Atividade Relacionada:* ${report.activities.title}\n`;
    }
    
    if (report.deviation_type) {
      message += `⚠️ *Tipo de Desvio:* ${deviationTypeLabels[report.deviation_type] || report.deviation_type}\n`;
    }
    
    if (report.description) {
      message += `\n📝 *Descrição:*\n${report.description}\n`;
    }
    
    if (report.daily_report_photos && report.daily_report_photos.length > 0) {
      message += `\n📸 *Fotos Anexadas (${report.daily_report_photos.length}):*\n`;
      report.daily_report_photos.forEach((photo, index) => {
        message += `🔗 *Foto ${index + 1}:* ${photo.photo_url}\n`;
      });
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto flex flex-col ">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle>
            <ReportHeader title={report.title} onWhatsAppShare={handleWhatsAppShare} />
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <div className="flex items-center text-inherit ">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(report.report_date)}
                </div>
                {report.asset && (
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    {report.asset}
                  </div>
                )}
                {report.responsible && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {report.responsible}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {report.activities && (
                  <Badge variant="outline" className="text-vale-blue border-vale-blue">
                    Atividade: {report.activities.title}
                  </Badge>
                )}
                
                {report.deviation_type && (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {deviationTypeLabels[report.deviation_type] || report.deviation_type}
                  </Badge>
                )}
              </div>
            </div>

            {report.description && (
              <div>
                <h3 className="font-medium mb-2 text-inherit">Descrição</h3>
                <p className="text-sm break-words leading-relaxed text-inherit">
                  {report.description}
                </p>
              </div>
            )}

            <ReportPhotos photos={report.daily_report_photos} reportId={report.id} />

            <div className="text-xs text-gray-500 pt-4 border-t">
              Relatório criado em {format(new Date(report.created_at), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR
              })}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
