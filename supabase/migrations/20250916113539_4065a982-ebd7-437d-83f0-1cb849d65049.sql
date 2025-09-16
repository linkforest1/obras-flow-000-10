-- Remover policies conflitantes que permitem ver todas as atividades
DROP POLICY IF EXISTS "Users can view all activities" ON public.activities;
DROP POLICY IF EXISTS "All authenticated users can view activities" ON public.activities;
DROP POLICY IF EXISTS "Todos podem visualizar atividades" ON public.activities;

-- Manter apenas a policy que filtra por pacote
-- Verificar se a policy de pacote existe, se não, criar
DO $$
BEGIN
    -- Remove any conflicting policies first
    DROP POLICY IF EXISTS "Users can view activities from their pacote" ON public.activities;
    
    -- Create the package-based policy
    CREATE POLICY "Users can view activities from their pacote" 
    ON public.activities 
    FOR SELECT 
    USING (pacote = get_current_user_pacote());
    
    RAISE NOTICE 'Package-based policy created successfully';
END $$;