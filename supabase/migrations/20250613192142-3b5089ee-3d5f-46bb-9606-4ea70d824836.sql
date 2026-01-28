
-- Adicionar colunas asset e week na tabela activities
ALTER TABLE public.activities 
ADD COLUMN asset text,
ADD COLUMN week text;
