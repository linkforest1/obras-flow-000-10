
-- Remove a restrição de unicidade da coluna custom_id para permitir duplicatas
ALTER TABLE activities DROP CONSTRAINT IF EXISTS unique_custom_id;
