-- =====================================================
-- PHASE 1: CRITICAL SECURITY FIXES
-- =====================================================

-- Step 1.1: Create user roles system to prevent privilege escalation
-- =====================================================

-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'gestor',
  'gestor_disciplina',
  'engenheiro',
  'encarregado',
  'fiscal',
  'cliente'
);

-- 2. Create user_roles table (separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  CASE 
    WHEN role = 'admin' THEN 'admin'::app_role
    WHEN role = 'gestor' THEN 'gestor'::app_role
    WHEN role = 'gestor_disciplina' THEN 'gestor_disciplina'::app_role
    WHEN role = 'engenheiro' THEN 'engenheiro'::app_role
    WHEN role = 'encarregado' THEN 'encarregado'::app_role
    WHEN role = 'fiscal' THEN 'fiscal'::app_role
    WHEN role = 'cliente' THEN 'cliente'::app_role
    ELSE 'fiscal'::app_role
  END
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Add RLS policies to user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Step 1.2 & 1.3: Remove dangerous policies and secure exposed tables
-- =====================================================

-- Drop all overly permissive policies from activities table
DROP POLICY IF EXISTS "Users can delete activities" ON public.activities;
DROP POLICY IF EXISTS "Users can update activities" ON public.activities;
DROP POLICY IF EXISTS "Users can insert activities" ON public.activities;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar atividades" ON public.activities;
DROP POLICY IF EXISTS "Usuários autenticados podem criar atividades" ON public.activities;
DROP POLICY IF EXISTS "Usuários autenticados podem excluir atividades" ON public.activities;

-- Drop dangerous policies from activity_assignments
DROP POLICY IF EXISTS "Users can insert activity assignments" ON public.activity_assignments;
DROP POLICY IF EXISTS "Users can update activity assignments" ON public.activity_assignments;
DROP POLICY IF EXISTS "Usuários autenticados podem criar atribuições" ON public.activity_assignments;
DROP POLICY IF EXISTS "Usuários podem excluir atribuições" ON public.activity_assignments;

-- Drop dangerous policies from activity_comments
DROP POLICY IF EXISTS "Usuários autenticados podem criar comentários" ON public.activity_comments;
DROP POLICY IF EXISTS "Usuários podem excluir comentários" ON public.activity_comments;

-- Drop dangerous policies from activity_photos
DROP POLICY IF EXISTS "Usuários autenticados podem criar fotos" ON public.activity_photos;
DROP POLICY IF EXISTS "Usuários podem excluir fotos" ON public.activity_photos;

-- Drop dangerous policies from activity_subtasks
DROP POLICY IF EXISTS "Usuários autenticados podem criar subtarefas" ON public.activity_subtasks;
DROP POLICY IF EXISTS "Usuários podem excluir subtarefas" ON public.activity_subtasks;

-- Drop dangerous policies from timeline
DROP POLICY IF EXISTS "Users can delete timeline activities" ON public.timeline;
DROP POLICY IF EXISTS "Users can insert timeline activities" ON public.timeline;
DROP POLICY IF EXISTS "Users can update timeline status" ON public.timeline;

-- Drop dangerous policies from activity_workforce
DROP POLICY IF EXISTS "Users can delete workforce data" ON public.activity_workforce;
DROP POLICY IF EXISTS "Users can insert workforce data" ON public.activity_workforce;
DROP POLICY IF EXISTS "Users can update workforce data" ON public.activity_workforce;

-- Drop dangerous policies from projects
DROP POLICY IF EXISTS "Users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update projects" ON public.projects;

-- Create new secure policies for activities table
CREATE POLICY "Admins and gestores can create activities"
ON public.activities
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'gestor'::app_role)
);

CREATE POLICY "Admins and gestores can update activities"
ON public.activities
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'gestor'::app_role)
);

CREATE POLICY "Only admins can delete activities"
ON public.activities
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Secure activity_assignments
CREATE POLICY "Admins and gestores can manage assignments"
ON public.activity_assignments
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'gestor'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'gestor'::app_role)
);

-- Secure activity_comments
CREATE POLICY "Users can create comments on activities they can view"
ON public.activity_comments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.activities
    WHERE id = activity_id AND pacote = get_current_user_pacote()
  )
);

CREATE POLICY "Users can delete their own comments"
ON public.activity_comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Secure activity_photos
CREATE POLICY "Users can add photos to activities they can view"
ON public.activity_photos
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.activities
    WHERE id = activity_id AND pacote = get_current_user_pacote()
  )
);

CREATE POLICY "Users can delete their own photos"
ON public.activity_photos
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Secure activity_subtasks
CREATE POLICY "Users can create subtasks for activities they can view"
ON public.activity_subtasks
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.activities
    WHERE id = activity_id AND pacote = get_current_user_pacote()
  )
);

CREATE POLICY "Admins and gestores can delete subtasks"
ON public.activity_subtasks
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'gestor'::app_role)
);

-- Secure timeline (only authenticated users, admins/gestores can modify)
CREATE POLICY "Admins and gestores can manage timeline"
ON public.timeline
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'gestor'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'gestor'::app_role)
);

-- Secure activity_workforce
CREATE POLICY "Admins and gestores can manage workforce data"
ON public.activity_workforce
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'gestor'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'gestor'::app_role)
);

-- Secure projects
CREATE POLICY "Admins and gestores can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'gestor'::app_role)
);

CREATE POLICY "Admins and project managers can update projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  manager_id = auth.uid()
);

-- Update profiles table to prevent role manipulation
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile (except role)"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Prevent users from changing their own role
  (role IS NULL OR role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
);

-- Comment on the migration
COMMENT ON TABLE public.user_roles IS 'Stores user roles separately from profiles to prevent privilege escalation attacks';
COMMENT ON FUNCTION public.has_role IS 'Security definer function to check user roles without RLS recursion';