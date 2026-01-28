
-- Criar tabela para vídeos de treinamento
CREATE TABLE IF NOT EXISTS public.training_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  position INT DEFAULT 0,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.training_videos ENABLE ROW LEVEL SECURITY;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_training_videos_topic_position 
ON public.training_videos (topic, position);

CREATE INDEX IF NOT EXISTS idx_training_videos_created_at 
ON public.training_videos (created_at DESC);

-- Políticas RLS
CREATE POLICY "authenticated can select" 
ON public.training_videos 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "owner can insert" 
ON public.training_videos 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "owner can update" 
ON public.training_videos 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by) 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "owner can delete" 
ON public.training_videos 
FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);
