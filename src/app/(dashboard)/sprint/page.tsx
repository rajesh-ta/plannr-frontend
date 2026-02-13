"use client";

import { useState } from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  Divider,
  Chip,
  Avatar,
  Button,
} from "@mui/material";
import {
  KeyboardArrowDown,
  ExpandMore,
  ExpandLess,
  Star,
  StarBorder,
  People,
  Add,
  ViewWeek,
} from "@mui/icons-material";

interface Task {
  id: string;
  title: string;
  status: string;
  assignee: {
    name: string;
    initials: string;
  };
  tags?: string[];
}

interface UserStory {
  id: string;
  title: string;
  tasks: Task[];
}

// Mock data - replace with API calls later
const mockSprints = [
  { id: "1", name: "2020 TIPS Retirement" },
  { id: "2", name: "Sprint 2" },
  { id: "3", name: "Sprint 3" },
];

const mockUserStories: UserStory[] = [
  {
    id: "story-1",
    title: "TIPSRetirement: PV Business Go Live",
    tasks: [
      {
        id: "668937",
        title: "TIPSRetirement: MDM/XPC Interface HyperCare Week2",
        status: "Closed",
        assignee: { name: "Surampalli, Sai (PEP)", initials: "SS" },
        tags: ["CAS TPM to MDM/XPC"],
      },
    ],
  },
  {
    id: "story-2",
    title: "TIPSRetirement: Retire / Shut off PV to MDM components in Prod",
    tasks: [],
  },
  {
    id: "story-3",
    title: "TIPSRetirement: Create SIT Test Plan for CAS PMF interface",
    tasks: [],
  },
  {
    id: "story-4",
    title: "TIPSRetirement: QA Cutover for CAS PMF interface",
    tasks: [],
  },
  {
    id: "story-5",
    title:
      "TIPSRetirement: Unit Test Customer Subscription to CAS PMF via PO XI",
    tasks: [],
  },
  {
    id: "story-6",
    title: "TIPSRetirement: UT Material Subscription to CAS PMF via PO XI",
    tasks: [],
  },
  {
    id: "story-7",
    title:
      "TIPSRetirement: UT Sales Unit Hierarchy Subscription to CAS PMF via PO XI",
    tasks: [],
  },
];

