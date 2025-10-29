import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  generateLore,
  generateFullStory,
  generateDraft,
  getWorld,
  getWorlds,
  deleteWorld,
  registerUser,
  loginUser,
  startAdventure,
  deleteAdventureSession,
  updateWorldVisibility,
} from "./api";
import { RegisterRequest, LoginRequest } from "@/types/api";
import { SelectedLore } from "@/types/generate-world";

//* Query keys
export const queryKeys = {
  world: (id: number) => ["world", id],
  worlds: (filters?: {
    scope?: "my" | "global";
    theme?: string;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }) => {
    if (filters?.search && filters.search.trim()) {
      //* For search queries, exclude pagination params from key since we fetch all and paginate locally
      return [
        "worlds",
        {
          scope: filters.scope,
          theme: filters.theme,
          status: filters.status,
          search: filters.search,
        },
      ];
    }
    return ["worlds", filters || {}];
  },
  lore: (
    category: string,
    theme: string,
    count: number,
    regenerate?: boolean,
  ) => ["lore", category, theme, count, regenerate || false],
  fullStory: (selectedLore: SelectedLore, theme: string) => [
    "fullStory",
    selectedLore,
    theme,
  ],
};

//* Hooks
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

export function useGenerateLore(
  category: "characters" | "factions" | "settings" | "events" | "relics",
  theme: string,
  count: number = 3,
  regenerate: boolean = false,
  enabled: boolean = false,
) {
  return useQuery({
    queryKey: queryKeys.lore(category, theme, count, regenerate),
    queryFn: () => generateLore(category, theme, count, regenerate),
    enabled,
  });
}

export function useGenerateFullStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      selectedLore,
      theme,
    }: {
      selectedLore: SelectedLore;
      theme: string;
    }) => generateFullStory(selectedLore, theme),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["world"] });
    },
  });
}

export function useGenerateDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      selectedLore,
      theme,
    }: {
      selectedLore: SelectedLore;
      theme: string;
    }) => generateDraft(selectedLore, theme),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["world"] });
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

export function useRegister() {
  return useMutation({
    mutationFn: (request: RegisterRequest) => registerUser(request),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (request: LoginRequest) => loginUser(request),
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
      //* Invalidate worlds query to refresh the list
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

// TODO Phase 1: Add this hook for adventure page
// export function useAdventureSession(sessionId: number) {
//   return useQuery({
//     queryKey: ["adventureSession", sessionId],
//     queryFn: () => getAdventureSession(sessionId),
//     enabled: !!sessionId && !isNaN(sessionId),
//   });
// }
