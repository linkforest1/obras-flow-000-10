// Importa a biblioteca xlsx para gerar um Excel de verdade
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5?dts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Iniciando processamento da requisição...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      console.log('❌ Usuário não autenticado')
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    console.log('✅ Usuário autenticado:', user.email)

    const url = new URL(req.url)
    
    if (url.pathname.endsWith('/download-template')) {
      console.log('📥 Processando download do template...')
      return await handleDownloadTemplate()
    } else if (url.pathname.endsWith('/upload') && req.method === 'POST') {
      console.log('📤 Processando upload do arquivo...')
      return await handleUpload(req, supabaseClient, user)
    }

    console.log('❌ Rota não encontrada:', url.pathname)
    return new Response('Not found', { 
      status: 404, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Gera um arquivo Excel verdadeiro em formato .xlsx
async function handleDownloadTemplate() {
  try {
    console.log('Generating improved Excel template (.xlsx) with ASCII headers...');
    
    // --- Criação da aba de Modelo ---
    // Usando cabeçalhos ASCII para prevenir problemas de codificação
    const modelHeaders = [
      "ID da Atividade", "Titulo", "Descricao", "Disciplina", "Nome do Encarregado",
      "Ativo", "Semana", "Localizacao", "Data de Inicio",
      "Data de Termino", "Prioridade"
    ];

    const exampleData = [
      [
        "ACT-001", "Inspecao semanal do transportador TC-01", "Realizar inspecao visual e lubrificacao dos roletes.",
        "Mecanica", "Carlos Souza", "TC-01", "Semana 25",
        "Area da Britagem", "2025-06-16", "2025-06-16", "high"
      ],
      [
        "ACT-002", "Troca de lampadas do galpao G-03", "Substituir todas as lampadas queimadas por LED.",
        "Eletrica", "Ana Pereira", "GALPAO-G03", "Semana 25",
        "Area de Manutencao", "2025-06-17", "2025-06-18", "medium"
      ],
      [
        "ACT-003", "Pintura de corrimao da escada E-05", "Lixar, aplicar fundo e pintar o corrimao.",
        "Pintura", "Mariana Costa", "ESCADA-E05", "Semana 26",
        "Predio Administrativo", "2025-06-23", "2025-06-25", "low"
      ]
    ];

    const modelWorksheetData = [modelHeaders, ...exampleData];
    const modelWorksheet = XLSX.utils.aoa_to_sheet(modelWorksheetData);
    modelWorksheet['!cols'] = modelHeaders.map(() => ({ wch: 25 }));
    
    // --- Criação da aba de Instruções ---
    const instructionsHeaders = ["Campo", "Descricao", "Exemplo / Valores Validos"];
    const instructionsData = [
      ["ID da Atividade", "Identificador personalizado para a atividade (Opcional - pode ser duplicado)", "ACT-001, MECA-001, etc."],
      ["Titulo", "Titulo breve e descritivo da atividade (Obrigatorio)", "Inspecao semanal do transportador TC-01"],
      ["Descricao", "Detalhes sobre o que precisa ser feito na atividade (Opcional)", "Realizar inspecao visual e lubrificacao dos roletes."],
      ["Disciplina", "Area tecnica responsavel pela atividade (Obrigatorio)", "Mecanica, Eletrica, Pintura, Civil, etc."],
      ["Nome do Encarregado", "Nome do responsavel pela execucao (Obrigatorio)", "Carlos Souza"],
      ["Ativo", "Codigo ou nome do equipamento/local relacionado (Obrigatorio)", "TC-01, GALPAO-G03"],
      ["Semana", "Semana do planejamento em que a atividade deve ocorrer (Obrigatorio)", "Semana 25"],
      ["Localizacao", "Localizacao mais especifica da atividade (Opcional)", "Area da Britagem"],
      ["Data de Inicio", "Data de inicio da atividade no formato AAAA-MM-DD (Obrigatorio)", "2025-06-16"],
      ["Data de Termino", "Data de termino da atividade no formato AAAA-MM-DD (Obrigatorio)", "2025-06-16"],
      ["Prioridade", "Nivel de prioridade da tarefa (Obrigatorio)", "Valores aceitos: low, medium, high"],
    ];

    const instructionsWorksheetData = [instructionsHeaders, ...instructionsData];
    const instructionsWorksheet = XLSX.utils.aoa_to_sheet(instructionsWorksheetData);
    instructionsWorksheet['!cols'] = [ { wch: 20 }, { wch: 50 }, { wch: 40 } ];

    // Cria workbook e adiciona as abas
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, modelWorksheet, "Modelo Atividades");
    XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, "Instrucoes");

    // Gera arquivo em formato .xlsx como array buffer
    const excelBuffer = XLSX.write(workbook, { 
      bookType: "xlsx", 
      type: "array"
    });

    console.log('Improved Excel template (.xlsx) generated successfully, size:', excelBuffer.length);

    return new Response(excelBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="modelo_atividades.xlsx"',
      }
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return new Response(JSON.stringify({ error: 'Error generating template', details: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleUpload(req: Request, supabaseClient: any, user: any) {
  console.log('🔍 INICIANDO PROCESSAMENTO DO UPLOAD...')
  
  try {
    console.log('1. Extraindo arquivo do FormData...')
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('❌ Nenhum arquivo foi enviado')
      return new Response(JSON.stringify({ 
        error: 'Nenhum arquivo fornecido',
        debug: 'O campo "file" não foi encontrado no FormData'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ Arquivo extraído:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    console.log('2. Verificando tipo de arquivo...')
    let activities: any[] = []

    // Detectar se é arquivo Excel ou CSV
    const isExcel = file.name.toLowerCase().endsWith('.xlsx') || 
                    file.name.toLowerCase().endsWith('.xls') || 
                    file.type.includes('spreadsheet') || 
                    file.type.includes('excel')

    console.log('Tipo detectado:', isExcel ? 'Excel' : 'CSV')

    if (isExcel) {
      console.log('3. Processando arquivo Excel...')
      const arrayBuffer = await file.arrayBuffer()
      console.log('ArrayBuffer size:', arrayBuffer.byteLength)
      
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
      console.log('Workbook carregado, sheets disponíveis:', workbook.SheetNames)
      
      // Pegar a primeira aba
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      console.log('Usando sheet:', sheetName)
      
      // Converter para JSON usando a primeira linha como cabeçalho
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        raw: false,
        dateNF: 'yyyy-mm-dd'
      }) as any[][]
      
      console.log('4. Dados extraídos do Excel:', {
        totalRows: jsonData.length,
        firstRow: jsonData[0],
        sampleData: jsonData.slice(0, 3)
      })
      
      if (jsonData.length < 2) {
        console.log('❌ Arquivo Excel inválido - menos de 2 linhas')
        return new Response(JSON.stringify({
          error: 'Arquivo Excel deve conter pelo menos 2 linhas (cabeçalho + dados)',
          debug: `Arquivo tem apenas ${jsonData.length} linha(s)`
        }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Primeira linha são os cabeçalhos
      const headers = jsonData[0].map(h => String(h).trim())
      console.log('5. Cabeçalhos encontrados:', headers)
      
      // Criar mapeamento de índices dos cabeçalhos
      const headerMap = {
        idAtividade: findHeaderIndex(headers, ['ID da Atividade', 'ID da atividade', 'id_atividade', 'ID_ATIVIDADE']),
        titulo: findHeaderIndex(headers, ['Titulo', 'Título', 'titulo', 'TITULO']),
        descricao: findHeaderIndex(headers, ['Descricao', 'Descrição', 'descricao', 'DESCRICAO']),
        disciplina: findHeaderIndex(headers, ['Disciplina', 'disciplina', 'DISCIPLINA']),
        encarregado: findHeaderIndex(headers, ['Nome do Encarregado', 'Encarregado', 'encarregado', 'ENCARREGADO']),
        ativo: findHeaderIndex(headers, ['Ativo', 'ativo', 'ATIVO']),
        semana: findHeaderIndex(headers, ['Semana', 'semana', 'SEMANA']),
        localizacao: findHeaderIndex(headers, ['Localizacao', 'Localização', 'localizacao', 'LOCALIZACAO']),
        dataInicio: findHeaderIndex(headers, ['Data de Inicio', 'Data de Início', 'data_inicio', 'DATA_INICIO']),
        dataTermino: findHeaderIndex(headers, ['Data de Termino', 'Data de Término', 'data_termino', 'DATA_TERMINO']),
        prioridade: findHeaderIndex(headers, ['Prioridade', 'prioridade', 'PRIORIDADE'])
      }

      console.log('6. Mapeamento de cabeçalhos:', headerMap)

      // Verificar se campos obrigatórios foram encontrados
      const missingRequired = []
      if (headerMap.titulo === -1) missingRequired.push('Titulo')
      if (headerMap.disciplina === -1) missingRequired.push('Disciplina')
      if (headerMap.encarregado === -1) missingRequired.push('Nome do Encarregado')
      if (headerMap.ativo === -1) missingRequired.push('Ativo')
      if (headerMap.semana === -1) missingRequired.push('Semana')
      if (headerMap.dataInicio === -1) missingRequired.push('Data de Inicio')
      if (headerMap.dataTermino === -1) missingRequired.push('Data de Termino')
      if (headerMap.prioridade === -1) missingRequired.push('Prioridade')

      if (missingRequired.length > 0) {
        console.log('❌ Campos obrigatórios não encontrados:', missingRequired)
        return new Response(JSON.stringify({
          error: 'Cabeçalhos obrigatórios não encontrados',
          debug: `Campos faltando: ${missingRequired.join(', ')}`,
          expectedHeaders: ['ID da Atividade (opcional)', 'Titulo', 'Disciplina', 'Nome do Encarregado', 'Ativo', 'Semana', 'Data de Inicio', 'Data de Termino', 'Prioridade'],
          foundHeaders: headers
        }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('7. Processando linhas de dados...')
      // Processar dados (começando da linha 2 - índice 1)
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i]
        
        if (!row || row.length === 0 || !row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
          console.log(`Pulando linha vazia ${i}`)
          continue // Pular linhas vazias
        }

        console.log(`Processando linha ${i}:`, row)

        // Extrair dados usando o mapeamento de cabeçalhos
        const activityData = {
          custom_id: getCellValue(row, headerMap.idAtividade) || null,
          title: getCellValue(row, headerMap.titulo),
          description: getCellValue(row, headerMap.descricao) || '',
          discipline: getCellValue(row, headerMap.disciplina) || '',
          responsible_name: getCellValue(row, headerMap.encarregado) || '',
          asset: getCellValue(row, headerMap.ativo) || '',
          week: getCellValue(row, headerMap.semana) || '',
          location: getCellValue(row, headerMap.localizacao) || '',
          start_date: formatDate(getCellValue(row, headerMap.dataInicio)),
          end_date: formatDate(getCellValue(row, headerMap.dataTermino)),
          priority: normalizePriority(getCellValue(row, headerMap.prioridade)),
          project_id: '00000000-0000-0000-0000-000000000001', // Projeto padrão
          status: 'pending',
          progress: 0
        }

        console.log(`Dados mapeados para linha ${i}:`, activityData)

        // Validar se tem pelo menos o título
        if (activityData.title && activityData.title.trim() !== '') {
          activities.push(activityData)
        } else {
          console.log(`Pulando linha ${i} - título inválido`)
        }
      }
    } else {
      console.log('3. Processando arquivo CSV...')
      const content = await file.text()
      const lines = content.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        return new Response('Arquivo CSV deve conter pelo menos 2 linhas (cabeçalho + dados)', { 
          status: 400, 
          headers: corsHeaders 
        })
      }

      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())

      // Criar mapeamento para CSV (similar ao Excel)
      const headerMap = {
        idAtividade: findHeaderIndex(headers, ['ID da Atividade', 'ID da atividade', 'id_atividade']),
        titulo: findHeaderIndex(headers, ['Titulo', 'Título', 'titulo']),
        descricao: findHeaderIndex(headers, ['Descricao', 'Descrição', 'descricao']),
        disciplina: findHeaderIndex(headers, ['Disciplina', 'disciplina']),
        encarregado: findHeaderIndex(headers, ['Nome do Encarregado', 'Encarregado', 'encarregado']),
        ativo: findHeaderIndex(headers, ['Ativo', 'ativo']),
        semana: findHeaderIndex(headers, ['Semana', 'semana']),
        localizacao: findHeaderIndex(headers, ['Localizacao', 'Localização', 'localizacao']),
        dataInicio: findHeaderIndex(headers, ['Data de Inicio', 'Data de Início', 'data_inicio']),
        dataTermino: findHeaderIndex(headers, ['Data de Termino', 'Data de Término', 'data_termino']),
        prioridade: findHeaderIndex(headers, ['Prioridade', 'prioridade'])
      }

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())
        
        if (values.length === 0 || !values.some(v => v !== '')) continue

        const activityData = {
          custom_id: values[headerMap.idAtividade] || null,
          title: values[headerMap.titulo] || '',
          description: values[headerMap.descricao] || '',
          discipline: values[headerMap.disciplina] || '',
          responsible_name: values[headerMap.encarregado] || '',
          asset: values[headerMap.ativo] || '',
          week: values[headerMap.semana] || '',
          location: values[headerMap.localizacao] || '',
          start_date: formatDate(values[headerMap.dataInicio]),
          end_date: formatDate(values[headerMap.dataTermino]),
          priority: normalizePriority(values[headerMap.prioridade]),
          project_id: '00000000-0000-0000-0000-000000000001',
          status: 'pending',
          progress: 0
        }

        if (activityData.title) {
          activities.push(activityData)
        }
      }
    }

    console.log('8. Resumo das atividades processadas:', {
      totalActivities: activities.length,
      sampleActivity: activities[0]
    })

    if (activities.length === 0) {
      console.log('❌ Nenhuma atividade válida encontrada')
      return new Response(JSON.stringify({
        error: 'Nenhuma atividade válida encontrada no arquivo',
        debug: 'Verifique se os cabeçalhos estão corretos e se há dados nas linhas'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('9. Inserindo no banco de dados...')
    // Inserir atividades no banco
    const { data, error } = await supabaseClient
      .from('activities')
      .insert(activities)
      .select()

    if (error) {
      console.error('❌ Erro do banco de dados:', error)
      
      return new Response(JSON.stringify({
        error: 'Erro ao inserir atividades no banco de dados',
        debug: error.message,
        activities: activities
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ Sucesso! Atividades inseridas:', data?.length)

    return new Response(JSON.stringify({ 
      success: true, 
      imported: data.length,
      activities: data 
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('❌ Erro crítico no processamento:', error)
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor',
      debug: error.message,
      stack: error.stack
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Função auxiliar para encontrar índice do cabeçalho
function findHeaderIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()))
    if (index !== -1) return index
  }
  return -1
}

// Função auxiliar para obter valor da célula
function getCellValue(row: any[], index: number): string {
  if (index === -1 || index >= row.length) return ''
  const value = row[index]
  return value !== null && value !== undefined ? String(value).trim() : ''
}

// Função auxiliar para formatar data
function formatDate(dateValue: string): string | null {
  if (!dateValue) return null
  
  try {
    // Se já está no formato correto YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue
    }
    
    // Tentar converter outros formatos
    const date = new Date(dateValue)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
  } catch (error) {
    console.error('Error formatting date:', dateValue, error)
  }
  
  return null
}

// Função auxiliar para normalizar prioridade
function normalizePriority(priority: string): string {
  if (!priority) return 'medium'
  
  const p = priority.toLowerCase().trim()
  if (['low', 'baixa'].includes(p)) return 'low'
  if (['high', 'alta'].includes(p)) return 'high'
  return 'medium'
}
