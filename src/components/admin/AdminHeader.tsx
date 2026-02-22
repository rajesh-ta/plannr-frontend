"use client";

import { Box, Typography, Stack } from "@mui/material";
import { AdminPanelSettings } from "@mui/icons-material";

export default function AdminHeader() {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
      <AdminPanelSettings sx={{ fontSize: 28, color: "#0078D4" }} />
      <Box>
        <Typography variant="h5" fontWeight={600} color="#323130">
          Admin Panel
        </Typography>
        <Typography variant="body2" color="#605E5C">
          Manage users, roles, and access levels across the project.
        </Typography>
      </Box>
    </Stack>
  );
}
