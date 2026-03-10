"use client";

import { useCallback } from "react";
import {
  setSelectedProjectId,
  setSelectedSprintId,
} from "@/store/projectSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export interface UseProjectReturn {
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedSprintId: string;
  setSelectedSprintId: (id: string) => void;
}

/**
 * Returns the Redux-backed project selection state and its setters.
 * Replaces the old React Context-based useProject hook.
 */
export function useProject(): UseProjectReturn {
  const dispatch = useAppDispatch();
  const selectedProjectId = useAppSelector((s) => s.project.selectedProjectId);
  const selectedSprintId = useAppSelector((s) => s.project.selectedSprintId);

  const handleSetProjectId = useCallback(
    (id: string) => dispatch(setSelectedProjectId(id)),
    [dispatch],
  );

  const handleSetSprintId = useCallback(
    (id: string) => dispatch(setSelectedSprintId(id)),
    [dispatch],
  );

  return {
    selectedProjectId,
    setSelectedProjectId: handleSetProjectId,
    selectedSprintId,
    setSelectedSprintId: handleSetSprintId,
  };
}
