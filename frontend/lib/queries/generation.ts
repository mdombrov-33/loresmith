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
    queryFn: () => generateLore(category, theme, count),
    enabled,
    staleTime: Infinity, // Never mark data as stale
    refetchOnMount: false, // Don't refetch when component mounts
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
