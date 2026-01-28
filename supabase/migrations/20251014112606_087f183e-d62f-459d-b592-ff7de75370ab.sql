-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins and gestores can manage timeline" ON timeline;

-- Create new policies that allow authenticated users to update status
CREATE POLICY "Authenticated users can view timeline"
ON timeline
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update timeline status"
ON timeline
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Admins and gestores can do everything (INSERT, DELETE)
CREATE POLICY "Admins and gestores can insert timeline"
ON timeline
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Admins and gestores can delete timeline"
ON timeline
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));