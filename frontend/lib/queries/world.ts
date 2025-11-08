import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorld, getWorlds, deleteWorld, updateWorldVisibility } from "@/lib/api/world";
import { queryKeys } from "./keys";

export function useWorld(worldId: number) {
  return useQuery({
    queryKey: queryKeys.world(worldId),
    queryFn: () => getWorld(worldId),
    enabled: !!worldId && !isNaN(worldId),
    retry: false, //* Don't retry on 404 or auth errors
  });
}

export function useWorlds(filters?: {
  scope?: "my" | "global";
  theme?: string;
  status?: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  //* For search queries, fetch all results and paginate locally to avoid re-running search
  const isSearchQuery = filters?.search && filters.search.trim();

  return useQuery({
    queryKey: queryKeys.worlds(filters),
    queryFn: async () => {
      if (isSearchQuery) {
        //* For search queries, fetch all results once
        const allResults = await getWorlds({
          ...filters,
          limit: 100, //* Fetch all
          offset: 0,
        });

        //* Return all worlds for local pagination in component
        return {
          worlds: allResults.worlds,
          total: allResults.worlds.length,
        };
      } else {
        //* Normal server-side pagination for non-search queries
        return getWorlds(filters);
      }
    },
  });
}

export function useDeleteWorld() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (worldId: number) => deleteWorld(worldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worlds"] });
    },
  });
}

export function useUpdateWorldVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ worldId, visibility }: { worldId: number; visibility: "private" | "published" }) =>
      updateWorldVisibility(worldId, visibility),
    onSuccess: (_, { worldId }) => {
      //* Invalidate world and worlds queries to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.world(worldId) });
      queryClient.invalidateQueries({ queryKey: ["worlds"] });
    },
  });
}
