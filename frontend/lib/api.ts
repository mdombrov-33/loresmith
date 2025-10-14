import { LorePiece, SelectedLore } from "@/types/generate-world";

export async function generateLore(
  category: "characters" | "factions" | "settings" | "events" | "relics",
  theme: string,
  count: number = 3,
  regenerate: boolean = false,
): Promise<LorePiece[]> {
  const url = `http://localhost:8080/generate/${category}?theme=${theme}&count=${count}${regenerate ? "&regenerate=true" : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to generate ${category}: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`[API] ${category} response:`, data);

  return data[category] || data;
}

export interface FullStoryResponse {
  story: {
    title: string;
    content: string;
    quest: {
      title: string;
      description: string;
    };
    pieces: {
      characters: LorePiece;
      factions: LorePiece;
      settings: LorePiece;
      events: LorePiece;
      relics: LorePiece;
    };
  };
}

export async function generateFullStory(
  selectedLore: SelectedLore,
  theme: string,
): Promise<FullStoryResponse> {
  const url = `http://localhost:8080/generate/full-story?theme=${theme}`;

  const requestBody = {
    character: selectedLore.character,
    faction: selectedLore.faction,
    setting: selectedLore.setting,
    event: selectedLore.event,
    relic: selectedLore.relic,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate full story: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("[API] Full story response:", data);

  return data;
}
