"use client";

import { Box, Grid } from "@mui/material";
import OverviewHeader from "@/components/overview/OverviewHeader";
import TaskStatsCards from "@/components/overview/TaskStatsCards";
import TaskDistributionSection from "@/components/overview/TaskDistributionSection";
import { useOverviewData } from "@/hooks/useOverviewData";

export default function OverviewPage() {
  const { taskStats, isLoading } = useOverviewData();

  return (
    <Box sx={{ p: 2.5 }}>
      <OverviewHeader />

      {/* Task Status Cards: Total, New, Active, Closed, Removed */}
      <TaskStatsCards stats={taskStats} isLoading={isLoading} />

      {/* Task Distribution breakdown */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TaskDistributionSection stats={taskStats} isLoading={isLoading} />
        </Grid>
      </Grid>
    </Box>
  );
}
