
-- Habilitar a extensão pg_graphql se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS pg_graphql;

-- Configurar permissões para o GraphQL endpoint
GRANT USAGE ON SCHEMA graphql TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA graphql TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA graphql TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA graphql TO postgres, anon, authenticated, service_role;

-- Expor as tabelas públicas para GraphQL
COMMENT ON SCHEMA public IS '@graphql({"inflect_names": true})';

-- Configurar comentários GraphQL para as tabelas principais
COMMENT ON TABLE public.activities IS '@graphql({"primary_key_columns": ["id"]})';
COMMENT ON TABLE public.projects IS '@graphql({"primary_key_columns": ["id"]})';
COMMENT ON TABLE public.profiles IS '@graphql({"primary_key_columns": ["id"]})';
COMMENT ON TABLE public.activity_photos IS '@graphql({"primary_key_columns": ["id"]})';
COMMENT ON TABLE public.activity_comments IS '@graphql({"primary_key_columns": ["id"]})';
COMMENT ON TABLE public.activity_subtasks IS '@graphql({"primary_key_columns": ["id"]})';
COMMENT ON TABLE public.notifications IS '@graphql({"primary_key_columns": ["id"]})';
COMMENT ON TABLE public.boards IS '@graphql({"primary_key_columns": ["id"]})';
COMMENT ON TABLE public.lists IS '@graphql({"primary_key_columns": ["id"]})';
COMMENT ON TABLE public.tasks IS '@graphql({"primary_key_columns": ["id"]})';
COMMENT ON TABLE public.scope_changes IS '@graphql({"primary_key_columns": ["id"]})';
COMMENT ON TABLE public.activity_assignments IS '@graphql({"primary_key_columns": ["id"]})';

-- Configurar relacionamentos GraphQL
COMMENT ON CONSTRAINT activities_project_id_fkey ON public.activities IS '@graphql({"foreign_name": "project", "local_name": "activities"})';
COMMENT ON CONSTRAINT activity_comments_activity_id_fkey ON public.activity_comments IS '@graphql({"foreign_name": "activity", "local_name": "comments"})';
COMMENT ON CONSTRAINT activity_photos_activity_id_fkey ON public.activity_photos IS '@graphql({"foreign_name": "activity", "local_name": "photos"})';
COMMENT ON CONSTRAINT activity_subtasks_activity_id_fkey ON public.activity_subtasks IS '@graphql({"foreign_name": "activity", "local_name": "subtasks"})';
COMMENT ON CONSTRAINT activity_assignments_activity_id_fkey ON public.activity_assignments IS '@graphql({"foreign_name": "activity", "local_name": "assignments"})';
COMMENT ON CONSTRAINT scope_changes_activity_id_fkey ON public.scope_changes IS '@graphql({"foreign_name": "activity", "local_name": "scopeChanges"})';
COMMENT ON CONSTRAINT lists_board_id_fkey ON public.lists IS '@graphql({"foreign_name": "board", "local_name": "lists"})';
COMMENT ON CONSTRAINT tasks_list_id_fkey ON public.tasks IS '@graphql({"foreign_name": "list", "local_name": "tasks"})';

-- Habilitar GraphQL para funções específicas se necessário
COMMENT ON FUNCTION public.get_current_user_role() IS '@graphql({"name": "currentUserRole"})';
