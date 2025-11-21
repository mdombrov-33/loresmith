import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { generateLore, generateFullStory, generateDraft } from "@/lib/api/generation";
import { SelectedLore } from "@/lib/schemas";
import { queryKeys } from "./keys";
import { useAppStore } from "@/stores/appStore";

export function useGenerateLore(
  category: "characters" | "factions" | "settings" | "events" | "relics",
  theme: string,
  count: number = 3,
  enabled: boolean = false,
) {
  const selectedLore = useAppStore((state) => state.selectedLore);

  return useQuery({
    queryKey: queryKeys.lore(category, theme, count),
    queryFn: ({ signal }) => generateLore(category, theme, count, signal, selectedLore),
    enabled,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
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
