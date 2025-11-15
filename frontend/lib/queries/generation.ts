import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { generateLore, generateFullStory, generateDraft } from "@/lib/api/generation";
import { SelectedLore } from "@/lib/schemas";
import { queryKeys } from "./keys";

export function useGenerateLore(
  category: "characters" | "factions" | "settings" | "events" | "relics",
  theme: string,
  count: number = 3,
  enabled: boolean = false,
) {
  return useQuery({
    queryKey: queryKeys.lore(category, theme, count),
    queryFn: ({ signal }) => generateLore(category, theme, count, signal), //* Pass abort signal
    enabled,
    staleTime: Infinity, // Never mark data as stale
    gcTime: 0, // Don't cache aborted/failed requests
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on network reconnect
    retry: false, // Don't retry failed requests automatically
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
