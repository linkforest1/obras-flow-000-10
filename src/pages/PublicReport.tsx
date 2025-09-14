
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Building, FileText, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PublicReportData {
  id: string;
  title: string;
  description?: string;
  asset?: string;
  report_date: string;
  created_at: string;
  activities?: { title: string } | null;
  daily_report_photos: Array<{
    id: string;
    photo_url: string;
    caption?: string;
  }>;
}

export default function PublicReport() {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('report');
  const [report, setReport] = useState<PublicReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    if (reportId) {
      fetchReport(reportId);
    }
  }, [reportId]);

  const fetchReport = async (id: string) => {
    try {
      const { data: reportData, error: reportError } = await supabase
        .from('daily_reports')
        .select(`
          *,
          daily_report_photos (*)
        `)
        .eq('id', id)
        .single();

      if (reportError) {
        console.error('Error fetching report:', reportError);
        return;
      }

      let activityData = null;
      if (reportData.activity_id) {
        const { data: activity } = await supabase
          .from('activities')
          .select('id, title')
          .eq('id', reportData.activity_id)
          .single();
        activityData = activity;
      }

      setReport({
        ...reportData,
        activities: activityData
      });
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const handleDownloadImage = async (photoUrl: string, fileName?: string) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `relatorio-${report?.id}-foto-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    }
  };

  const nextPhoto = () => {
    if (report?.daily_report_photos && selectedPhotoIndex < report.daily_report_photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vale-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Relatório não encontrado</h1>
          <p className="text-muted-foreground">O relatório solicitado não existe ou não está disponível.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <FileText className="w-6 h-6 text-vale-blue" />
            {report.title}
          </h1>
          
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(report.report_date)}
            </div>
            {report.asset && (
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-1" />
                {report.asset}
              </div>
            )}
          </div>

          {report.activities && (
            <Badge variant="outline" className="text-vale-blue border-vale-blue">
              Atividade: {report.activities.title}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Descrição */}
          {report.description && (
            <div className="bg-card rounded-lg border p-6">
              <h2 className="font-semibold text-lg mb-3">Descrição</h2>
              <p className="text-muted-foreground leading-relaxed">
                {report.description}
              </p>
            </div>
          )}

          {/* Fotos */}
          {report.daily_report_photos && report.daily_report_photos.length > 0 && (
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">
                  Fotos ({report.daily_report_photos.length})
                </h2>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDownloadImage(
                    report.daily_report_photos[selectedPhotoIndex].photo_url, 
                    `relatorio-${report.id}-foto-${selectedPhotoIndex + 1}.jpg`
                  )}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
              </div>

              <div className="relative">
                <img 
                  src={report.daily_report_photos[selectedPhotoIndex].photo_url} 
                  alt={report.daily_report_photos[selectedPhotoIndex].caption || `Foto ${selectedPhotoIndex + 1}`} 
                  className="w-full h-64 md:h-80 rounded border object-cover" 
                />
                
                {report.daily_report_photos.length > 1 && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute left-2 top-1/2 transform -translate-y-1/2" 
                      onClick={prevPhoto} 
                      disabled={selectedPhotoIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2" 
                      onClick={nextPhoto} 
                      disabled={selectedPhotoIndex === report.daily_report_photos.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>

              {report.daily_report_photos[selectedPhotoIndex].caption && (
                <p className="text-sm text-muted-foreground mt-3">
                  {report.daily_report_photos[selectedPhotoIndex].caption}
                </p>
              )}

              {report.daily_report_photos.length > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <span className="text-sm text-muted-foreground">
                    {selectedPhotoIndex + 1} de {report.daily_report_photos.length}
                  </span>
                </div>
              )}

              {/* Miniaturas */}
              {report.daily_report_photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mt-4">
                  {report.daily_report_photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                        index === selectedPhotoIndex ? 'border-vale-blue' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={photo.photo_url} 
                        alt={`Miniatura ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Informações de criação */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            Relatório criado em {format(new Date(report.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
        </div>
      </div>
    </div>
  );
}
