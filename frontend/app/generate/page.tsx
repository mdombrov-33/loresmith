"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import {
  GenerationStage,
  SelectedLore,
  LorePiece,
} from "@/types/generate-world";
import { useAppStore } from "@/stores/appStore";
import CharacterCard from "@/components/generate/CharacterCard";
import FactionCard from "@/components/generate/FactionCard";
import SettingCard from "@/components/generate/SettingCard";
import EventCard from "@/components/generate/EventCard";
import RelicCard from "@/components/generate/RelicCard";
import ActionButtons from "@/components/generate/ActionButtons";
import { useGenerateLore, useGenerateDraft } from "@/lib/queries";
import { STAGE_CONFIG, getNextStage } from "@/constants/stage-config";

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "fantasy";
  const { setAppStage, updateSelectedLore, setSelectedLore } = useAppStore();

  const [stage, setStage] = useState<GenerationStage>("characters");
  const [generatedOptions, setGeneratedOptions] = useState<LorePiece[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasRegenerated, setHasRegenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerateFlag, setRegenerateFlag] = useState(false);

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

  //* Loading messages for full story generation
  const loadingMessages = [
    "Creating your world...",
    "Weaving narratives into adventure...",
    "Forging legendary tales...",
    "Bending reality into story...",
    "Crafting your epic journey...",
  ];

  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(0);

  //* Cycle through loading messages during full story generation
  useEffect(() => {
    if (generateDraftMutation.isPending) {
      const interval = setInterval(() => {
        setCurrentLoadingMessage((prev) => (prev + 1) % loadingMessages.length);
      }, 3000); //* change every 3 secs
      return () => clearInterval(interval);
    } else {
      setCurrentLoadingMessage(0);
    }
  }, [generateDraftMutation.isPending, loadingMessages.length]);

  //* Set app stage on mount and cleanup on unmount
  useEffect(() => {
    setAppStage("generating");
    setSelectedLore({}); //* Clear previous selections for new generation
    return () => setAppStage("home");
  }, [setAppStage, setSelectedLore]);

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
              window.location.href = `/worlds/${encodeURIComponent(
                theme,
              )}/${response.world_id}`;
            },
            onError: (err) => {
              setError(
                err instanceof Error
                  ? err.message
                  : "Failed to generate draft world",
              );
              console.error("Draft generation error:", err);
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

  const renderCard = (option: LorePiece, index: number) => {
    const isSelected = selectedIndex === index;
    const onSelect = () => handleSelectCard(index);

    switch (stage) {
      case "characters":
        return (
          <CharacterCard
            key={index}
            character={option}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      case "factions":
        return (
          <FactionCard
            key={index}
            faction={option}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      case "settings":
        return (
          <SettingCard
            key={index}
            setting={option}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      case "events":
        return (
          <EventCard
            key={index}
            event={option}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      case "relics":
        return (
          <RelicCard
            key={index}
            relic={option}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">{stageConfig.title}</h1>
        <p className="text-muted-foreground">{stageConfig.description}</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 text-center">
          <div className="border-primary inline-block h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-4">
            Generating {stageConfig.category}...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border-destructive text-destructive mb-8 rounded-lg border p-4">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && generatedOptions.length > 0 && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {generatedOptions.map((option, index) => renderCard(option, index))}
          </div>

          {/* Action Buttons */}
          <ActionButtons
            hasSelection={selectedIndex !== null}
            hasRegenerated={hasRegenerated}
            isLoading={isLoading || generateDraftMutation.isPending}
            isLastStage={stage === "relics"}
            onRegenerate={handleRegenerate}
            onNext={handleNext}
          />
        </>
      )}

      {/* Empty State */}
      {!isLoading && generatedOptions.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No options available.</p>
        </div>
      )}

      {/* Full Story Generation Loading Overlay */}
      {generateDraftMutation.isPending && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="border-primary/20 border-t-primary h-24 w-24 animate-spin rounded-full border-4"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="text-primary h-8 w-8" />
                </div>
              </div>
            </div>
            <h2 className="text-foreground mb-4 text-2xl font-bold">
              {loadingMessages[currentLoadingMessage]}
            </h2>
            <p className="text-muted-foreground">
              Weaving your chosen elements into an epic adventure...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
