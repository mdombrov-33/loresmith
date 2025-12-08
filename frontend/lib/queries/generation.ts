import { useQueryClient } from "@tanstack/react-query";
import { SelectedLore } from "@/lib/schemas";
import { useAppStore } from "@/stores/appStore";
import { useJobPolling } from "./jobs";
import { useEffect, useRef, useState } from "react";

/**
 * Hook to generate lore using the job system
 * Automatically starts generation when enabled
 */
export function useGenerateLore(
  category: "characters" | "factions" | "settings" | "events" | "relics",
  theme: string,
  count: number = 3,
  enabled: boolean = false,
) {
  const selectedLore = useAppStore((state) => state.selectedLore);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const hasSubmittedForCategory = useRef<string | null>(null);

  const { submit, job, isPolling, isFailed } = useJobPolling(
    (result) => {
      setData(result);
      setError(null);
    },
    (err) => {
      setError(err);
      setData(null);
    }
  );

  // Auto-submit job on initial load when enabled
  useEffect(() => {
    const shouldSubmit = enabled && hasSubmittedForCategory.current !== category;

    if (shouldSubmit) {
      hasSubmittedForCategory.current = category;
      setData(null); // Clear old data
      setError(null); // Clear any previous errors

      const payload: any = {
        theme,
        count,
      };

      // Add context for events and relics
      if (category === "events" && selectedLore?.setting) {
        payload.selectedSetting = selectedLore.setting;
      }
      if (category === "relics" && selectedLore?.setting && selectedLore?.event) {
        payload.selectedSetting = selectedLore.setting;
        payload.selectedEvent = selectedLore.event;
      }

      submit({
        type: `generate_${category}`,
        payload,
      });
    }
  }, [enabled, category, theme, count, selectedLore]);

  // Reset data when category changes
  useEffect(() => {
    setData(null);
    setError(null);
  }, [category]);

  const refetch = async () => {
    setData(null);
    setError(null);
    // Mark this category as submitted so auto-submit doesn't trigger again
    hasSubmittedForCategory.current = category;

    const payload: any = {
      theme,
      count,
    };

    if (category === "events" && selectedLore?.setting) {
      payload.selectedSetting = selectedLore.setting;
    }
    if (category === "relics" && selectedLore?.setting && selectedLore?.event) {
      payload.selectedSetting = selectedLore.setting;
      payload.selectedEvent = selectedLore.event;
    }

    await submit({
      type: `generate_${category}`,
      payload,
    });
  };

  return {
    data,
    isLoading: isPolling,
    error: error ? new Error(error) : null,
    refetch,
    job,
  };
}

/**
 * Hook to generate draft world using the job system
 */
export function useGenerateDraft() {
  const queryClient = useQueryClient();
  const callbacksRef = useRef<{
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
  }>({});

  const { submit, job, isPolling, isFailed, isCompleted } = useJobPolling(
    (result) => {
      queryClient.invalidateQueries({ queryKey: ["world"] });
      callbacksRef.current?.onSuccess?.(result);
    },
    (error) => {
      callbacksRef.current?.onError?.(new Error(error));
    }
  );

  const mutate = async (
    variables: { selectedLore: SelectedLore; theme: string },
    options?: {
      onSuccess?: (data: any) => void;
      onError?: (error: Error) => void;
    }
  ) => {
    try {
      const user = useAppStore.getState().user;
      if (!user) {
        throw new Error("User must be logged in to generate a draft world.");
      }

      // Store callbacks
      callbacksRef.current = {
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      };

      await submit({
        type: "create_world",
        payload: {
          selectedLore: variables.selectedLore,
          theme: variables.theme,
          user_id: user.id,
        },
      });
    } catch (err) {
      options?.onError?.(err instanceof Error ? err : new Error("Failed to generate draft world"));
    }
  };

  return {
    mutate,
    isPending: isPolling,
    job,
  };
}
