
import React from 'react';
import { AlertTriangle } from "lucide-react";

interface DeviationAnalysisProps {
  deviationStats: Record<string, number>;
  totalDeviations: number;
}

const deviationLabels: Record<string, string> = {
  'falta-materiais': 'Falta de materiais',
  'atividade-fora-programacao': 'Atividade fora da programação',
  'absenteismo': 'Absenteísmo (falta)',
  'problema-equipamento': 'Problema com equipamento',
  'baixa-produtividade': 'Baixa produtividade',
  'burocracia': 'Burocracia',
  'outros': 'Outros'
};

export function DeviationAnalysis({ deviationStats, totalDeviations }: DeviationAnalysisProps) {
  if (totalDeviations === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-12 font-bold text-gray-800 mb-2 flex items-center">
        <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
        Análise de Desvios da Programação
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(deviationStats).map(([type, count]) => {
          const numericCount = typeof count === 'number' ? count : 0;
          const percentage = totalDeviations > 0 ? Math.round((numericCount / totalDeviations) * 100) : 0;
          const label = deviationLabels[type] || type;
          
          return (
            <div key={type} className="flex items-center justify-between p-2 bg-red-50 rounded border-l-4 border-red-500">
              <span className="text-9 font-medium text-red-800">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-10 font-bold text-red-600">{numericCount}</span>
                <span className="text-8 text-red-500">
                  ({percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-8 text-gray-600 text-center">
        Total de desvios reportados: <strong>{totalDeviations}</strong>
      </div>
    </div>
  );
}
