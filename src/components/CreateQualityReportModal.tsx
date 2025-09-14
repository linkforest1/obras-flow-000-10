import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateQualityReport } from "@/hooks/useQualityReports";
import { toast } from "@/hooks/use-toast";
import { Camera, Upload } from "lucide-react";

interface CreateQualityReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateQualityReportModal({ open, onOpenChange }: CreateQualityReportModalProps) {
  const [formData, setFormData] = useState({
    cwp: '',
    tag_peca: '',
    eixo: '',
    elevacao: '',
    descricao: '',
    fotos: [] as File[]
  });

  const createReport = useCreateQualityReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cwp || !formData.tag_peca) {
      toast({
        title: "Erro",
        description: "CWP e TAG da peça são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      await createReport.mutateAsync({
        cwp: formData.cwp,
        tag_peca: formData.tag_peca,
        eixo: formData.eixo || null,
        elevacao: formData.elevacao || null,
        descricao: formData.descricao || null,
        fotos: formData.fotos
      });

      toast({
        title: "Sucesso",
        description: "Relatório de qualidade criado com sucesso"
      });

      // Reset form
      setFormData({
        cwp: '',
        tag_peca: '',
        eixo: '',
        elevacao: '',
        descricao: '',
        fotos: []
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar relatório de qualidade",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, fotos: files }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Relatório de Qualidade</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cwp">CWP *</Label>
            <Input
              id="cwp"
              value={formData.cwp}
              onChange={(e) => setFormData(prev => ({ ...prev, cwp: e.target.value }))}
              placeholder="Digite o CWP"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag_peca">TAG da Peça *</Label>
            <Input
              id="tag_peca"
              value={formData.tag_peca}
              onChange={(e) => setFormData(prev => ({ ...prev, tag_peca: e.target.value }))}
              placeholder="Digite a TAG da peça"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eixo">Eixo</Label>
              <Input
                id="eixo"
                value={formData.eixo}
                onChange={(e) => setFormData(prev => ({ ...prev, eixo: e.target.value }))}
                placeholder="Ex: A1, B2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="elevacao">Elevação</Label>
              <Input
                id="elevacao"
                value={formData.elevacao}
                onChange={(e) => setFormData(prev => ({ ...prev, elevacao: e.target.value }))}
                placeholder="Ex: +15.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição do Problema</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva o problema de qualidade encontrado (descolamento, corrosão, etc.)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fotos">Fotos</Label>
            <div className="flex items-center gap-2">
              <Input
                id="fotos"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label htmlFor="fotos" className="cursor-pointer">
                <Button type="button" variant="outline" className="gap-2" asChild>
                  <span>
                    <Camera className="w-4 h-4" />
                    Adicionar Fotos
                  </span>
                </Button>
              </Label>
              {formData.fotos.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {formData.fotos.length} foto(s) selecionada(s)
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createReport.isPending}
              className="flex-1"
            >
              {createReport.isPending ? "Criando..." : "Criar Relatório"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}