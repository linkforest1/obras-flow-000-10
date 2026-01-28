
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useActivities } from "@/hooks/useActivities";

interface ActivityProgressChartProps {
  selectedWeek: string;
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

export function ActivityProgressChart({ selectedWeek }: ActivityProgressChartProps) {
  const { activities } = useActivities();

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

  // Filtrar por semana se especificado
  const filteredActivities = selectedWeek === 'all' 
    ? activities 
    : activities.filter(activity => String(activity.week) === selectedWeek);

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
        <p className="text-muted-foreground">Nenhuma atividade encontrada</p>
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

  console.log('=== GRÁFICO DE PROGRESSO ===');
  console.log('Status counts:', statusCounts);
  console.log('Chart data:', data);

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
