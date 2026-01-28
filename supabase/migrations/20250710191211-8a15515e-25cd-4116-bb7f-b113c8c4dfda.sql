
-- Verificar se há dados no campo responsible_name
SELECT DISTINCT responsible_name 
FROM public.activities 
WHERE responsible_name IS NOT NULL 
AND responsible_name != '';

-- Verificar se há dados na tabela profiles que poderiam ser usados como encarregados
SELECT full_name, role 
FROM public.profiles 
WHERE full_name IS NOT NULL 
AND full_name != '';

-- Atualizar atividades que não têm responsible_name definido com dados dos profiles
UPDATE public.activities 
SET responsible_name = p.full_name
FROM public.profiles p
WHERE activities.responsible_name IS NULL 
AND p.role IN ('fiscal', 'gestor', 'admin', 'gestor_disciplina')
AND p.full_name IS NOT NULL;
