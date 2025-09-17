
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import { useExcelActivities } from "@/hooks/useExcelActivities";
import { validateFileUpload } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface ExcelUploadModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ExcelUploadModal({ trigger, onSuccess }: ExcelUploadModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { downloadTemplate, uploadFile, isDownloading, isUploading } = useExcelActivities();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file security
      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        toast({
          title: "Arquivo inválido",
          description: validation.message,
          variant: "destructive"
        });
        // Clear the input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    await uploadFile(selectedFile, () => {
      setOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onSuccess?.();
    });
  };

  const handleDownloadTemplate = async () => {
    await downloadTemplate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar Excel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] p-0 dark:bg-gray-900">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Importar Atividades
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-4rem)] px-6 pb-6">
          <div className="space-y-6 mt-4">
            {/* Download Template */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full">
                <FileSpreadsheet className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">1. Baixar Modelo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Baixe o arquivo modelo Excel (.xlsx) com os campos necessários
                </p>
              </div>
              <Button 
                onClick={handleDownloadTemplate}
                disabled={isDownloading}
                variant="outline"
                className="w-full dark:border-gray-600 dark:hover:bg-gray-800"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Baixando...' : 'Baixar Modelo'}
              </Button>
            </div>

            <div className="border-t dark:border-gray-700 pt-6">
              {/* Upload File */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">2. Fazer Upload</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Selecione o arquivo Excel preenchido para importar
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="file-upload" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Arquivo Excel/CSV
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="mt-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                {selectedFile && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Arquivo selecionado:</strong> {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="flex-1 bg-vale-blue hover:bg-vale-blue/90"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Importando...' : 'Importar Atividades'}
                  </Button>
                  <Button 
                    onClick={() => setOpen(false)}
                    variant="outline"
                    className="flex-1 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>

        {/* Instructions */}
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p><strong>Instruções:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use o modelo Excel (.xlsx) baixado como base</li>
                <li>Preencha todas as colunas obrigatórias incluindo o pacote</li>
                <li>Formatos de data: AAAA-MM-DD (ex: 2024-01-15)</li>
                <li>Prioridade: low, medium, high</li>
                <li>Pacote: Pacote 1, Pacote 2, Pacote 3, Pacote 4, Pacote 5</li>
                <li>Aceita arquivos .csv, .xlsx, .xls</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
