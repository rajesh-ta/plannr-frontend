"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Checkbox,
} from "@mui/material";
import {
  BugReport,
  Task,
  TurnedIn,
  Assignment,
  MoreHoriz,
} from "@mui/icons-material";

interface WorkItem {
  id: string;
  title: string;
  type: "feature" | "bug" | "task" | "user-story";
  assignedTo: {
    name: string;
    avatar?: string;
  };
  state: "new" | "active" | "in-progress" | "fixed" | "failed";
  areaPath: string;
  tags?: string[];
}

const mockData: WorkItem[] = [
  {
    id: "231065",
    title: "QA Testing: PI1 Iteration 2 (CV, LL, ML, SRE, Agentic)",
    type: "feature",
    assignedTo: { name: "Kura, Swapna priya (PEP)" },
    state: "in-progress",
    areaPath: "EIAP_Projects\\Pepvigil",
    tags: ["General Feature"],
  },
  {
    id: "235402",
    title: "AISP Project Support_Iteration1 PepIris, PepGenX Project on Azure",
    type: "feature",
    assignedTo: { name: "Amir, Mohammad - Contractor" },
    state: "in-progress",
    areaPath: "EIAP_Projects\\EIP\\EIP Modern",
  },
];

const getTypeIcon = (type: WorkItem["type"]) => {
  const iconProps = { fontSize: "small" as const };
  switch (type) {
    case "feature":
      return <TurnedIn {...iconProps} sx={{ color: "#773DBD" }} />;
    case "bug":
      return <BugReport {...iconProps} sx={{ color: "#E81123" }} />;
    case "task":
      return <Task {...iconProps} sx={{ color: "#F2CB1D" }} />;
    case "user-story":
      return <Assignment {...iconProps} sx={{ color: "#009CCC" }} />;
  }
};

const getStateColor = (state: WorkItem["state"]) => {
  switch (state) {
    case "new":
      return "#767676";
    case "active":
      return "#007ACC";
    case "in-progress":
      return "#007ACC";
    case "fixed":
      return "#107C10";
    case "failed":
      return "#E81123";
    default:
      return "#767676";
  }
};

const getStateLabel = (state: WorkItem["state"]) => {
  switch (state) {
    case "in-progress":
      return "In Progress";
    case "new":
      return "New";
    case "active":
      return "Active";
    case "fixed":
      return "Fixed";
    case "failed":
      return "Failed";
  }
};

export default function WorkItemsGrid() {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(mockData.map((item) => item.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 1 }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: "#F3F2F1" }}>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={
                  selected.length > 0 && selected.length < mockData.length
                }
                checked={
                  mockData.length > 0 && selected.length === mockData.length
                }
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: "13px" }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: "13px" }}>
              Title
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: "13px" }}>
              Assigned To
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: "13px" }}>
              State
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: "13px" }}>
              Area Path
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: "13px" }}>
              Tags
            </TableCell>
            <TableCell padding="checkbox"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockData.map((item) => (
            <TableRow
              key={item.id}
              hover
              selected={selected.includes(item.id)}
              sx={{
                "&:hover": { bgcolor: "#F3F2F1" },
                cursor: "pointer",
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.includes(item.id)}
                  onChange={() => handleSelect(item.id)}
                />
              </TableCell>
              <TableCell sx={{ fontSize: "13px" }}>{item.id}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {getTypeIcon(item.type)}
                  <span style={{ fontSize: "13px" }}>{item.title}</span>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: "11px" }}>
                    {item.assignedTo.name.substring(0, 2).toUpperCase()}
                  </Avatar>
                  <span style={{ fontSize: "13px" }}>
                    {item.assignedTo.name}
                  </span>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={getStateLabel(item.state)}
                  size="small"
                  sx={{
                    bgcolor: getStateColor(item.state),
                    color: "white",
                    fontSize: "12px",
                    height: "20px",
                    fontWeight: 500,
                  }}
                />
              </TableCell>
              <TableCell sx={{ fontSize: "13px" }}>{item.areaPath}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {item.tags?.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        bgcolor: "#E1DFDD",
                        fontSize: "11px",
                        height: "18px",
                      }}
                    />
                  ))}
                </Box>
              </TableCell>
              <TableCell padding="checkbox">
                <IconButton size="small">
                  <MoreHoriz fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
