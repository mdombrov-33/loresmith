"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type AppStage = "home" | "generating" | "story" | "adventure";

interface AppStageContextType {
  appStage: AppStage;
  setAppStage: (stage: AppStage) => void;
}

const AppStageContext = createContext<AppStageContextType | undefined>(
  undefined,
);

export function AppStageProvider({ children }: { children: ReactNode }) {
  const [appStage, setAppStage] = useState<AppStage>("home");

  return (
    <AppStageContext.Provider value={{ appStage, setAppStage }}>
      {children}
    </AppStageContext.Provider>
  );
}

export function useAppStage() {
  const context = useContext(AppStageContext);
  if (context === undefined) {
    throw new Error("useAppStage must be used within an AppStageProvider");
  }
  return context;
}
