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
  }) => ["worlds", filters || {}],
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

// Hooks
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
  return useQuery({
    queryKey: queryKeys.worlds(filters),
    queryFn: () => getWorlds(filters),
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
