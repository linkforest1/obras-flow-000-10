
-- Adicionar coluna employee_count para armazenar dados de efetivo na tabela activities
ALTER TABLE public.activities 
ADD COLUMN employee_count JSONB DEFAULT '{}';

-- Criar índice para melhorar performance de consultas no JSONB
CREATE INDEX idx_activities_employee_count ON public.activities USING GIN (employee_count);

-- Comentário explicativo da coluna
COMMENT ON COLUMN public.activities.employee_count IS 'Armazena o efetivo de funcionários por cargo em formato JSON';
