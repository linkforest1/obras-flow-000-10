import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { statusConfig } from "@/config/activity";
import { Filters } from "@/contexts/FilterContext";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: any[];
  onApplyFilters: (filters: Filters) => void;
  initialFilters?: Filters;
}

export function FilterSheet({
  open,
  onOpenChange,
  activities,
  onApplyFilters,
  initialFilters = {}
}: FilterSheetProps) {
  const [selectedStatus, setSelectedStatus] = React.useState<string[]>(initialFilters.status || []);
  const [selectedWeek, setSelectedWeek] = React.useState<string[]>(initialFilters.week || []);
  const [selectedAsset, setSelectedAsset] = React.useState<string[]>(initialFilters.asset || []);
  const [selectedResponsible, setSelectedResponsible] = React.useState<string[]>(initialFilters.responsible || []);
  const [selectedLocation, setSelectedLocation] = React.useState<string[]>(initialFilters.location || []);
  const [selectedDiscipline, setSelectedDiscipline] = React.useState<string[]>(initialFilters.discipline || []);
  const [date, setDate] = React.useState<DateRange | undefined>(initialFilters.dateRange);

  React.useEffect(() => {
    if (open) {
      setSelectedStatus(initialFilters.status || []);
      setSelectedWeek(initialFilters.week || []);
      setSelectedAsset(initialFilters.asset || []);
      setSelectedResponsible(initialFilters.responsible || []);
      setSelectedLocation(initialFilters.location || []);
      setSelectedDiscipline(initialFilters.discipline || []);
      setDate(initialFilters.dateRange);
    }
  }, [open, initialFilters]);

  // Handle the case when activities is undefined or null
  const safeActivities = activities || [];
  const uniqueWeeks = React.useMemo(() => [...new Set(safeActivities.map(a => a.week).filter(Boolean).filter(week => week !== ""))], [safeActivities]);
  const uniqueAssets = React.useMemo(() => [...new Set(safeActivities.map(a => a.asset).filter(Boolean).filter(asset => asset !== ""))], [safeActivities]);
  const uniqueResponsibles = React.useMemo(() => {
    console.log('Computing unique responsibles from activities:', safeActivities);
    const responsibles = [...new Set(safeActivities.map(a => a.responsible).filter(Boolean).filter(resp => resp !== "" && resp !== "Não especificado"))];
    console.log('Unique responsibles found:', responsibles);
    return responsibles;
  }, [safeActivities]);
  const uniqueLocations = React.useMemo(() => [...new Set(safeActivities.map(a => a.location).filter(Boolean).filter(loc => loc !== ""))], [safeActivities]);
  const uniqueDisciplines = React.useMemo(() => [...new Set(safeActivities.map(a => a.discipline).filter(Boolean).filter(disc => disc !== ""))], [safeActivities]);

  const statusOptions = Object.entries(statusConfig).map(([key, config]) => ({
    value: key,
    label: config.label
  }));

  const weekOptions = uniqueWeeks.map(week => ({
    value: week,
    label: `Semana ${week}`
  }));

  const assetOptions = uniqueAssets.map(asset => ({
    value: asset,
    label: asset
  }));

  const responsibleOptions = uniqueResponsibles.map(resp => ({
    value: resp,
    label: resp
  }));

  const locationOptions = uniqueLocations.map(loc => ({
    value: loc,
    label: loc
  }));

  const disciplineOptions = uniqueDisciplines.map(disc => ({
    value: disc,
    label: disc
  }));

  const handleApply = () => {
    onApplyFilters({
      status: selectedStatus.length > 0 ? selectedStatus : undefined,
      week: selectedWeek.length > 0 ? selectedWeek : undefined,
      asset: selectedAsset.length > 0 ? selectedAsset : undefined,
      responsible: selectedResponsible.length > 0 ? selectedResponsible : undefined,
      location: selectedLocation.length > 0 ? selectedLocation : undefined,
      discipline: selectedDiscipline.length > 0 ? selectedDiscipline : undefined,
      dateRange: date
    });
  };

  const handleClear = () => {
    setSelectedStatus([]);
    setSelectedWeek([]);
    setSelectedAsset([]);
    setSelectedResponsible([]);
    setSelectedLocation([]);
    setSelectedDiscipline([]);
    setDate(undefined);
    onApplyFilters({});
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Filtros de Atividades</SheetTitle>
          <SheetDescription>
            Refine sua busca de atividades aplicando os filtros abaixo.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 h-0">
          <div className="py-4 space-y-4 pr-4">
            <MultiSelectFilter
              label="Status"
              options={statusOptions}
              selectedValues={selectedStatus}
              onSelectionChange={setSelectedStatus}
              placeholder="Selecione os status"
            />

            <MultiSelectFilter
              label="Semana"
              options={weekOptions}
              selectedValues={selectedWeek}
              onSelectionChange={setSelectedWeek}
              placeholder="Selecione as semanas"
            />

            <MultiSelectFilter
              label="Ativo"
              options={assetOptions}
              selectedValues={selectedAsset}
              onSelectionChange={setSelectedAsset}
              placeholder="Selecione os ativos"
            />

            <MultiSelectFilter
              label="Encarregado"
              options={responsibleOptions}
              selectedValues={selectedResponsible}
              onSelectionChange={setSelectedResponsible}
              placeholder="Selecione os encarregados"
            />

            <MultiSelectFilter
              label="Local"
              options={locationOptions}
              selectedValues={selectedLocation}
              onSelectionChange={setSelectedLocation}
              placeholder="Selecione os locais"
            />

            <MultiSelectFilter
              label="Disciplina"
              options={disciplineOptions}
              selectedValues={selectedDiscipline}
              onSelectionChange={setSelectedDiscipline}
              placeholder="Selecione as disciplinas"
            />

            <div className="grid gap-2">
              <Label>Período da Atividade</Label>
              <Calendar
                mode="range"
                selected={date}
                onSelect={setDate}
                className="rounded-md border p-0"
                numberOfMonths={1}
              />
            </div>
          </div>
        </ScrollArea>
        
        <SheetFooter>
          <Button variant="outline" onClick={handleClear}>Limpar Filtros</Button>
          <SheetClose asChild>
            <Button onClick={handleApply}>Aplicar Filtros</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
