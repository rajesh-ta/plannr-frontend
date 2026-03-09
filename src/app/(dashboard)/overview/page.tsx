"use client";

import { Box } from "@mui/material";
import OverviewHeader from "@/components/overview/OverviewHeader";
import TaskStatsCards from "@/components/overview/TaskStatsCards";
import TeamWorkloadSection from "@/components/overview/TeamWorkloadSection";
import { useOverviewData } from "@/hooks/useOverviewData";

export default function OverviewPage() {
  const { taskStats, workload, unassignedOpen, isLoading } = useOverviewData();

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        height: "calc(100vh - 48px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <OverviewHeader />
      <TaskStatsCards stats={taskStats} isLoading={isLoading} />
      <TeamWorkloadSection
        workload={workload}
        unassignedOpen={unassignedOpen}
        isLoading={isLoading}
      />
    </Box>
  );
}
