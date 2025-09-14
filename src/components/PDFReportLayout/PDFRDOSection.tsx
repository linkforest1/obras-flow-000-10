
import React from 'react';
import { FileText, AlertTriangle, CheckCircle2 } from "lucide-react";

interface PDFRDOSectionProps {
  rdoData: {
    reports: any[];
    deviationStats: Record<string, number>;
    totalDeviations: number;
    newestReport?: any;
    mainDeviationType?: string;
  };
}

export function PDFRDOSection({ rdoData }: PDFRDOSectionProps) {
  const { reports, deviationStats, totalDeviations, newestReport, mainDeviationType } = rdoData;
  const conformityRate = reports.length > 0 ? Math.round(((reports.length - totalDeviations) / reports.length) * 100) : 0;

  return (
    <div className="mb-4 page-break-inside-avoid">
      <h2 className="text-lg font-bold mb-3 text-gray-800 border-b-2 border-vale-blue pb-1">
        📋 Relatório de Desvios da Programação
      </h2>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 border border-gray-200 rounded-lg bg-blue-50">
          <FileText className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <div className="text-xl font-bold text-blue-600">{reports.length}</div>
          <div className="text-xs text-gray-600">Desvios Registrados</div>
        </div>

        <div className="text-center p-3 border border-gray-200 rounded-lg bg-red-50">
          <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-1" />
          <div className="text-xl font-bold text-red-600">{totalDeviations}</div>
          <div className="text-xs text-gray-600">Desvios Reportados</div>
        </div>

        <div className="text-center p-3 border border-gray-200 rounded-lg bg-green-50">
          <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <div className="text-xl font-bold text-green-600">{conformityRate}%</div>
          <div className="text-xs text-gray-600">Taxa de Conformidade</div>
        </div>
      </div>

      {newestReport && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">📄 Desvio Mais Recente</h3>
          <div className="text-sm text-gray-700">
            <p><strong>Título:</strong> {newestReport.title}</p>
            <p><strong>Data:</strong> {new Date(newestReport.report_date).toLocaleDateString('pt-BR')}</p>
            {newestReport.description && (
              <p><strong>Descrição:</strong> {newestReport.description}</p>
            )}
          </div>
        </div>
      )}

      {mainDeviationType && (
        <div className="bg-red-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-red-800 mb-2">⚠️ Principal Motivo de Desvio</h3>
          <div className="text-sm text-gray-700">
            <p><strong>{mainDeviationType}</strong></p>
            <p>Ocorrências: {deviationStats[mainDeviationType]} ({Math.round((deviationStats[mainDeviationType] / totalDeviations) * 100)}% dos desvios)</p>
          </div>
        </div>
      )}

      {totalDeviations > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">📊 Distribuição dos Desvios</h3>
          <div className="space-y-2">
            {Object.entries(deviationStats).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{type}</span>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-800 mr-2">{count as number}</span>
                  <span className="text-gray-500">({Math.round(((count as number) / totalDeviations) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
