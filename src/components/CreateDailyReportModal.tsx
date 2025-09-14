
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building, Calendar, FileText, AlertTriangle, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { useDailyReports } from "@/hooks/useDailyReports";
import { useActivities } from "@/hooks/useActivities";

interface DailyReportFormData {
  title: string;
  description: string;
  asset: string;
  activity_id: string;
  report_date: string;
  deviation_type: string;
  responsible: string;
}

const deviationTypes = [
  { value: 'falta-materiais', label: 'Falta de materiais' },
  { value: 'atividade-fora-programacao', label: 'Atividade fora da programação' },
  { value: 'absenteismo', label: 'Absenteísmo (falta)' },
  { value: 'problema-equipamento', label: 'Problema com equipamento' },
  { value: 'baixa-produtividade', label: 'Baixa produtividade' },
  { value: 'burocracia', label: 'Burocracia (Ex: Liberação de plano de rigging, Liberação na portaria, etc.)' },
  { value: 'outros', label: 'Outros' }
];

const responsibleOptions = [
  { value: 'Vale', label: 'Vale' },
  { value: 'Contratada', label: 'Contratada' }
];

export function CreateDailyReportModal() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<DailyReportFormData>();
  const { createReport, isCreating } = useDailyReports();
  const { activities } = useActivities();

  const onSubmit = async (data: DailyReportFormData) => {
    const reportData = {
      title: data.title,
      description: data.description || undefined,
      asset: data.asset || undefined,
      activity_id: data.activity_id || undefined,
      report_date: data.report_date,
      deviation_type: data.deviation_type || undefined,
      responsible: data.responsible || undefined,
    };

    createReport(reportData, {
      onSuccess: () => {
        reset();
        setOpen(false);
      }
    });
  };

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  // Filter out activities with empty or invalid IDs
  const validActivities = activities?.filter(activity => activity.id && activity.id.trim() !== '') || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-vale-blue hover:bg-vale-blue/90 w-full sm:w-auto mx-0">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Novo Relatório</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            Criar Relatório de Desvio
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4 inline mr-1" />
                Título do Relatório *
              </Label>
              <Input
                id="title"
                placeholder="Ex: Relatório - Montagem Estrutural"
                {...register("title", { required: "Título é obrigatório" })}
                className="mt-1"
              />
              {errors.title && (
                <p className="text-sm text-vale-red mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="report_date" className="text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data do Relatório *
              </Label>
              <Input
                id="report_date"
                type="date"
                {...register("report_date", { required: "Data é obrigatória" })}
                defaultValue={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
              {errors.report_date && (
                <p className="text-sm text-vale-red mt-1">{errors.report_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="asset" className="text-sm font-medium text-gray-700">
                <Building className="w-4 h-4 inline mr-1" />
                Ativo (Opcional)
              </Label>
              <Input
                id="asset"
                placeholder="Ex: Equipamento A-001"
                {...register("asset")}
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">
                <User className="w-4 h-4 inline mr-1" />
                Responsável (Opcional)
              </Label>
              <Select onValueChange={(value) => setValue("responsible", value === "none" ? '' : value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum responsável</SelectItem>
                  {responsibleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">
                Atividade Associada (Opcional)
              </Label>
              <Select onValueChange={(value) => setValue("activity_id", value === "none" ? '' : value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma atividade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma atividade</SelectItem>
                  {validActivities.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Tipo de Desvio (Opcional)
              </Label>
              <Select onValueChange={(value) => setValue("deviation_type", value === "none" ? '' : value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um tipo de desvio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum desvio</SelectItem>
                  {deviationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descrição das Atividades do Dia
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva as atividades realizadas no dia, observações importantes, problemas encontrados, etc."
                {...register("description")}
                className="mt-1 min-h-[120px]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isCreating}
              className="flex-1 bg-vale-blue hover:bg-vale-blue/90 text-white"
            >
              {isCreating ? 'Criando...' : 'Criar Relatório'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
