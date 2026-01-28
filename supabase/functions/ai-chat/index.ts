import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Autenticação necessária');
    }

    const { messages } = await req.json();
    
    // Input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Mensagens inválidas');
    }
    
    // Validate message content
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage.content || typeof lastMessage.content !== 'string' || lastMessage.content.length > 1000) {
      throw new Error('Conteúdo da mensagem inválido ou muito longo');
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados relevantes do Supabase
    console.log('Buscando dados do Supabase...');
    
    const activitiesResult = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    // Construir contexto com os dados
    const activities = activitiesResult.data || [];

    console.log(`Dados carregados: ${activities.length} atividades`);

    const contextData = {
      totalActivities: activities.length,
      activities: activities.map(a => ({
        id: a.id,
        titulo: a.title,
        descricao: a.description,
        responsavel: a.responsible_name,
        disciplina: a.discipline,
        status: a.status,
        progresso: a.progress,
        inicio: a.start_date,
        fim: a.end_date,
        local: a.location,
        ativo: a.asset,
        pacote: a.pacote,
        prioridade: a.priority,
        semana: a.week,
        custom_id: a.custom_id,
        employee_count: a.employee_count
      }))
    };

    const systemPrompt = `Você é um assistente de IA especializado em gestão de projetos e construção civil da Vale. 
Você tem acesso às atividades do projeto e pode responder perguntas sobre:
- Status das atividades (Não Iniciado, Em Andamento, Concluído, Atrasado, Não Concluída)
- Progresso das atividades (0-100%)
- Responsáveis pelas atividades
- Disciplinas (Civil, Mecânica, Elétrica, Instrumentação, etc.)
- Datas de início e fim das atividades
- Locais e ativos onde as atividades são realizadas
- Prioridades (Baixa, Média, Alta)
- Pacotes de trabalho
- Contagem de funcionários por atividade

Contexto atual das atividades:
${JSON.stringify(contextData, null, 2)}

Instruções:
- Responda de forma clara e objetiva em português brasileiro
- Use os dados fornecidos acima para responder com precisão
- Para perguntas sobre status, use: Não Iniciado, Em Andamento, Concluído, Atrasado, Não Concluída
- Para perguntas sobre disciplinas, mencione as disciplinas relevantes
- Se perguntarem sobre números específicos (quantidade de atividades, progresso médio, etc.), calcule usando os dados
- Forneça insights úteis como atividades atrasadas, progresso geral, atividades por responsável, etc.
- Se não souber algo que não está nos dados, seja honesto
- Mantenha um tom profissional mas amigável`;

    // Fazer chamada para o Lovable AI Gateway
    console.log('Chamando Gemini AI...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro do Gemini AI:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }), 
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Por favor, adicione créditos ao seu workspace.' }), 
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(`Erro do Gemini AI: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
    
    console.log('Resposta do Gemini recebida');

    return new Response(
      JSON.stringify({ response: aiMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro na edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        response: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
