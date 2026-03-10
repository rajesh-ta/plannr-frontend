"use client";

import { Alert, Snackbar } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hideNotification } from "@/store/notificationSlice";

export default function GlobalSnackbar() {
  const dispatch = useAppDispatch();
  const { open, message, severity } = useAppSelector(
    (state) => state.notification,
  );

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    dispatch(hideNotification());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
