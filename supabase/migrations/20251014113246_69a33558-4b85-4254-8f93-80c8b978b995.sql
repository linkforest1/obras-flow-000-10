-- Allow authenticated users to update status/progress of activities within their own pacote
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'activities' 
    AND policyname = 'Users can update activities status/progress in their pacote'
  ) THEN
    CREATE POLICY "Users can update activities status/progress in their pacote"
    ON activities
    FOR UPDATE
    TO authenticated
    USING (pacote = get_current_user_pacote())
    WITH CHECK (pacote = get_current_user_pacote());
  END IF;
END
$$;