
-- Adicionar coluna custom_id na tabela activities
ALTER TABLE public.activities 
ADD COLUMN custom_id TEXT;

-- Criar índice para melhor performance nas buscas por custom_id
CREATE INDEX idx_activities_custom_id ON public.activities(custom_id);

-- Adicionar constraint para garantir que custom_id seja único quando não for nulo
ALTER TABLE public.activities 
ADD CONSTRAINT unique_custom_id UNIQUE (custom_id);
