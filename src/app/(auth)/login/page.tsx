"use client";

import React, { useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login, googleSignIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/overview");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Login failed. Please check your credentials.";
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
        {/* Logo / Brand */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: "#9775fa", letterSpacing: 1 }}
          >
            Plannr
          </Typography>
          <Typography variant="body2" sx={{ color: "grey.500", mt: 0.5 }}>
            Sign in to your workspace
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Google Sign-In */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <GoogleLogin
            onSuccess={(res) => {
              if (res.credential) handleGoogle(res.credential);
            }}
            onError={() => setError("Google sign-in failed.")}
            theme="filled_black"
            size="large"
            width="100%"
            text="signin_with"
            shape="rectangular"
          />
        </Box>

        <Divider sx={{ color: "grey.600", my: 2 }}>
          or continue with email
        </Divider>

        {/* Email / Password form */}
        <Stack component="form" onSubmit={handleSubmit} spacing={2}>
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
            autoComplete="current-password"
            size="small"
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
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </Stack>

        <Typography
          variant="body2"
          sx={{ textAlign: "center", mt: 3, color: "grey.500" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            style={{ color: "#9775fa", textDecoration: "none" }}
          >
            Sign up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
