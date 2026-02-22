"use client";

import { Paper, Stack, Typography } from "@mui/material";
import { User } from "@/services/api/users";

interface AdminStatsProps {
  users: User[];
}

export default function AdminStats({ users }: AdminStatsProps) {
  const stats = [
    { label: "Total Users", value: users.length, color: "#0078D4" },
    {
      label: "Active",
      value: users.filter((u) => u.status === "ACTIVE").length,
      color: "#107C10",
    },
    {
      label: "Inactive",
      value: users.filter((u) => u.status !== "ACTIVE").length,
      color: "#D13438",
    },
    {
      label: "Admins",
      value: users.filter((u) => u.role_name === "PROJECT_ADMIN").length,
      color: "#8764B8",
    },
  ];

  return (
    <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
      {stats.map((stat) => (
        <Paper
          key={stat.label}
          elevation={0}
          sx={{
            px: 2.5,
            py: 1.5,
            border: "1px solid #EDEBE9",
            borderRadius: 2,
            minWidth: 110,
          }}
        >
          <Typography variant="h5" fontWeight={700} color={stat.color}>
            {stat.value}
          </Typography>
          <Typography variant="caption" color="#605E5C">
            {stat.label}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
}
