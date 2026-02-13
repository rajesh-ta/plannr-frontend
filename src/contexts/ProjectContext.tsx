"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ProjectContextType {
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  return (
    <ProjectContext.Provider
      value={{ selectedProjectId, setSelectedProjectId }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
