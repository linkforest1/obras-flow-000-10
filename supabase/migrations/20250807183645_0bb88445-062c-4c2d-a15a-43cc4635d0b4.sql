-- Adicionar campo status na tabela timeline para permitir controle de status das atividades
ALTER TABLE public.timeline 
ADD COLUMN status TEXT DEFAULT 'nao-iniciado' CHECK (status IN ('concluido', 'em-andamento', 'nao-iniciado'));