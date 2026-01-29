import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, eachDayOfInterval, startOfYear, endOfYear, getMonth, getDay, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Camera, MessageSquare } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DayData {
  date: Date;
  comments: number;
  photos: number;
  total: number;
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function ActivityContributionCalendar() {
  const currentYear = new Date().getFullYear();
  
  const { data: comments } = useQuery({
    queryKey: ['contribution-comments', currentYear],
    queryFn: async () => {
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;
      
      const { data, error } = await supabase
        .from('activity_comments')
        .select('id, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: photos } = useQuery({
    queryKey: ['contribution-photos', currentYear],
    queryFn: async () => {
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;
      
      const { data, error } = await supabase
        .from('activity_photos')
        .select('id, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (error) throw error;
      return data || [];
    }
  });

  const calendarData = useMemo(() => {
    const start = startOfYear(new Date(currentYear, 0, 1));
    const end = endOfYear(new Date(currentYear, 11, 31));
    const days = eachDayOfInterval({ start, end });

    const commentsByDate = new Map<string, number>();
    const photosByDate = new Map<string, number>();

    comments?.forEach(comment => {
      const dateKey = format(parseISO(comment.created_at), 'yyyy-MM-dd');
      commentsByDate.set(dateKey, (commentsByDate.get(dateKey) || 0) + 1);
    });

    photos?.forEach(photo => {
      const dateKey = format(parseISO(photo.created_at), 'yyyy-MM-dd');
      photosByDate.set(dateKey, (photosByDate.get(dateKey) || 0) + 1);
    });

    return days.map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const commentsCount = commentsByDate.get(dateKey) || 0;
      const photosCount = photosByDate.get(dateKey) || 0;
      return {
        date,
        comments: commentsCount,
        photos: photosCount,
        total: commentsCount + photosCount
      };
    });
  }, [comments, photos, currentYear]);

  // Agrupar por mês e semana
  const monthlyData = useMemo(() => {
    const months: Record<number, DayData[][]> = {};
    
    calendarData.forEach(day => {
      const month = getMonth(day.date);
      if (!months[month]) {
        months[month] = Array.from({ length: 7 }, () => []);
      }
      const weekDay = getDay(day.date);
      months[month][weekDay].push(day);
    });

    return months;
  }, [calendarData]);

  const getIntensityClass = (total: number) => {
    if (total === 0) return 'bg-muted';
    if (total <= 2) return 'bg-green-200 dark:bg-green-900';
    if (total <= 5) return 'bg-green-400 dark:bg-green-700';
    if (total <= 10) return 'bg-green-600 dark:bg-green-500';
    return 'bg-green-800 dark:bg-green-300';
  };

  const totalComments = comments?.length || 0;
  const totalPhotos = photos?.length || 0;
  const daysWithActivity = calendarData.filter(d => d.total > 0).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Calendário de Contribuições
        </CardTitle>
        <CardDescription>
          Dias com comentários e fotos cadastrados em {currentYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-lg font-bold">{totalComments}</p>
                <p className="text-xs text-muted-foreground">Comentários</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Camera className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-lg font-bold">{totalPhotos}</p>
                <p className="text-xs text-muted-foreground">Fotos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-lg font-bold">{daysWithActivity}</p>
                <p className="text-xs text-muted-foreground">Dias ativos</p>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Month Headers */}
              <div className="flex mb-2">
                <div className="w-8"></div>
                {MONTHS.map((month, idx) => (
                  <div 
                    key={month} 
                    className="flex-1 text-xs text-muted-foreground font-medium text-center"
                  >
                    {month}
                  </div>
                ))}
              </div>

              {/* Calendar Rows */}
              <TooltipProvider>
                {[0, 1, 2, 3, 4, 5, 6].map(weekDay => (
                  <div key={weekDay} className="flex items-center gap-1 mb-1">
                    <div className="w-8 text-xs text-muted-foreground">
                      {weekDay === 0 && 'Dom'}
                      {weekDay === 1 && 'Seg'}
                      {weekDay === 2 && 'Ter'}
                      {weekDay === 3 && 'Qua'}
                      {weekDay === 4 && 'Qui'}
                      {weekDay === 5 && 'Sex'}
                      {weekDay === 6 && 'Sáb'}
                    </div>
                    {MONTHS.map((_, monthIdx) => (
                      <div key={monthIdx} className="flex-1 flex gap-[2px] justify-center">
                        {monthlyData[monthIdx]?.[weekDay]?.map((day, dayIdx) => (
                          <Tooltip key={dayIdx}>
                            <TooltipTrigger asChild>
                              <div
                                className={`w-3 h-3 rounded-sm cursor-pointer transition-colors ${getIntensityClass(day.total)}`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                <p className="font-medium">
                                  {format(day.date, "dd 'de' MMMM", { locale: ptBR })}
                                </p>
                                {day.total > 0 ? (
                                  <div className="text-xs text-muted-foreground">
                                    {day.comments > 0 && <p>{day.comments} comentário(s)</p>}
                                    {day.photos > 0 && <p>{day.photos} foto(s)</p>}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">Sem atividade</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </TooltipProvider>

              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                <span>Menos</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-muted" />
                  <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
                  <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
                  <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
                  <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-300" />
                </div>
                <span>Mais</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
