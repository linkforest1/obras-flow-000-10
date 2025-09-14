
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, LogOut, Calendar, MapPin, User, Camera, MessageCircle, CheckCircle2, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CreateActivityModal } from "@/components/CreateActivityModal";
import { useActivities } from "@/hooks/useActivities";
import { ActivityDetailModal } from "@/components/ActivityDetailModal";
import { ViewActivityPhotosModal } from "@/components/ViewActivityPhotosModal";
import { EmployeeCountModal } from "@/components/EmployeeCountModal";
import { EmployeeDistributionModal } from "@/components/EmployeeDistributionModal";
import { updateActivityEmployeeCount } from "@/services/activityService";
import { useState, useMemo, useEffect } from "react";
import { BottomNavBar } from "@/components/BottomNavBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FilterSheet } from "@/components/FilterSheet";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import { statusConfig, priorityConfig } from "@/config/activity";
import { useFilters } from "@/contexts/FilterContext";
import { useSearchParams } from "react-router-dom";

const Activities = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { activities, loading, refetch } = useActivities();
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { filters, setFilters } = useFilters();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check if we need to open a specific activity from URL params
  useEffect(() => {
    const activityId = searchParams.get('activity');
    if (activityId && activities.length > 0) {
      const activity = activities.find(a => a.id === activityId);
      if (activity) {
        setSelectedActivity(activity);
        setShowPhotosModal(true);
        // Remove the activity parameter from URL
        searchParams.delete('activity');
        setSearchParams(searchParams);
      }
    }
  }, [activities, searchParams, setSearchParams]);

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Filtrar atividades por título e filtros aplicados
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      if (searchTerm && !activity.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Fixed filter logic to handle arrays properly
      if (filters.status && filters.status.length > 0 && !filters.status.includes(activity.status || '')) {
        return false;
      }
      if (filters.week && filters.week.length > 0 && !filters.week.includes(String(activity.week || ''))) {
        return false;
      }
      if (filters.asset && filters.asset.length > 0 && !filters.asset.includes(activity.asset || '')) {
        return false;
      }
      if (filters.responsible && filters.responsible.length > 0 && !filters.responsible.includes(activity.responsible || '')) {
        return false;
      }
      if (filters.location && filters.location.length > 0 && !filters.location.includes(activity.location || '')) {
        return false;
      }
      if (filters.discipline && filters.discipline.length > 0 && !filters.discipline.includes(activity.discipline || '')) {
        return false;
      }
      if (filters.dateRange?.from) {
        if (!activity.startDate) return false;
        try {
          const activityDate = parseISO(activity.startDate);
          const from = startOfDay(filters.dateRange.from);
          const to = filters.dateRange.to ? endOfDay(filters.dateRange.to) : endOfDay(from);
          return activityDate >= from && activityDate <= to;
        } catch (error) {
          console.error("Invalid date format for activity:", activity.id, activity.startDate);
          return false;
        }
      }
      return true;
    });
  }, [activities, searchTerm, filters]);

  // Calcular total de funcionários
  const totalEmployees = useMemo(() => {
    return activities.reduce((total, activity) => {
      if (activity.employeeCount) {
        const activityTotal = Object.values(activity.employeeCount).reduce((sum: number, count) => {
          return sum + (typeof count === 'number' ? count : 0);
        }, 0);
        return total + activityTotal;
      }
      return total;
    }, 0);
  }, [activities]);

  // Calcular distribuição de funcionários por função
  const employeeDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    activities.forEach(activity => {
      if (activity.employeeCount) {
        Object.entries(activity.employeeCount).forEach(([jobTitle, count]) => {
          const numCount = typeof count === 'number' ? count : 0;
          distribution[jobTitle] = (distribution[jobTitle] || 0) + numCount;
        });
      }
    });
    return distribution;
  }, [activities]);

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

  const handleActivityClick = (activity: any) => {
    setSelectedActivity(activity);
    setShowPhotosModal(true);
  };

  const handleEmployeeCountSave = async (activityId: string, employeeCount: Record<string, number>) => {
    try {
      await updateActivityEmployeeCount(activityId, employeeCount);
      toast({
        title: "Efetivo atualizado",
        description: "O efetivo de funcionários foi salvo com sucesso."
      });
      refetch(); // Refresh the activities list
    } catch (error) {
      console.error('Error updating employee count:', error);
      toast({
        title: "Erro ao salvar efetivo",
        description: "Ocorreu um erro ao salvar o efetivo. Tente novamente.",
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
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-vale-blue" />
                    <h1 className="text-base md:text-2xl font-bold text-foreground truncate">Atividades</h1>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    <span className="hidden sm:inline">Gerenciar todas as atividades do projeto</span>
                    <span className="sm:hidden">Atividades</span>
                    <span className="ml-2 text-vale-blue">
                      • {totalEmployees} funcionários alocados
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <div className="md:hidden">
                  <ThemeToggle />
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowDistributionModal(true)} className="hidden sm:flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Distribuição
                </Button>
                
                <CreateActivityModal />
                <Button onClick={handleSignOut} variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 p-2 md:px-3">
                  <LogOut className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto bg-background">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Buscar atividades..." 
                    className="pl-9 w-full sm:w-64 bg-background border-border text-foreground placeholder:text-muted-foreground" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                  />
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setIsFilterSheetOpen(true)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>

            {/* Activities List */}
            {loading ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vale-blue mx-auto mb-4"></div>
                Carregando atividades...
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="mb-4">
                  {searchTerm ? "Nenhuma atividade encontrada para a busca." : "Nenhuma atividade encontrada."}
                </p>
                {!searchTerm && (
                  <CreateActivityModal 
                    trigger={
                      <Button className="bg-vale-blue hover:bg-vale-blue/90">
                        Criar primeira atividade
                      </Button>
                    } 
                  />
                )}
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="divide-y divide-border">
                  {filteredActivities.map(activity => (
                    <div key={activity.id} className="p-4 hover:bg-accent transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleActivityClick(activity)}>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg md:text-xl text-foreground break-words whitespace-normal leading-tight">
                              {activity.title}
                            </h3>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 break-words whitespace-normal leading-relaxed">
                            {activity.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{activity.responsible || 'Não atribuído'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{activity.startDate} - {activity.endDate}</span>
                            </div>
                            {activity.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{activity.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>
                                 {activity.employeeCount ? (Object.values(activity.employeeCount) as number[]).reduce((sum: number, count: number) => {
                                   return sum + (typeof count === 'number' ? count : 0);
                                 }, 0) : 0} funcionários
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex flex-col items-end gap-2">
                          <div className="text-right">
                            <div className="text-sm font-medium text-vale-blue">
                              {activity.progress || 0}%
                            </div>
                            <div className="w-20 bg-muted rounded-full h-2 mt-1">
                              <div 
                                className="bg-vale-blue h-2 rounded-full" 
                                style={{ width: `${activity.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedActivity(activity);
                              setShowEmployeeModal(true);
                            }} 
                            className="text-xs"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            Efetivo
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomNavBar />

      {/* Modals */}
      {selectedActivity && (
        <>
          <ActivityDetailModal 
            open={showDetailModal} 
            onClose={() => {
              setShowDetailModal(false);
              setSelectedActivity(null);
            }} 
            activity={selectedActivity} 
          />

          <ViewActivityPhotosModal 
            open={showPhotosModal} 
            onClose={() => {
              setShowPhotosModal(false);
              setSelectedActivity(null);
            }} 
            activityId={selectedActivity.id} 
            activityTitle={selectedActivity.title} 
          />

          <EmployeeCountModal 
            open={showEmployeeModal} 
            onClose={() => {
              setShowEmployeeModal(false);
              setSelectedActivity(null);
            }} 
            title={selectedActivity.title} 
            initialEmployeeCount={selectedActivity.employeeCount || {}} 
            onSave={(employeeCount) => handleEmployeeCountSave(selectedActivity.id, employeeCount)} 
          />
        </>
      )}

      <EmployeeDistributionModal 
        open={showDistributionModal} 
        onClose={() => setShowDistributionModal(false)} 
        employeeDistribution={employeeDistribution} 
      />

      <FilterSheet 
        open={isFilterSheetOpen} 
        onOpenChange={setIsFilterSheetOpen} 
        activities={activities || []} 
        onApplyFilters={handleApplyFilters} 
        initialFilters={filters} 
      />
    </SidebarProvider>
  );
};

export default Activities;
