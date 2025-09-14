-- Verificar e adicionar coluna pacote nas tabelas que ainda não têm
-- Tabela profiles já existe, vamos verificar se tem a coluna pacote
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pacote text NOT NULL DEFAULT 'Pacote 1';

-- Verificar outras tabelas que podem precisar da coluna pacote
-- Baseado no contexto, parece que algumas já têm, mas vou garantir que todas tenham

-- Para tabelas relacionadas a desvios/RDO que podem não ter
ALTER TABLE rdo_entries ADD COLUMN IF NOT EXISTS pacote text NOT NULL DEFAULT 'Pacote 1';
ALTER TABLE rdo_photos ADD COLUMN IF NOT EXISTS pacote text NOT NULL DEFAULT 'Pacote 1';

-- Atualizar todos os registros existentes para garantir que tenham Pacote 1
UPDATE profiles SET pacote = 'Pacote 1' WHERE pacote IS NULL OR pacote = '';
UPDATE activities SET pacote = 'Pacote 1' WHERE pacote IS NULL OR pacote = '';
UPDATE activity_comments SET pacote = 'Pacote 1' WHERE pacote IS NULL OR pacote = '';
UPDATE activity_photos SET pacote = 'Pacote 1' WHERE pacote IS NULL OR pacote = '';
UPDATE daily_reports SET pacote = 'Pacote 1' WHERE pacote IS NULL OR pacote = '';
UPDATE daily_report_photos SET pacote = 'Pacote 1' WHERE pacote IS NULL OR pacote = '';
UPDATE quality_reports SET pacote = 'Pacote 1' WHERE pacote IS NULL OR pacote = '';
UPDATE quality_report_photos SET pacote = 'Pacote 1' WHERE pacote IS NULL OR pacote = '';
UPDATE rdo_entries SET pacote = 'Pacote 1' WHERE pacote IS NULL OR pacote = '';
UPDATE rdo_photos SET pacote = 'Pacote 1' WHERE pacote IS NULL OR pacote = '';