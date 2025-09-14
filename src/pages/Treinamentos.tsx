import { useEffect, useMemo, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNavBar } from "@/components/BottomNavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PlayCircle, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrainings, getEmbedUrl, getThumbnailUrl, TrainingVideo } from "@/hooks/useTrainings";

const Treinamentos = () => {
  const { toast } = useToast();
  const { videos, topics, groupedByTopic, loading, error, addVideo, deleteVideo } = useTrainings();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("Geral");
  const [selected, setSelected] = useState<TrainingVideo | null>(null);

  useEffect(() => {
    document.title = "Treinamentos | ObrasFlow";
    const meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = 'Treinamentos da plataforma: assista vídeos e aprenda a usar o ObrasFlow.';
      document.head.appendChild(m);
    } else {
      meta.setAttribute('content', 'Treinamentos da plataforma: assista vídeos e aprenda a usar o ObrasFlow.');
    }
  }, []);

  useEffect(() => {
    if (!selected && videos.length > 0) {
      setSelected(videos[0]);
    }
  }, [videos, selected]);

  const handleQuickAdd = async () => {
    if (!url.trim()) {
      toast({ title: "Cole a URL do YouTube", variant: "destructive" });
      return;
    }
    const { error } = await addVideo({ url, title, topic });
    if (!error) {
      setUrl("");
      setTitle("");
    }
  };

  const totals = useMemo(() => ({
    totalVideos: videos.length,
    totalTopics: topics.length,
  }), [videos.length, topics.length]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-background pb-[60px] md:pb-0">
          {/* Header */}
          <header className="bg-card border-b border-border p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-2xl font-bold text-foreground flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 md:w-6 md:h-6 text-vale-blue" />
                  Treinamentos
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">Aprenda a utilizar a plataforma com vídeos curtos</p>
              </div>
              <div className="flex items-center gap-2"></div>
            </div>
          </header>

          <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto bg-background">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-muted-foreground">Total de Vídeos</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{totals.totalVideos}</CardContent>
              </Card>
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-muted-foreground">Tópicos</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{totals.totalTopics}</CardContent>
              </Card>
            </div>

            {/* Quick add */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    placeholder="Cole a URL do YouTube"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-background border-border"
                  />
                  <Input
                    placeholder="Título (opcional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background border-border"
                  />
                  <Input
                    placeholder="Tópico (ex: Introdução, Relatórios)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-background border-border"
                  />
                  <Button onClick={handleQuickAdd} className="bg-vale-blue hover:bg-vale-blue/90">
                    <Plus className="w-4 h-4 mr-2" /> Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Player */}
            {selected && (
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-base md:text-lg">{selected.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <AspectRatio ratio={16 / 9}>
                    <iframe
                      src={getEmbedUrl(selected.url) || undefined}
                      title={selected.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full rounded-md border border-border"
                    />
                  </AspectRatio>
                </CardContent>
              </Card>
            )}

            {/* List by topic */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Conteúdo por tópico</h2>
              {loading ? (
                <div className="text-center text-muted-foreground py-8">Carregando vídeos...</div>
              ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
              ) : videos.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Nenhum vídeo cadastrado ainda.</div>
              ) : (
                <Accordion type="multiple" className="w-full">
                  {Object.keys(groupedByTopic).map((t) => (
                    <AccordionItem value={t} key={t}>
                      <AccordionTrigger className="text-left">{t}</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                          {groupedByTopic[t].map((v) => (
                            <Card key={v.id} className="overflow-hidden flex flex-col">
                              <div className="relative">
                                <img
                                  src={getThumbnailUrl(v.url) || ''}
                                  alt={`Miniatura do vídeo ${v.title}`}
                                  className="w-full h-40 object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <CardHeader className="py-3">
                                <CardTitle className="text-sm font-medium break-words min-h-[2.5rem]">{v.title}</CardTitle>
                              </CardHeader>
                              <CardContent className="mt-auto flex items-center justify-between gap-2">
                                <Button size="sm" className="bg-vale-blue hover:bg-vale-blue/90" onClick={() => setSelected(v)}>
                                  <PlayCircle className="w-4 h-4 mr-2" /> Assistir
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => deleteVideo(v.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </section>
          </div>
        </main>
      </div>
      <BottomNavBar />
    </SidebarProvider>
  );
};

export default Treinamentos;
