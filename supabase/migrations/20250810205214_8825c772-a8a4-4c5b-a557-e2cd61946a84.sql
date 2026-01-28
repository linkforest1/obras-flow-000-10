
-- Atualizar política para permitir que gestores editem qualquer relatório
DROP POLICY IF EXISTS "Users can update their own daily reports" ON public.daily_reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.daily_reports;

CREATE POLICY "Users can update their own reports or managers can edit any" 
ON public.daily_reports 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'gestor'
  ))
);

-- Também atualizar política para fotos dos relatórios
DROP POLICY IF EXISTS "Users can update photos of their own daily reports" ON public.daily_report_photos;

CREATE POLICY "Users can update photos of their own reports or managers can edit any" 
ON public.daily_report_photos 
FOR UPDATE 
USING (
  (EXISTS (
    SELECT 1 
    FROM daily_reports 
    WHERE daily_reports.id = daily_report_photos.daily_report_id 
    AND daily_reports.user_id = auth.uid()
  )) OR 
  (EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'gestor'
  ))
);
