"use client";

import {
  Box,
  Button,
  Typography,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  Add,
  OpenInNew,
  ViewColumn,
  Upload,
  Delete,
  ArrowDropDown,
  ViewComfy,
  ViewList,
  FullscreenOutlined,
} from "@mui/icons-material";
import { useState } from "react";

export default function WorkItemsHeader() {
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h5"
        sx={{ mb: 2, fontWeight: 500, color: "#323130" }}
      >
        Work Items
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        {/* Left side - Action buttons */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            variant="text"
            onClick={handleSortClick}
            endIcon={<ArrowDropDown />}
            sx={{
              textTransform: "none",
              color: "#323130",
              fontSize: "13px",
            }}
          >
            Recently updated
          </Button>
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={handleSortClose}
          >
            <MenuItem onClick={handleSortClose}>Recently updated</MenuItem>
            <MenuItem onClick={handleSortClose}>Recently created</MenuItem>
            <MenuItem onClick={handleSortClose}>Title</MenuItem>
            <MenuItem onClick={handleSortClose}>ID</MenuItem>
          </Menu>

          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              textTransform: "none",
              bgcolor: "#0078D4",
              "&:hover": { bgcolor: "#106EBE" },
              fontSize: "13px",
            }}
          >
            New Work Item
          </Button>

          <Button
            variant="text"
            startIcon={<OpenInNew fontSize="small" />}
            sx={{
              textTransform: "none",
              color: "#323130",
              fontSize: "13px",
            }}
          >
            Open in Queries
          </Button>

          <Button
            variant="text"
            startIcon={<ViewColumn fontSize="small" />}
            sx={{
              textTransform: "none",
              color: "#323130",
              fontSize: "13px",
            }}
          >
            Column Options
          </Button>

          <Button
            variant="text"
            startIcon={<Upload fontSize="small" />}
            sx={{
              textTransform: "none",
              color: "#323130",
              fontSize: "13px",
            }}
          >
            Import Work Items
          </Button>

          <Button
            variant="text"
            startIcon={<Delete fontSize="small" />}
            sx={{
              textTransform: "none",
              color: "#323130",
              fontSize: "13px",
            }}
          >
            Recycle Bin
          </Button>
        </Box>

        {/* Right side - View controls */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton size="small" sx={{ color: "#0078D4" }}>
            <ViewComfy fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <ViewList fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <FullscreenOutlined fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
