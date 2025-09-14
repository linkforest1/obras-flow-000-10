
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Clock, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";
import { useMemo } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  progress?: number;
  className?: string;
}

function StatCard({ title, value, icon: Icon, description, trend, progress, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-xl md:text-2xl font-bold">{value}</div>
        {description && <div className="mt-1">{description}</div>}
        {trend && (
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            {trend.isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3 text-vale-green" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-vale-red" />
            )}
            <span className={trend.isPositive ? "text-vale-green" : "text-vale-red"}>
              {trend.value}%
            </span>
            <span className="ml-1 hidden sm:inline">em relação à semana anterior</span>
          </div>
        )}
        {progress !== undefined && (
          <div className="mt-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{progress}% concluído</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsOverviewProps {
  activities: any[];
  loading: boolean;
}

export function StatsOverview({ activities, loading }: StatsOverviewProps) {
  const stats = useMemo(() => {
    if (!activities || activities.length === 0) {
      return {
        completed: 0,
        inProgress: 0,
        pending: 0,
        completedLate: 0,
        notCompleted: 0,
        totalProgress: 0,
      };
    }

    // Baseado nos status da base de dados
    const completed = activities.filter(activity => activity.status === 'completed').length;
    const inProgress = activities.filter(activity => activity.status === 'in-progress').length;
    const pending = activities.filter(activity => activity.status === 'pending').length;
    const completedLate = activities.filter(activity => activity.status === 'delayed').length;
    const notCompleted = activities.filter(activity => activity.status === 'not-completed').length;

    // Calcular progresso geral
    const totalProgress = activities.length > 0 
      ? Math.round(activities.reduce((acc, activity) => acc + (activity.progress || 0), 0) / activities.length)
      : 0;

    return {
      completed,
      inProgress,
      pending,
      completedLate,
      notCompleted,
      totalProgress,
    };
  }, [activities]);

  if (loading) {
    return (
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const completionRate = activities.length > 0 
    ? Math.round(((stats.completed + stats.completedLate) / activities.length) * 100)
    : 0;

  return (
    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Concluídas"
        value={stats.completed}
        icon={CheckCircle2}
        description={
          <p className="text-xs text-muted-foreground">
            {completionRate}% do total
          </p>
        }
        trend={{ value: 12, isPositive: true }}
        className="border-l-4 border-l-vale-green"
      />
      
      <StatCard
        title="Em Andamento"
        value={stats.inProgress}
        icon={Clock}
        description={
          <p className="text-xs text-muted-foreground">
            atividades em execução
          </p>
        }
        className="border-l-4 border-l-blue-500"
      />
      
      <StatCard
        title="Não Iniciadas"
        value={stats.pending}
        icon={AlertTriangle}
        description={
          <p className="text-xs text-muted-foreground">
            aguardando início
          </p>
        }
        className="border-l-4 border-l-vale-yellow"
      />
      
      <StatCard
        title="Concluídas com Atraso"
        value={stats.completedLate}
        icon={Calendar}
        description={
          <p className="text-xs text-muted-foreground">
            finalizadas com atraso
          </p>
        }
        className="border-l-4 border-l-purple-500"
      />

      <StatCard
        title="Não Concluídas"
        value={stats.notCompleted}
        icon={AlertTriangle}
        description={
          <p className="text-xs text-muted-foreground">
            requerem atenção
          </p>
        }
        className="border-l-4 border-l-vale-red"
      />
    </div>
  );
}
