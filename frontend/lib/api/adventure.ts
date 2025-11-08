import { API_BASE_URL, fetchWithTimeout, getAuthHeaders } from "./base";

export async function checkActiveSession(
  worldId: number,
): Promise<{ has_active_session: boolean; session: any | null }> {
  const url = `${API_BASE_URL}/worlds/${worldId}/adventure/check`;

  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || `Failed to check active session: ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data;
}

export async function startAdventure(
  worldId: number,
): Promise<{ session_id: number; protagonist: any }> {
  const url = `${API_BASE_URL}/worlds/${worldId}/adventure/start`;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || `Failed to start adventure: ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data;
}

export async function deleteAdventureSession(
  sessionId: number,
): Promise<void> {
  const url = `${API_BASE_URL}/adventure/${sessionId}`;

  const response = await fetchWithTimeout(url, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error ||
        `Failed to delete adventure session: ${response.statusText}`,
    );
  }
}

// TODO Phase 1: Add this function for adventure page theme syncing
// export async function getAdventureSession(sessionId: number): Promise<{ id: number; world_id: number; ... }> {
//   const url = `${API_BASE_URL}/adventure/${sessionId}`;
//   const response = await fetchWithTimeout(url, { method: "GET", headers: await getAuthHeaders() });
//   if (!response.ok) throw new Error("Failed to fetch adventure session");
//   return response.json();
// }
