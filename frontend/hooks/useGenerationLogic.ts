"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  GenerationStage,
  SelectedLore,
  LorePiece,
} from "@/types/generate-world";
import { useAppStore } from "@/stores/appStore";
import { useGenerateLore, useGenerateDraft } from "@/lib/queries";
import { STAGE_CONFIG, getNextStage } from "@/constants/stage-config";
import { LOADING_MESSAGES } from "@/constants/loading-messages";

export function useGenerationLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = searchParams.get("theme") || "fantasy";
  const { setAppStage, updateSelectedLore, setSelectedLore } = useAppStore();

  const [stage, setStage] = useState<GenerationStage>("characters");
  const [generatedOptions, setGeneratedOptions] = useState<LorePiece[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasRegenerated, setHasRegenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerateFlag, setRegenerateFlag] = useState(false);
  const [generationMode, setGenerationMode] = useState<
    "random" | "custom" | null
  >(null);

  const stageConfig = STAGE_CONFIG[stage];

  const {
    data: loreData,
    isLoading,
    refetch,
  } = useGenerateLore(
    stageConfig.category as
      | "characters"
      | "factions"
      | "settings"
      | "events"
      | "relics",
    theme,
    3,
    regenerateFlag,
    true,
  );

  const generateDraftMutation = useGenerateDraft();

  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(0);

  //* Cycle through loading messages during full story generation
  useEffect(() => {
    if (generateDraftMutation.isPending) {
      const interval = setInterval(() => {
        setCurrentLoadingMessage(
          (prev) => (prev + 1) % LOADING_MESSAGES.length,
        );
      }, 3000); //* change every 3 secs
      return () => clearInterval(interval);
    } else {
      setCurrentLoadingMessage(0);
    }
  }, [generateDraftMutation.isPending]);

  //* Set app stage on mount and cleanup on unmount
  useEffect(() => {
    setAppStage("generating");
    setSelectedLore({}); //* Clear previous selections for new generation
    return () => setAppStage("home");
  }, [setAppStage, setSelectedLore]);

  //* Clear generated options when stage changes
  useEffect(() => {
    setGeneratedOptions([]);
    setSelectedIndex(null);
    setError(null);
  }, [stage]);

  //* Update generated options when data changes
  useEffect(() => {
    if (loreData) {
      setGeneratedOptions(loreData);
      setSelectedIndex(null);
      setError(null);
    }
  }, [loreData]);

  const handleSelectCard = (index: number) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  const handleRegenerate = () => {
    setGeneratedOptions([]); //* Clear cards immediately to prevent stacking
    setSelectedIndex(null); //* Clear selection
    setRegenerateFlag(true);
    setHasRegenerated(true);
    refetch();
  };

  const handleNext = async () => {
    if (selectedIndex === null) return;

    //* Save the selected lore piece
    const selectedPiece = generatedOptions[selectedIndex];
    //* Map plural stage names to singular SelectedLore keys
    const stageKeyMap: Record<string, keyof SelectedLore> = {
      characters: "character",
      factions: "faction",
      settings: "setting",
      events: "event",
      relics: "relic",
    };
    const stageKey = stageKeyMap[stage] || (stage as keyof SelectedLore);

    updateSelectedLore(stageKey, selectedPiece);

    //* Move to next stage
    const nextStage = getNextStage(stage);
    if (nextStage) {
      if (nextStage === "full-story") {
        //* Generate draft world and navigate to story page
        generateDraftMutation.mutate(
          { selectedLore: useAppStore.getState().selectedLore, theme },
          {
            onSuccess: (response) => {
              router.push(
                `/worlds/${encodeURIComponent(theme)}/${response.world_id}`,
              );
            },
            onError: (err) => {
              setError(
                err instanceof Error
                  ? err.message
                  : "Failed to generate draft world",
              );
            },
          },
        );
      } else {
        setStage(nextStage);
        setHasRegenerated(false);
        setRegenerateFlag(false);
      }
    }
  };

  const handleSelectRandom = () => {
    setGenerationMode("random");
  };

  const handleSelectCustom = () => {
    setGenerationMode("custom");
  };

  return {
    stageConfig,
    isLoading,
    error,
    generatedOptions,
    selectedIndex,
    hasRegenerated,
    generateDraftMutation,
    currentLoadingMessage,
    generationMode,
    handleSelectCard,
    handleRegenerate,
    handleNext,
    handleSelectRandom,
    handleSelectCustom,
    refetch,
  };
}
