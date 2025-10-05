import { LorePiece } from "@/types/generate-world";

export async function generateLore(
  category: "characters" | "factions" | "settings" | "events" | "relics",
  theme: string,
  count: number = 3,
): Promise<LorePiece[]> {
  const response = await fetch(
    `http://localhost:8080/generate/${category}?theme=${theme}&count=${count}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to generate ${category}: ${response.statusText}`);
  }

  const data = await response.json();
  return data[category] || data;
}
