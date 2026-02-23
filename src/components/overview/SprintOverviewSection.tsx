import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Skeleton,
  Divider,
} from "@mui/material";
import { RocketLaunch } from "@mui/icons-material";
import { Sprint } from "@/services/api/sprints";
import { UserStory } from "@/services/api/userStories";

interface SprintOverviewSectionProps {
  sprints: Sprint[];
  allUserStories: UserStory[];
  isLoading: boolean;
}

function getSprintProgress(sprint: Sprint, userStories: UserStory[]): number {
  const storiesInSprint = userStories.filter(
    (us) => us.sprint_id === sprint.id,
  );
  if (storiesInSprint.length === 0) return 0;
  const closed = storiesInSprint.filter((us) => us.status === "closed").length;
  return Math.round((closed / storiesInSprint.length) * 100);
}

function getSprintStoryCount(sprint: Sprint, userStories: UserStory[]) {
  return userStories.filter((us) => us.sprint_id === sprint.id).length;
}

const STATUS_CHIP: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  active: { label: "Active", color: "#0078D4", bg: "#EBF3FB" },
  closed: { label: "Closed", color: "#107C10", bg: "#DFF6DD" },
  new: { label: "New", color: "#605E5C", bg: "#F3F2F1" },
};

export default function SprintOverviewSection({
  sprints,
  allUserStories,
  isLoading,
}: SprintOverviewSectionProps) {
  const visibleSprints = sprints.slice(0, 5);

  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <RocketLaunch sx={{ fontSize: 20, color: "#0078D4" }} />
          <Typography variant="subtitle1" fontWeight={600}>
            Sprint Status
          </Typography>
        </Box>

        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton
                variant="rectangular"
                height={8}
                sx={{ borderRadius: 4 }}
              />
            </Box>
          ))
        ) : visibleSprints.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ py: 4, textAlign: "center" }}
          >
            No sprints found for this project.
          </Typography>
        ) : (
          visibleSprints.map((sprint, idx) => {
            const progress = getSprintProgress(sprint, allUserStories);
            const storyCount = getSprintStoryCount(sprint, allUserStories);
            const chip = STATUS_CHIP[sprint.status] ?? STATUS_CHIP.new;

            return (
              <Box key={sprint.id}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {sprint.name}
                    </Typography>
                    <Chip
                      label={chip.label}
                      size="small"
                      sx={{
                        fontSize: "0.65rem",
                        height: 18,
                        color: chip.color,
                        backgroundColor: chip.bg,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {storyCount} stories · {progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    mb: 0.5,
                    backgroundColor: "#F3F2F1",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor:
                        sprint.status === "closed"
                          ? "#107C10"
                          : sprint.status === "active"
                            ? "#0078D4"
                            : "#8A8886",
                      borderRadius: 3,
                    },
                  }}
                />
                {sprint.start_date && sprint.end_date && (
                  <Typography variant="caption" color="text.disabled">
                    {new Date(sprint.start_date).toLocaleDateString()} –{" "}
                    {new Date(sprint.end_date).toLocaleDateString()}
                  </Typography>
                )}
                {idx < visibleSprints.length - 1 && (
                  <Divider sx={{ my: 1.5 }} />
                )}
              </Box>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
