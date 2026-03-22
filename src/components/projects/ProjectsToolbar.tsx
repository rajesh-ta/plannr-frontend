import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Menu,
} from "@mui/material";
import {
  KeyboardArrowDown,
  Add,
  DashboardCustomize,
  MenuBook,
  DirectionsRun,
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
}: ProjectsToolbarProps) {
  const { can } = usePermissions();
  const canAddProject = can("project:write");
  const canAddSprint = can("sprint:write");
  const canAddStory = can("story:write");
  const showNewWorkItem = canAddProject || canAddSprint || canAddStory;

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
