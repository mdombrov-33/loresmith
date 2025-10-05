import { GenerationStage } from "@/types/generate-world";

export interface StageConfig {
  title: string;
  description: string;
  category:
    | "characters"
    | "factions"
    | "settings"
    | "events"
    | "relics"
    | "full-story";
}

export const STAGE_CONFIG: Record<GenerationStage, StageConfig> = {
  characters: {
    title: "Choose Your Character",
    description: "Select your playable character for this adventure",
    category: "characters",
  },
  factions: {
    title: "Choose a Faction",
    description: "Select a notable faction that will shape your story",
    category: "factions",
  },
  settings: {
    title: "Choose Your Setting",
    description: "Select the primary location where your adventure begins",
    category: "settings",
  },
  events: {
    title: "Choose a Historical Event",
    description: "Select a significant event that impacts your world",
    category: "events",
  },
  relics: {
    title: "Choose a Relic",
    description: "Select a powerful artifact that exists in your world",
    category: "relics",
  },
  "full-story": {
    title: "Generate Full Story",
    description: "Creating your complete adventure narrative",
    category: "full-story",
  },
};

export const STAGE_ORDER: GenerationStage[] = [
  "characters",
  "factions",
  "settings",
  "events",
  "relics",
  "full-story",
];

export function getNextStage(
  currentStage: GenerationStage,
): GenerationStage | null {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === STAGE_ORDER.length - 1) {
    return null;
  }
  return STAGE_ORDER[currentIndex + 1];
}
