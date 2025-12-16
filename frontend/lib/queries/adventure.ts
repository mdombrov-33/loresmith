import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { API_BASE_URL, fetchWithTimeout, getAuthHeaders } from "@/lib/api/base";
import { queryKeys } from "./keys";

export function useCheckActiveSession(worldId: number) {
  const { getToken, isLoaded } = useAuth();

  return useQuery({
    queryKey: queryKeys.activeSession(worldId),
    queryFn: async () => {
      const token = await getToken();
      const url = `${API_BASE_URL}/worlds/${worldId}/adventure/check`;
      const response = await fetchWithTimeout(url, {
        method: "GET",
        headers: await getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error(`Failed to check active session: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    },
    enabled: !!worldId && isLoaded,
    staleTime: 0, //* Always fetch fresh data
  });
}

export function useStartAdventure() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (worldId: number) => {
      const token = await getToken();
      const url = `${API_BASE_URL}/worlds/${worldId}/adventure/start`;
      const response = await fetchWithTimeout(url, {
        method: "POST",
        headers: await getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error(`Failed to start adventure: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    },
    onSuccess: (data, worldId) => {
      //* Invalidate world query to refresh status
      queryClient.invalidateQueries({ queryKey: queryKeys.world(worldId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeSession(worldId) });
      queryClient.invalidateQueries({ queryKey: ["worlds"] });
    },
  });
}

export function useDeleteAdventureSession() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (sessionId: number) => {
      const token = await getToken();
      const url = `${API_BASE_URL}/adventure/${sessionId}`;
      const response = await fetchWithTimeout(url, {
        method: "DELETE",
        headers: await getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error(`Failed to delete adventure session: ${response.statusText}`);
      }
    },
    onSuccess: () => {
      //* Invalidate all worlds and session queries to refresh
      queryClient.invalidateQueries({ queryKey: ["worlds"] });
      queryClient.invalidateQueries({ queryKey: ["activeSession"] });
    },
  });
}

// TODO Phase 1: Add this hook for adventure page
// export function useAdventureSession(sessionId: number) {
//   return useQuery({
//     queryKey: queryKeys.adventureSession(sessionId),
//     queryFn: () => getAdventureSession(sessionId),
//     enabled: !!sessionId && !isNaN(sessionId),
//   });
// }
