
-- Criar tabela para armazenar fotos das atividades
CREATE TABLE public.activity_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para armazenar comentários das atividades
CREATE TABLE public.activity_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para subtarefas
CREATE TABLE public.activity_subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.activity_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_subtasks ENABLE ROW LEVEL SECURITY;

-- Políticas para activity_photos
CREATE POLICY "Users can view activity photos" 
  ON public.activity_photos 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert activity photos" 
  ON public.activity_photos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Políticas para activity_comments
CREATE POLICY "Users can view activity comments" 
  ON public.activity_comments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert activity comments" 
  ON public.activity_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Políticas para activity_subtasks
CREATE POLICY "Users can view activity subtasks" 
  ON public.activity_subtasks 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert activity subtasks" 
  ON public.activity_subtasks 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update activity subtasks" 
  ON public.activity_subtasks 
  FOR UPDATE 
  USING (true);

-- Criar storage bucket para fotos das atividades
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-photos', 'activity-photos', true);

-- Política para upload de fotos
CREATE POLICY "Users can upload activity photos"
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'activity-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view activity photos"
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'activity-photos');
