"use client";

import { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
      gap={2}
      p={4}
    >
      <Typography variant="h5" fontWeight={700}>
        Something went wrong
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {error.message || "An unexpected error occurred in this section."}
      </Typography>
      <Button variant="outlined" onClick={reset}>
        Try again
      </Button>
    </Box>
  );
}
