import React, { useMemo } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNavBar } from "@/components/BottomNavBar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, LogOut, Clock, CheckCircle, Play, Square } from "lucide-react";
import { useTimeline } from "@/hooks/useTimeline";
const statusConfig = {
  'concluido': {
    label: 'Concluído',
    icon: CheckCircle,
    variant: 'default' as const,
    className: 'bg-green-500 hover:bg-green-600 text-white'
  },
  'em-andamento': {
    label: 'Em Andamento',
    icon: Play,
    variant: 'secondary' as const,
    className: 'bg-blue-500 hover:bg-blue-600 text-white'
  },
  'nao-iniciado': {
    label: 'Não Iniciado',
    icon: Square,
    variant: 'outline' as const,
    className: 'bg-gray-500 hover:bg-gray-600 text-white'
  }
};
export default function Timeline() {
  const {
    signOut
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    activities,
    loading,
    updateActivityStatus
  } = useTimeline();
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
  const handleStatusChange = async (id: number, newStatus: 'concluido' | 'em-andamento' | 'nao-iniciado') => {
    await updateActivityStatus(id, newStatus);
    toast({
      title: "Status atualizado",
      description: `Atividade marcada como ${statusConfig[newStatus].label.toLowerCase()}`
    });
  };

  // Agrupar atividades por mês
  const activitiesByMonth = useMemo(() => {
    const grouped: Record<string, typeof activities> = {};
    activities.forEach(activity => {
      const month = activity.Mes || 'Sem mês definido';
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(activity);
    });
    return grouped;
  }, [activities]);

  // Calcular estatísticas resumidas
  const stats = useMemo(() => {
    const total = activities.length;
    const concluidas = activities.filter(a => a.status === 'concluido').length;
    const emAndamento = activities.filter(a => a.status === 'em-andamento').length;
    const naoIniciadas = activities.filter(a => a.status === 'nao-iniciado').length;
    return {
      total,
      concluidas,
      emAndamento,
      naoIniciadas,
      percentualConcluido: total > 0 ? Math.round(concluidas / total * 100) : 0
    };
  }, [activities]);
  const months = Object.keys(activitiesByMonth).sort((a, b) => {
    const order = ['janeiro', 'fevereiro', 'março', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const parse = (s: string) => {
      const n = normalize(s);
      const numMatch = n.match(/\b(1[0-2]|0?[1-9])\b/);
      if (numMatch) return parseInt(numMatch[0].padStart(2, '0'), 10) - 1;
      const found = order.findIndex(m => n.includes(m));
      return found >= 0 ? found : 99;
    };
    const ai = parse(a);
    const bi = parse(b);
    if (ai !== 99 || bi !== 99) return ai - bi;
    return a.localeCompare(b, 'pt-BR');
  });
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-background pb-[60px] md:pb-0">
          {/* Header */}
          <header className="bg-card border-b border-border p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1 mr-2">
                <div className="min-w-0 flex-1">
                  <h1 className="text-base md:text-2xl font-bold text-foreground truncate flex items-center gap-2">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-vale-blue" />
                    <span className="hidden sm:inline">Cronograma de Atividades</span>
                    <span className="sm:hidden">Cronograma</span>
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    <span className="hidden sm:inline">Acompanhe o progresso das atividades por mês</span>
                    <span className="sm:hidden">Progresso por mês</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <div className="md:hidden">
                  <ThemeToggle />
                </div>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 p-2 md:px-3">
                  <LogOut className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {loading ? <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vale-blue mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando cronograma...</p>
              </div> : <>
                {/* Estatísticas Resumidas */}
                <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
                  <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total de Atividades
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Concluídas
                      </CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{stats.concluidas}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Em Andamento
                      </CardTitle>
                      <Play className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{stats.emAndamento}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Progresso
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{stats.percentualConcluido}%</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Atividades por Mês */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">Atividades por Mês</h2>
                  
                  {months.length === 0 ? <Card className="bg-card border-border">
                      <CardContent className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">Nenhuma atividade encontrada no cronograma</p>
                      </CardContent>
                    </Card> : months.map(month => <div key={month} className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-vale-blue" />
                          {month}
                          <Badge variant="secondary" className="ml-2">
                            {activitiesByMonth[month].length} atividade{activitiesByMonth[month].length !== 1 ? 's' : ''}
                          </Badge>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {activitiesByMonth[month].map(activity => {
                    const currentStatus = activity.status;
                    const config = statusConfig[currentStatus];
                    return <Card key={activity.ID} className="bg-card border-border hover:shadow-md transition-shadow h-64 flex flex-col">
                                <CardHeader className="pb-3 shrink-0">
                                  <div className="flex items-start justify-between">
                                    <CardTitle className="text-sm font-medium text-foreground break-words" title={activity.Atividade || `Atividade ${activity.ID}`}>
                                      {activity.Atividade || `Atividade ${activity.ID}`}
                                    </CardTitle>
                                    <Badge variant="outline" className="text-xs">
                                      ID: {activity.ID}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                
                                <CardContent className="min-h-0 flex-1 overflow-y-auto space-y-3">
                                  <div className="flex items-center gap-2">
                                    <config.icon className="w-4 h-4" />
                                    <span className="text-sm text-muted-foreground">
                                      Status: {config.label}
                                    </span>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(statusConfig).map(([status, statusConf]) => <Button key={status} size="sm" variant={currentStatus === status ? 'default' : 'outline'} className={`text-xs h-7 ${currentStatus === status ? statusConf.className : ''}`} onClick={() => handleStatusChange(activity.ID, status as 'concluido' | 'em-andamento' | 'nao-iniciado')}>
                                        <statusConf.icon className="w-3 h-3 mr-1" />
                                        {statusConf.label}
                                      </Button>)}
                                  </div>
                                </CardContent>
                              </Card>;
                  })}
                        </div>
                      </div>)}
                </div>
              </>}
          </div>
        </main>
      </div>
      <BottomNavBar />
    </SidebarProvider>;
}