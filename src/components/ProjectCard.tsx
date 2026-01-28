
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Plus, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AddTeamMemberModal } from "./AddTeamMemberModal";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProjectCardProps {
  project: any;
  onUpdate: () => void;
}

export const ProjectCard = ({ project, onUpdate }: ProjectCardProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const roleLabels = {
    gestor: 'Gestor',
    engenheiro: 'Engenheiro',
    fiscal: 'Fiscal'
  };

  const handleRemoveMember = async (memberId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Membro removido",
        description: "Membro removido da equipe com sucesso!"
      });
      onUpdate();
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover membro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-vale-blue" />
              {project.name}
            </CardTitle>
            <CardDescription>
              {project.description || "Sem descrição"}
            </CardDescription>
          </div>
          <Badge variant="secondary">{project.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(project.start_date || project.end_date) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {project.start_date && format(new Date(project.start_date), "dd/MM/yyyy", { locale: ptBR })}
              {project.start_date && project.end_date && " - "}
              {project.end_date && format(new Date(project.end_date), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Equipe ({project.team_members?.length || 0})
            </h4>
            <AddTeamMemberModal 
              projectId={project.id} 
              onMemberAdded={onUpdate}
              trigger={
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              }
            />
          </div>

          {project.team_members?.length > 0 ? (
            <div className="space-y-2">
              {project.team_members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {member.profiles?.full_name || member.profiles?.email || 'Nome não informado'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {roleLabels[member.role as keyof typeof roleLabels]} • {member.profiles?.email}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover membro</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover este membro da equipe? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={loading}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {loading ? "Removendo..." : "Remover"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum membro adicionado ainda.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
