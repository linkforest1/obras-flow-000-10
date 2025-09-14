-- Habilitar RLS na tabela timeline
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para timeline
CREATE POLICY "Users can view timeline activities" 
ON public.timeline 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update timeline status" 
ON public.timeline 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can insert timeline activities" 
ON public.timeline 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can delete timeline activities" 
ON public.timeline 
FOR DELETE 
USING (true);