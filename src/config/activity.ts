
export const statusConfig = {
  pending: {
    label: "Não Iniciado",
    className: "bg-muted text-muted-foreground",
    color: "bg-muted"
  },
  "in-progress": {
    label: "Em Andamento",
    className: "bg-blue-100 text-vale-blue dark:bg-blue-900/30 dark:text-blue-400",
    color: "bg-blue-500"
  },
  completed: {
    label: "Concluído",
    className: "bg-green-100 text-vale-green dark:bg-green-900/30 dark:text-green-400",
    color: "bg-green-500"
  },
  delayed: {
    label: "Atrasado",
    className: "bg-red-100 text-vale-red dark:bg-red-900/30 dark:text-red-400",
    color: "bg-red-500"
  },
  "not-completed": {
    label: "Não Concluída",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    color: "bg-orange-500"
  },
};

export const priorityConfig = {
  low: {
    label: "Baixa",
    className: "bg-muted text-muted-foreground",
    color: "bg-gray-500"
  },
  medium: {
    label: "Média",
    className: "bg-yellow-100 text-vale-yellow dark:bg-yellow-900/30 dark:text-yellow-400",
    color: "bg-yellow-500"
  },
  high: {
    label: "Alta",
    className: "bg-red-100 text-vale-red dark:bg-red-900/30 dark:text-red-400",
    color: "bg-red-500"
  }
};
