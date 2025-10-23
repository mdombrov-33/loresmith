import { LorePiece, SelectedLore } from "@/types/generate-world";
import { useAppStore } from "@/stores/appStore";
import { getSession } from "next-auth/react";
import {
  FullStory,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  AuthResponse,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const REQUEST_TIMEOUT = 60000; // 60 seconds

async function getAuthHeaders() {
  const session = await getSession();
  const token = session?.token || useAppStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `Request timed out after ${timeout / 1000} seconds. Please try again.`,
      );
    }
    throw error;
  }
}

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

  // Normalize: backend may return either { story: FullStory } or
  // the FullStory object directly. Return the FullStory object.
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

export async function getWorld(worldId: number): Promise<FullStory> {
  const url = `${API_BASE_URL}/worlds/${worldId}`;

  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch world: ${response.statusText}`);
  }

  const data = await response.json();

  const fullStory = JSON.parse(data.world.full_story) as FullStory;
  return fullStory;
}

export async function registerUser(
  request: RegisterRequest,
): Promise<RegisterResponse> {
  const url = `${API_BASE_URL}/register`;

  const response = await fetchWithTimeout(url, {
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
  const url = `${API_BASE_URL}/login`;

  const response = await fetchWithTimeout(url, {
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
