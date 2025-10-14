import { LorePiece, SelectedLore } from "@/types/generate-world";

function getAuthHeaders() {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function generateLore(
  category: "characters" | "factions" | "settings" | "events" | "relics",
  theme: string,
  count: number = 3,
  regenerate: boolean = false,
): Promise<LorePiece[]> {
  const url = `http://localhost:8080/generate/${category}?theme=${theme}&count=${count}${regenerate ? "&regenerate=true" : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate full story: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("[API] Full story response:", data);

  return data;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export interface RegisterResponse {
  user: {
    id: number;
    username: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
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
  console.log("[API] Register response:", data);

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
  console.log("[API] Login response:", data);

  return data;
}
