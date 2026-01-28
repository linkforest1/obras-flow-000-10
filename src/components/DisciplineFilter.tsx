import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";
import { useDisciplineFilter } from "@/hooks/useDisciplineFilter";

interface DisciplineFilterProps {
  selectedDiscipline: string;
  onDisciplineChange: (discipline: string) => void;
}

export function DisciplineFilter({ selectedDiscipline, onDisciplineChange }: DisciplineFilterProps) {
  const { availableDisciplines, isLoading } = useDisciplineFilter();
  
  // Opções padrão
  const defaultOptions = [
    { value: 'all', label: 'Todas as Disciplinas' }
  ];

  const allOptions = [...defaultOptions, ...availableDisciplines];

  return (
    <Select value={selectedDiscipline} onValueChange={onDisciplineChange}>
      <SelectTrigger className="w-[160px] md:w-[180px]">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
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