
import React from 'react';
import { Button } from "@/components/ui/button";
import { BarChart3, Download, LogOut, Filter } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";
import { useWeekFilter } from "@/hooks/useWeekFilter";
import { useDisciplineFilter } from "@/hooks/useDisciplineFilter";
import { useLocationFilter } from "@/hooks/useLocationFilter";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface ReportsHeaderProps {
  selectedWeeks: string[];
  selectedDisciplines: string[];
  selectedLocations: string[];
  onWeeksChange: (weeks: string[]) => void;
  onDisciplinesChange: (disciplines: string[]) => void;
  onLocationsChange: (locations: string[]) => void;
  onExportPDF: () => void;
  onSignOut: () => void;
  isExporting: boolean;
  activities?: any[];
}

export function ReportsHeader({ 
  selectedWeeks, 
  selectedDisciplines, 
  selectedLocations,
  onWeeksChange, 
  onDisciplinesChange, 
  onLocationsChange,
  onExportPDF, 
  onSignOut, 
  isExporting,
  activities 
}: ReportsHeaderProps) {
  const { availableWeeks } = useWeekFilter(activities);
  const { availableDisciplines } = useDisciplineFilter(activities);
  const { availableLocations } = useLocationFilter(activities);

  const activeFiltersCount = 
    (selectedWeeks.length > 0 ? 1 : 0) + 
    (selectedDisciplines.length > 0 ? 1 : 0) + 
    (selectedLocations.length > 0 ? 1 : 0);

  return (
    <header className="bg-card border-b border-border p-3 md:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1 mr-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-base md:text-2xl font-bold text-foreground truncate flex items-center gap-2">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-vale-blue" />
              <span className="hidden sm:inline">Relatórios</span>
              <span className="sm:hidden">Relatórios</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              <span className="hidden sm:inline">Resumo executivo</span>
              <span className="sm:hidden">Resumo semanal</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <div className="md:hidden">
            <ThemeToggle />
          </div>
          
          {/* Filtros em Sheet para mobile/tablet e inline para desktop */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden relative p-2">
                <Filter className="w-4 h-4" />
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>
                  Selecione os filtros para refinar o relatório
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semanas</label>
                  <MultiSelectFilter
                    label="Semanas"
                    options={availableWeeks}
                    selectedValues={selectedWeeks}
                    onSelectionChange={onWeeksChange}
                    placeholder="Todas"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Disciplinas</label>
                  <MultiSelectFilter
                    label="Disciplinas"
                    options={availableDisciplines}
                    selectedValues={selectedDisciplines}
                    onSelectionChange={onDisciplinesChange}
                    placeholder="Todas"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Locais</label>
                  <MultiSelectFilter
                    label="Locais"
                    options={availableLocations}
                    selectedValues={selectedLocations}
                    onSelectionChange={onLocationsChange}
                    placeholder="Todos"
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Filtros inline para desktop */}
          <div className="hidden md:flex items-center gap-2">
            <MultiSelectFilter
              label="Semanas"
              options={availableWeeks}
              selectedValues={selectedWeeks}
              onSelectionChange={onWeeksChange}
              placeholder="Todas"
            />
            <MultiSelectFilter
              label="Disciplinas"
              options={availableDisciplines}
              selectedValues={selectedDisciplines}
              onSelectionChange={onDisciplinesChange}
              placeholder="Todas"
            />
            <MultiSelectFilter
              label="Locais"
              options={availableLocations}
              selectedValues={selectedLocations}
              onSelectionChange={onLocationsChange}
              placeholder="Todos"
            />
          </div>

          <Button 
            onClick={onExportPDF} 
            disabled={isExporting}
            variant="outline" 
            size="sm" 
            className="text-vale-blue hover:text-vale-blue hover:bg-blue-50 dark:hover:bg-blue-950 p-2 md:px-3"
          >
            <Download className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">
              {isExporting ? 'Exportando...' : 'Exportar PDF'}
            </span>
          </Button>
          <Button 
            onClick={onSignOut} 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 p-2 md:px-3"
          >
            <LogOut className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
