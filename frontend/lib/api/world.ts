import { World } from "@/lib/schemas";
import { API_BASE_URL, fetchWithTimeout, getAuthHeaders } from "./base";

export async function getWorld(worldId: number): Promise<World> {
  const url = `${API_BASE_URL}/worlds/${worldId}`;

  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch world: ${response.statusText}`);
  }

  const data = await response.json();
  return data.world as World;
}

export async function getWorlds(filters?: {
  scope?: "my" | "global";
  theme?: string;
  status?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{ worlds: World[]; total: number }> {
  let url: URL;
  if (filters?.search) {
    url = new URL(`${API_BASE_URL}/worlds/search`);
    url.searchParams.set("q", filters.search);
    if (filters.scope) url.searchParams.set("scope", filters.scope);
    if (filters.theme) url.searchParams.set("theme", filters.theme);
    if (filters.status) url.searchParams.set("status", filters.status);
    if (filters.limit) url.searchParams.set("limit", filters.limit.toString());
    if (filters.offset)
      url.searchParams.set("offset", filters.offset.toString());
  } else {
    url = new URL(`${API_BASE_URL}/worlds`);
    if (filters) {
      if (filters.scope) url.searchParams.set("scope", filters.scope);
      if (filters.theme) url.searchParams.set("theme", filters.theme);
      if (filters.status) url.searchParams.set("status", filters.status);
      if (filters.limit)
        url.searchParams.set("limit", filters.limit.toString());
      if (filters.offset)
        url.searchParams.set("offset", filters.offset.toString());
    }
  }

  const response = await fetchWithTimeout(url.toString(), {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch worlds: ${response.statusText}`);
  }

  const data = await response.json();
  return { worlds: data.worlds || [], total: data.total || 0 };
}

export async function deleteWorld(worldId: number): Promise<void> {
  const url = `${API_BASE_URL}/worlds/${worldId}`;

  const response = await fetchWithTimeout(url, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete world: ${response.statusText}`);
  }
}

export async function updateWorldVisibility(
  worldId: number,
  visibility: "private" | "published",
): Promise<void> {
  const url = `${API_BASE_URL}/worlds/${worldId}/visibility`;

  const response = await fetchWithTimeout(url, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ visibility }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Failed to update world visibility: ${response.statusText}`,
    );
  }
}
