import { LorePiece, SelectedLore, FullStory } from "@/lib/schemas";
import { useAppStore } from "@/stores/appStore";
import { API_BASE_URL, fetchWithTimeout, getAuthHeaders } from "./base";

export async function generateLore(
  category: "characters" | "factions" | "settings" | "events" | "relics",
  theme?: string,
  count: number = 3,
  regenerate: boolean = false,
): Promise<LorePiece[]> {
  const storeTheme = useAppStore.getState().theme;
  const finalTheme = theme || storeTheme;
  const url = `${API_BASE_URL}/generate/${category}?theme=${finalTheme}&count=${count}${regenerate ? "&regenerate=true" : ""}`;

  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate ${category}: ${response.statusText}`);
  }

  const data = await response.json();
  return data[category] || data;
}

export async function generateFullStory(
  selectedLore: SelectedLore,
  theme?: string,
): Promise<FullStory> {
  const storeTheme = useAppStore.getState().theme;
  const finalTheme = theme || storeTheme;
  const url = `${API_BASE_URL}/generate/full-story?theme=${finalTheme}`;

  const requestBody = Object.fromEntries(
    Object.entries(selectedLore).filter(([, value]) => value !== undefined),
  );

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate full story: ${response.statusText}`);
  }

  const data = await response.json();

  //* Normalize: backend may return either { story: FullStory } or
  //* the FullStory object directly. Return the FullStory object.
  return data && data.story ? data.story : data;
}

export async function generateDraft(
  selectedLore: SelectedLore,
  theme?: string,
): Promise<{ world_id: number }> {
  const storeTheme = useAppStore.getState().theme;
  const finalTheme = theme || storeTheme;
  const user = useAppStore.getState().user;
  if (!user) {
    throw new Error("User must be logged in to generate a draft world.");
  }
  const url = `${API_BASE_URL}/worlds/draft`;

  const requestBody = {
    pieces: Object.fromEntries(
      Object.entries(selectedLore).filter(([, value]) => value !== undefined),
    ),
    theme: finalTheme,
    user_id: user.id,
  };

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate draft: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
