
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useActivities } from "@/hooks/useActivities";

interface DisciplineDistributionChartProps {
  selectedWeek: string;
}

export function DisciplineDistributionChart({ selectedWeek }: DisciplineDistributionChartProps) {
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

  // Agrupar atividades por disciplina
  const disciplineGroups = activities.reduce((acc: any, activity) => {
    const discipline = activity.discipline || 'Geral';
    if (!acc[discipline]) {
      acc[discipline] = { total: 0, completed: 0 };
    }
    acc[discipline].total++;
    if (activity.status === 'completed') {
      acc[discipline].completed++;
    }
    return acc;
  }, {});

  const data = Object.entries(disciplineGroups).map(([name, counts]: [string, any]) => ({
    name,
    atividades: counts.total,
    concluidas: counts.completed
  })).sort((a, b) => b.atividades - a.atividades);

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Nenhuma atividade encontrada</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-vale-blue">
            Total: {payload[0].value} atividades
          </p>
          <p className="text-sm text-green-600">
            Concluídas: {payload[1].value} atividades
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
          <Bar dataKey="atividades" fill="#1e40af" name="Total" />
          <Bar dataKey="concluidas" fill="#22c55e" name="Concluídas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
