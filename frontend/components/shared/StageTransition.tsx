"use client";

import { ReactNode, useEffect, useState } from "react";

interface StageTransitionProps {
  children: ReactNode;
  stageKey: string;
}

export default function StageTransition({
  children,
  stageKey,
}: StageTransitionProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [currentStage, setCurrentStage] = useState(stageKey);

  useEffect(() => {
    if (currentStage !== stageKey) {
      setIsExiting(true);
      const timeout = setTimeout(() => {
        setCurrentStage(stageKey);
        setIsExiting(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [stageKey, currentStage]);

  return (
    <div
      className={`transition-opacity duration-300 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {children}
    </div>
  );
}
