import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Calendar, FileText, AlertTriangle, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { useDailyReports } from "@/hooks/useDailyReports";
import { useActivities } from "@/hooks/useActivities";
import { useState } from "react";

interface EditDailyReportModalProps {
  report: {
    id: string;
    title: string;
    description?: string;
    asset?: string;
    activity_id?: string;
    report_date: string;
    deviation_type?: string;
    responsible?: string;
  };
  open: boolean;
  onClose: () => void;
}

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

export function EditDailyReportModal({ report, open, onClose }: EditDailyReportModalProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<DailyReportFormData>();
  const { updateReport, isUpdating } = useDailyReports();
  const { activities } = useActivities();
  const [activitySearch, setActivitySearch] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showActivitySuggestions, setShowActivitySuggestions] = useState(false);

  // Watch the activity_id, deviation_type, and responsible to ensure they're controlled properly
  const watchedActivityId = watch("activity_id");
  const watchedDeviationType = watch("deviation_type");
  const watchedResponsible = watch("responsible");

  // Filtrar atividades baseado na pesquisa
  const filteredActivities = activities?.filter(activity => 
    activity.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
    (activity.custom_id && activity.custom_id.toLowerCase().includes(activitySearch.toLowerCase()))
  ).slice(0, 5) || []; // Limitar a 5 resultados

  const handleActivitySelect = (activity: any) => {
    setSelectedActivity(activity);
    setActivitySearch(activity.title);
    setValue("activity_id", activity.id);
    setShowActivitySuggestions(false);
  };

  const handleActivitySearchChange = (value: string) => {
    setActivitySearch(value);
    setShowActivitySuggestions(value.length > 0);
    
    if (value === '') {
      setSelectedActivity(null);
      setValue("activity_id", '');
    }
  };

  useEffect(() => {
    if (open && report) {
      console.log('Setting form data for report:', report);
      
      // Buscar atividade associada se existir
      if (report.activity_id && activities) {
        const associatedActivity = activities.find(activity => activity.id === report.activity_id);
        if (associatedActivity) {
          setSelectedActivity(associatedActivity);
          setActivitySearch(associatedActivity.title);
        }
      } else {
        setSelectedActivity(null);
        setActivitySearch('');
      }
      
      reset({
        title: report.title,
        description: report.description || '',
        asset: report.asset || '',
        activity_id: report.activity_id || '',
        report_date: report.report_date,
        deviation_type: report.deviation_type || '',
        responsible: report.responsible || '',
      });
    }
  }, [open, report, reset, activities]);

  const onSubmit = async (data: DailyReportFormData) => {
    console.log('Submitting report update:', data);
    
    const reportData = {
      id: report.id,
      title: data.title,
      description: data.description || undefined,
      asset: data.asset || undefined,
      activity_id: data.activity_id || undefined,
      report_date: data.report_date,
      deviation_type: data.deviation_type || undefined,
      responsible: data.responsible || undefined,
    };

    console.log('Final report data:', reportData);

    updateReport(reportData);
    onClose();
  };

  const handleClose = () => {
    reset();
    setActivitySearch('');
    setSelectedActivity(null);
    setShowActivitySuggestions(false);
    onClose();
  };

  // Filter out activities with empty or invalid IDs
  const validActivities = activities?.filter(activity => activity.id && activity.id.trim() !== '') || [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Editar Relatório Diário
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
              <Select 
                value={watchedResponsible || undefined}
                onValueChange={(value) => setValue("responsible", value || '')}
              >
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
              <div className="relative mt-1">
                <Input
                  placeholder="Digite para buscar uma atividade..."
                  value={activitySearch}
                  onChange={(e) => handleActivitySearchChange(e.target.value)}
                  onFocus={() => setShowActivitySuggestions(activitySearch.length > 0)}
                  className="w-full"
                />
                
                {/* Sugestões de atividades */}
                {showActivitySuggestions && filteredActivities.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="px-3 py-2 hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
                        onClick={() => handleActivitySelect(activity)}
                      >
                        <div className="font-medium text-sm">{activity.title}</div>
                        {activity.custom_id && (
                          <div className="text-xs text-muted-foreground">ID: {activity.custom_id}</div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {activity.discipline} • {activity.responsible}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Atividade selecionada */}
                {selectedActivity && (
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{selectedActivity.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {selectedActivity.custom_id && `ID: ${selectedActivity.custom_id} • `}
                          {selectedActivity.discipline} • {selectedActivity.responsible}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedActivity(null);
                          setActivitySearch('');
                          setValue("activity_id", '');
                        }}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Mensagem quando não há resultados */}
                {showActivitySuggestions && activitySearch.length > 0 && filteredActivities.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-3">
                    <div className="text-sm text-muted-foreground text-center">
                      Nenhuma atividade encontrada para "{activitySearch}"
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Tipo de Desvio (Opcional)
              </Label>
              <Select 
                value={watchedDeviationType || undefined}
                onValueChange={(value) => setValue("deviation_type", value || '')}
              >
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
              disabled={isUpdating}
              className="flex-1 bg-vale-blue hover:bg-vale-blue/90 text-white"
            >
              {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
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