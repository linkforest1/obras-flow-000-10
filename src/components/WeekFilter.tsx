
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useWeekFilter } from "@/hooks/useWeekFilter";

interface WeekFilterProps {
  selectedWeek: string;
  onWeekChange: (week: string) => void;
}

export function WeekFilter({ selectedWeek, onWeekChange }: WeekFilterProps) {
  const { availableWeeks, isLoading } = useWeekFilter();
  
  // Opções padrão
  const defaultOptions = [
    { value: 'all', label: 'Todas as Semanas' }
  ];

  const allOptions = [...defaultOptions, ...availableWeeks];

  return (
    <Select value={selectedWeek} onValueChange={onWeekChange}>
      <SelectTrigger className="w-[160px] md:w-[180px]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading" disabled>
            Carregando...
          </SelectItem>
        ) : (
          allOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
