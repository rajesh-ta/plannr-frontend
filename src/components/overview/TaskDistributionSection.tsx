import {
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  LinearProgress,
  Divider,
} from "@mui/material";
import { PieChart } from "@mui/icons-material";
import { TaskStats } from "@/hooks/useOverviewData";

interface TaskDistributionSectionProps {
  stats: TaskStats;
  isLoading: boolean;
}

interface DistributionRowProps {
  label: string;
  count: number;
  total: number;
  color: string;
  isLoading: boolean;
}

function DistributionRow({
  label,
  count,
  total,
  color,
  isLoading,
}: DistributionRowProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <Box sx={{ mb: 1.5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: color,
              flexShrink: 0,
            }}
          />
          <Typography variant="body2" fontWeight={500}>
            {label}
          </Typography>
        </Box>
        {isLoading ? (
          <Skeleton variant="text" width={50} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {count} &nbsp;
            <Typography
              component="span"
              variant="caption"
              color="text.disabled"
            >
              ({percentage}%)
            </Typography>
          </Typography>
        )}
      </Box>
      {isLoading ? (
        <Skeleton variant="rectangular" height={6} sx={{ borderRadius: 3 }} />
      ) : (
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: "#F3F2F1",
            "& .MuiLinearProgress-bar": {
              backgroundColor: color,
              borderRadius: 3,
            },
          }}
        />
      )}
    </Box>
  );
}

export default function TaskDistributionSection({
  stats,
  isLoading,
}: TaskDistributionSectionProps) {
  const rows = [
    { label: "New", count: stats.new, color: "#8A8886" },
    { label: "Active", count: stats.active, color: "#0078D4" },
    { label: "Closed", count: stats.closed, color: "#107C10" },
    { label: "Removed", count: stats.removed, color: "#A80000" },
  ];

  const completionRate =
    stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0;

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <PieChart sx={{ fontSize: 20, color: "#0078D4" }} />
          <Typography variant="subtitle1" fontWeight={600}>
            Task Distribution
          </Typography>
        </Box>

        {rows.map((row) => (
          <DistributionRow
            key={row.label}
            label={row.label}
            count={row.count}
            total={stats.total}
            color={row.color}
            isLoading={isLoading}
          />
        ))}

        <Divider sx={{ my: 1.5 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Overall Completion
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width={40} />
          ) : (
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ color: completionRate >= 75 ? "#107C10" : "#0078D4" }}
            >
              {completionRate}%
            </Typography>
          )}
        </Box>
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            height={8}
            sx={{ borderRadius: 4, mt: 1 }}
          />
        ) : (
          <LinearProgress
            variant="determinate"
            value={completionRate}
            sx={{
              height: 8,
              borderRadius: 4,
              mt: 1,
              backgroundColor: "#F3F2F1",
              "& .MuiLinearProgress-bar": {
                backgroundColor: completionRate >= 75 ? "#107C10" : "#0078D4",
                borderRadius: 4,
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
