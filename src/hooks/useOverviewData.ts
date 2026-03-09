import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "@/services/api/tasks";
import { usersApi } from "@/services/api/users";

export interface TaskStats {
  total: number;
  new: number;
  active: number;
  closed: number;
  removed: number;
}

export interface MemberWorkload {
  userId: string;
  name: string;
  open: number;
  closed: number;
  total: number;
}

export function useOverviewData() {
  const { data: allTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: tasksApi.getAll,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
    staleTime: 30_000,
  });

  const isLoading = loadingTasks || loadingUsers;

  const taskStats: TaskStats = {
    total: allTasks.length,
    new: allTasks.filter((t) => t.status === "new").length,
    active: allTasks.filter((t) => t.status === "active").length,
    closed: allTasks.filter((t) => t.status === "closed").length,
    removed: allTasks.filter((t) => t.status === "removed").length,
  };

  const assignedTasks = allTasks.filter((t) => t.assignee_id);
  const workload: MemberWorkload[] = allUsers
    .map((user) => {
      const userTasks = assignedTasks.filter((t) => t.assignee_id === user.id);
      const open = userTasks.filter(
        (t) => t.status === "new" || t.status === "active",
      ).length;
      const closed = userTasks.filter((t) => t.status === "closed").length;
      return {
        userId: user.id,
        name: user.name,
        open,
        closed,
        total: userTasks.length,
      };
    })
    .filter((m) => m.total > 0)
    .sort((a, b) => b.open - a.open);

  const unassignedOpen = allTasks.filter(
    (t) => !t.assignee_id && (t.status === "new" || t.status === "active"),
  ).length;

  return { taskStats, workload, unassignedOpen, isLoading };
}
