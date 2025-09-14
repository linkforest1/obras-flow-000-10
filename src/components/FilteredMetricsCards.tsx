
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertTriangle, BarChart3, XCircle } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";
import { useFilters } from "@/contexts/FilterContext";

interface FilteredMetricsCardsProps {
  selectedWeek?: string;
}

export function FilteredMetricsCards({
  selectedWeek
}: FilteredMetricsCardsProps) {
  const { activities } = useActivities();
  const { filters } = useFilters();

  if (!activities) {
    return (
      <div className="grid gap-4 md:grid-cols-5">
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <div className="animate-pulse h-4 bg-muted rounded mt-1"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Aplicar filtros incluindo selectedWeek se fornecido
  const filteredActivities = activities.filter(activity => {
    // Filtro por semana selecionada se fornecido
    if (selectedWeek && selectedWeek !== 'all' && String(activity.week) !== selectedWeek) {
      return false;
    }

    // Aplicar outros filtros do contexto
    if (filters.status && filters.status.length > 0 && !filters.status.includes(activity.status || '')) {
      return false;
    }
    if (filters.week && filters.week.length > 0 && !filters.week.includes(String(activity.week || ''))) {
      return false;
    }
    if (filters.asset && filters.asset.length > 0 && !filters.asset.includes(activity.asset || '')) {
      return false;
    }
    if (filters.responsible && filters.responsible.length > 0 && !filters.responsible.includes(activity.responsible_name || '')) {
      return false;
    }
    if (filters.location && filters.location.length > 0 && !filters.location.includes(activity.location || '')) {
      return false;
    }
    if (filters.discipline && filters.discipline.length > 0 && !filters.discipline.includes(activity.discipline || '')) {
      return false;
    }
    return true;
  });

  const totalActivities = filteredActivities.length;

  // Categorizar atividades baseado nos status da base de dados
  const completedCount = filteredActivities.filter(a => a.status === 'completed').length;
  const inProgressCount = filteredActivities.filter(a => a.status === 'in-progress').length;
  const pendingCount = filteredActivities.filter(a => a.status === 'pending').length;
  const completedLateCount = filteredActivities.filter(a => a.status === 'delayed').length;
  const notCompletedCount = filteredActivities.filter(a => a.status === 'not-completed').length;

  const completionRate = totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0;
  const weekLabel = selectedWeek && selectedWeek !== 'all' ? `Semana ${selectedWeek}` : 'Filtros aplicados';

  const metrics = [
    {
      title: "Concluídas no prazo",
      value: completedCount,
      description: `${completionRate}% do total`,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-950"
    },
    {
      title: "Concluídas com Atraso",
      value: completedLateCount,
      description: `finalizadas com atraso`,
      icon: AlertTriangle,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-950"
    },
    {
      title: "Não Concluídas",
      value: notCompletedCount,
      description: `requerem atenção`,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-950"
    },
    {
      title: "Não Iniciadas",
      value: pendingCount,
      description: `aguardando início`,
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-950"
    },
    {
      title: "Em Andamento",
      value: inProgressCount,
      description: `atividades em execução`,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950"
    }
  ];

  return (
    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-5">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <div className={`p-2 rounded-full ${metric.bgColor}`}>
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
