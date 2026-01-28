
-- Adicionar coluna deviation_type na tabela daily_reports
ALTER TABLE public.daily_reports 
ADD COLUMN deviation_type text;

-- Adicionar comentário na coluna
COMMENT ON COLUMN public.daily_reports.deviation_type IS 'Tipo de desvio reportado: falta-materiais, absenteismo, problema-equipamento, baixa-produtividade, burocracia, outros';
