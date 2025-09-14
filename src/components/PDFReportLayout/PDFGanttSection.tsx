
import React from 'react';
import { Calendar, Clock } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PDFGanttSectionProps {
  activities: any[];
  selectedWeek: string;
}

export function PDFGanttSection({ activities, selectedWeek }: PDFGanttSectionProps) {
  const getWeekDates = (weekValue: string) => {
    const today = new Date();
    let weekStart: Date;

    switch (weekValue) {
      case 'current':
        weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Domingo
        break;
      case 'last-week':
        weekStart = startOfWeek(addDays(today, -7), { weekStartsOn: 0 });
        break;
      case 'two-weeks-ago':
        weekStart = startOfWeek(addDays(today, -14), { weekStartsOn: 0 });
        break;
      case 'three-weeks-ago':
        weekStart = startOfWeek(addDays(today, -21), { weekStartsOn: 0 });
        break;
      case 'month':
        weekStart = startOfWeek(addDays(today, -30), { weekStartsOn: 0 });
        break;
      default:
        weekStart = startOfWeek(today, { weekStartsOn: 0 });
    }

    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 }); // Sábado
    return { weekStart, weekEnd };
  };

  const { weekStart, weekEnd } = getWeekDates(selectedWeek);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const activitiesWithDates = activities.filter(activity => 
    activity.start_date || activity.end_date
  );

  const statusColors = {
    completed: '#059669',
    'in-progress': '#2563eb',
    'in_progress': '#2563eb',
    pending: '#d97706',
    delayed: '#dc2626',
    'not-completed': '#dc2626'
  };

  const getActivityBar = (activity: any) => {
    if (!activity.start_date && !activity.end_date) return null;

    const startDate = activity.start_date ? parseISO(activity.start_date) : weekStart;
    const endDate = activity.end_date ? parseISO(activity.end_date) : weekEnd;

    const totalDays = 7;
    const startDay = Math.max(0, Math.floor((startDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)));
    const endDay = Math.min(6, Math.floor((endDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)));
    
    return { startDay, endDay };
  };

  return (
    <div className="mb-8 page-break-inside-avoid">
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-vale-blue pb-2">
        📅 Cronograma Gantt
      </h2>
      
      <div className="mb-4 bg-vale-blue-light p-3 rounded-lg">
        <div className="flex items-center justify-center text-vale-blue font-semibold">
          <Calendar className="w-5 h-5 mr-2" />
          Período: {format(weekStart, 'dd/MM', { locale: ptBR })} - {format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}
        </div>
      </div>

      {activitiesWithDates.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 rounded-lg">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Nenhuma atividade programada encontrada para este período.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700 w-1/3">
                  Atividade
                </th>
                {weekDays.map(day => (
                  <th key={day.toISOString()} className="border border-gray-300 p-2 text-center font-semibold text-gray-700">
                    <div className="text-sm">{format(day, 'EEE', { locale: ptBR })}</div>
                    <div className="text-xs text-gray-500">{format(day, 'dd/MM')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activitiesWithDates.slice(0, 10).map((activity, index) => {
                const barData = getActivityBar(activity);
                const color = statusColors[activity.status as keyof typeof statusColors] || '#e5e7eb';
                
                return (
                  <tr key={activity.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-3">
                      <div className="font-medium text-gray-800 mb-1">{activity.title}</div>
                      <div className="text-xs text-gray-600 mb-1">
                        {activity.discipline || 'Geral'} • Progresso: {activity.progress || 0}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {activity.responsible_name || 'Responsável não definido'}
                      </div>
                    </td>
                    {weekDays.map((day, dayIndex) => {
                      const isInRange = barData && dayIndex >= barData.startDay && dayIndex <= barData.endDay;
                      
                      return (
                        <td key={day.toISOString()} className="border border-gray-300 p-1 text-center">
                          {isInRange ? (
                            <div 
                              className="h-6 rounded opacity-80 flex items-center justify-center"
                              style={{ backgroundColor: color }}
                            >
                              <span className="text-xs text-white font-medium">
                                {activity.progress || 0}%
                              </span>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-4 justify-center bg-gray-50 p-3 rounded-lg">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }}></div>
            <span className="text-sm text-gray-700 capitalize">
              {status === 'completed' ? 'Concluída' :
               status === 'in-progress' || status === 'in_progress' ? 'Em Andamento' :
               status === 'pending' ? 'Pendente' :
               status === 'delayed' ? 'Atrasada' :
               status === 'not-completed' ? 'Não Concluída' : status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
