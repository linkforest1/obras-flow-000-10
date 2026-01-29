import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bot, RefreshCw, MessageSquare, Loader2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CommentWithActivity {
  id: string;
  comment_text: string;
  created_at: string;
  activity_id: string;
  activity_title?: string;
  activity_custom_id?: string;
}

export function WeeklySummaryAI() {
  const { toast } = useToast();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);

  const currentDate = new Date();
  const weekStart = startOfWeek(subWeeks(currentDate, selectedWeekOffset), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(subWeeks(currentDate, selectedWeekOffset), { weekStartsOn: 1 });

  const { data: weeklyComments, isLoading } = useQuery({
    queryKey: ['weekly-comments-ai', selectedWeekOffset],
    queryFn: async () => {
      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(weekEnd, 'yyyy-MM-dd');

      // Buscar comentários da semana
      const { data: comments, error: commentsError } = await supabase
        .from('activity_comments')
        .select(`
          id,
          comment_text,
          created_at,
          activity_id
        `)
        .gte('created_at', startDate)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Buscar informações das atividades
      const activityIds = [...new Set(comments?.map(c => c.activity_id) || [])];
      
      if (activityIds.length === 0) return [];

      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('id, title, custom_id')
        .in('id', activityIds);

      if (activitiesError) throw activitiesError;

      const activityMap = new Map(activities?.map(a => [a.id, a]) || []);

      return (comments || []).map(comment => ({
        ...comment,
        activity_title: activityMap.get(comment.activity_id)?.title || 'Atividade não encontrada',
        activity_custom_id: activityMap.get(comment.activity_id)?.custom_id || '-'
      })) as CommentWithActivity[];
    }
  });

  const generateAISummary = useCallback(async () => {
    if (!weeklyComments || weeklyComments.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há comentários suficientes para gerar o resumo.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setAiSummary(null);

    try {
      const commentsForAI = weeklyComments.map(c => ({
        id: c.activity_custom_id,
        titulo: c.activity_title,
        comentario: c.comment_text,
        data: format(new Date(c.created_at), 'dd/MM/yyyy HH:mm')
      }));

      const prompt = `Analise os seguintes comentários de atividades de obra da semana de ${format(weekStart, "dd 'de' MMMM", { locale: ptBR })} a ${format(weekEnd, "dd 'de' MMMM", { locale: ptBR })}:

${JSON.stringify(commentsForAI, null, 2)}

Por favor, gere um resumo executivo que inclua:
1. Principais avanços e progresso das atividades
2. Identificação de problemas ou desafios mencionados
3. Sentimento geral dos comentários (positivo, neutro, negativo)
4. Recomendações baseadas nos comentários

Formate o resumo de forma clara e objetiva em português brasileiro.`;

      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{ role: 'user', content: prompt }]
        }
      });

      if (response.error) throw response.error;
      
      setAiSummary(response.data.response);
    } catch (error: any) {
      console.error('Erro ao gerar resumo:', error);
      toast({
        title: "Erro ao gerar resumo",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, [weeklyComments, weekStart, weekEnd, toast]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Resumo Semanal com IA
            </CardTitle>
            <CardDescription>
              Análise automática dos comentários - Semana de {format(weekStart, "dd/MM", { locale: ptBR })} a {format(weekEnd, "dd/MM", { locale: ptBR })}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedWeekOffset(prev => prev + 1)}
            >
              ← Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedWeekOffset(prev => Math.max(0, prev - 1))}
              disabled={selectedWeekOffset === 0}
            >
              Próxima →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de comentários da semana */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Comentários da Semana ({weeklyComments?.length || 0})
          </h4>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : weeklyComments && weeklyComments.length > 0 ? (
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-3">
                {weeklyComments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {comment.activity_custom_id}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {comment.activity_title}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {comment.comment_text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(comment.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-md">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum comentário encontrado para esta semana.</p>
            </div>
          )}
        </div>

        {/* Botão para gerar resumo */}
        <Button 
          onClick={generateAISummary} 
          disabled={isGenerating || !weeklyComments?.length}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando resumo...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Gerar Resumo com IA
            </>
          )}
        </Button>

        {/* Resumo da IA */}
        {aiSummary && (
          <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-primary" />
              Análise da IA
            </h4>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm">
                {aiSummary}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
