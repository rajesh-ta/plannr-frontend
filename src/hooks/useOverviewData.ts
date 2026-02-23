import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "@/services/api/tasks";

export interface TaskStats {
  total: number;
  new: number;
  active: number;
  closed: number;
  removed: number;
}

export function useOverviewData() {
  const { data: allTasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: tasksApi.getAll,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const taskStats: TaskStats = {
    total: allTasks.length,
    new: allTasks.filter((t) => t.status === "new").length,
    active: allTasks.filter((t) => t.status === "active").length,
    closed: allTasks.filter((t) => t.status === "closed").length,
    removed: allTasks.filter((t) => t.status === "removed").length,
  };

  return { taskStats, isLoading };
}
