import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

interface RDODateFilterProps {
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
  dateRange?: DateRange;
}

export function RDODateFilter({ onDateRangeChange, dateRange }: RDODateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClearFilter = () => {
    onDateRangeChange(undefined);
    setIsOpen(false);
  };

  const formatDateRange = (range?: DateRange) => {
    if (!range?.from) return "Selecionar período";
    if (!range.to) return format(range.from, "dd/MM/yyyy", { locale: ptBR });
    return `${format(range.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(range.to, "dd/MM/yyyy", { locale: ptBR })}`;
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-vale-blue" />
          <h3 className="font-medium text-foreground">Filtrar por Data do Relatório</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal min-w-[200px]",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {formatDateRange(dateRange)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={1}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          
          {dateRange?.from && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilter}
              className="h-9 w-9 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}