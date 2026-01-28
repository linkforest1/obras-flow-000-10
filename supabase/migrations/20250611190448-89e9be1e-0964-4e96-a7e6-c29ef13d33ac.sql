
-- Habilitar RLS e criar políticas para a tabela activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (visualizar atividades)
CREATE POLICY "Todos podem visualizar atividades" 
ON public.activities 
FOR SELECT 
TO authenticated 
USING (true);

-- Política para INSERT (criar atividades)
CREATE POLICY "Usuários autenticados podem criar atividades" 
ON public.activities 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Política para UPDATE (atualizar atividades)
CREATE POLICY "Usuários autenticados podem atualizar atividades" 
ON public.activities 
FOR UPDATE 
TO authenticated 
USING (true);

-- Política para DELETE (excluir atividades)
CREATE POLICY "Usuários autenticados podem excluir atividades" 
ON public.activities 
FOR DELETE 
TO authenticated 
USING (true);

-- Habilitar RLS e criar políticas para activity_comments
ALTER TABLE public.activity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem visualizar comentários" 
ON public.activity_comments 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem criar comentários" 
ON public.activity_comments 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir comentários" 
ON public.activity_comments 
FOR DELETE 
TO authenticated 
USING (true);

-- Habilitar RLS e criar políticas para activity_photos
ALTER TABLE public.activity_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem visualizar fotos" 
ON public.activity_photos 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem criar fotos" 
ON public.activity_photos 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir fotos" 
ON public.activity_photos 
FOR DELETE 
TO authenticated 
USING (true);

-- Habilitar RLS e criar políticas para activity_subtasks
ALTER TABLE public.activity_subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem visualizar subtarefas" 
ON public.activity_subtasks 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem criar subtarefas" 
ON public.activity_subtasks 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Usuários podem excluir subtarefas" 
ON public.activity_subtasks 
FOR DELETE 
TO authenticated 
USING (true);

-- Habilitar RLS e criar políticas para activity_assignments
ALTER TABLE public.activity_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem visualizar atribuições" 
ON public.activity_assignments 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem criar atribuições" 
ON public.activity_assignments 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Usuários podem excluir atribuições" 
ON public.activity_assignments 
FOR DELETE 
TO authenticated 
USING (true);
