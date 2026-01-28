
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateActivityForm } from "./CreateActivityForm";
import { ExcelUploadModal } from "./ExcelUploadModal";

interface CreateActivityModalProps {
  trigger?: React.ReactNode;
}

export function CreateActivityModal({
  trigger
}: CreateActivityModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleExcelUploadSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="bg-vale-blue hover:bg-vale-blue/90">
            <Plus className="w-4 h-4 mr-2" />
            Nova Atividade
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-inherit">
            Criar Nova Atividade
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Bulk Import Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              Importação em Lote
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <ExcelUploadModal 
                trigger={
                  <Button variant="outline" className="flex-1">
                    Baixar Modelo Excel
                  </Button>
                }
                onSuccess={handleExcelUploadSuccess}
              />
              <ExcelUploadModal 
                trigger={
                  <Button variant="outline" className="flex-1">
                    Importar Excel
                  </Button>
                }
                onSuccess={handleExcelUploadSuccess}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Baixe o modelo Excel, preencha com múltiplas atividades e importe em lote
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-gray-500 dark:text-gray-400">
                OU CRIE MANUALMENTE
              </span>
            </div>
          </div>

          {/* Manual Creation Form */}
          <CreateActivityForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
