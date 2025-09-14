
-- Adicionar coluna para o nome do encarregado na tabela activities
ALTER TABLE public.activities 
ADD COLUMN responsible_name text;

-- Atualizar registros existentes para não deixar nulos se necessário
UPDATE public.activities 
SET responsible_name = 'Não especificado' 
WHERE responsible_name IS NULL;
