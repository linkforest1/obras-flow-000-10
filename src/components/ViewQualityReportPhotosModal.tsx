import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface QualityReportPhoto {
  id: string;
  photo_url: string;
  caption?: string;
  created_at: string;
}

interface ViewQualityReportPhotosModalProps {
  reportId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewQualityReportPhotosModal({ 
  reportId, 
  open, 
  onOpenChange 
}: ViewQualityReportPhotosModalProps) {
  const { data: photos, isLoading } = useQuery({
    queryKey: ['quality-report-photos', reportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quality_report_photos')
        .select('*')
        .eq('quality_report_id', reportId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as QualityReportPhoto[];
    },
    enabled: open && !!reportId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Fotos do Relatório de Qualidade</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="w-full h-48 mb-3" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
              ))}
            </div>
          ) : photos && photos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || "Foto do relatório"}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
                      Erro ao carregar imagem
                    </div>
                  </div>
                  {photo.caption && (
                    <div className="p-3">
                      <p className="text-sm text-muted-foreground">{photo.caption}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma foto encontrada para este relatório.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}