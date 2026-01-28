
import React from 'react';
import { Calendar, FileText } from "lucide-react";

interface PDFHeaderProps {
  title: string;
  dateRange?: string;
  selectedWeek?: string;
  totalActivities?: number;
}

export function PDFHeader({ title, dateRange, selectedWeek, totalActivities }: PDFHeaderProps) {
  return (
    <div className="mb-4 text-center border-b-2 border-vale-blue pb-3">
      <div className="flex items-center justify-center mb-2">
        <FileText className="w-6 h-6 text-vale-blue mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>
      
      {dateRange && (
        <div className="flex items-center justify-center mb-1">
          <Calendar className="w-4 h-4 text-gray-600 mr-2" />
          <p className="text-sm text-gray-600 font-medium">{dateRange}</p>
        </div>
      )}
      
      <div className="bg-vale-blue-light p-2 rounded-lg inline-block">
        <p className="text-vale-blue font-semibold text-sm">
          Filtro Aplicado: {selectedWeek === 'all' ? 'Todas as Semanas' : `Semana ${selectedWeek}`}
        </p>
        {totalActivities && (
          <p className="text-xs text-gray-600 mt-1">
            {totalActivities} atividades analisadas
          </p>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
      </div>
    </div>
  );
}
