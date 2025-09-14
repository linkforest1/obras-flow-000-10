import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { createActivityInDB } from "@/services/activityService";
import { useActivityInteractions } from "@/hooks/useActivityInteractions";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CreateActivityFormProps {
  onSuccess: () => void;
}

export function CreateActivityForm({ onSuccess }: CreateActivityFormProps) {
  const [formData, setFormData] = useState({
    customId: "",
    title: "",
    description: "",
    discipline: "",
    location: "",
    priority: "medium",
    responsible_name: "",
    asset: "",
    week: "",
    pacote: "",
  });
  
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createdActivityId, setCreatedActivityId] = useState<string | null>(null);
  const [idCopied, setIdCopied] = useState(false);
  
  const { toast } = useToast();
  const { uploadPhoto } = useActivityInteractions();
  const { user } = useAuth();
  const [userPacote, setUserPacote] = useState<string>("");

  // Buscar o pacote do usuário logado
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('pacote')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          setUserPacote(data.pacote);
          setFormData(prev => ({ ...prev, pacote: data.pacote }));
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const copyIdToClipboard = async () => {
    if (createdActivityId) {
      try {
        await navigator.clipboard.writeText(createdActivityId);
        setIdCopied(true);
        toast({
          title: "ID copiado!",
          description: "O ID da atividade foi copiado para a área de transferência.",
        });
        setTimeout(() => setIdCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível copiar o ID.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título da atividade é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const activityData = {
        ...formData,
        custom_id: formData.customId.trim() || undefined,
        start_date: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        end_date: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      };

      const createdActivity = await createActivityInDB(activityData);
      
      // Upload image if selected
      if (selectedFile && createdActivity) {
        await uploadPhoto(createdActivity.id, selectedFile);
      }

      // Store the created activity ID to display
      setCreatedActivityId(createdActivity.id);

      toast({
        title: "Atividade criada!",
        description: `A atividade foi criada com sucesso. ${formData.customId ? `ID personalizado: ${formData.customId}, ` : ''}ID do sistema: ${createdActivity.id}`,
      });

      // Reset form but keep showing the ID
      setFormData({
        customId: "",
        title: "",
        description: "",
        discipline: "",
        location: "",
        priority: "medium",
        responsible_name: "",
        asset: "",
        week: "",
        pacote: userPacote,
      });
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedFile(null);

      onSuccess();
    } catch (error: any) {
      console.error('Error creating activity:', error);
      
      // Handle unique constraint violation for custom_id
      if (error.message && error.message.includes('unique_custom_id')) {
        toast({
          title: "Erro ao criar atividade",
          description: "Este ID de atividade já existe. Por favor, escolha um ID diferente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao criar atividade",
          description: error.message || "Ocorreu um erro inesperado.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Display created activity ID */}
      {createdActivityId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-800">Atividade Criada com Sucesso!</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-green-600">ID do Sistema:</span>
                <code className="bg-green-100 px-2 py-1 rounded text-sm text-green-800 font-mono">
                  {createdActivityId}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyIdToClipboard}
                  className="h-8 w-8 p-0"
                >
                  {idCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-green-600" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="customId">ID da Atividade</Label>
          <Input
            id="customId"
            value={formData.customId}
            onChange={(e) => setFormData({ ...formData, customId: e.target.value })}
            placeholder="Ex: ACT-001 (opcional)"
          />
          <p className="text-xs text-gray-500 mt-1">
            ID personalizado para facilitar identificação (opcional e deve ser único)
          </p>
        </div>

        <div>
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Inspeção de equipamentos"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva os detalhes da atividade..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="discipline">Disciplina</Label>
          <Input
            id="discipline"
            value={formData.discipline}
            onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
            placeholder="Ex: Mecânica"
          />
        </div>

        <div>
          <Label htmlFor="location">Local</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Ex: Bloco A"
          />
        </div>

        <div>
          <Label htmlFor="priority">Prioridade</Label>
          <Select onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="responsible_name">Responsável</Label>
          <Input
            id="responsible_name"
            value={formData.responsible_name}
            onChange={(e) => setFormData({ ...formData, responsible_name: e.target.value })}
            placeholder="Nome do responsável"
          />
        </div>

        <div>
          <Label htmlFor="asset">Ativo</Label>
          <Input
            id="asset"
            value={formData.asset}
            onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
            placeholder="Ex: Equipamento X"
          />
        </div>

        <div>
          <Label htmlFor="week">Semana</Label>
          <Input
            id="week"
            value={formData.week}
            onChange={(e) => setFormData({ ...formData, week: e.target.value })}
            placeholder="Ex: Semana 42"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date > (endDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Data de Término</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date < (startDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label htmlFor="pacote">Pacote</Label>
          <Input
            id="pacote"
            value={formData.pacote}
            disabled
            className="bg-muted"
            placeholder="Pacote será definido automaticamente"
          />
          <p className="text-xs text-gray-500 mt-1">
            O pacote é definido automaticamente com base no seu perfil
          </p>
        </div>

        <div>
          <Label htmlFor="image">Anexar Imagem</Label>
          <div className="flex items-center gap-2">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <Upload className="w-4 h-4 text-gray-400" />
          </div>
          {selectedFile && (
            <p className="text-sm text-gray-600 mt-1">
              Arquivo selecionado: {selectedFile.name}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Criando Atividade..." : "Criar Atividade"}
          </Button>
        </div>
      </form>
    </div>
  );
}
