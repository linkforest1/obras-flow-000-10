import { Calendar, Home, Users, Settings, BarChart3, AlertTriangle, CheckCircle2, FileText, PlayCircle, Camera } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
export const menuItems = [{
  title: "Dashboard",
  url: "/",
  icon: Home
}, {
  title: "Atividades",
  url: "/atividades",
  icon: CheckCircle2
}, {
  title: "Desvios",
  url: "/rdo",
  icon: FileText
}, {
  title: "Cronograma",
  url: "/cronograma",
  icon: Calendar
}, {
  title: "Treinamentos",
  url: "/treinamentos",
  icon: PlayCircle
}, {
  title: "Qualidade Brafer",
  url: "/qualidade-brafer",
  icon: Camera
}, {
  title: "Relatórios",
  url: "/relatorios",
  icon: BarChart3
}, {
  title: "Equipe",
  url: "/equipe",
  icon: Users
}, {
  title: "Alertas",
  url: "/alertas",
  icon: AlertTriangle
}];
const roleLabels = {
  admin: 'Administrador',
  gestor: 'Gestor',
  engenheiro: 'Engenheiro',
  fiscal: 'Fiscal de Obra',
  encarregado: 'Encarregado',
  cliente: 'Cliente'
};
export function AppSidebar() {
  const {
    user
  } = useAuth();
  const {
    theme
  } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const {
          data,
          error
        } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
        }
      }
    };
    fetchProfile();
  }, [user]);

  // Função para gerar iniciais do nome
  const getInitials = (name: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name[0].toUpperCase();
    }
    return 'U';
  };
  const displayName = profile?.full_name || user?.email || 'Usuário';
  const userRole = profile?.role || 'fiscal';
  const roleLabel = roleLabels[userRole as keyof typeof roleLabels] || 'Fiscal de Obra';
  const handleNavigation = (url: string) => {
    navigate(url);
  };

  // Escolher o ícone baseado no tema
  const logoSrc = theme === 'dark' ? "/lovable-uploads/b7e157d8-4fdf-481b-a8f1-866ca4bc3623.png" : "/lovable-uploads/eaf23cdd-0c79-48bf-a188-139350a878af.png";
  return <Sidebar className="border-r border-sidebar-border hidden md:flex">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 py-0 my-0 px-[10px]">
          <img src={logoSrc} alt="ObrasFlow Logo" className="w-20 h-20 object-contain transition-all duration-300" />
          <div className="flex-1"></div>
          <ThemeToggle />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 px-3">Navegação Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className={`hover:bg-sidebar-accent cursor-pointer ${location.pathname === item.url ? 'bg-sidebar-accent' : ''}`} onClick={() => handleNavigation(item.url)}>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-vale-blue text-white text-sm">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-sidebar-foreground">
              {displayName}
            </p>
            <p className="text-xs text-sidebar-foreground/70">{roleLabel}</p>
          </div>
          <Settings className="w-4 h-4 text-sidebar-foreground/70 cursor-pointer hover:text-sidebar-foreground" />
        </div>
      </SidebarFooter>
    </Sidebar>;
}