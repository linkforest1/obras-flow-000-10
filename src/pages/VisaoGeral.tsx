import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import pacote1Image from "@/assets/pacote1-overview.jpeg";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNavBar } from "@/components/BottomNavBar";

export default function VisaoGeral() {
  const { user } = useAuth();
  const [pacote, setPacote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPacote = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('pacote')
          .eq('id', user.id)
          .single();

        if (data) {
          setPacote(data.pacote);
        }
      }
      setLoading(false);
    };

    fetchUserPacote();
  }, [user]);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1">
            <div className="container mx-auto p-6 space-y-6">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-96 w-full" />
            </div>
          </main>
          <BottomNavBar />
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="container mx-auto p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
              <p className="text-muted-foreground mt-2">
                Informações gerais sobre o pacote
              </p>
            </div>

            {pacote === "Pacote 1" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Pacote 1 (RT-1000KN-M-500002)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="w-full">
                    <img 
                      src={pacote1Image} 
                      alt="Diagrama do Pacote 1" 
                      className="w-full h-auto rounded-lg border border-border"
                    />
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-foreground leading-relaxed">
                      Toda a montagem eletromecânica referente ao novo prédio do peneiramento 
                      secundário anexo (ED-1310KN-01) (incluso o novo tripper TR-1310KN126), bem 
                      como subestação (SE-1310KN-10), escritório/vestiário, ponto de ônibus, caminho 
                      seguro e oficina de caldeiraria. Atualmente, o pacote 1 está em execução a partir 
                      da mão de obra da empresa PAREX Engenharia S.A.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{pacote || "Informações do Pacote"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground text-lg">Em breve</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        <BottomNavBar />
      </div>
    </SidebarProvider>
  );
}
