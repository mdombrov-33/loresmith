import { LorePiece } from "@/types/generate-world";

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
