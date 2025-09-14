
-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Users can view their own daily reports" ON public.daily_reports;
DROP POLICY IF EXISTS "Users can create their own daily reports" ON public.daily_reports;
DROP POLICY IF EXISTS "Users can update their own daily reports" ON public.daily_reports;
DROP POLICY IF EXISTS "Users can delete their own daily reports" ON public.daily_reports;
DROP POLICY IF EXISTS "Users can view photos of their own daily reports" ON public.daily_report_photos;
DROP POLICY IF EXISTS "Users can add photos to their own daily reports" ON public.daily_report_photos;
DROP POLICY IF EXISTS "Users can update photos of their own daily reports" ON public.daily_report_photos;
DROP POLICY IF EXISTS "Users can delete photos of their own daily reports" ON public.daily_report_photos;

-- Garantir que RLS esteja habilitado
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_report_photos ENABLE ROW LEVEL SECURITY;

-- Política para visualizar próprios relatórios OU ser gestor
CREATE POLICY "Users can view their own daily reports or managers can view all" 
  ON public.daily_reports 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'gestor'
    )
  );

-- Política para criar próprios relatórios
CREATE POLICY "Users can create their own daily reports" 
  ON public.daily_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para atualizar próprios relatórios
CREATE POLICY "Users can update their own daily reports" 
  ON public.daily_reports 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para deletar próprios relatórios
CREATE POLICY "Users can delete their own daily reports" 
  ON public.daily_reports 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Política para visualizar fotos de relatórios próprios OU ser gestor
CREATE POLICY "Users can view photos of their own daily reports or managers can view all" 
  ON public.daily_report_photos 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.daily_reports 
      WHERE id = daily_report_photos.daily_report_id 
      AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'gestor'
    )
  );

-- Política para adicionar fotos aos próprios relatórios
CREATE POLICY "Users can add photos to their own daily reports" 
  ON public.daily_report_photos 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.daily_reports 
    WHERE id = daily_report_photos.daily_report_id 
    AND user_id = auth.uid()
  ));

-- Política para atualizar fotos dos próprios relatórios
CREATE POLICY "Users can update photos of their own daily reports" 
  ON public.daily_report_photos 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.daily_reports 
    WHERE id = daily_report_photos.daily_report_id 
    AND user_id = auth.uid()
  ));

-- Política para deletar fotos dos próprios relatórios
CREATE POLICY "Users can delete photos of their own daily reports" 
  ON public.daily_report_photos 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.daily_reports 
    WHERE id = daily_report_photos.daily_report_id 
    AND user_id = auth.uid()
  ));
