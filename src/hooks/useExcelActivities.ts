
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useExcelActivities = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Usar a URL correta do projeto Supabase com função específica
      const supabaseUrl = 'https://ihxvtltuqsnasxdkmbhz.supabase.co';
      const functionUrl = `${supabaseUrl}/functions/v1/excel-activities/download-template`;
      
      console.log('🔗 Fazendo request para:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        let errorMsg = 'Erro ao baixar modelo';
        try {
          const errorData = await response.json();
          errorMsg = errorData.details || errorData.error || 'Erro desconhecido do servidor';
        } catch (e) {
          const textError = await response.text();
          errorMsg = textError || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      
      // Lógica de download simplificada
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "modelo_atividades.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Modelo baixado",
        description: "O arquivo modelo Excel (.xlsx) foi baixado com sucesso.",
      });
    } catch (error: any) {
      console.error('Error downloading template:', error);
      toast({
        title: "Erro ao baixar modelo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const uploadFile = async (file: File, onSuccess?: () => void) => {
    console.log('🔍 INICIANDO DEBUG DO UPLOAD:');
    console.log('1. Arquivo selecionado:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });

    setIsUploading(true);
    try {
      // Verificação 1: Sessão do usuário
      console.log('2. Verificando autenticação...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('❌ Usuário não autenticado - faça login novamente');
      }
      console.log('✅ Usuário autenticado:', session.user.email);

      // Verificação 2: Validação do arquivo
      console.log('3. Validando arquivo...');
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        throw new Error(`❌ Formato de arquivo inválido: ${fileExtension}. Use: .xlsx, .xls ou .csv`);
      }
      
      if (file.size === 0) {
        throw new Error('❌ Arquivo está vazio');
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('❌ Arquivo muito grande (máximo 10MB)');
      }
      console.log('✅ Arquivo válido');

      // Verificação 3: Preparação do FormData
      console.log('4. Preparando envio...');
      const formData = new FormData();
      formData.append('file', file);
      console.log('✅ FormData preparado');

      // Verificação 4: Chamada para o servidor
      console.log('5. Enviando para o servidor...');
      const supabaseUrl = 'https://ihxvtltuqsnasxdkmbhz.supabase.co';
      const uploadUrl = `${supabaseUrl}/functions/v1/excel-activities/upload`;
      console.log('URL do upload:', uploadUrl);

      console.log('6. Dados sendo enviados:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasValidToken: !!session.access_token
      });

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      console.log('6. Resposta do servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let detailedError = `Erro HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          console.log('❌ Erro detalhado do servidor:', errorText);
          
          // Tentar parsear como JSON primeiro
          try {
            const errorJson = JSON.parse(errorText);
            detailedError = errorJson.error || errorJson.message || errorText;
          } catch {
            detailedError = errorText;
          }
        } catch (e) {
          console.log('❌ Não foi possível ler a resposta de erro:', e);
        }
        
        throw new Error(detailedError);
      }

      // Verificação 5: Processamento da resposta
      console.log('7. Processando resposta...');
      const result = await response.json();
      console.log('✅ Resultado:', result);
      
      toast({
        title: "✅ Importação concluída",
        description: `${result.imported || 0} atividade(s) importada(s) com sucesso.`,
      });

      onSuccess?.();
      
    } catch (error: any) {
      console.error('❌ ERRO FINAL NO UPLOAD:', error);
      
      let userFriendlyMessage = error.message;
      
      // Categorizar tipos de erro para melhor diagnóstico
      if (error.message.includes('Failed to fetch')) {
        userFriendlyMessage = '🌐 Erro de conexão - verifique sua internet e tente novamente';
      } else if (error.message.includes('401')) {
        userFriendlyMessage = '🔐 Sessão expirada - faça login novamente';
      } else if (error.message.includes('413')) {
        userFriendlyMessage = '📁 Arquivo muito grande - reduza o tamanho';
      } else if (error.message.includes('415')) {
        userFriendlyMessage = '📋 Formato de arquivo não suportado';
      }
      
      toast({
        title: "❌ Erro na importação",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      console.log('🏁 Upload finalizado');
    }
  };

  return {
    downloadTemplate,
    uploadFile,
    isDownloading,
    isUploading,
  };
};
