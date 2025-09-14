
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useActivities } from "@/hooks/useActivities";
import { useFilters } from "@/contexts/FilterContext";

interface FilteredDisciplineDistributionChartProps {
  selectedWeek?: string;
}

export function FilteredDisciplineDistributionChart({ selectedWeek }: FilteredDisciplineDistributionChartProps) {
  const { activities } = useActivities();
  const { filters } = useFilters();

  if (!activities) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
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

  // Agrupar atividades por disciplina
  const disciplineGroups = filteredActivities.reduce((acc: any, activity) => {
    const discipline = activity.discipline || 'Geral';
    if (!acc[discipline]) {
      acc[discipline] = { total: 0, completed: 0, delayed: 0 };
    }
    acc[discipline].total++;
    if (activity.status === 'completed') {
      acc[discipline].completed++;
    }
    if (activity.status === 'delayed') {
      acc[discipline].delayed++;
    }
    return acc;
  }, {});

  const data = Object.entries(disciplineGroups).map(([name, counts]: [string, any]) => ({
    name,
    atividades: counts.total,
    concluidas: counts.completed,
    atrasadas: counts.delayed
  })).sort((a, b) => b.atividades - a.atividades);

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Nenhuma atividade encontrada com os filtros aplicados</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-vale-blue">
            Total: {payload.find(p => p.dataKey === 'atividades')?.value || 0} atividades
          </p>
          <p className="text-sm text-green-600">
            Concluídas no prazo: {payload.find(p => p.dataKey === 'concluidas')?.value || 0} atividades
          </p>
          <p className="text-sm text-purple-600">
            Concluídas com atraso: {payload.find(p => p.dataKey === 'atrasadas')?.value || 0} atividades
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            className="text-xs"
          />
          <YAxis className="text-xs" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="atividades" fill="#e5e7eb" name="Total" />
          <Bar dataKey="concluidas" fill="#22c55e" name="Concluídas no prazo" stackId="stack" />
          <Bar dataKey="atrasadas" fill="#a855f7" name="Concluídas com atraso" stackId="stack" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
