import TaskDetailsDialog from "@/components/sprint/TaskDetailsDialog";
import UserStoryDialog from "@/components/sprint/UserStoryDialog";
import SprintDialog from "@/components/sprint/SprintDialog";
import AddProjectDialog from "@/components/sprint/AddProjectDialog";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { Task } from "@/services/api/tasks";
import { UserStory, UserStoryCreatePayload } from "@/services/api/userStories";
import { Sprint, SprintCreatePayload } from "@/services/api/sprints";
import { Project } from "@/services/api/projects";

interface ProjectsDialogsProps {
  // Task dialog
  dialogOpen: boolean;
  selectedTask: Task | null;
  selectedUserStory: UserStory | undefined;
  onCloseDialog: () => void;
  onSaveTask: (taskData: Partial<Task>) => void;

  // User story dialog
  userStoryDialogOpen: boolean;
  editingUserStory: UserStory | null;
  sprints: Sprint[];
  selectedSprintId: string;
  onCloseUserStoryDialog: () => void;
  onSaveUserStory: (
    payload: UserStoryCreatePayload,
    id?: string,
  ) => Promise<void>;

  // Sprint dialog
  sprintDialogOpen: boolean;
  editingSprint: Sprint | null;
  selectedProjectId: string;
  projects: Project[];
  onCloseSprintDialog: () => void;
  onSaveSprint: (payload: SprintCreatePayload, id?: string) => Promise<void>;

  // Delete story dialog
  deleteStoryConfirmOpen: boolean;
  pendingDeleteStoryId: string | null;
  userStories: UserStory[];
  onCloseDeleteStory: () => void;
  onConfirmDeleteStory: () => void;

  // Add / edit project dialog
  addProjectDialogOpen: boolean;
  editingProject: Project | null;
  onCloseAddProject: () => void;
  onProjectCreated: () => void;

  // Delete project dialog
  deleteProjectConfirmOpen: boolean;
  selectedProject: Project | undefined;
  onCloseDeleteProject: () => void;
  onConfirmDeleteProject: () => void;

  // Delete sprint dialog
  deleteSprintConfirmOpen: boolean;
  selectedSprint: Sprint | undefined;
  onCloseDeleteSprint: () => void;
  onConfirmDeleteSprint: () => void;
}

export default function ProjectsDialogs({
  dialogOpen,
  selectedTask,
  selectedUserStory,
  onCloseDialog,
  onSaveTask,
  userStoryDialogOpen,
  editingUserStory,
  sprints,
  selectedSprintId,
  onCloseUserStoryDialog,
  onSaveUserStory,
  sprintDialogOpen,
  editingSprint,
  selectedProjectId,
  projects,
  onCloseSprintDialog,
  onSaveSprint,
  deleteStoryConfirmOpen,
  pendingDeleteStoryId,
  userStories,
  onCloseDeleteStory,
  onConfirmDeleteStory,
  addProjectDialogOpen,
  editingProject,
  onCloseAddProject,
  onProjectCreated,
  deleteProjectConfirmOpen,
  selectedProject,
  onCloseDeleteProject,
  onConfirmDeleteProject,
  deleteSprintConfirmOpen,
  selectedSprint,
  onCloseDeleteSprint,
  onConfirmDeleteSprint,
}: ProjectsDialogsProps) {
  const { can } = usePermissions();
  return (
    <>
      <TaskDetailsDialog
        open={dialogOpen}
        onClose={onCloseDialog}
        task={selectedTask}
        userStory={selectedUserStory}
        onSave={onSaveTask}
        readOnly={!can("task:write")}
      />

      <UserStoryDialog
        open={userStoryDialogOpen}
        onClose={onCloseUserStoryDialog}
        sprints={sprints}
        defaultSprintId={selectedSprintId}
        editStory={editingUserStory}
        onSave={onSaveUserStory}
      />

      <SprintDialog
        open={sprintDialogOpen}
        onClose={onCloseSprintDialog}
        projectId={selectedProjectId}
        projects={projects}
        editSprint={editingSprint}
        onSave={onSaveSprint}
      />

      <DeleteConfirmDialog
        open={deleteStoryConfirmOpen}
        onClose={onCloseDeleteStory}
        onConfirm={onConfirmDeleteStory}
        itemType="User Story"
        itemName={userStories.find((s) => s.id === pendingDeleteStoryId)?.title}
      />

      <AddProjectDialog
        open={addProjectDialogOpen}
        onClose={onCloseAddProject}
        onCreated={onProjectCreated}
        editProject={editingProject}
      />

      <DeleteConfirmDialog
        open={deleteProjectConfirmOpen}
        onClose={onCloseDeleteProject}
        onConfirm={onConfirmDeleteProject}
        itemType="Project"
        itemName={selectedProject?.name}
      />

      <DeleteConfirmDialog
        open={deleteSprintConfirmOpen}
        onClose={onCloseDeleteSprint}
        onConfirm={onConfirmDeleteSprint}
        itemType="Sprint"
        itemName={selectedSprint?.name}
      />
    </>
  );
}
