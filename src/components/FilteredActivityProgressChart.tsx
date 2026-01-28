
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useActivities } from "@/hooks/useActivities";
import { useFilters } from "@/contexts/FilterContext";

interface FilteredActivityProgressChartProps {
  selectedWeeks?: string[];
  selectedDisciplines?: string[];
  selectedLocations?: string[];
}

const COLORS = {
  completed: '#22c55e',        // verde - Concluída no prazo
  in_progress: '#3b82f6',     // azul - Em andamento  
  pending: '#f59e0b',         // laranja - Não iniciadas
  delayed: '#8b5cf6',         // roxo - Concluídas com atraso
  not_completed: '#ef4444',   // vermelho - Não concluídas
};

const STATUS_LABELS = {
  completed: 'Concluída no prazo',
  in_progress: 'Em andamento',
  pending: 'Não iniciadas',
  delayed: 'Concluídas com atraso',
  not_completed: 'Não concluídas'
};

export function FilteredActivityProgressChart({ selectedWeeks = [], selectedDisciplines = [], selectedLocations = [] }: FilteredActivityProgressChartProps) {
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

  // Aplicar filtros incluindo selectedWeeks e selectedDisciplines se fornecidos
  const filteredActivities = activities.filter(activity => {
    // Filtro por semanas selecionadas se fornecido
    if (selectedWeeks.length > 0 && !selectedWeeks.includes(String(activity.week))) {
      return false;
    }
    
    // Filtro por disciplinas selecionadas se fornecido
    if (selectedDisciplines.length > 0 && !selectedDisciplines.includes(activity.discipline || '')) {
      return false;
    }

    // Filtro por locais selecionados se fornecido
    if (selectedLocations.length > 0 && !selectedLocations.includes(activity.location || '')) {
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

  // Categorizar atividades baseado no status da base de dados
  const statusCounts = {
    completed: filteredActivities.filter(a => a.status === 'completed').length,
    in_progress: filteredActivities.filter(a => a.status === 'in-progress').length,
    pending: filteredActivities.filter(a => a.status === 'pending').length,
    delayed: filteredActivities.filter(a => a.status === 'delayed').length,
    not_completed: filteredActivities.filter(a => a.status === 'not-completed').length,
  };

  const data = [
    { name: 'Concluída no prazo', value: statusCounts.completed, status: 'completed' },
    { name: 'Em andamento', value: statusCounts.in_progress, status: 'in_progress' },
    { name: 'Não iniciadas', value: statusCounts.pending, status: 'pending' },
    { name: 'Concluídas com atraso', value: statusCounts.delayed, status: 'delayed' },
    { name: 'Não concluídas', value: statusCounts.not_completed, status: 'not_completed' },
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Nenhuma atividade encontrada com os filtros aplicados</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} atividades ({Math.round((data.value / total) * 100)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.status as keyof typeof COLORS]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
