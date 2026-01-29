import React, { useState, useRef } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNavBar } from "@/components/BottomNavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, TrendingUp, Users, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { WeeklyMetricsCards } from "@/components/WeeklyMetricsCards";
import { FilteredMetricsCards } from "@/components/FilteredMetricsCards";
import { FilteredActivityProgressChart } from "@/components/FilteredActivityProgressChart";
import { WeeklyActivitiesTable } from "@/components/WeeklyActivitiesTable";
import { FilteredDisciplineDistributionChart } from "@/components/FilteredDisciplineDistributionChart";
import { IssuesCards } from "@/components/IssuesCards";
import { ActivityContributionCalendar } from "@/components/Reports/ActivityContributionCalendar";
import { WeeklySummaryAI } from "@/components/Reports/WeeklySummaryAI";

import { usePDFExport } from "@/hooks/usePDFExport";
import { useActivities } from "@/hooks/useActivities";
import { useDailyReports } from "@/hooks/useDailyReports";
import { ReportsHeader } from "@/components/Reports/ReportsHeader";
import { DeviationAnalysis } from "@/components/PDFReportLayout/DeviationAnalysis";
import { FilterProvider, useFilters } from "@/contexts/FilterContext";
import { FilterSheet } from "@/components/FilterSheet";

export default function Reports() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const { exportToPDF, isExporting } = usePDFExport();
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { activities } = useActivities();
  const { reports } = useDailyReports();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleExportPDF = async () => {
    console.log('Iniciando exportação com dados:', {
      activitiesCount: activities?.length,
      selectedWeeks,
      selectedDisciplines,
      selectedLocations
    });

    // Filtrar atividades baseado nas semanas, disciplinas e locais selecionados
    let filteredActivities = activities || [];
    
    if (selectedWeeks.length > 0) {
      filteredActivities = filteredActivities.filter(activity => 
        selectedWeeks.includes(String(activity.week))
      );
    }
    
    if (selectedDisciplines.length > 0) {
      filteredActivities = filteredActivities.filter(activity => 
        selectedDisciplines.includes(activity.discipline || '')
      );
    }

    if (selectedLocations.length > 0) {
      filteredActivities = filteredActivities.filter(activity => 
        selectedLocations.includes(activity.location || '')
      );
    }

    // Filtrar desvios baseado na semana selecionada (se necessário)
    const filteredReports = reports || [];

    const rdoData = {
      reports: filteredReports,
      deviationStats: getDeviationStats(filteredReports).stats,
      totalDeviations: getDeviationStats(filteredReports).total
    };

    const reportSuffix = [];
    if (selectedWeeks.length > 0) reportSuffix.push(`semanas-${selectedWeeks.join('-')}`);
    if (selectedDisciplines.length > 0) reportSuffix.push(`disciplinas-${selectedDisciplines.length}`);
    if (selectedLocations.length > 0) reportSuffix.push(`locais-${selectedLocations.length}`);
    
    const reportName = reportSuffix.length > 0 
      ? `relatorio-gerencial-${reportSuffix.join('-')}`
      : 'relatorio-gerencial-completo';

    await exportToPDF(
      null, 
      reportName, 
      selectedWeeks.length > 0 ? selectedWeeks[0] : 'all', 
      filteredActivities, 
      rdoData
    );
  };

  const getRecommendations = () => {
    if (!activities) return [];
    const recommendations = [];
    
    // Filtrar atividades por semana, disciplina e local se necessário
    let filteredActivities = activities;
    
    if (selectedWeeks.length > 0) {
      filteredActivities = filteredActivities.filter(activity => 
        selectedWeeks.includes(String(activity.week))
      );
    }
    
    if (selectedDisciplines.length > 0) {
      filteredActivities = filteredActivities.filter(activity => 
        selectedDisciplines.includes(activity.discipline || '')
      );
    }

    if (selectedLocations.length > 0) {
      filteredActivities = filteredActivities.filter(activity => 
        selectedLocations.includes(activity.location || '')
      );
    }

    const delayedByDiscipline = filteredActivities.filter(a => a.status === 'delayed').reduce((acc: any, activity) => {
      const discipline = activity.discipline || 'Geral';
      acc[discipline] = (acc[discipline] || 0) + 1;
      return acc;
    }, {});

    const pendingCount = filteredActivities.filter(a => a.status === 'pending').length;
    const notCompletedCount = filteredActivities.filter(a => a.status === 'not-completed').length;
    const maxDelayedDiscipline = Object.entries(delayedByDiscipline).sort(([, a]: any, [, b]: any) => (b as number) - (a as number))[0];

    if (maxDelayedDiscipline) {
      recommendations.push({
        type: 'error',
        title: `Revisar cronograma da Disciplina ${maxDelayedDiscipline[0]}`,
        description: `${maxDelayedDiscipline[1]} atividades estão em atraso`
      });
    }

    if (notCompletedCount > 0) {
      recommendations.push({
        type: 'error',
        title: 'Atividades não concluídas',
        description: `${notCompletedCount} atividades não foram concluídas no prazo`
      });
    }

    if (pendingCount > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Iniciar atividades pendentes',
        description: `${pendingCount} atividades aguardando início`
      });
    }

    return recommendations;
  };

  const getDeviationStats = (reportsList = reports) => {
    if (!reportsList) return { stats: {}, total: 0 };

    const deviationStats = reportsList.filter(report => report.deviation_type && report.deviation_type !== 'none').reduce((acc: Record<string, number>, report) => {
      const type = report.deviation_type || 'Outros';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const totalDeviations = Object.values(deviationStats).reduce((sum: number, count: number) => sum + count, 0);

    return { stats: deviationStats, total: totalDeviations };
  };

  const { stats: deviationStats, total: totalDeviations } = getDeviationStats();

  return (
    <FilterProvider>
      <ReportsContent 
        selectedWeeks={selectedWeeks} 
        selectedDisciplines={selectedDisciplines}
        selectedLocations={selectedLocations}
        setSelectedWeeks={setSelectedWeeks} 
        setSelectedDisciplines={setSelectedDisciplines}
        setSelectedLocations={setSelectedLocations}
        handleExportPDF={handleExportPDF} 
        handleSignOut={handleSignOut}
        isExporting={isExporting} 
        activities={activities} 
        reports={reports} 
        getRecommendations={getRecommendations} 
        deviationStats={deviationStats} 
        totalDeviations={totalDeviations} 
        reportRef={reportRef} 
      />
    </FilterProvider>
  );
}

function ReportsContent({ selectedWeeks, selectedDisciplines, selectedLocations, setSelectedWeeks, setSelectedDisciplines, setSelectedLocations, handleExportPDF, handleSignOut, isExporting, activities, reports, getRecommendations, deviationStats, totalDeviations, reportRef }: any) {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { filters, setFilters } = useFilters();

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-background pb-[60px] md:pb-0">
          <ReportsHeader 
            selectedWeeks={selectedWeeks} 
            selectedDisciplines={selectedDisciplines}
            selectedLocations={selectedLocations}
            onWeeksChange={setSelectedWeeks} 
            onDisciplinesChange={setSelectedDisciplines}
            onLocationsChange={setSelectedLocations}
            onExportPDF={handleExportPDF} 
            onSignOut={handleSignOut} 
            isExporting={isExporting}
            activities={activities}
          />

          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div ref={reportRef} className="space-y-6">
              <div className="flex justify-between items-center">
                <FilterSheet 
                  open={isFilterSheetOpen} 
                  onOpenChange={setIsFilterSheetOpen} 
                  activities={activities || []} 
                  onApplyFilters={handleApplyFilters} 
                  initialFilters={filters} 
                />
              </div>

              <Tabs defaultValue="overview" className="space-y-6">
                <div className="overflow-x-auto">
                  <TabsList className="flex w-max min-w-full">
                    <TabsTrigger value="overview" className="flex-shrink-0">Visão Geral</TabsTrigger>
                    <TabsTrigger value="activities" className="flex-shrink-0">Atividades</TabsTrigger>
                    <TabsTrigger value="scheduling" className="flex-shrink-0">Programação</TabsTrigger>
                    <TabsTrigger value="performance" className="flex-shrink-0">Performance</TabsTrigger>
                    <TabsTrigger value="rdo" className="flex-shrink-0">Desvios</TabsTrigger>
                    <TabsTrigger value="issues" className="flex-shrink-0">Problemas</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-6">
                  <FilteredMetricsCards selectedWeeks={selectedWeeks} selectedDisciplines={selectedDisciplines} selectedLocations={selectedLocations} />
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-vale-blue" />
                          Progresso das Atividades
                        </CardTitle>
                        <CardDescription>
                          Distribuição do status das atividades filtradas
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FilteredActivityProgressChart selectedWeeks={selectedWeeks} selectedDisciplines={selectedDisciplines} selectedLocations={selectedLocations} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-vale-blue" />
                          Distribuição por Disciplina
                        </CardTitle>
                        <CardDescription>
                          Atividades por área de atuação filtradas
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FilteredDisciplineDistributionChart selectedWeeks={selectedWeeks} selectedDisciplines={selectedDisciplines} selectedLocations={selectedLocations} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="activities" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-vale-blue" />
                        Atividades Recentes
                      </CardTitle>
                      <CardDescription>
                        Detalhes das atividades do projeto
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WeeklyActivitiesTable selectedWeeks={selectedWeeks} selectedDisciplines={selectedDisciplines} selectedLocations={selectedLocations} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="scheduling" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-vale-blue" />
                        Cronograma de Atividades
                      </CardTitle>
                      <CardDescription>
                        Visualização temporal das atividades programadas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <p>O cronograma agora está disponível em uma aba dedicada.</p>
                        <p className="text-sm mt-2">Acesse "Cronograma" no menu lateral para visualizar as atividades por mês.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                  <ActivityContributionCalendar />
                  <WeeklySummaryAI />
                </TabsContent>

                <TabsContent value="rdo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-vale-blue" />
                        Relatório de Desvios da Programação
                      </CardTitle>
                      <CardDescription>
                        Análise dos relatórios diários e principais desvios
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Total de Desvios</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{reports?.length || 0}</div>
                              <p className="text-xs text-muted-foreground">Esta semana</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Desvios Reportados</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-red-600">{totalDeviations}</div>
                              <p className="text-xs text-muted-foreground">Total de desvios</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Taxa de Conformidade</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-green-600">
                                {reports?.length ? Math.round((reports.length - totalDeviations) / reports.length * 100) : 0}%
                              </div>
                              <p className="text-xs text-muted-foreground">Registros sem desvios</p>
                            </CardContent>
                          </Card>
                        </div>

                        <DeviationAnalysis deviationStats={deviationStats} totalDeviations={totalDeviations} />

                        <Card>
                          <CardHeader>
                            <CardTitle>Histórico de Desvios</CardTitle>
                            <CardDescription>
                              Últimos relatórios diários registrados
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {reports && reports.length > 0 ? (
                                reports.slice(0, 5).map((report: any) => (
                                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                      <p className="font-medium">{report.title}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(report.report_date).toLocaleDateString('pt-BR')} - {report.author?.name || 'Autor não identificado'}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {report.deviation_type && report.deviation_type !== 'none' ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                          <AlertTriangle className="w-3 h-3 mr-1" />
                                          {report.deviation_type}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                          <CheckCircle2 className="w-3 h-3 mr-1" />
                                          Conforme
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center text-muted-foreground py-4">
                                  Nenhum desvio encontrado para o período selecionado.
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="issues" className="space-y-6">
                  <IssuesCards selectedWeeks={selectedWeeks} selectedDisciplines={selectedDisciplines} selectedLocations={selectedLocations} />

                  <Card>
                    <CardHeader>
                      <CardTitle>Ações Recomendadas</CardTitle>
                      <CardDescription>
                        Sugestões baseadas nos dados atuais
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {getRecommendations().map((rec: any, index: number) => (
                          <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${rec.type === 'error' ? 'bg-red-50 dark:bg-red-950' : 'bg-yellow-50 dark:bg-yellow-950'}`}>
                            {rec.type === 'error' ? (
                              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-5 h-5 text-yellow-600 mt-0.5" />
                            )}
                            <div>
                              <p className="font-medium">{rec.title}</p>
                              <p className="text-sm text-muted-foreground">{rec.description}</p>
                            </div>
                          </div>
                        ))}
                        {getRecommendations().length === 0 && (
                          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Tudo funcionando bem!</p>
                              <p className="text-sm text-muted-foreground">Não há problemas críticos no momento</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
      <BottomNavBar />
    </SidebarProvider>
  );
}
