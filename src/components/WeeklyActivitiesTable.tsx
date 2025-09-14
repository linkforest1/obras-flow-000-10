
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useActivities } from "@/hooks/useActivities";
import { useFilters } from "@/contexts/FilterContext";

interface WeeklyActivitiesTableProps {
  selectedWeek: string;
}

const statusColors = {
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  delayed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const statusLabels = {
  completed: 'Concluída',
  in_progress: 'Em Andamento',
  pending: 'Pendente',
  delayed: 'Atrasada'
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
};

const priorityLabels = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa'
};

export function WeeklyActivitiesTable({ selectedWeek }: WeeklyActivitiesTableProps) {
  const { activities, loading } = useActivities();
  const { filters } = useFilters();

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma atividade encontrada</p>
      </div>
    );
  }

  // Aplicar filtros incluindo selectedWeek
  const filteredActivities = activities.filter(activity => {
    // Filtro por semana selecionada
    if (selectedWeek !== 'all' && String(activity.week) !== selectedWeek) {
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

  // Mostrar as primeiras 15 atividades filtradas
  const displayActivities = filteredActivities.slice(0, 15);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Atividade</TableHead>
            <TableHead>Disciplina</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Progresso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayActivities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell className="font-medium">
                <div>
                  <p className="font-medium">{activity.title}</p>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {activity.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {activity.discipline || 'Geral'}
                </Badge>
              </TableCell>
              <TableCell>{activity.responsible}</TableCell>
              <TableCell>
                <Badge 
                  className={statusColors[activity.status as keyof typeof statusColors]}
                >
                  {statusLabels[activity.status as keyof typeof statusLabels]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  className={priorityColors[activity.priority as keyof typeof priorityColors]}
                >
                  {priorityLabels[activity.priority as keyof typeof priorityLabels]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-vale-blue h-2 rounded-full transition-all duration-300"
                      style={{ width: `${activity.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12">
                    {activity.progress}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
