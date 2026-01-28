import { useMemo } from 'react';

interface LocationOption {
  value: string;
  label: string;
}

export function useLocationFilter(activities?: any[]) {
  const availableLocations = useMemo<LocationOption[]>(() => {
    if (!activities || activities.length === 0) {
      return [];
    }

    const uniqueLocations = [...new Set(
      activities
        .map(a => a.location)
        .filter(Boolean)
        .filter(loc => loc !== "")
    )].sort();

    return uniqueLocations.map(location => ({
      value: String(location),
      label: String(location)
    }));
  }, [activities]);

  return {
    availableLocations,
    isLoading: false
  };
}
