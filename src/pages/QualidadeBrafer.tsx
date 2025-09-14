import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNavBar } from "@/components/BottomNavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Camera, Eye } from "lucide-react";
import { CreateQualityReportModal } from "@/components/CreateQualityReportModal";
import { QualityReportCard } from "@/components/QualityReportCard";
import { useQualityReports } from "@/hooks/useQualityReports";

export default function QualidadeBrafer() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: reports, isLoading } = useQualityReports();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <main className="flex-1 p-4 space-y-6 overflow-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Qualidade Brafer</h1>
                <p className="text-muted-foreground">Relatórios fotográficos de estruturas metálicas</p>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Relatório
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reports?.length || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reports?.filter(r => r.status === 'pending').length || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reports?.filter(r => r.status === 'resolved').length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reports List */}
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Qualidade</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Carregando relatórios...</div>
                ) : reports?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum relatório de qualidade encontrado.
                    <br />
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      onClick={() => setShowCreateModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar primeiro relatório
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reports?.map((report) => (
                      <QualityReportCard key={report.id} report={report} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>

      <BottomNavBar />
      
      <CreateQualityReportModal 
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </SidebarProvider>
  );
}