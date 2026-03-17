"use client";

import { Box, Grid, Paper, Typography } from "@mui/material";
import {
  PeopleAlt,
  CheckCircleOutline,
  PersonOff,
  AdminPanelSettings,
} from "@mui/icons-material";
import { User } from "@/services/api/users";

interface AdminStatsProps {
  users: User[];
}

export default function AdminStats({ users }: AdminStatsProps) {
  const total = users.length;

  const stats = [
    {
      label: "Total Users",
      value: total,
      subtitle: "Registered accounts",
      color: "#0078D4",
      accentLight: "#deeffe",
      icon: <PeopleAlt sx={{ fontSize: 20, color: "#0078D4" }} />,
    },
    {
      label: "Active",
      value: users.filter((u) => u.status === "ACTIVE").length,
      subtitle: "Currently enabled",
      color: "#107C10",
      accentLight: "#dff0df",
      icon: <CheckCircleOutline sx={{ fontSize: 20, color: "#107C10" }} />,
    },
    {
      label: "Inactive",
      value: users.filter((u) => u.status !== "ACTIVE").length,
      subtitle: "Access suspended",
      color: "#D13438",
      accentLight: "#fde7e8",
      icon: <PersonOff sx={{ fontSize: 20, color: "#D13438" }} />,
    },
    {
      label: "Admins",
      value: users.filter((u) => u.role_name === "PROJECT_ADMIN").length,
      subtitle: "With admin role",
      color: "#8764B8",
      accentLight: "#ede7f6",
      icon: <AdminPanelSettings sx={{ fontSize: 20, color: "#8764B8" }} />,
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat) => (
        // 4 cols → 1 per card | 2 cols → 2×2 | 1 col → stacked
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              overflow: "hidden",
              px: 2.5,
              py: 2,
              border: "1px solid #EDEBE9",
              borderLeft: `4px solid ${stat.color}`,
              borderRadius: 2,
              background: `linear-gradient(135deg, #ffffff 55%, ${stat.color}0a 100%)`,
              transition: "box-shadow 0.18s, transform 0.18s",
              "&:hover": {
                boxShadow: `0 6px 20px ${stat.color}22`,
                transform: "translateY(-2px)",
              },
            }}
          >
            {/* Floating icon — top right */}
            <Box
              sx={{
                pointerEvents: "none",
                position: "absolute",
                top: 14,
                right: 14,
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: stat.accentLight,
                boxShadow: `0 2px 8px ${stat.color}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {stat.icon}
            </Box>

            {/* Label */}
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                color: "#A19F9D",
                mb: 1,
              }}
            >
              {stat.label}
            </Typography>

            {/* Hero number */}
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "2rem",
                lineHeight: 1,
                color: stat.color,
                letterSpacing: -1,
                mb: 0.5,
              }}
            >
              {stat.value}
            </Typography>

            {/* Subtitle */}
            <Typography variant="caption" sx={{ color: "#A19F9D" }}>
              {stat.subtitle}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
