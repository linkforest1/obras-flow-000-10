import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Building, User, Eye, Edit, AlertTriangle, Camera } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ViewDailyReportModal } from "./ViewDailyReportModal";
import { EditDailyReportModal } from "./EditDailyReportModal";
import { AddPhotoModal } from "./AddPhotoModal";
import { DailyReport } from "@/types/dailyReport";
interface DailyReportCardProps {
  report: DailyReport;
}
const deviationTypeLabels: {
  [key: string]: string;
} = {
  'falta-materiais': 'Falta de materiais',
  'atividade-fora-programacao': 'Atividade fora da programação',
  'absenteismo': 'Absenteísmo (falta)',
  'problema-equipamento': 'Problema com equipamento',
  'baixa-produtividade': 'Baixa produtividade',
  'burocracia': 'Burocracia',
  'outros': 'Outros'
};
const statusColors = {
  completed: 'bg-green-100 text-green-800 border-green-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  delayed: 'bg-red-100 text-red-800 border-red-200'
};
export function DailyReportCard({
  report
}: DailyReportCardProps) {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const formatDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM", {
      locale: ptBR
    });
  };
  const formatFullDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", {
      locale: ptBR
    });
  };
  return <>
      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-vale-blue">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base break-words text-inherit">
                {report.title}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center ">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {formatDate(report.report_date)}
                </div>
                {report.asset && <div className="flex items-center">
                    <Building className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {report.asset}
                  </div>}
                {report.author && <div className="flex items-center text-inherit ">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {report.author.name}
                  </div>}
              </div>
            </div>
            
            <div className="flex flex-row sm:flex-row gap-2 flex-shrink-0 my-0 py-0 px-0 mx-[30px]">
              <Button onClick={() => setShowAddPhotoModal(true)} variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-950 text-inherit px-[30px] mx-0">
                <Camera className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Foto</span>
              </Button>
              <Button onClick={() => setShowViewModal(true)} variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-950 text-inherit mx-0 my-0 px-[30px]">
                <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Ver</span>
              </Button>
              <Button onClick={() => setShowEditModal(true)} variant="outline" size="sm" className="hover:bg-gray-50 dark:hover:bg-gray-800 text-inherit px-[30px]">
                <Edit className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {report.activities && <Badge variant="outline" className="text-vale-blue border-vale-blue text-xs">
                  {report.activities.title}
                </Badge>}
              
              {report.deviation_type && <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {deviationTypeLabels[report.deviation_type] || report.deviation_type}
                </Badge>}

              {report.daily_report_photos && report.daily_report_photos.length > 0 && <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                  📸 {report.daily_report_photos.length} foto{report.daily_report_photos.length !== 1 ? 's' : ''}
                </Badge>}
            </div>

            {report.description && <p className="text-sm line-clamp-2 break-words text-inherit px-0 mx-0 my-0 py-[19px]">
                {report.description}
              </p>}

            <div className="text-xs  text-inherit">
              Criado em {formatFullDate(report.created_at)}
            </div>
          </div>
        </CardContent>
      </Card>

      <ViewDailyReportModal report={report} open={showViewModal} onClose={() => setShowViewModal(false)} />
      
      <EditDailyReportModal report={report} open={showEditModal} onClose={() => setShowEditModal(false)} />

      <AddPhotoModal reportId={report.id} reportTitle={report.title} open={showAddPhotoModal} onClose={() => setShowAddPhotoModal(false)} />
    </>;
}