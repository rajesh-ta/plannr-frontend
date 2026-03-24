import { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Menu,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  KeyboardArrowDown,
  Add,
  DashboardCustomize,
  MenuBook,
  DirectionsRun,
  MoreVert,
  Edit,
  Delete,
} from "@mui/icons-material";
import { Project } from "@/services/api/projects";
import { Sprint } from "@/services/api/sprints";
import { usePermissions } from "@/hooks/usePermissions";

interface ProjectsToolbarProps {
  projects: Project[];
  loadingProjects: boolean;
  sprints: Sprint[];
  loadingSprints: boolean;
  selectedProjectId: string;
  selectedSprintId: string;
  onProjectChange: (id: string) => void;
  onSprintChange: (id: string) => void;
  newWorkItemAnchor: null | HTMLElement;
  setNewWorkItemAnchor: (el: null | HTMLElement) => void;
  onAddProject: () => void;
  onAddSprint: () => void;
  onAddUserStory: () => void;
  onEditProject: () => void;
  onDeleteProject: () => void;
  onEditSprint: () => void;
  onDeleteSprint: () => void;
}

export default function ProjectsToolbar({
  projects,
  loadingProjects,
  sprints,
  loadingSprints,
  selectedProjectId,
  selectedSprintId,
  onProjectChange,
  onSprintChange,
  newWorkItemAnchor,
  setNewWorkItemAnchor,
  onAddProject,
  onAddSprint,
  onAddUserStory,
  onEditProject,
  onDeleteProject,
  onEditSprint,
  onDeleteSprint,
}: ProjectsToolbarProps) {
  const { can } = usePermissions();
  const canWriteProject = can("project:write");
  const canWriteSprint = can("sprint:write");
  const canAddProject = canWriteProject;
  const canAddSprint = canWriteSprint;
  const canAddStory = can("story:write");
  const showNewWorkItem = canAddProject || canAddSprint || canAddStory;

  const [projectMenuAnchor, setProjectMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [sprintMenuAnchor, setSprintMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

  const selectSx = {
    fontSize: "14px",
    fontWeight: 600,
    "& fieldset": { borderColor: "#EDEBE9" },
    "&:hover fieldset": { borderColor: "#C8C6C4" },
    "&.Mui-focused fieldset": { borderColor: "#0078D4" },
  };

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid #EDEBE9",
        px: { xs: 2, sm: 3 },
        py: { xs: 1.5, sm: 2 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: { xs: "wrap", md: "nowrap" },
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Dropdowns — full width at xs/sm so button wraps to next line; auto at md+ so everything fits in one row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            width: { xs: "100%", md: "auto" },
          }}
        >
          {/* Project selector + action menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <FormControl
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 160 }, maxWidth: { sm: 260 } }}
            >
              <InputLabel sx={{ fontSize: "13px" }} id="project-select-label">
                Project
              </InputLabel>
              <Select
                labelId="project-select-label"
                label="Project"
                value={selectedProjectId}
                onChange={(e) => onProjectChange(e.target.value)}
                disabled={loadingProjects || projects.length === 0}
                IconComponent={KeyboardArrowDown}
                sx={selectSx}
              >
                {loadingProjects ? (
                  <MenuItem disabled>
                    <em>Loading projects…</em>
                  </MenuItem>
                ) : projects.length === 0 ? (
                  <MenuItem disabled>
                    <em>No projects</em>
                  </MenuItem>
                ) : (
                  projects.map((p) => (
                    <MenuItem key={p.id} value={p.id} sx={{ fontSize: "13px" }}>
                      {p.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            {canWriteProject && selectedProjectId && (
              <>
                <Tooltip title="Project actions">
                  <IconButton
                    size="small"
                    onClick={(e) => setProjectMenuAnchor(e.currentTarget)}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={projectMenuAnchor}
                  open={Boolean(projectMenuAnchor)}
                  onClose={() => setProjectMenuAnchor(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                  PaperProps={{
                    sx: {
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      minWidth: 160,
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      setProjectMenuAnchor(null);
                      onEditProject();
                    }}
                    sx={{ fontSize: "13px", py: 1, gap: 1.5 }}
                  >
                    <Edit sx={{ fontSize: 16, color: "#0078D4" }} />
                    Edit Project
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setProjectMenuAnchor(null);
                      onDeleteProject();
                    }}
                    sx={{ fontSize: "13px", py: 1, gap: 1.5, color: "#D13438" }}
                  >
                    <Delete sx={{ fontSize: 16, color: "#D13438" }} />
                    Delete Project
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {/* Sprint selector + action menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <FormControl
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 180 }, maxWidth: { sm: 280 } }}
            >
              <InputLabel sx={{ fontSize: "13px" }} id="sprint-select-label">
                Sprint
              </InputLabel>
              <Select
                labelId="sprint-select-label"
                label="Sprint"
                value={selectedSprintId}
                onChange={(e) => onSprintChange(e.target.value)}
                disabled={
                  loadingSprints || !selectedProjectId || sprints.length === 0
                }
                IconComponent={KeyboardArrowDown}
                sx={selectSx}
              >
                {loadingSprints ? (
                  <MenuItem disabled>
                    <em>Loading sprints…</em>
                  </MenuItem>
                ) : sprints.length === 0 ? (
                  <MenuItem disabled>
                    <em>No sprints</em>
                  </MenuItem>
                ) : (
                  sprints.map((sprint) => (
                    <MenuItem
                      key={sprint.id}
                      value={sprint.id}
                      sx={{ fontSize: "13px" }}
                    >
                      {sprint.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            {canWriteSprint && selectedSprintId && (
              <>
                <Tooltip title="Sprint actions">
                  <IconButton
                    size="small"
                    onClick={(e) => setSprintMenuAnchor(e.currentTarget)}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={sprintMenuAnchor}
                  open={Boolean(sprintMenuAnchor)}
                  onClose={() => setSprintMenuAnchor(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                  PaperProps={{
                    sx: {
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      minWidth: 160,
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      setSprintMenuAnchor(null);
                      onEditSprint();
                    }}
                    sx={{ fontSize: "13px", py: 1, gap: 1.5 }}
                  >
                    <Edit sx={{ fontSize: 16, color: "#0078D4" }} />
                    Edit Sprint
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setSprintMenuAnchor(null);
                      onDeleteSprint();
                    }}
                    sx={{ fontSize: "13px", py: 1, gap: 1.5, color: "#D13438" }}
                  >
                    <Delete sx={{ fontSize: 16, color: "#D13438" }} />
                    Delete Sprint
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Box>

        {/* New Work Item — wraps to next line at xs/sm (left-aligned), inline right at md+ */}
        {showNewWorkItem && (
          <>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={(e) => setNewWorkItemAnchor(e.currentTarget)}
              sx={{
                bgcolor: "#0078D4",
                textTransform: "none",
                fontSize: "14px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                flexShrink: 0,
                ml: { md: "auto" },
                "&:hover": { bgcolor: "#106EBE" },
              }}
            >
              New Work Item
            </Button>
            <Menu
              anchorEl={newWorkItemAnchor}
              open={Boolean(newWorkItemAnchor)}
              onClose={() => setNewWorkItemAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              PaperProps={{
                sx: { boxShadow: "0 2px 8px rgba(0,0,0,0.15)", minWidth: 200 },
              }}
            >
              {canAddProject && (
                <MenuItem
                  onClick={onAddProject}
                  sx={{ fontSize: "13px", py: 1, gap: 1.5 }}
                >
                  <DashboardCustomize sx={{ fontSize: 18, color: "#0078D4" }} />
                  Add Project
                </MenuItem>
              )}
              {canAddSprint && (
                <MenuItem
                  onClick={onAddSprint}
                  sx={{ fontSize: "13px", py: 1, gap: 1.5 }}
                >
                  <DirectionsRun sx={{ fontSize: 18, color: "#0078D4" }} />
                  Add Sprint
                </MenuItem>
              )}
              {canAddStory && (
                <MenuItem
                  onClick={onAddUserStory}
                  sx={{ fontSize: "13px", py: 1, gap: 1.5 }}
                >
                  <MenuBook sx={{ fontSize: 18, color: "#0078D4" }} />
                  Add User Story
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </Box>
    </Box>
  );
}
