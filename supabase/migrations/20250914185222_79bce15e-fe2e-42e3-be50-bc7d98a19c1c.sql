-- Atualizar as RLS policies para filtrar por pacote do usuário
-- Primeiro, vamos atualizar a função para obter o pacote do usuário

CREATE OR REPLACE FUNCTION public.get_current_user_pacote()
RETURNS TEXT AS $$
  SELECT pacote FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Atualizar as policies existentes para considerar o pacote
-- Activities
DROP POLICY IF EXISTS "Users can view activities from their pacote" ON public.activities;
CREATE POLICY "Users can view activities from their pacote" 
ON public.activities 
FOR SELECT 
USING (pacote = get_current_user_pacote());

DROP POLICY IF EXISTS "Users can create activities in their pacote" ON public.activities;
CREATE POLICY "Users can create activities in their pacote" 
ON public.activities 
FOR INSERT 
WITH CHECK (pacote = get_current_user_pacote());

-- Activity comments
DROP POLICY IF EXISTS "Users can view comments from their pacote" ON public.activity_comments;
CREATE POLICY "Users can view comments from their pacote" 
ON public.activity_comments 
FOR SELECT 
USING (pacote = get_current_user_pacote());

-- Activity photos
DROP POLICY IF EXISTS "Users can view photos from their pacote" ON public.activity_photos;
CREATE POLICY "Users can view photos from their pacote" 
ON public.activity_photos 
FOR SELECT 
USING (pacote = get_current_user_pacote());

-- Daily reports
DROP POLICY IF EXISTS "Users can view reports from their pacote" ON public.daily_reports;
CREATE POLICY "Users can view reports from their pacote" 
ON public.daily_reports 
FOR SELECT 
USING (pacote = get_current_user_pacote());

-- Quality reports
DROP POLICY IF EXISTS "Users can view quality reports from their pacote" ON public.quality_reports;
CREATE POLICY "Users can view quality reports from their pacote" 
ON public.quality_reports 
FOR SELECT 
USING (pacote = get_current_user_pacote());

-- RDO entries
DROP POLICY IF EXISTS "Users can view rdo entries from their pacote" ON public.rdo_entries;
CREATE POLICY "Users can view rdo entries from their pacote" 
ON public.rdo_entries 
FOR SELECT 
USING (pacote = get_current_user_pacote());