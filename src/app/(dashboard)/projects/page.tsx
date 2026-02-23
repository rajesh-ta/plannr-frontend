"use client";

import { Box } from "@mui/material";
import ProjectsToolbar from "@/components/projects/ProjectsToolbar";
import BoardBody from "@/components/projects/BoardBody";
import ProjectsDialogs from "@/components/projects/ProjectsDialogs";
import { useProjectsData } from "@/hooks/useProjectsData";

export default function ProjectsPage() {
  const d = useProjectsData();

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#FAF9F8", minHeight: "100vh" }}>
      <ProjectsToolbar
        projects={d.projects}
        loadingProjects={d.loadingProjects}
        sprints={d.sprints}
        loadingSprints={d.loadingSprints}
        selectedProjectId={d.selectedProjectId}
        selectedSprintId={d.selectedSprintId}
        onProjectChange={d.setSelectedProjectId}
        onSprintChange={d.setSelectedSprintId}
        newWorkItemAnchor={d.newWorkItemAnchor}
        setNewWorkItemAnchor={d.setNewWorkItemAnchor}
        onAddProject={() => {
          d.setNewWorkItemAnchor(null);
          d.setAddProjectDialogOpen(true);
        }}
        onAddSprint={() => {
          d.setNewWorkItemAnchor(null);
          d.setEditingSprint(null);
          d.setSprintDialogOpen(true);
        }}
        onAddUserStory={() => {
          d.setNewWorkItemAnchor(null);
          d.setUserStoryDialogOpen(true);
        }}
      />

      <BoardBody
        userStories={d.userStories}
        loadingUserStories={d.loadingUserStories}
        selectedSprintId={d.selectedSprintId}
        storyTasks={d.storyTasks}
        loadingTasks={d.loadingTasks}
        expandedStories={d.expandedStories}
        allCollapsed={d.allCollapsed}
        users={d.users}
        storyMenuAnchor={d.storyMenuAnchor}
        storyMenuId={d.storyMenuId}
        onCollapseAll={d.handleCollapseAll}
        onToggleStory={d.toggleStory}
        onTaskClick={d.handleTaskClick}
        onAddTask={d.handleAddTask}
        onDeleteTask={d.handleDeleteTask}
        onStoryMenuOpen={d.handleStoryMenuOpen}
        onStoryMenuClose={d.handleStoryMenuClose}
        onEditStory={d.handleEditStory}
        onDeleteStoryRequest={d.handleDeleteStoryRequest}
      />

      <ProjectsDialogs
        dialogOpen={d.dialogOpen}
        selectedTask={d.selectedTask}
        selectedUserStory={d.getSelectedUserStory() ?? undefined}
        onCloseDialog={d.handleCloseDialog}
        onSaveTask={d.handleSaveTask}
        userStoryDialogOpen={d.userStoryDialogOpen}
        editingUserStory={d.editingUserStory}
        sprints={d.sprints}
        selectedSprintId={d.selectedSprintId}
        onCloseUserStoryDialog={() => {
          d.setUserStoryDialogOpen(false);
          d.setEditingUserStory(null);
        }}
        onSaveUserStory={d.handleSaveUserStory}
        sprintDialogOpen={d.sprintDialogOpen}
        editingSprint={d.editingSprint}
        selectedProjectId={d.selectedProjectId}
        onCloseSprintDialog={() => {
          d.setSprintDialogOpen(false);
          d.setEditingSprint(null);
        }}
        onSaveSprint={d.handleSaveSprint}
        deleteStoryConfirmOpen={d.deleteStoryConfirmOpen}
        pendingDeleteStoryId={d.pendingDeleteStoryId}
        userStories={d.userStories}
        onCloseDeleteStory={() => d.setDeleteStoryConfirmOpen(false)}
        onConfirmDeleteStory={d.handleDeleteStory}
        addProjectDialogOpen={d.addProjectDialogOpen}
        onCloseAddProject={() => d.setAddProjectDialogOpen(false)}
        onProjectCreated={d.handleProjectCreated}
      />
    </Box>
  );
}
