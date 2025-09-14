import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, User, Camera, MapPin, Ruler, AlertTriangle } from "lucide-react";
import { QualityReport } from "@/hooks/useQualityReports";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { ViewQualityReportPhotosModal } from "./ViewQualityReportPhotosModal";

interface ViewQualityReportModalProps {
  report: QualityReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewQualityReportModal({ 
  report, 
  open, 
  onOpenChange 
}: ViewQualityReportModalProps) {
  const [showPhotos, setShowPhotos] = useState(false);

  if (!report) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'in_progress':
        return 'Em Progresso';
      case 'resolved':
        return 'Resolvido';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Detalhes do Relatório de Qualidade
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header com informações principais */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">{report.cwp}</h2>
                <p className="text-muted-foreground">TAG: {report.tag_peca}</p>
              </div>
              <Badge className={getStatusColor(report.status)}>
                {getStatusText(report.status)}
              </Badge>
            </div>

            {/* Cards com informações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.eixo && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Eixo:</span>
                        <span className="text-sm font-medium">{report.eixo}</span>
                      </div>
                    )}
                    {report.elevacao && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Elevação:</span>
                        <span className="text-sm font-medium">{report.elevacao}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Informações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Criado em:</span>
                      <span className="text-sm font-medium">
                        {format(new Date(report.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fotos:</span>
                      <span className="text-sm font-medium">{report.fotos_count || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Descrição do problema */}
            {report.descricao && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Descrição do Problema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{report.descricao}</p>
                </CardContent>
              </Card>
            )}

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3">
              {(report.fotos_count || 0) > 0 && (
                <Button 
                  onClick={() => setShowPhotos(true)}
                  className="gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Ver Fotos ({report.fotos_count})
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ViewQualityReportPhotosModal
        reportId={report.id}
        open={showPhotos}
        onOpenChange={setShowPhotos}
      />
    </>
  );
}