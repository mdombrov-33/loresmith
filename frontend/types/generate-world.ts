export type GenerationStage =
  | "characters"
  | "factions"
  | "settings"
  | "events"
  | "relics"
  | "full-story";

export interface LorePiece {
  name: string;
  description: string;
  details: Record<string, string>;
  type: "character" | "faction" | "setting" | "relic" | "event";
}

export interface SelectedLore {
  character?: LorePiece;
  faction?: LorePiece;
  setting?: LorePiece;
  event?: LorePiece;
  relic?: LorePiece;
}
