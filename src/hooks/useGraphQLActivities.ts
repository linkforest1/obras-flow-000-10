
import { useQuery, useMutation } from '@apollo/client';
import { GET_ACTIVITIES, GET_ACTIVITY_BY_ID } from '@/graphql/queries';
import { CREATE_ACTIVITY, UPDATE_ACTIVITY, DELETE_ACTIVITY } from '@/graphql/mutations';
import { useToast } from '@/hooks/use-toast';

export const useGraphQLActivities = () => {
  const { toast } = useToast();

  const { data: activitiesData, loading, error, refetch } = useQuery(GET_ACTIVITIES);

  const [createActivity] = useMutation(CREATE_ACTIVITY, {
    onCompleted: () => {
      toast({
        title: "Atividade criada",
        description: "A atividade foi criada com sucesso via GraphQL.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar atividade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [updateActivity] = useMutation(UPDATE_ACTIVITY, {
    onCompleted: () => {
      toast({
        title: "Atividade atualizada",
        description: "A atividade foi atualizada com sucesso via GraphQL.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar atividade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [deleteActivity] = useMutation(DELETE_ACTIVITY, {
    onCompleted: () => {
      toast({
        title: "Atividade removida",
        description: "A atividade foi removida com sucesso via GraphQL.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover atividade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activities = activitiesData?.activitiesCollection?.edges?.map((edge: any) => edge.node) || [];

  return {
    activities,
    loading,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
    refetch,
  };
};

export const useGraphQLActivity = (id: string) => {
  const { data, loading, error } = useQuery(GET_ACTIVITY_BY_ID, {
    variables: { id },
    skip: !id,
  });

  const activity = data?.activitiesCollection?.edges?.[0]?.node;

  return {
    activity,
    loading,
    error,
  };
};
