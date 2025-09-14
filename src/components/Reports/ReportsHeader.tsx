
import React from 'react';
import { Button } from "@/components/ui/button";
import { BarChart3, Download, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WeekFilter } from "@/components/WeekFilter";

interface ReportsHeaderProps {
  selectedWeek: string;
  onWeekChange: (week: string) => void;
  onExportPDF: () => void;
  onSignOut: () => void;
  isExporting: boolean;
}

export function ReportsHeader({ selectedWeek, onWeekChange, onExportPDF, onSignOut, isExporting }: ReportsHeaderProps) {
  return (
    <header className="bg-card border-b border-border p-3 md:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1 mr-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-base md:text-2xl font-bold text-foreground truncate flex items-center gap-2">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-vale-blue" />
              <span className="hidden sm:inline">Relatórios Gerenciais</span>
              <span className="sm:hidden">Relatórios</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              <span className="hidden sm:inline">Resumo executivo das atividades e métricas semanais</span>
              <span className="sm:hidden">Resumo semanal</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <div className="md:hidden">
            <ThemeToggle />
          </div>
          <WeekFilter selectedWeek={selectedWeek} onWeekChange={onWeekChange} />
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
