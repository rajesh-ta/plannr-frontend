"use client";

import { Box, Button, Paper, Typography } from "@mui/material";
import { BlockOutlined } from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function InactivePage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#F3F2F1",
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          p: { xs: 4, sm: 6 },
          borderRadius: 2,
          border: "1px solid #EDEBE9",
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            bgcolor: "#FDE7E9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <BlockOutlined sx={{ fontSize: 36, color: "#D13438" }} />
        </Box>

        {/* Heading */}
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "#323130", mb: 1.5 }}
        >
          Account Inactive
        </Typography>

        {/* Body */}
        <Typography
          variant="body1"
          sx={{ color: "#605E5C", lineHeight: 1.7, mb: 4 }}
        >
          Your account has been marked as <strong>inactive</strong>. You no
          longer have access to Plannr.
          <br />
          Please reach out to your team administrator for further assistance.
        </Typography>

        {/* Sign out */}
        <Button
          variant="contained"
          onClick={handleLogout}
          sx={{
            bgcolor: "#323130",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            "&:hover": { bgcolor: "#201F1E" },
          }}
        >
          Sign Out
        </Button>
      </Paper>
    </Box>
  );
}
