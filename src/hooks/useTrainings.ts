
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type TrainingVideo = {
  id: string;
  topic: string;
  title: string;
  url: string;
  description?: string | null;
  position?: number | null;
  created_by?: string | null;
  created_at?: string | null;
};

const YT_REGEXPS = [
  /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([\w-]{11})/i,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([\w-]{11})/i,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([\w-]{11})/i,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([\w-]{11})/i,
];

export function parseYouTubeId(url: string): string | null {
  if (!url) return null;
  for (const re of YT_REGEXPS) {
    const m = url.match(re);
    if (m && m[1]) return m[1];
  }
  // Fallback: try to read v= param
  try {
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v && v.length === 11) return v;
  } catch {}
  return null;
}

export function getEmbedUrl(idOrUrl: string): string | null {
  const id = idOrUrl.length === 11 ? idOrUrl : parseYouTubeId(idOrUrl);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}

export function getThumbnailUrl(idOrUrl: string): string | null {
  const id = idOrUrl.length === 11 ? idOrUrl : parseYouTubeId(idOrUrl);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function useTrainings() {
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("training_videos")
      .select("*")
      .order("topic", { ascending: true })
      .order("position", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching training videos:", error);
      setError(error.message);
      setLoading(false);
      return;
    }

    setVideos(data as TrainingVideo[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const addVideo = async (payload: { url: string; title?: string; topic: string; description?: string }) => {
    const embed = getEmbedUrl(payload.url);
    if (!embed) {
      toast({ title: "URL inválida", description: "Forneça uma URL válida do YouTube.", variant: "destructive" });
      return { error: new Error("invalid_url") };
    }

    const title = payload.title?.trim() || "Vídeo de Treinamento";
    const topic = payload.topic?.trim() || "Geral";

    const { data, error } = await supabase
      .from("training_videos")
      .insert({
        url: payload.url,
        title,
        topic,
        description: payload.description || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error inserting training video:", error);
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
      return { error };
    }

    toast({ title: "Vídeo adicionado", description: title });
    setVideos((prev) => [data as TrainingVideo, ...prev]);
    return { data };
  };

  const updateVideo = async (id: string, updates: Partial<TrainingVideo>) => {
    const { data, error } = await supabase
      .from("training_videos")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating training video:", error);
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      return { error };
    }

    setVideos((prev) => prev.map((v) => (v.id === id ? (data as TrainingVideo) : v)));
    toast({ title: "Vídeo atualizado" });
    return { data };
  };

  const deleteVideo = async (id: string) => {
    const { error } = await supabase.from("training_videos").delete().eq("id", id);
    if (error) {
      console.error("Error deleting training video:", error);
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return { error };
    }
    setVideos((prev) => prev.filter((v) => v.id !== id));
    toast({ title: "Vídeo removido" });
    return { data: true };
  };

  const topics = useMemo(() => {
    const set = new Set<string>();
    videos.forEach((v) => set.add(v.topic || "Geral"));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [videos]);

  const groupedByTopic = useMemo(() => {
    const groups: Record<string, TrainingVideo[]> = {};
    for (const v of videos) {
      const t = v.topic || "Geral";
      if (!groups[t]) groups[t] = [];
      groups[t].push(v);
    }
    for (const k of Object.keys(groups)) {
      groups[k] = groups[k].sort((a, b) => (a.position || 0) - (b.position || 0));
    }
    return groups;
  }, [videos]);

  return {
    videos,
    topics,
    groupedByTopic,
    loading,
    error,
    refetch: fetchVideos,
    addVideo,
    updateVideo,
    deleteVideo,
  };
}
