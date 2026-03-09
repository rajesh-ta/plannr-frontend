import { Box, Typography } from "@mui/material";
import { CalendarToday } from "@mui/icons-material";

export default function OverviewHeader() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 600, color: "#323130", mb: 0.5 }}
      >
        Overview
      </Typography>
      <Typography variant="body2" sx={{ color: "#605E5C", mb: 1.5 }}>
        Track your team&apos;s progress across all active sprints — task
        statuses, blockers, and delivery at a glance.
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <CalendarToday sx={{ fontSize: 13, color: "#A19F9D" }} />
        <Typography variant="caption" sx={{ color: "#A19F9D" }}>
          {today}
        </Typography>
      </Box>
    </Box>
  );
}
