
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { StatsOverview } from "@/components/StatsOverview";
import { ActivityCard } from "@/components/ActivityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CreateActivityModal } from "@/components/CreateActivityModal";
import { useActivities } from "@/hooks/useActivities";
import { BottomNavBar } from "@/components/BottomNavBar";
import { useMemo, useState } from "react";
import { startOfWeek, endOfWeek, parseISO, startOfDay, endOfDay } from 'date-fns';
import { FilterSheet } from "@/components/FilterSheet";
import { useFilters } from "@/contexts/FilterContext";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";

const Index = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { activities, loading } = useActivities();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { filters, setFilters } = useFilters();

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const displayedActivities = useMemo(() => {
    const hasFilters = Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true));
    let activitiesToFilter = activities;

    // Apply search filter
    if (searchTerm.trim()) {
      activitiesToFilter = activitiesToFilter.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.responsible?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.asset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.discipline?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (hasFilters) {
      activitiesToFilter = activitiesToFilter.filter(activity => {
        if (filters.status && filters.status.length > 0 && !filters.status.includes(activity.status)) return false;
        if (filters.week && filters.week.length > 0 && !filters.week.includes(String(activity.week))) return false;
        if (filters.asset && filters.asset.length > 0 && !filters.asset.includes(activity.asset)) return false;
        if (filters.responsible && filters.responsible.length > 0 && !filters.responsible.includes(activity.responsible)) return false;
        if (filters.location && filters.location.length > 0 && !filters.location.includes(activity.location)) return false;
        if (filters.discipline && filters.discipline.length > 0 && !filters.discipline.includes(activity.discipline)) return false;
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
    } else if (!searchTerm.trim()) {
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 });

      activitiesToFilter = activitiesToFilter.filter(activity => {
        if (!activity.startDate) return false;
        try {
          const activityDate = parseISO(activity.startDate);
          return activityDate >= weekStart && activityDate <= weekEnd;
        } catch (error) {
          console.error("Invalid date format for activity:", activity.id, activity.startDate);
          return false;
        }
      });
    }

    const statusOrder = {
      'in-progress': 1,
      'pending': 2,
      'delayed': 3,
      'completed': 4,
      'not-completed': 5
    };

    return [...activitiesToFilter].sort((a, b) => {
      const orderA = statusOrder[a.status as keyof typeof statusOrder] || 99;
      const orderB = statusOrder[b.status as keyof typeof statusOrder] || 99;
      return orderA - orderB;
    });
  }, [activities, filters, searchTerm]);

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

  const getDisplayTitle = () => {
    if (searchTerm.trim()) {
      return `Resultados da pesquisa: "${searchTerm}"`;
    }
    if (Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true))) {
      return 'Atividades Filtradas';
    }
    return 'Atividades da Semana';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-background pb-[60px] md:pb-0">
          <DashboardHeader user={user} onSignOut={handleSignOut} />

          <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto bg-background">
            <StatsOverview activities={displayedActivities} loading={loading} />

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg md:text-xl font-semibold text-foreground">
                  {getDisplayTitle()}
                </h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Buscar atividades..." 
                      className="pl-9 w-full sm:w-64 bg-background border-border text-foreground placeholder:text-muted-foreground" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto" 
                    onClick={() => setIsFilterSheetOpen(true)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="text-center text-muted-foreground py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vale-blue mx-auto mb-4"></div>
                  Carregando atividades...
                </div>
              ) : displayedActivities.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="mb-4">
                    {searchTerm.trim() 
                      ? `Nenhuma atividade encontrada para "${searchTerm}".`
                      : Object.values(filters).some(f => f) 
                        ? 'Nenhuma atividade encontrada para os filtros aplicados.' 
                        : 'Nenhuma atividade para a semana atual.'
                    }
                  </p>
                  <CreateActivityModal trigger={
                    <Button className="bg-vale-blue hover:bg-vale-blue/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar nova atividade
                    </Button>
                  } />
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {displayedActivities.map(activity => (
                    <ActivityCard key={activity.id} {...activity} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <BottomNavBar />
      <FilterSheet 
        open={isFilterSheetOpen} 
        onOpenChange={setIsFilterSheetOpen}
        activities={activities} 
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />
    </SidebarProvider>
  );
};

export default Index;
