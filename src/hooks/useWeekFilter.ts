import { useMemo } from 'react';

interface WeekOption {
  value: string;
  label: string;
}

export function useWeekFilter(activities?: any[]) {
  const availableWeeks = useMemo<WeekOption[]>(() => {
    if (!activities || activities.length === 0) {
      return [];
    }

    const uniqueWeeks = [...new Set(
      activities
        .map(a => a.week)
        .filter(Boolean)
        .filter(week => week !== "")
    )];

    // Sort weeks numerically (descending - most recent first)
    const sortedWeeks = uniqueWeeks.sort((a, b) => {
      const numA = parseInt(String(a).replace(/\D/g, ''), 10);
      const numB = parseInt(String(b).replace(/\D/g, ''), 10);
      return numB - numA;
    });

    return sortedWeeks.map(week => ({
      value: String(week),
      label: `Semana ${week}`
    }));
  }, [activities]);

  return {
    availableWeeks,
    isLoading: false
  };
}
