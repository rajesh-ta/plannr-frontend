"use client";

import { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html>
      <body>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          gap={2}
          p={4}
        >
          <Typography variant="h4" fontWeight={700}>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            {error.message || "An unexpected error occurred."}
          </Typography>
          <Button variant="contained" onClick={reset}>
            Try again
          </Button>
        </Box>
      </body>
    </html>
  );
}
