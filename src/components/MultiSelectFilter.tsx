
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ChevronDown, X, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MultiSelectFilterProps {
  label: string;
  options: {
    value: string;
    label: string;
  }[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Selecionar..."
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startScrollTop, setStartScrollTop] = useState(0);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleValueToggle = (value: string) => {
    const newValues = selectedValues.includes(value) 
      ? selectedValues.filter(v => v !== value) 
      : [...selectedValues, value];
    onSelectionChange(newValues);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartScrollTop(scrollAreaRef.current?.scrollTop || 0);
    e.preventDefault();
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging || !scrollAreaRef.current) return;
    
    const deltaY = e.clientY - startY;
    const newScrollTop = startScrollTop - deltaY;
    
    scrollAreaRef.current.scrollTop = Math.max(0, Math.min(newScrollTop, scrollAreaRef.current.scrollHeight - scrollAreaRef.current.clientHeight));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, startY, startScrollTop]);

  // Reset search when popover closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} selecionados`;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={isOpen} 
            className="w-full justify-between"
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{label}</span>
              {selectedValues.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearAll} 
                  className="h-6 px-2 text-xs"
                >
                  Limpar todos
                </Button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 h-8"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div 
            ref={scrollAreaRef}
            className="h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            onPointerDown={handlePointerDown}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'pan-y' }}
          >
            <div className="p-2 space-y-1">
              {filteredOptions.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 text-center">
                  Nenhum item encontrado
                </div>
              ) : (
                filteredOptions.map(option => (
                  <div 
                    key={option.value} 
                    onClick={(e) => {
                      if (!isDragging) {
                        handleValueToggle(option.value);
                      }
                      e.stopPropagation();
                    }} 
                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer select-none"
                  >
                    <Checkbox 
                      checked={selectedValues.includes(option.value)} 
                      onChange={() => handleValueToggle(option.value)} 
                    />
                    <label className="text-sm cursor-pointer flex-1 pointer-events-none">
                      {option.label}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedValues.map(value => {
            const option = options.find(opt => opt.value === value);
            return (
              <Badge key={value} variant="secondary" className="text-xs">
                {option?.label || value}
                <button 
                  onClick={() => handleValueToggle(value)} 
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
