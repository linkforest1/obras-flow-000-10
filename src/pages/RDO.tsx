
import React, { useState, useMemo } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CreateDailyReportModal } from "@/components/CreateDailyReportModal";
import { DailyReportCard } from "@/components/DailyReportCard";
import { RDODateFilter } from "@/components/RDODateFilter";
import { useDailyReports } from "@/hooks/useDailyReports";
import { FileText, Calendar, LogOut } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO } from "date-fns";

export default function RDO() {
  const { reports, isLoading } = useDailyReports();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Filter reports based on date range
  const filteredReports = useMemo(() => {
    if (!reports || !dateRange?.from) return reports;

    return reports.filter(report => {
      const reportDate = parseISO(report.report_date);
      
      if (dateRange.to) {
        // If we have both from and to dates, check if report date is within range
        return isWithinInterval(reportDate, {
          start: dateRange.from,
          end: dateRange.to
        });
      } else {
        // If we only have from date, check if report date is the same day
        return reportDate.toDateString() === dateRange.from.toDateString();
      }
    });
  }, [reports, dateRange]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-background pb-[60px] md:pb-0">
          {/* Header */}
          <header className="bg-card border-b border-border p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1 mr-2">
                <div className="min-w-0 flex-1">
                  <h1 className="text-base md:text-2xl font-bold text-foreground truncate flex items-center gap-2">
                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-vale-blue" />
                    <span className="hidden sm:inline">Relatório de Desvios da Programação</span>
                    <span className="sm:hidden">Desvios</span>
                  </h1>
                   <p className="text-xs md:text-sm text-muted-foreground truncate">
                     <span className="hidden sm:inline">Registre e acompanhe desvios na programação</span>
                     <span className="sm:hidden">Registro de desvios</span>
                   </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <div className="md:hidden">
                  <ThemeToggle />
                </div>
                <CreateDailyReportModal />
                <Button onClick={handleSignOut} variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 p-2 md:px-3">
                  <LogOut className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <RDODateFilter 
              onDateRangeChange={setDateRange}
              dateRange={dateRange}
            />
            
            <div className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vale-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando desvios...</p>
                  </div>
                </div>
              ) : filteredReports && filteredReports.length > 0 ? (
                <div className="grid gap-4 sm:gap-6">
                  {filteredReports.map((report) => (
                    <DailyReportCard key={report.id} report={report} />
                  ))}
                </div>
              ) : reports && reports.length > 0 && dateRange?.from ? (
                <div className="text-center py-12 px-4">
                  <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum desvio encontrado no período selecionado
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    Tente ajustar o filtro de data ou limpar os filtros para ver todos os desvios.
                  </p>
                </div>
              ) : (
                 <div className="text-center py-12 px-4">
                   <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                   <h3 className="text-lg font-medium text-gray-900 mb-2">
                     Nenhum desvio registrado
                   </h3>
                   <p className="text-gray-600 mb-6 text-sm sm:text-base">
                     Comece criando seu primeiro relatório de desvio da programação.
                   </p>
                   <CreateDailyReportModal />
                 </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <BottomNavBar />
    </SidebarProvider>
  );
}
