"use client";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  Assignment,
  CheckCircle,
  Error,
  People,
} from "@mui/icons-material";

export default function OverviewPage() {
  const stats = [
    {
      title: "Total Work Items",
      value: "156",
      icon: <Assignment sx={{ fontSize: 40, color: "#0078D4" }} />,
      trend: "+12%",
    },
    {
      title: "Completed",
      value: "89",
      icon: <CheckCircle sx={{ fontSize: 40, color: "#107C10" }} />,
      trend: "+8%",
    },
    {
      title: "In Progress",
      value: "45",
      icon: <TrendingUp sx={{ fontSize: 40, color: "#FF8C00" }} />,
      trend: "+5%",
    },
    {
      title: "Blocked",
      value: "12",
      icon: <Error sx={{ fontSize: 40, color: "#D13438" }} />,
      trend: "-3%",
    },
  ];

  const recentSprints = [
    { name: "Sprint 22", progress: 85, status: "Active" },
    { name: "Sprint 21", progress: 100, status: "Completed" },
    { name: "Sprint 20", progress: 100, status: "Completed" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome to your project dashboard
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: "100%",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                "&:hover": {
                  boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  {stat.icon}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: stat.trend.startsWith("+") ? "#107C10" : "#D13438",
                    fontWeight: 600,
                  }}
                >
                  {stat.trend} from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Sprint Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Sprint Progress
            </Typography>
            {recentSprints.map((sprint, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {sprint.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sprint.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={sprint.progress}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: "#EDEBE9",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: sprint.progress === 100 ? "#107C10" : "#0078D4",
                    },
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Team Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Team Activity
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <People sx={{ color: "#0078D4", mr: 2 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  12 Active Team Members
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Working on 45 items
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Recent Updates
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#F3F2F1",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Typography variant="body2">
                  <strong>John Doe</strong> completed 3 tasks in Sprint 22
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  2 hours ago
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#F3F2F1",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Typography variant="body2">
                  <strong>Jane Smith</strong> created new user story
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  5 hours ago
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
