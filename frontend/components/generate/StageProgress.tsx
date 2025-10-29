"use client";

import { User, Users, MapPin, Zap, Gem, BookOpen } from "lucide-react";

interface StageProgressProps {
  currentStage: string;
}

const stages = [
  { name: "characters", icon: User, label: "Character" },
  { name: "factions", icon: Users, label: "Faction" },
  { name: "settings", icon: MapPin, label: "Setting" },
  { name: "events", icon: Zap, label: "Event" },
  { name: "relics", icon: Gem, label: "Relic" },
  { name: "full-story", icon: BookOpen, label: "Story" },
];

export default function StageProgress({ currentStage }: StageProgressProps) {
  const currentIndex = stages.findIndex((s) => s.name === currentStage);

  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {stages.map((stage, index) => {
        const Icon = stage.icon;
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <div key={stage.name} className="flex items-center">
            <div
              className={`flex flex-col items-center transition-all duration-300 ${
                isCurrent ? "scale-110" : ""
              }`}
            >
              <div
                className={`border-border flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary text-primary-foreground border-primary"
                    : isCurrent
                      ? "bg-primary/20 text-primary border-primary animate-pulse"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`text-muted-foreground mt-1 text-xs transition-opacity ${
                  isCurrent ? "opacity-100" : "opacity-50"
                }`}
              >
                {stage.label}
              </span>
            </div>
            {index < stages.length - 1 && (
              <div
                className={`border-border mx-2 h-0.5 w-8 border-t-2 transition-colors duration-300 ${
                  isCompleted ? "border-primary" : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
