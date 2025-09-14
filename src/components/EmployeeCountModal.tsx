
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

const jobTitles = [
  'Ajudante',
  'Caldeireiro', 
  'Carpinteiro',
  'Eletricista FC',
  'Eletricista montador',
  'Encanador industrial',
  'Encarregado de andaime',
  'Encarregado de caldeiraria',
  'Encarregado de civil',
  'Encarregado de elétrica',
  'Encarregado de estruturas',
  'Encarregado de mecânica',
  'Encarregado de pintura',
  'Instrumentista',
  'Lixador',
  'Mecânico ajustador',
  'Mestre de elétrica',
  'Montador de andaime',
  'Montador de equipamentos',
  'Montador de estruturas',
  'Pedreiro',
  'Pintor industrial',
  'Soldador de chaparia',
  'Soldador MIG',
  'Soldador TIG'
];

interface EmployeeCountModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  initialEmployeeCount?: Record<string, number>;
  onSave: (employeeCount: Record<string, number>) => void;
}

export function EmployeeCountModal({ 
  open, 
  onClose, 
  title, 
  initialEmployeeCount = {}, 
  onSave 
}: EmployeeCountModalProps) {
  const [employeeCount, setEmployeeCount] = useState<Record<string, number>>(initialEmployeeCount);

  const updateCount = (jobTitle: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setEmployeeCount(prev => ({
      ...prev,
      [jobTitle]: Math.max(0, numValue)
    }));
  };

  const getTotalEmployees = () => {
    return Object.values(employeeCount).reduce((sum, count) => sum + count, 0);
  };

  const handleSave = () => {
    onSave(employeeCount);
    onClose();
  };

  const handleClose = () => {
    setEmployeeCount(initialEmployeeCount);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Efetivo de Funcionários - {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <p className="text-sm font-medium">
              Total de funcionários: <span className="text-lg font-bold text-blue-600">{getTotalEmployees()}</span>
            </p>
          </div>

          <div className="grid gap-3">
            {jobTitles.map((jobTitle) => (
              <div key={jobTitle} className="flex items-center gap-3 p-3 border rounded-lg">
                <Label className="text-sm font-medium flex-1">{jobTitle}</Label>
                <div className="w-20">
                  <Input
                    type="number"
                    min="0"
                    value={employeeCount[jobTitle] || 0}
                    onChange={(e) => updateCount(jobTitle, e.target.value)}
                    className="text-center"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Users className="w-4 h-4 mr-2" />
              Salvar Efetivo
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
