
import React from 'react';
import { PDFHeader } from './PDFReportLayout/PDFHeader';
import { PDFSummarySection } from './PDFReportLayout/PDFSummarySection';
import { PDFRDOSection } from './PDFReportLayout/PDFRDOSection';
import { PDFGanttSection } from './PDFReportLayout/PDFGanttSection';
import { PDFAnalysisSection } from './PDFReportLayout/PDFAnalysisSection';

interface PDFReportLayoutProps {
  activities: any[];
  title: string;
  dateRange?: string;
  selectedWeek?: string;
  rdoData?: {
    reports: any[];
    deviationStats: Record<string, number>;
    totalDeviations: number;
  };
}

export function PDFReportLayout({ activities, title, dateRange, selectedWeek = 'all', rdoData }: PDFReportLayoutProps) {
  
  // Filtrar atividades pela semana selecionada se não for 'all'
  const filteredActivities = selectedWeek === 'all' 
    ? activities 
    : activities.filter(activity => String(activity.week) === selectedWeek);

  // Calcular métricas baseadas nas atividades filtradas
  const calculateMetrics = () => {
    const completed = filteredActivities.filter(a => a.status === 'completed').length;
    const completedWithDelay = filteredActivities.filter(a => a.status === 'delayed').length;
    const inProgress = filteredActivities.filter(a => 
      a.status === 'in_progress' || a.status === 'in-progress'
    ).length;
    const notCompleted = filteredActivities.filter(a => a.status === 'not-completed').length;
    const total = filteredActivities.length;

    return {
      completed,
      completedWithDelay,
      inProgress,
      notCompleted,
      total
    };
  };

  const metrics = calculateMetrics();
  const completionRate = metrics.total > 0 ? Math.round(((metrics.completed + metrics.completedWithDelay) / metrics.total) * 100) : 0;

  // Processar dados de desvios filtrados por semana
  const processedRDOData = rdoData ? {
    ...rdoData,
    reports: selectedWeek === 'all' 
      ? rdoData.reports 
      : rdoData.reports.filter(report => String(report.week) === selectedWeek),
    newestReport: rdoData.reports
      .filter(report => selectedWeek === 'all' || String(report.week) === selectedWeek)
      .sort((a, b) => 
        new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
      )[0],
    mainDeviationType: Object.entries(rdoData.deviationStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0]
  } : undefined;

  return (
    <div className="min-h-screen bg-white text-black p-4 font-sans">{/* Reduzido de p-8 para p-4 */}
      {/* Estilos CSS para PDF */}
      <style>{`
        @media print {
          .page-break-before {
            page-break-before: always;
          }
          .page-break-after {
            page-break-after: always;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
          .no-print {
            display: none;
          }
        }
        
        @page {
          margin: 3cm 3cm 2cm 2cm;
          size: A4;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.4;
          color: #333;
        }
        
        .vale-blue {
          color: #1e40af;
        }
        
        .vale-blue-light {
          background-color: #dbeafe;
        }
      `}</style>

      {/* Cabeçalho */}
      <PDFHeader 
        title={title}
        dateRange={dateRange}
        selectedWeek={selectedWeek}
        totalActivities={activities.length}
      />

      {/* Resumo Geral */}
      <PDFSummarySection 
        metrics={metrics}
        completionRate={completionRate}
      />

      {/* Seção de Desvios */}
      {processedRDOData && (
        <PDFRDOSection rdoData={processedRDOData} />
      )}

      {/* Nova página para Gantt e Análises */}
      <div className="page-break-before">
        {/* Cronograma Gantt */}
        <PDFGanttSection 
          activities={filteredActivities}
          selectedWeek={selectedWeek}
        />

        {/* Análises e Problemas */}
        <PDFAnalysisSection activities={filteredActivities} />
      </div>

      {/* Rodapé */}
      <div className="mt-4 pt-2 border-t-2 border-gray-300 text-center text-xs text-gray-500">
        <p>
          Este relatório foi gerado automaticamente pelo Sistema de Gestão de Atividades
        </p>
        <p>
          Dados baseados nos filtros selecionados • Confidencial
        </p>
      </div>
    </div>
  );
}
