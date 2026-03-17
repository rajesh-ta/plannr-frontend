"use client";

import {
  Avatar,
  Box,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import { MemberWorkload } from "@/hooks/useOverviewData";

interface Props {
  workload: MemberWorkload[];
  unassignedOpen: number;
  isLoading: boolean;
}

const AVATAR_COLORS = [
  "#9775fa",
  "#4dabf7",
  "#69db7c",
  "#ff8787",
  "#ffa94d",
  "#a9e34b",
  "#74c0fc",
  "#da77f2",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TeamWorkloadSection({
  workload,
  unassignedOpen,
  isLoading,
}: Props) {
  const maxTotal =
    workload.length > 0 ? Math.max(...workload.map((m) => m.total), 1) : 1;
  const rows = isLoading ? Array(5).fill(null) : workload;
  const hasData = !isLoading && workload.length > 0;
  const empty = !isLoading && workload.length === 0 && unassignedOpen === 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        flex: 1,
        // On desktop the parent is height-constrained so minHeight:0 lets this shrink
        // and fill. On mobile/tablet the parent is auto-height, so we give it a
        // minimum height so the content is always visible without internal scroll.
        minHeight: { xs: 300, md: 0 },
        display: "flex",
        flexDirection: "column",
        border: "1px solid #EDEBE9",
        borderRadius: 2,
        background: "#ffffff",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={600} color="#323130">
            Team Workload
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Open and completed tasks per assignee
          </Typography>
        </Box>

        {/* Legend */}
        {hasData && (
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1, sm: 2 },
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "#9775fa",
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Open
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "#4caf50",
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Closed
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Empty state */}
      {empty && (
        <Box
          sx={{
            py: 5,
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          <Typography variant="body2">
            No tasks have been assigned to team members yet.
          </Typography>
        </Box>
      )}

      {/* Rows */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          pr: 0.5,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#EDEBE9",
            borderRadius: 99,
          },
          "&::-webkit-scrollbar-thumb:hover": { bgcolor: "#C8C6C4" },
        }}
      >
        {rows.map((member, idx) => {
          if (!member) {
            /* Skeleton */
            return (
              <Box
                key={idx}
                sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton variant="text" width={110} height={20} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="rounded" height={12} />
                </Box>
                <Skeleton variant="text" width={60} height={20} />
              </Box>
            );
          }

          const m = member as MemberWorkload;
          const barPct = (m.total / maxTotal) * 100;
          const openPct = m.total > 0 ? (m.open / m.total) * 100 : 0;
          const closedPct = m.total > 0 ? (m.closed / m.total) * 100 : 0;

          return (
            <Tooltip
              key={m.userId}
              title={`${m.open} open · ${m.closed} closed`}
              placement="right"
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 0.75,
                  px: 1,
                  borderRadius: 1.5,
                  cursor: "default",
                  transition: "background 0.15s",
                  "&:hover": { background: "#F8F7FF" },
                }}
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: getAvatarColor(m.name),
                    fontSize: 13,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {initials(m.name)}
                </Avatar>

                {/* Name */}
                <Typography
                  variant="body2"
                  fontWeight={500}
                  color="#323130"
                  sx={{
                    width: 130,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {m.name}
                </Typography>

                {/* Bar track */}
                <Box
                  sx={{
                    flex: 1,
                    height: 10,
                    borderRadius: 99,
                    bgcolor: "#F3F2F1",
                    overflow: "hidden",
                  }}
                >
                  {/* Filled region = proportion of maxTotal */}
                  <Box
                    sx={{
                      width: `${barPct}%`,
                      height: "100%",
                      display: "flex",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    {/* Open segment (purple) */}
                    {m.open > 0 && (
                      <Box
                        sx={{
                          width: `${openPct}%`,
                          bgcolor: "#9775fa",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    {/* Closed segment (green) */}
                    {m.closed > 0 && (
                      <Box
                        sx={{
                          width: `${closedPct}%`,
                          bgcolor: "#69db7c",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Count annotation */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.75,
                    flexShrink: 0,
                    minWidth: 80,
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="#9775fa"
                  >
                    {m.open} open
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    ·
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {m.closed} done
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          );
        })}

        {/* Unassigned row */}
        {!isLoading && unassignedOpen > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              py: 0.75,
              px: 1,
              borderRadius: 1.5,
              borderTop: workload.length > 0 ? "1px dashed #EDEBE9" : "none",
              mt: workload.length > 0 ? 0.5 : 0,
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "#EDEBE9",
                color: "#605E5C",
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              ?
            </Avatar>
            <Typography
              variant="body2"
              fontWeight={500}
              color="#605E5C"
              sx={{ width: 130, flexShrink: 0 }}
            >
              Unassigned
            </Typography>
            <Box
              sx={{
                flex: 1,
                height: 10,
                borderRadius: 99,
                bgcolor: "#F3F2F1",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${(unassignedOpen / maxTotal) * 100}%`,
                  height: "100%",
                  bgcolor: "#CCC8C0",
                  borderRadius: 99,
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 0.75,
                flexShrink: 0,
                minWidth: 80,
                justifyContent: "flex-end",
              }}
            >
              <Typography variant="caption" fontWeight={600} color="#605E5C">
                {unassignedOpen} open
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
