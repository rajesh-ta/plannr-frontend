"use client";

import { Grid, Paper, Box, Typography, Skeleton } from "@mui/material";
import {
  Assignment,
  FiberNew,
  PlayCircleOutline,
  CheckCircleOutline,
  RemoveCircleOutline,
} from "@mui/icons-material";
import { TaskStats } from "@/hooks/useOverviewData";

interface CardConfig {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  accentLight: string;
  description: string;
}

interface StatCardProps extends CardConfig {
  isLoading: boolean;
}

function StatCard({
  title,
  value,
  icon,
  accent,
  accentLight,
  description,
  isLoading,
}: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
        border: "1px solid #EDEBE9",
        borderTop: `3px solid ${accent}`,
        borderRadius: 2,
        p: 2.5,
        background: "#ffffff",
        transition: "box-shadow 0.18s, transform 0.18s",
        "&:hover": {
          boxShadow: `0 6px 20px ${accent}28`,
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Dot pattern — fades in from top-right */}
      <Box
        sx={{
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          right: 0,
          width: "70%",
          height: "100%",
          backgroundImage: `radial-gradient(circle, ${accent}2e 1.2px, transparent 1.2px)`,
          backgroundSize: "14px 14px",
          backgroundPosition: "top right",
          maskImage:
            "radial-gradient(ellipse 90% 90% at 100% 0%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 90% at 100% 0%, black 20%, transparent 75%)",
        }}
      />

      {/* Decorative hollow rings — bottom-right */}
      <Box
        sx={{
          pointerEvents: "none",
          position: "absolute",
          bottom: -30,
          right: -30,
          width: 96,
          height: 96,
          borderRadius: "50%",
          border: `14px solid ${accent}18`,
        }}
      />
      <Box
        sx={{
          pointerEvents: "none",
          position: "absolute",
          bottom: -14,
          right: -14,
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: `8px solid ${accent}12`,
        }}
      />

      {/* Content */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              bgcolor: accentLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="body2"
            sx={{ color: "#605E5C", fontWeight: 600, letterSpacing: 0.1 }}
          >
            {title}
          </Typography>
        </Box>

        {isLoading ? (
          <Skeleton variant="text" width={56} height={48} />
        ) : (
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "2.2rem",
              lineHeight: 1,
              mb: 0.75,
              color: accent,
              letterSpacing: -1,
            }}
          >
            {value}
          </Typography>
        )}

        <Typography variant="caption" sx={{ color: "#A19F9D" }}>
          {description}
        </Typography>
      </Box>
    </Paper>
  );
}

interface TaskStatsCardsProps {
  stats: TaskStats;
  isLoading: boolean;
}

export default function TaskStatsCards({
  stats,
  isLoading,
}: TaskStatsCardsProps) {
  const cards: CardConfig[] = [
    {
      title: "Total Tasks",
      value: stats.total,
      icon: <Assignment sx={{ fontSize: 18, color: "#605E5C" }} />,
      accent: "#605E5C",
      accentLight: "#F3F2F1",
      description: "All tasks across sprints",
    },
    {
      title: "New",
      value: stats.new,
      icon: <FiberNew sx={{ fontSize: 18, color: "#0078D4" }} />,
      accent: "#0078D4",
      accentLight: "#deeffe",
      description: "Not yet started",
    },
    {
      title: "Active",
      value: stats.active,
      icon: <PlayCircleOutline sx={{ fontSize: 18, color: "#8764B8" }} />,
      accent: "#8764B8",
      accentLight: "#ede7f6",
      description: "Currently in progress",
    },
    {
      title: "Closed",
      value: stats.closed,
      icon: <CheckCircleOutline sx={{ fontSize: 18, color: "#107C10" }} />,
      accent: "#107C10",
      accentLight: "#dff0df",
      description: "Successfully completed",
    },
    {
      title: "Removed",
      value: stats.removed,
      icon: <RemoveCircleOutline sx={{ fontSize: 18, color: "#D13438" }} />,
      accent: "#D13438",
      accentLight: "#fde7e8",
      description: "Cancelled or removed",
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={index}>
          <StatCard {...card} isLoading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
}
