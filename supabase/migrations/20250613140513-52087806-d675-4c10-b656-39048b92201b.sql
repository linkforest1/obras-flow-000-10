
-- Criar tabela para os relatórios diários de obra (RDO)
CREATE TABLE public.daily_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  description TEXT,
  asset TEXT,
  activity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para fotos dos relatórios diários
CREATE TABLE public.daily_report_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_report_id UUID NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS (Row Level Security) para daily_reports
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- Política para visualizar próprios relatórios
CREATE POLICY "Users can view their own daily reports" 
  ON public.daily_reports 
  FOR SELECT 
  USING (auth.uid() = user_id);

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

-- Adicionar RLS para daily_report_photos
ALTER TABLE public.daily_report_photos ENABLE ROW LEVEL SECURITY;

-- Política para visualizar fotos de relatórios próprios
CREATE POLICY "Users can view photos of their own daily reports" 
  ON public.daily_report_photos 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.daily_reports 
    WHERE id = daily_report_photos.daily_report_id 
    AND user_id = auth.uid()
  ));

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

-- Criar bucket para fotos dos relatórios diários
INSERT INTO storage.buckets (id, name, public) 
VALUES ('daily-report-photos', 'daily-report-photos', true);

-- Política para permitir upload de fotos
CREATE POLICY "Allow users to upload daily report photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'daily-report-photos');

-- Política para permitir visualização de fotos
CREATE POLICY "Allow users to view daily report photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'daily-report-photos');

-- Política para permitir atualização de fotos
CREATE POLICY "Allow users to update daily report photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'daily-report-photos');

-- Política para permitir exclusão de fotos
CREATE POLICY "Allow users to delete daily report photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'daily-report-photos');

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_daily_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_reports_updated_at
  BEFORE UPDATE ON public.daily_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_reports_updated_at();
