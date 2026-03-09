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
  total: number;
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
  total,
  icon,
  accent,
  accentLight,
  description,
  isLoading,
}: StatCardProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
        border: "1px solid #EDEBE9",
        borderLeft: `4px solid ${accent}`,
        borderRadius: 2,
        p: 1.75,
        background: `linear-gradient(135deg, #ffffff 60%, ${accent}0a 100%)`,
        transition: "box-shadow 0.18s, transform 0.18s",
        "&:hover": {
          boxShadow: `0 8px 24px ${accent}22`,
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Diagonal stripe texture */}
      <Box
        sx={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            ${accent}09 0px,
            ${accent}09 1px,
            transparent 1px,
            transparent 12px
          )`,
          maskImage:
            "linear-gradient(to bottom-left, black 0%, transparent 55%)",
          WebkitMaskImage:
            "linear-gradient(to bottom-left, black 0%, transparent 55%)",
        }}
      />

      {/* Floating icon — top right */}
      <Box
        sx={{
          pointerEvents: "none",
          position: "absolute",
          top: 14,
          right: 14,
          width: 38,
          height: 38,
          borderRadius: "10px",
          bgcolor: accentLight,
          boxShadow: `0 2px 8px ${accent}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        {icon}
      </Box>

      {/* Content */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Label */}
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            color: "#A19F9D",
            mb: 1.25,
          }}
        >
          {title}
        </Typography>

        {/* Hero number */}
        {isLoading ? (
          <Skeleton variant="text" width={64} height={56} />
        ) : (
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "2rem",
              lineHeight: 1,
              color: accent,
              letterSpacing: -1,
              mb: 0.5,
            }}
          >
            {value}
          </Typography>
        )}

        {/* Description */}
        <Typography
          variant="caption"
          sx={{ color: "#A19F9D", display: "block", mb: 1.25 }}
        >
          {description}
        </Typography>

        {/* Progress bar */}
        <Box
          sx={{
            height: 4,
            borderRadius: 99,
            bgcolor: `${accent}18`,
            overflow: "hidden",
          }}
        >
          {!isLoading && (
            <Box
              sx={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 99,
                background: `linear-gradient(90deg, ${accent}99, ${accent})`,
                transition: "width 0.6s ease",
              }}
            />
          )}
        </Box>
        {!isLoading && (
          <Typography
            sx={{ fontSize: "0.65rem", color: `${accent}bb`, mt: 0.5 }}
          >
            {pct}% of total
          </Typography>
        )}
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
      total: stats.total,
      icon: <Assignment sx={{ fontSize: 22, color: "#605E5C" }} />,
      accent: "#605E5C",
      accentLight: "#F3F2F1",
      description: "All tasks across sprints",
    },
    {
      title: "New",
      value: stats.new,
      total: stats.total,
      icon: <FiberNew sx={{ fontSize: 22, color: "#0078D4" }} />,
      accent: "#0078D4",
      accentLight: "#deeffe",
      description: "Not yet started",
    },
    {
      title: "Active",
      value: stats.active,
      total: stats.total,
      icon: <PlayCircleOutline sx={{ fontSize: 22, color: "#8764B8" }} />,
      accent: "#8764B8",
      accentLight: "#ede7f6",
      description: "Currently in progress",
    },
    {
      title: "Closed",
      value: stats.closed,
      total: stats.total,
      icon: <CheckCircleOutline sx={{ fontSize: 22, color: "#107C10" }} />,
      accent: "#107C10",
      accentLight: "#dff0df",
      description: "Successfully completed",
    },
    {
      title: "Removed",
      value: stats.removed,
      total: stats.total,
      icon: <RemoveCircleOutline sx={{ fontSize: 22, color: "#D13438" }} />,
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
