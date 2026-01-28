
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddTeamMemberModalProps {
  projectId: string;
  onMemberAdded: () => void;
  trigger?: React.ReactNode;
}

export const AddTeamMemberModal = ({ projectId, onMemberAdded, trigger }: AddTeamMemberModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchAvailableProfiles();
    }
  }, [open, projectId]);

  const fetchAvailableProfiles = async () => {
    try {
      // Buscar perfis que não estão no projeto atual
      const { data: existingMembers } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('project_id', projectId);

      const existingUserIds = existingMembers?.map(member => member.user_id) || [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${existingUserIds.join(',')})`)
        .in('role', ['engenheiro', 'fiscal']);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar perfis disponíveis.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedRole) {
      toast({
        title: "Erro",
        description: "Selecione um usuário e uma função.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          project_id: projectId,
          user_id: selectedUserId,
          role: selectedRole
        });

      if (error) throw error;

      toast({
        title: "Membro adicionado",
        description: "Membro adicionado à equipe com sucesso!"
      });

      setSelectedUserId("");
      setSelectedRole("");
      setOpen(false);
      onMemberAdded();
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar membro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-vale-blue hover:bg-vale-blue/90">
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Membro
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
          <DialogDescription>
            Selecione um perfil da base de dados para adicionar ao projeto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Usuário</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    <div className="flex flex-col">
                      <span>{profile.full_name || profile.email}</span>
                      <span className="text-xs text-muted-foreground">{profile.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {profiles.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum perfil disponível para adicionar.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Função no Projeto</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engenheiro">Engenheiro</SelectItem>
                <SelectItem value="fiscal">Fiscal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedUserId || !selectedRole}
              className="bg-vale-blue hover:bg-vale-blue/90"
            >
              {loading ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
