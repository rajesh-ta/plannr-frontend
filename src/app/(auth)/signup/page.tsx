"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { rolesApi } from "@/services/api/roles";

export default function SignupPage() {
  const { register, googleSignIn } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [roleId, setRoleId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch roles on mount to resolve PROJECT_VIEWER id
  useEffect(() => {
    rolesApi.getAll().then((data) => {
      const viewer = data.find((r) => r.role_name === "PROJECT_VIEWER");
      if (viewer) setRoleId(viewer.id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, roleId);
      router.replace("/overview");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail
            .map(
              (e: { msg?: string }) =>
                e.msg?.replace(/^Value error,\s*/i, "") ?? "",
            )
            .join(" ")
        : typeof detail === "string"
          ? detail
          : "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential: string) => {
    setError("");
    setLoading(true);
    try {
      await googleSignIn(credential);
      router.replace("/overview");
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={12}
        sx={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 3,
          p: { xs: 3, sm: 4 },
          bgcolor: "#1e1e2e",
          border: "1px solid rgba(151, 117, 250, 0.2)",
        }}
      >
        {/* Brand */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: "#9775fa", letterSpacing: 1 }}
          >
            Plannr
          </Typography>
          <Typography variant="body2" sx={{ color: "grey.500", mt: 0.5 }}>
            Create your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Google Sign-Up */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <GoogleLogin
            onSuccess={(res) => {
              if (res.credential) handleGoogle(res.credential);
            }}
            onError={() => setError("Google sign-in failed.")}
            theme="filled_black"
            size="large"
            width="100%"
            text="signup_with"
            shape="rectangular"
          />
        </Box>

        <Divider sx={{ color: "grey.600", my: 2 }}>
          or sign up with email
        </Divider>

        {/* Form */}
        <Stack component="form" onSubmit={handleSubmit} spacing={2}>
          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            autoComplete="name"
            size="small"
            InputLabelProps={{ sx: { color: "grey.500" } }}
            sx={{ "& .MuiOutlinedInput-root": { color: "white" } }}
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoComplete="email"
            size="small"
            InputLabelProps={{ sx: { color: "grey.500" } }}
            sx={{ "& .MuiOutlinedInput-root": { color: "white" } }}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
            size="small"
            helperText="Minimum 8 characters"
            FormHelperTextProps={{ sx: { color: "grey.500" } }}
            InputLabelProps={{ sx: { color: "grey.500" } }}
            sx={{ "& .MuiOutlinedInput-root": { color: "white" } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    size="small"
                    sx={{ color: "grey.500" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
            size="small"
            InputLabelProps={{ sx: { color: "grey.500" } }}
            sx={{ "& .MuiOutlinedInput-root": { color: "white" } }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              bgcolor: "#9775fa",
              "&:hover": { bgcolor: "#7c5cdb" },
              fontWeight: 600,
              py: 1.2,
              borderRadius: 2,
            }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </Stack>

        <Typography
          variant="body2"
          sx={{ textAlign: "center", mt: 3, color: "grey.500" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "#9775fa", textDecoration: "none" }}
          >
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
