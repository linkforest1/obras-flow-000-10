
import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, XCircle } from "lucide-react";

interface MetricsCardsProps {
  metrics: {
    completed: number;
    inProgress: number;
    delayed: number;
    pending: number;
    notCompleted: number;
    total: number;
  };
  completionRate: number;
}

export function MetricsCards({ metrics, completionRate }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-5 gap-3 mb-4">
      <div className="text-center p-3 border border-gray-200 rounded">
        <div className="flex items-center justify-center mb-1">
          <CheckCircle2 className="w-4 h-4 text-green-600 mr-1" />
          <span className="text-10 font-medium">Concluídas</span>
        </div>
        <div className="text-16 font-bold text-green-600">{metrics.completed}</div>
        <div className="text-8 text-gray-500">
          {metrics.total > 0 ? `${Math.round((metrics.completed / metrics.total) * 100)}%` : '0%'}
        </div>
      </div>

      <div className="text-center p-3 border border-gray-200 rounded">
        <div className="flex items-center justify-center mb-1">
          <Clock className="w-4 h-4 text-blue-600 mr-1" />
          <span className="text-10 font-medium">Em Andamento</span>
        </div>
        <div className="text-16 font-bold text-blue-600">{metrics.inProgress}</div>
        <div className="text-8 text-gray-500">
          {metrics.total > 0 ? `${Math.round((metrics.inProgress / metrics.total) * 100)}%` : '0%'}
        </div>
      </div>

      <div className="text-center p-3 border border-gray-200 rounded">
        <div className="flex items-center justify-center mb-1">
          <AlertTriangle className="w-4 h-4 text-orange-600 mr-1" />
          <span className="text-10 font-medium">Não Iniciadas</span>
        </div>
        <div className="text-16 font-bold text-orange-600">{metrics.pending}</div>
        <div className="text-8 text-gray-500">
          {metrics.total > 0 ? `${Math.round((metrics.pending / metrics.total) * 100)}%` : '0%'}
        </div>
      </div>

      <div className="text-center p-3 border border-gray-200 rounded">
        <div className="flex items-center justify-center mb-1">
          <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
          <span className="text-10 font-medium">Concluídas com Atraso</span>
        </div>
        <div className="text-16 font-bold text-purple-600">{metrics.delayed}</div>
        <div className="text-8 text-gray-500">
          {metrics.total > 0 ? `${Math.round((metrics.delayed / metrics.total) * 100)}%` : '0%'}
        </div>
      </div>

      <div className="text-center p-3 border border-gray-200 rounded">
        <div className="flex items-center justify-center mb-1">
          <XCircle className="w-4 h-4 text-red-600 mr-1" />
          <span className="text-10 font-medium">Não Concluídas</span>
        </div>
        <div className="text-16 font-bold text-red-600">{metrics.notCompleted}</div>
        <div className="text-8 text-gray-500">
          {metrics.total > 0 ? `${Math.round((metrics.notCompleted / metrics.total) * 100)}%` : '0%'}
        </div>
      </div>
    </div>
  );
}
