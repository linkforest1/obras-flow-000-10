
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DateRange } from "react-day-picker";

export interface Filters {
  status?: string[];
  week?: string[];
  asset?: string[];
  responsible?: string[];
  location?: string[];
  discipline?: string[];
  dateRange?: DateRange;
}

interface FilterContextType {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider = ({ children }: FilterProviderProps) => {
  const [filters, setFilters] = useState<Filters>({});

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, clearFilters }}>
      {children}
    </FilterContext.Provider>
  );
};
