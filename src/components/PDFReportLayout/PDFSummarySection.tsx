
import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, TrendingUp } from "lucide-react";

interface PDFSummarySectionProps {
  metrics: {
    completed: number;
    completedWithDelay: number;
    inProgress: number;
    notCompleted: number;
    total: number;
  };
  completionRate: number;
}

export function PDFSummarySection({ metrics, completionRate }: PDFSummarySectionProps) {
  return (
    <div className="mb-4 page-break-inside-avoid">
      <h2 className="text-lg font-bold mb-3 text-gray-800 border-b-2 border-vale-blue pb-1">
        📊 Resumo Geral
      </h2>
      
      <div className="grid grid-cols-5 gap-3 mb-3">
        <div className="text-center p-3 border border-gray-200 rounded-lg bg-green-50">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle2 className="w-5 h-5 text-green-600 mr-1" />
            <span className="text-xs font-medium text-gray-700">Concluídas</span>
          </div>
          <div className="text-xl font-bold text-green-600">{metrics.completed}</div>
          <div className="text-xs text-gray-500">
            {metrics.total > 0 ? `${Math.round((metrics.completed / metrics.total) * 100)}%` : '0%'}
          </div>
        </div>

        <div className="text-center p-3 border border-gray-200 rounded-lg bg-purple-50">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-5 h-5 text-purple-600 mr-1" />
            <span className="text-xs font-medium text-gray-700">Concluídas com Atraso</span>
          </div>
          <div className="text-xl font-bold text-purple-600">{metrics.completedWithDelay}</div>
          <div className="text-xs text-gray-500">
            {metrics.total > 0 ? `${Math.round((metrics.completedWithDelay / metrics.total) * 100)}%` : '0%'}
          </div>
        </div>

        <div className="text-center p-3 border border-gray-200 rounded-lg bg-blue-50">
          <div className="flex items-center justify-center mb-1">
            <Clock className="w-5 h-5 text-blue-600 mr-1" />
            <span className="text-xs font-medium text-gray-700">Em Andamento</span>
          </div>
          <div className="text-xl font-bold text-blue-600">{metrics.inProgress}</div>
          <div className="text-xs text-gray-500">
            {metrics.total > 0 ? `${Math.round((metrics.inProgress / metrics.total) * 100)}%` : '0%'}
          </div>
        </div>

        <div className="text-center p-3 border border-gray-200 rounded-lg bg-red-50">
          <div className="flex items-center justify-center mb-1">
            <XCircle className="w-5 h-5 text-red-600 mr-1" />
            <span className="text-xs font-medium text-gray-700">Não Concluídas</span>
          </div>
          <div className="text-xl font-bold text-red-600">{metrics.notCompleted}</div>
          <div className="text-xs text-gray-500">
            {metrics.total > 0 ? `${Math.round((metrics.notCompleted / metrics.total) * 100)}%` : '0%'}
          </div>
        </div>

        <div className="text-center p-3 border border-gray-200 rounded-lg bg-vale-blue-light">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-5 h-5 text-vale-blue mr-1" />
            <span className="text-xs font-medium text-gray-700">Taxa de Conclusão</span>
          </div>
          <div className="text-xl font-bold text-vale-blue">{completionRate}%</div>
          <div className="text-xs text-gray-500">Meta: 85%</div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-vale-blue h-2 rounded-full transition-all duration-300" 
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-1 text-center">
          Progresso Geral: {completionRate}% de {metrics.total} atividades
        </p>
      </div>
    </div>
  );
}
