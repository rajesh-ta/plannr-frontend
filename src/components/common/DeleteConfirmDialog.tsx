import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: string;
  itemName?: string;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  itemType,
  itemName,
}: DeleteConfirmDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon sx={{ color: "#D13438", fontSize: 22 }} />
          <Typography sx={{ fontWeight: 600, fontSize: "16px" }}>
            Delete {itemType}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: "8px !important" }}>
        <Typography sx={{ fontSize: "14px", color: "#323130" }}>
          Are you sure you want to delete the {itemType.toLowerCase()}
          {itemName ? (
            <>
              {" "}
              -{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "#201F1E" }}>
                &ldquo;{itemName}&rdquo;
              </Box>
            </>
          ) : null}
          ? This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontSize: "13px",
            borderColor: "#8A8886",
            color: "#323130",
            "&:hover": { borderColor: "#323130", bgcolor: "#F3F2F1" },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          sx={{
            textTransform: "none",
            fontSize: "13px",
            bgcolor: "#D13438",
            "&:hover": { bgcolor: "#A4262C" },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
