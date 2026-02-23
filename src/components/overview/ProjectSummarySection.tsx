import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Skeleton,
} from "@mui/material";
import { FolderOpen, Speed, Layers, Assignment } from "@mui/icons-material";
import { Project } from "@/services/api/projects";
import { Sprint } from "@/services/api/sprints";
import { UserStory } from "@/services/api/userStories";

interface ProjectSummarySectionProps {
  projects: Project[];
  sprints: Sprint[];
  allUserStories: UserStory[];
  isLoading: boolean;
}

interface MetricTileProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  isLoading: boolean;
}

function MetricTile({
  label,
  value,
  icon,
  color,
  bg,
  isLoading,
}: MetricTileProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1.5,
        borderRadius: 2,
        backgroundColor: bg,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        {isLoading ? (
          <Skeleton variant="text" width={40} height={28} />
        ) : (
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color, lineHeight: 1 }}
          >
            {value}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ProjectSummarySection({
  projects,
  sprints,
  allUserStories,
  isLoading,
}: ProjectSummarySectionProps) {
  const activeSprintsCount = sprints.filter(
    (s) => s.status === "active",
  ).length;
  const activeStoriesCount = allUserStories.filter(
    (s) => s.status === "active",
  ).length;

  const metrics = [
    {
      label: "Total Projects",
      value: projects.length,
      icon: <FolderOpen sx={{ fontSize: 22, color: "#0078D4" }} />,
      color: "#0078D4",
      bg: "#EBF3FB",
    },
    {
      label: "Total Sprints",
      value: sprints.length,
      icon: <Speed sx={{ fontSize: 22, color: "#8764B8" }} />,
      color: "#8764B8",
      bg: "#F4EEF9",
    },
    {
      label: "Active Sprints",
      value: activeSprintsCount,
      icon: <Layers sx={{ fontSize: 22, color: "#0078D4" }} />,
      color: "#0078D4",
      bg: "#C7E0F4",
    },
    {
      label: "User Stories",
      value: allUserStories.length,
      icon: <Assignment sx={{ fontSize: 22, color: "#107C10" }} />,
      color: "#107C10",
      bg: "#DFF6DD",
    },
    {
      label: "Active Stories",
      value: activeStoriesCount,
      icon: <Assignment sx={{ fontSize: 22, color: "#107C10" }} />,
      color: "#107C10",
      bg: "#A9D18E",
    },
  ];

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        mb: 3,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Project Summary
        </Typography>
        <Grid container spacing={2}>
          {metrics.map((m, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={idx}>
              <MetricTile {...m} isLoading={isLoading} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
