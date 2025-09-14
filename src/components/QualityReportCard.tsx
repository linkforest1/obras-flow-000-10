import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { QualityReport } from "@/hooks/useQualityReports";
import { ViewQualityReportModal } from "./ViewQualityReportModal";

interface QualityReportCardProps {
  report: QualityReport;
}

export function QualityReportCard({ report }: QualityReportCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'resolved':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'in_progress':
        return 'Em Andamento';
      case 'resolved':
        return 'Resolvido';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {report.cwp} - {report.tag_peca}
          </CardTitle>
          <Badge className={getStatusColor(report.status)}>
            {getStatusLabel(report.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {report.eixo && (
            <div>
              <span className="text-muted-foreground">Eixo:</span>
              <span className="ml-1 font-medium">{report.eixo}</span>
            </div>
          )}
          {report.elevacao && (
            <div>
              <span className="text-muted-foreground">Elevação:</span>
              <span className="ml-1 font-medium">{report.elevacao}</span>
            </div>
          )}
        </div>

        {report.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {report.descricao}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {format(new Date(report.created_at), "dd/MM/yyyy", { locale: ptBR })}
          </div>
          
          {report.fotos_count && report.fotos_count > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Camera className="w-4 h-4" />
              {report.fotos_count} foto(s)
            </div>
          )}
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-2"
          onClick={() => setShowDetails(true)}
        >
          <Eye className="w-4 h-4" />
          Ver Detalhes
        </Button>
      </CardContent>

      <ViewQualityReportModal
        report={report}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </Card>
  );
}