-- Drop the overly permissive policy that allows public access to quality reports
DROP POLICY IF EXISTS "Users can view all quality reports" ON public.quality_reports;

-- Ensure the restrictive policy exists (already in place, but verifying)
-- This policy restricts access to users within the same 'pacote' only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'quality_reports' 
    AND policyname = 'Users can view quality reports from their pacote'
  ) THEN
    CREATE POLICY "Users can view quality reports from their pacote"
      ON public.quality_reports
      FOR SELECT
      USING (pacote = get_current_user_pacote());
  END IF;
END $$;