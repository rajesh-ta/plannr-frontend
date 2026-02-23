import { Box, Typography, Divider } from "@mui/material";
import { CalendarToday } from "@mui/icons-material";

export default function OverviewHeader() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Overview
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5 }}>
            Track your team&apos;s progress across all active sprints. Monitor
            task statuses, identify blockers, and keep delivery on schedule —
            all in one place.
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarToday sx={{ fontSize: 14, color: "text.disabled" }} />
            <Typography variant="caption" color="text.disabled">
              {today}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
}
