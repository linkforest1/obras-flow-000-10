
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Calendar, CheckCircle2 } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";

interface IssuesCardsProps {
  selectedWeek: string;
}

export function IssuesCards({ selectedWeek }: IssuesCardsProps) {
  const { activities } = useActivities();

  if (!activities) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted animate-pulse rounded w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-8 mb-2" />
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const delayedActivities = activities.filter(a => a.status === 'delayed');
  const pendingActivities = activities.filter(a => a.status === 'pending');

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Atividades Atrasadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{delayedActivities.length}</div>
          <p className="text-sm text-muted-foreground">atividades com atraso</p>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 dark:border-yellow-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <Calendar className="w-5 h-5" />
            Atividades Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-600">{pendingActivities.length}</div>
          <p className="text-sm text-muted-foreground">atividades aguardando início</p>
        </CardContent>
      </Card>
    </div>
  );
}
