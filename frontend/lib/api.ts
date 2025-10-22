import { LorePiece, SelectedLore } from "@/types/generate-world";
import { useAppStore } from "@/stores/appStore";
import { getSession } from "next-auth/react";
import {
  FullStoryResponse,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  AuthResponse,
} from "@/types/api";

async function getAuthHeaders() {
  const session = await getSession();
  const token = session?.token || useAppStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function generateLore(
  category: "characters" | "factions" | "settings" | "events" | "relics",
  theme?: string,
  count: number = 3,
  regenerate: boolean = false,
): Promise<LorePiece[]> {
  const storeTheme = useAppStore.getState().theme;
  const finalTheme = theme || storeTheme;
  const url = `http://localhost:8080/generate/${category}?theme=${finalTheme}&count=${count}${regenerate ? "&regenerate=true" : ""}`;

  const response = await fetch(url, {
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
): Promise<FullStoryResponse> {
  const storeTheme = useAppStore.getState().theme;
  const finalTheme = theme || storeTheme;
  const url = `http://localhost:8080/generate/full-story?theme=${finalTheme}`;

  const requestBody = Object.fromEntries(
    Object.entries(selectedLore).filter(([, value]) => value !== undefined),
  );

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(url, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to generate full story: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out after 60 seconds. Please try again.");
    }
    throw error;
  }
}

export async function generateDraft(
  selectedLore: SelectedLore,
  theme?: string,
): Promise<{ world_id: number }> {
  const storeTheme = useAppStore.getState().theme;
  const finalTheme = theme || storeTheme;
  const url = `http://localhost:8080/worlds/draft`;

  const requestBody = {
    pieces: Object.fromEntries(
      Object.entries(selectedLore).filter(([, value]) => value !== undefined),
    ),
    theme: finalTheme,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(url, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to generate draft: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out after 60 seconds. Please try again.");
    }
    throw error;
  }
}

export async function getWorld(worldId: number): Promise<FullStoryResponse> {
  const url = `http://localhost:8080/worlds/${worldId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch world: ${response.statusText}`);
  }

  const data = await response.json();

  const fullStory = JSON.parse(data.world.full_story);
  return fullStory;
}

export async function registerUser(
  request: RegisterRequest,
): Promise<RegisterResponse> {
  const url = "http://localhost:8080/register";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || `Registration failed: ${response.statusText}`,
    );
  }

  const data = await response.json();

  return data;
}

export async function loginUser(request: LoginRequest): Promise<AuthResponse> {
  const url = "http://localhost:8080/login";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Login failed: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
}
