
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, Building2, LogOut, Calendar, MapPin, Users as UsersIcon, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { ProjectCard } from "@/components/ProjectCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNavBar } from "@/components/BottomNavBar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Team = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const pacoteOptions = [
    { value: "Pacote 1", label: "Pacote 1" },
    { value: "Pacote 2", label: "Pacote 2" },
    { value: "Pacote 3", label: "Pacote 3" },
    { value: "Pacote 4", label: "Pacote 4" },
    { value: "Pacote 5", label: "Pacote 5" },
  ];

  useEffect(() => {
    fetchProfile();
    fetchProjects();
    fetchProfiles();
  }, [user]);

  const fetchProfile = async () => {
    if (user) {
      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        console.log('Profile fetched:', data);
        setProfile(data);
      }
    }
  };

  const fetchProfiles = async () => {
    if (user && profile?.role === 'gestor') {
      console.log('Fetching profiles for gestor');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['fiscal', 'engenheiro'])
        .order('full_name');
      
      if (error) {
        console.error('Error fetching profiles:', error);
      } else {
        console.log('Profiles fetched:', data);
        setProfiles(data || []);
      }
    }
  };

  const fetchProjects = async () => {
    if (user) {
      console.log('Fetching projects for manager:', user.id);
      
      // Primeiro buscar os projetos do gestor
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('manager_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        toast({
          title: "Erro",
          description: "Erro ao carregar projetos. Tente novamente.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('Projects fetched:', projectsData);

      // Para cada projeto, buscar os membros da equipe
      const projectsWithMembers = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: members, error: membersError } = await supabase
            .from('team_members')
            .select(`
              id,
              role,
              user_id,
              profiles!team_members_user_id_fkey (
                full_name,
                email,
                role
              )
            `)
            .eq('project_id', project.id);

          if (membersError) {
            console.error('Error fetching members for project', project.id, ':', membersError);
            return { ...project, team_members: [] };
          }

          return { ...project, team_members: members || [] };
        })
      );

      console.log('Projects with members:', projectsWithMembers);
      setProjects(projectsWithMembers);
      setLoading(false);
    }
  };

  const handleEditProfile = (profileToEdit: any) => {
    setEditingProfile(profileToEdit.id);
    setEditData({
      role: profileToEdit.role,
      pacote: profileToEdit.pacote
    });
  };

  const handleSaveProfile = async () => {
    if (!editingProfile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: editData.role,
          pacote: editData.pacote
        })
        .eq('id', editingProfile);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "As informações do perfil foram atualizadas com sucesso."
      });

      setEditingProfile(null);
      setEditData({});
      fetchProfiles();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingProfile(null);
    setEditData({});
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const isGestor = profile?.role === 'gestor';

  console.log('Current user:', user?.id);
  console.log('Profile:', profile);
  console.log('Is gestor:', isGestor);
  console.log('Projects:', projects);
  console.log('Loading:', loading);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-background pb-[60px] md:pb-0">
          {/* Header */}
          <header className="bg-card border-b border-border p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1 mr-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-vale-blue" />
                    <h1 className="text-base md:text-2xl font-bold text-foreground truncate">Equipe</h1>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    <span className="hidden sm:inline">Gerenciar equipe e projetos</span>
                    <span className="sm:hidden">Equipe</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <div className="md:hidden">
                  <ThemeToggle />
                </div>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 p-2 md:px-3">
                  <LogOut className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto bg-background">
            {!isGestor ? (
              <Card>
                <CardHeader>
                  <CardTitle>Acesso Restrito</CardTitle>
                  <CardDescription>
                    Apenas usuários com perfil de "gestor" podem acessar esta página.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : loading ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vale-blue mx-auto mb-4"></div>
                Carregando projetos...
              </div>
            ) : projects.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Nenhum projeto encontrado
                  </CardTitle>
                  <CardDescription>
                    Você ainda não criou nenhum projeto. Crie seu primeiro projeto para começar a gerenciar sua equipe.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateProjectModal 
                    onProjectCreated={fetchProjects}
                    trigger={
                      <Button className="bg-vale-blue hover:bg-vale-blue/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar primeiro projeto
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Meus Projetos</h2>
                  <CreateProjectModal onProjectCreated={fetchProjects} />
                </div>
                
                {/* Gestão de Perfis */}
                {isGestor && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Gerenciar Equipe
                      </CardTitle>
                      <CardDescription>
                        Edite perfis e pacotes dos membros da equipe
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {profiles.length > 0 ? (
                        <div className="space-y-3">
                          {profiles.map((profile) => (
                            <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium">{profile.full_name}</p>
                                <p className="text-sm text-muted-foreground">{profile.email}</p>
                                {editingProfile === profile.id ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                    <div>
                                      <Label className="text-xs">Função</Label>
                                      <Select value={editData.role} onValueChange={(value) => setEditData({...editData, role: value})}>
                                        <SelectTrigger className="h-8">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="fiscal">Fiscal</SelectItem>
                                          <SelectItem value="engenheiro">Engenheiro</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Pacote</Label>
                                      <Select value={editData.pacote} onValueChange={(value) => setEditData({...editData, pacote: value})}>
                                        <SelectTrigger className="h-8">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {pacoteOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                              {option.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-2 mt-1">
                                    <Badge variant="outline">{profile.role}</Badge>
                                    <Badge variant="secondary">{profile.pacote}</Badge>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {editingProfile === profile.id ? (
                                  <>
                                    <Button size="sm" onClick={handleSaveProfile} className="h-8">
                                      <Save className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8">
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button size="sm" variant="outline" onClick={() => handleEditProfile(profile)} className="h-8">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhum perfil de fiscal ou engenheiro encontrado
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Desktop List View / Mobile Grid View */}
                <div className="md:space-y-4 grid gap-6 md:gap-0 md:grid-cols-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:lg:grid-cols-1">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} onUpdate={fetchProjects} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomNavBar />
    </SidebarProvider>
  );
};

export default Team;
