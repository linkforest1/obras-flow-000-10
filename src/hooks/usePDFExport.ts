
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToPDF = async (
    element: HTMLElement | null, 
    filename: string = 'relatorio', 
    selectedWeek: string = 'all', 
    activitiesData?: any[], 
    rdoData?: any
  ) => {
    setIsExporting(true);

    try {
      console.log('Iniciando exportação PDF...', { 
        filename, 
        selectedWeek, 
        activitiesCount: activitiesData?.length, 
        rdoData 
      });

      if (!activitiesData || activitiesData.length === 0) {
        console.log('Nenhuma atividade encontrada');
        toast({
          title: 'Aviso',
          description: 'Nenhuma atividade encontrada para exportar.',
          variant: 'destructive'
        });
        return;
      }

      // Filtrar atividades baseado na semana selecionada
      const filteredActivities = selectedWeek === 'all' 
        ? activitiesData 
        : activitiesData.filter(activity => String(activity.week) === selectedWeek);

      console.log('Atividades filtradas:', filteredActivities.length);

      // Criar um container temporário para o layout PDF
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '-10000px';
      tempContainer.style.left = '-10000px';
      tempContainer.style.width = '210mm'; // A4 width
      tempContainer.style.minHeight = '297mm'; // A4 height
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.padding = '20mm';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.fontSize = '12px';
      tempContainer.style.lineHeight = '1.6';
      tempContainer.style.color = '#000000';
      tempContainer.style.boxSizing = 'border-box';
      
      // Adicionar estilos CSS necessários
      const style = document.createElement('style');
      style.textContent = `
        .vale-blue { color: #1e40af !important; }
        .vale-blue-light { background-color: #dbeafe !important; }
        .text-vale-blue { color: #1e40af !important; }
        .bg-vale-blue-light { background-color: #dbeafe !important; }
        .border-vale-blue { border-color: #1e40af !important; }
        * { box-sizing: border-box; }
        .page-break-before { page-break-before: always; }
        .page-break-inside-avoid { page-break-inside: avoid; }
      `;
      tempContainer.appendChild(style);
      
      document.body.appendChild(tempContainer);

      // Criar uma instância do React para renderizar o componente
      const { PDFReportLayout } = await import('../components/PDFReportLayout');
      const React = await import('react');
      const { createRoot } = await import('react-dom/client');

      // Criar o componente React
      const reportElement = React.createElement(PDFReportLayout, {
        activities: filteredActivities,
        title: `RELATÓRIO GERENCIAL ${selectedWeek === 'all' ? 'COMPLETO' : `SEMANA ${selectedWeek}`}`,
        dateRange: selectedWeek === 'all' ? 'Todas as Semanas' : `Semana ${selectedWeek}`,
        selectedWeek,
        rdoData
      });

      // Renderizar o componente
      const root = createRoot(tempContainer);
      root.render(reportElement);

      // Aguardar renderização completa
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Renderização concluída, iniciando captura...');

      // Configurações otimizadas para PDF
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: tempContainer.offsetWidth,
        height: tempContainer.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        imageTimeout: 15000,
        removeContainer: false,
        onclone: (clonedDoc) => {
          // Garantir que os estilos sejam aplicados no clone
          const clonedStyle = clonedDoc.createElement('style');
          clonedStyle.textContent = `
            .vale-blue { color: #1e40af !important; }
            .vale-blue-light { background-color: #dbeafe !important; }
            .text-vale-blue { color: #1e40af !important; }
            .bg-vale-blue-light { background-color: #dbeafe !important; }
            .border-vale-blue { border-color: #1e40af !important; }
            * { box-sizing: border-box; }
          `;
          clonedDoc.head.appendChild(clonedStyle);
        }
      });

      console.log('Canvas capturado:', { width: canvas.width, height: canvas.height });

      // Limpar o container temporário
      root.unmount();
      document.body.removeChild(tempContainer);

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas vazio - falha na captura');
      }

      // Converter para PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Criar PDF com múltiplas páginas se necessário
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const marginTop = 30; // 3cm
      const marginRight = 30; // 3cm
      const marginBottom = 20; // 2cm
      const marginLeft = 20; // 2cm

      // Calcular dimensões
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const imgWidthMM = pdfWidth - (marginLeft + marginRight);
      const imgHeightMM = (imgHeight * imgWidthMM) / imgWidth;
      
      let yPosition = 0;
      let pageNumber = 1;

      while (yPosition < imgHeightMM) {
        const pageHeight = Math.min(pdfHeight - (marginTop + marginBottom), imgHeightMM - yPosition);
        
        // Calcular a parte da imagem para esta página
        const srcY = (yPosition * imgHeight) / imgHeightMM;
        const srcHeight = (pageHeight * imgHeight) / imgHeightMM;
        
        // Criar um canvas temporário para esta página
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = srcHeight;
        
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, srcY, imgWidth, srcHeight,
            0, 0, imgWidth, srcHeight
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
          
          if (pageNumber > 1) {
            pdf.addPage();
          }
          
          pdf.addImage(
            pageImgData,
            'PNG',
            marginLeft,
            marginTop,
            imgWidthMM,
            pageHeight
          );
        }
        
        yPosition += pageHeight;
        pageNumber++;
      }

      // Salvar arquivo
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
      const timeStr = now.toLocaleTimeString('pt-BR').replace(/:/g, '-');
      const finalFilename = `${filename}-${dateStr}-${timeStr}.pdf`;
      
      console.log('Salvando PDF:', finalFilename);
      pdf.save(finalFilename);

      toast({
        title: 'PDF exportado com sucesso',
        description: `O relatório "${finalFilename}" foi gerado com ${filteredActivities.length} atividades.`
      });

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: 'Erro na exportação',
        description: `Não foi possível gerar o PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPDF,
    isExporting
  };
}
