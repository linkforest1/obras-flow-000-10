import { useMemo } from 'react';

interface DisciplineOption {
  value: string;
  label: string;
}

export function useDisciplineFilter(activities?: any[]) {
  const availableDisciplines = useMemo<DisciplineOption[]>(() => {
    if (!activities || activities.length === 0) {
      return [];
    }

    const uniqueDisciplines = [...new Set(
      activities
        .map(a => a.discipline)
        .filter(Boolean)
        .filter(disc => disc !== "")
    )].sort();

    return uniqueDisciplines.map(discipline => ({
      value: String(discipline),
      label: String(discipline)
    }));
  }, [activities]);

  return {
    availableDisciplines,
    isLoading: false
  };
}