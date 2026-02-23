import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Skeleton,
} from "@mui/material";
import {
  Assignment,
  FiberNew,
  PlayCircleOutline,
  CheckCircleOutline,
  RemoveCircleOutline,
} from "@mui/icons-material";
import { TaskStats } from "@/hooks/useOverviewData";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
  description: string;
  isLoading: boolean;
}

function StatCard({
  title,
  value,
  icon,
  accentColor,
  bgColor,
  description,
  isLoading,
}: StatCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        borderTop: `3px solid ${accentColor}`,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.5,
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              backgroundColor: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>

        {isLoading ? (
          <Skeleton variant="text" width={60} height={40} />
        ) : (
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, lineHeight: 1, mb: 1 }}
          >
            {value}
          </Typography>
        )}

        <Typography variant="caption" color="text.disabled">
          {description}
        </Typography>
      </CardContent>
    </Card>
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
  const cards = [
    {
      title: "Total Tasks",
      value: stats.total,
      icon: <Assignment sx={{ fontSize: 20, color: "#0078D4" }} />,
      accentColor: "#0078D4",
      bgColor: "#EBF3FB",
      description: "All tasks across sprints",
    },
    {
      title: "New",
      value: stats.new,
      icon: <FiberNew sx={{ fontSize: 20, color: "#605E5C" }} />,
      accentColor: "#8A8886",
      bgColor: "#F3F2F1",
      description: "Not yet started",
    },
    {
      title: "Active",
      value: stats.active,
      icon: <PlayCircleOutline sx={{ fontSize: 20, color: "#0078D4" }} />,
      accentColor: "#0078D4",
      bgColor: "#C7E0F4",
      description: "Currently in progress",
    },
    {
      title: "Closed",
      value: stats.closed,
      icon: <CheckCircleOutline sx={{ fontSize: 20, color: "#107C10" }} />,
      accentColor: "#107C10",
      bgColor: "#DFF6DD",
      description: "Successfully completed",
    },
    {
      title: "Removed",
      value: stats.removed,
      icon: <RemoveCircleOutline sx={{ fontSize: 20, color: "#A80000" }} />,
      accentColor: "#A80000",
      bgColor: "#FAD2CF",
      description: "Cancelled or removed",
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {cards.map((card, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={index}>
          <StatCard {...card} isLoading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
}
