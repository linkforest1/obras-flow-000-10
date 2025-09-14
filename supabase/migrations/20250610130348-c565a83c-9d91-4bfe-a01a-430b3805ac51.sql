
-- Remover políticas existentes que podem estar causando recursão
DROP POLICY IF EXISTS "Users can view activity assignments" ON public.activity_assignments;
DROP POLICY IF EXISTS "Users can insert activity assignments" ON public.activity_assignments;
DROP POLICY IF EXISTS "Users can update activity assignments" ON public.activity_assignments;

-- Remover políticas existentes das outras tabelas para recriar corretamente
DROP POLICY IF EXISTS "Users can view activity photos" ON public.activity_photos;
DROP POLICY IF EXISTS "Users can insert activity photos" ON public.activity_photos;
DROP POLICY IF EXISTS "Users can view activity comments" ON public.activity_comments;
DROP POLICY IF EXISTS "Users can insert activity comments" ON public.activity_comments;
DROP POLICY IF EXISTS "Users can view activity subtasks" ON public.activity_subtasks;
DROP POLICY IF EXISTS "Users can insert activity subtasks" ON public.activity_subtasks;
DROP POLICY IF EXISTS "Users can update activity subtasks" ON public.activity_subtasks;

-- Criar políticas simples e seguras para activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all activities" 
  ON public.activities 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert activities" 
  ON public.activities 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update activities" 
  ON public.activities 
  FOR UPDATE 
  USING (true);

-- Criar políticas simples para activity_assignments
CREATE POLICY "Users can view activity assignments" 
  ON public.activity_assignments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert activity assignments" 
  ON public.activity_assignments 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update activity assignments" 
  ON public.activity_assignments 
  FOR UPDATE 
  USING (true);

-- Recriar políticas para activity_photos
CREATE POLICY "Users can view activity photos" 
  ON public.activity_photos 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert activity photos" 
  ON public.activity_photos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Recriar políticas para activity_comments
CREATE POLICY "Users can view activity comments" 
  ON public.activity_comments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert activity comments" 
  ON public.activity_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Recriar políticas para activity_subtasks
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

-- Criar um projeto padrão se não existir
INSERT INTO public.projects (id, name, description, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Projeto Padrão', 'Projeto principal para atividades', 'active')
ON CONFLICT (id) DO NOTHING;

-- Recriar o bucket de fotos se necessário
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-photos', 'activity-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para storage
DROP POLICY IF EXISTS "Users can upload activity photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view activity photos" ON storage.objects;

CREATE POLICY "Users can upload activity photos"
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'activity-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view activity photos"
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'activity-photos');