export default function SprintPage() {
  const [selectedSprint, setSelectedSprint] = useState("1");
  const [expandedStories, setExpandedStories] = useState<{
    [key: string]: boolean;
  }>({ "story-1": true });
  const [allCollapsed, setAllCollapsed] = useState(false);

  const handleCollapseAll = () => {
    if (allCollapsed) {
      // Expand all
      const expanded: { [key: string]: boolean } = {};
      mockUserStories.forEach((story) => {
        expanded[story.id] = true;
      });
      setExpandedStories(expanded);
    } else {
      // Collapse all
      setExpandedStories({});
    }
    setAllCollapsed(!allCollapsed);
  };

  const toggleStory = (storyId: string) => {
    setExpandedStories((prev) => ({
      ...prev,
      [storyId]: !prev[storyId],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "closed":
        return "#107C10";
      case "active":
        return "#0078D4";
      case "new":
        return "#797775";
      default:
        return "#605E5C";
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "#FAF9F8",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #EDEBE9",
          px: 3,
          py: 2,
        }}
      >
        {/* Sprint Selector and Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <Select
                value={selectedSprint}
                onChange={(e) => setSelectedSprint(e.target.value)}
                IconComponent={KeyboardArrowDown}
                sx={{
                  fontSize: "20px",
                  fontWeight: 600,
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .MuiSelect-select": {
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                {mockSprints.map((sprint) => (
                  <MenuItem key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton size="small">
              <StarBorder sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small">
              <People sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                bgcolor: "#0078D4",
                textTransform: "none",
                fontSize: "14px",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#106EBE",
                },
              }}
            >
              New Work Item
            </Button>
            <Button
              variant="outlined"
              startIcon={<ViewWeek />}
              sx={{
                textTransform: "none",
                fontSize: "14px",
                borderColor: "#8A8886",
                color: "#323130",
                "&:hover": {
                  borderColor: "#323130",
                  bgcolor: "#F3F2F1",
                },
              }}
            >
              Column Options
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Filters Section */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #EDEBE9",
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <FormControl size="small">
          <Select defaultValue="all" sx={{ fontSize: "13px", minWidth: 100 }}>
            <MenuItem value="all">Person: All</MenuItem>
            <MenuItem value="me">Assigned to me</MenuItem>
          </Select>
        </FormControl>
        <Typography
          sx={{
            fontSize: "13px",
            color: "#0078D4",
            ml: "auto",
          }}
        >
          October 7 - October 20
        </Typography>
        <Typography sx={{ fontSize: "13px", color: "#605E5C" }}>
          10 work days
        </Typography>
      </Box>

      {/* Main Content - User Stories */}
      <Box sx={{ px: 3, py: 2 }}>
        {/* Collapse All Button */}
        <Box sx={{ mb: 2 }}>
          <Typography
            onClick={handleCollapseAll}
            sx={{
              fontSize: "12px",
              color: "#0078D4",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            <ExpandMore sx={{ fontSize: 16 }} />
            {allCollapsed ? "Expand all" : "Collapse all"}
          </Typography>
        </Box>

        {/* Column Headers */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
            gap: 2,
            px: 2,
            py: 1,
            bgcolor: "#F3F2F1",
            borderRadius: "4px 4px 0 0",
            fontSize: "12px",
            fontWeight: 600,
            color: "#323130",
          }}
        >
          <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
            New
          </Typography>
          <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
            Active
          </Typography>
          <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
            Validating
          </Typography>
          <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
            Failed
          </Typography>
          <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
            Fixed
          </Typography>
        </Box>

        {/* User Stories List */}
        <Box sx={{ bgcolor: "white", border: "1px solid #EDEBE9" }}>
          {mockUserStories.map((story, index) => (
            <Box key={story.id}>
              {index > 0 && <Divider />}
              {/* User Story Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "#F3F2F1",
                  },
                }}
                onClick={() => toggleStory(story.id)}
              >
                <IconButton size="small" sx={{ mr: 1 }}>
                  {expandedStories[story.id] ? (
                    <ExpandLess sx={{ fontSize: 18 }} />
                  ) : (
                    <ExpandMore sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: "#0078D4",
                    borderRadius: "2px",
                    mr: 1,
                  }}
                />
                <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                  {story.title}
                </Typography>
              </Box>

              {/* Tasks under User Story */}
              <Collapse in={expandedStories[story.id]} timeout="auto">
                {story.tasks.length > 0 ? (
                  story.tasks.map((task) => (
                    <Box
                      key={task.id}
                      sx={{
                        pl: 8,
                        pr: 2,
                        py: 1.5,
                        borderTop: "1px solid #EDEBE9",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        "&:hover": {
                          bgcolor: "#FAF9F8",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: "#605E5C",
                          borderRadius: "2px",
                          mr: 1,
                        }}
                      />
                      <Typography
                        sx={{ fontSize: "13px", color: "#0078D4", mr: 1 }}
                      >
                        {task.id}
                      </Typography>
                      <Typography sx={{ fontSize: "13px", flexGrow: 1 }}>
                        {task.title}
                      </Typography>
                      <Chip
                        label={task.status}
                        size="small"
                        icon={
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: getStatusColor(task.status),
                            }}
                          />
                        }
                        sx={{
                          fontSize: "11px",
                          height: 20,
                          "& .MuiChip-label": {
                            px: 1,
                          },
                        }}
                      />
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: "10px",
                          bgcolor: "#0078D4",
                        }}
                      >
                        {task.assignee.initials}
                      </Avatar>
                      {task.tags && task.tags.length > 0 && (
                        <Chip
                          label={task.tags[0]}
                          size="small"
                          sx={{
                            fontSize: "11px",
                            height: 20,
                            bgcolor: "#E1DFDD",
                          }}
                        />
                      )}
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      pl: 8,
                      pr: 2,
                      py: 1,
                      borderTop: "1px solid #EDEBE9",
                      color: "#605E5C",
                      fontSize: "12px",
                      fontStyle: "italic",
                    }}
                  >
                    No tasks
                  </Box>
                )}
              </Collapse>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
