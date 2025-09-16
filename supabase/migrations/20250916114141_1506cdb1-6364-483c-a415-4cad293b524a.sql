-- Ensure profile auto-creation and correct pacote for RLS to work
-- 1) Create/refresh trigger to populate public.profiles on new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2) Backfill missing profiles using auth metadata (pacote, role, full_name)
INSERT INTO public.profiles (id, email, full_name, role, pacote)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
  COALESCE(u.raw_user_meta_data ->> 'role', 'fiscal'),
  COALESCE(u.raw_user_meta_data ->> 'pacote', 'Pacote 1')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 3) Normalize pacote values to the canonical form 'Pacote N'
-- Convert common variants like 'pacote 3', 'PACOTE 3', '3', etc.
WITH normalized AS (
  SELECT id,
    CASE
      WHEN pacote ~* '^\s*pacote\s*[1-5]\s*$' THEN INITCAP(pacote)
      WHEN pacote ~* '^\s*[1-5]\s*$' THEN 'Pacote ' || pacote
      ELSE pacote
    END AS new_pacote
  FROM public.profiles
)
UPDATE public.profiles p
SET pacote = n.new_pacote
FROM normalized n
WHERE p.id = n.id AND p.pacote IS DISTINCT FROM n.new_pacote;

WITH normalized_act AS (
  SELECT id,
    CASE
      WHEN pacote ~* '^\s*pacote\s*[1-5]\s*$' THEN INITCAP(pacote)
      WHEN pacote ~* '^\s*[1-5]\s*$' THEN 'Pacote ' || pacote
      ELSE pacote
    END AS new_pacote
  FROM public.activities
)
UPDATE public.activities a
SET pacote = n.new_pacote
FROM normalized_act n
WHERE a.id = n.id AND a.pacote IS DISTINCT FROM n.new_pacote;