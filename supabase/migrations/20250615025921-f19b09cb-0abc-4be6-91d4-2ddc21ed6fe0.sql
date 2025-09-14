
-- Remove o trigger se ele já existir, para evitar erros em caso de re-execução
DROP TRIGGER IF EXISTS set_activity_status_from_progress ON public.activities;

-- Cria a função que atualiza o status com base no progresso
CREATE OR REPLACE FUNCTION public.update_activity_status_from_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica se é uma inserção ou se a coluna 'progress' foi atualizada
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.progress IS DISTINCT FROM OLD.progress) THEN
        IF NEW.progress = 100 THEN
            NEW.status = 'completed';
        ELSIF NEW.progress > 0 AND NEW.progress < 100 THEN
            NEW.status = 'in-progress';
        ELSIF NEW.progress = 0 THEN
            NEW.status = 'pending';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria o trigger que executa a função antes de cada inserção ou atualização na tabela 'activities'
CREATE TRIGGER set_activity_status_from_progress
BEFORE INSERT OR UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.update_activity_status_from_progress();
