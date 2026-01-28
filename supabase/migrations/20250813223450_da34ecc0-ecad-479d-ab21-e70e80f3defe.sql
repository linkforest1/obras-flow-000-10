-- Create quality_reports table
CREATE TABLE public.quality_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cwp TEXT NOT NULL,
  tag_peca TEXT NOT NULL,
  eixo TEXT,
  elevacao TEXT,
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quality_report_photos table
CREATE TABLE public.quality_report_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quality_report_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quality_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_report_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for quality_reports
CREATE POLICY "Users can view all quality reports" 
ON public.quality_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own quality reports" 
ON public.quality_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quality reports" 
ON public.quality_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quality reports" 
ON public.quality_reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for quality_report_photos
CREATE POLICY "Users can view all quality report photos" 
ON public.quality_report_photos 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create photos for their quality reports" 
ON public.quality_report_photos 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.quality_reports 
  WHERE id = quality_report_photos.quality_report_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can update photos of their quality reports" 
ON public.quality_report_photos 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.quality_reports 
  WHERE id = quality_report_photos.quality_report_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can delete photos of their quality reports" 
ON public.quality_report_photos 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.quality_reports 
  WHERE id = quality_report_photos.quality_report_id 
  AND user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quality_reports_updated_at
BEFORE UPDATE ON public.quality_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for quality report photos
INSERT INTO storage.buckets (id, name, public) VALUES ('quality-report-photos', 'quality-report-photos', true);

-- Create storage policies
CREATE POLICY "Quality report images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'quality-report-photos');

CREATE POLICY "Users can upload quality report photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'quality-report-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their quality report photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'quality-report-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their quality report photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'quality-report-photos' AND auth.uid()::text = (storage.foldername(name))[1]);