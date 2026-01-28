
-- Criar tabela de membros da equipe para associar usuários a projetos
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('gestor', 'engenheiro', 'fiscal')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Adicionar colunas necessárias na tabela projects se não existirem
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Habilitar RLS na tabela team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para team_members
CREATE POLICY "Gestores podem ver membros dos seus projetos" 
  ON public.team_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = team_members.project_id 
      AND p.manager_id = auth.uid()
    )
  );

CREATE POLICY "Gestores podem adicionar membros aos seus projetos" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = team_members.project_id 
      AND p.manager_id = auth.uid()
    )
  );

CREATE POLICY "Gestores podem atualizar membros dos seus projetos" 
  ON public.team_members 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = team_members.project_id 
      AND p.manager_id = auth.uid()
    )
  );

CREATE POLICY "Gestores podem remover membros dos seus projetos" 
  ON public.team_members 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = team_members.project_id 
      AND p.manager_id = auth.uid()
    )
  );

-- Habilitar RLS na tabela projects se não estiver habilitada
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para projects
CREATE POLICY "Gestores podem ver seus próprios projetos" 
  ON public.projects 
  FOR SELECT 
  USING (manager_id = auth.uid());

CREATE POLICY "Gestores podem criar projetos" 
  ON public.projects 
  FOR INSERT 
  WITH CHECK (manager_id = auth.uid());

CREATE POLICY "Gestores podem atualizar seus próprios projetos" 
  ON public.projects 
  FOR UPDATE 
  USING (manager_id = auth.uid());

CREATE POLICY "Gestores podem deletar seus próprios projetos" 
  ON public.projects 
  FOR DELETE 
  USING (manager_id = auth.uid());

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_team_members_updated_at_trigger
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_members_updated_at();
