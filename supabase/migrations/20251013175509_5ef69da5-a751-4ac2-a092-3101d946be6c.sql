-- Fix infinite recursion error on activity_assignments table
-- Drop problematic policies that cause recursion

DROP POLICY IF EXISTS "Users can view assignments they're involved in" ON public.activity_assignments;
DROP POLICY IF EXISTS "Only admins and gestores can manage assignments" ON public.activity_assignments;

-- The remaining policies are safe:
-- 1. "Admins and gestores can manage assignments" - uses has_role() function (no recursion)
-- 2. "Todos podem visualizar atribuições" - uses simple true condition (no recursion)
-- 3. "Users can view activity assignments" - uses simple true condition (no recursion)

-- These existing policies provide adequate security:
-- - Admins and gestores can manage all assignments via has_role()
-- - All authenticated users can view assignments (controlled by pacote filtering in application layer)