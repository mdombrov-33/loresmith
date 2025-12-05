import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { checkActiveSession, startAdventure, deleteAdventureSession } from "@/lib/api/adventure";
import { queryKeys } from "./keys";

export function useCheckActiveSession(worldId: number) {
  return useQuery({
    queryKey: queryKeys.activeSession(worldId),
    queryFn: () => checkActiveSession(worldId),
    staleTime: 0, //* Always fetch fresh data
  });
}

export function useStartAdventure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (worldId: number) => startAdventure(worldId),
    onSuccess: (data, worldId) => {
      //* Invalidate world query to refresh status
      queryClient.invalidateQueries({ queryKey: queryKeys.world(worldId) });
      queryClient.invalidateQueries({ queryKey: ["worlds"] });
    },
  });
}

export function useDeleteAdventureSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number) => deleteAdventureSession(sessionId),
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
