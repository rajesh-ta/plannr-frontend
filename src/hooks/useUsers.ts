import { useQuery } from "@tanstack/react-query";
import { usersApi, User } from "@/services/api/users";

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
  });
};

export const useUserById = (userId?: string) => {
  const { data: users } = useUsers();

  if (!userId || !users) return null;

  return users.find((user) => user.id === userId);
};
