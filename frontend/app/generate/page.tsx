"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { generateLore, generateDraft } from "@/lib/api";
import { STAGE_CONFIG, getNextStage } from "@/constants/stage-config";

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "fantasy";
  const { setAppStage, updateSelectedLore } = useAppStore();

  const [stage, setStage] = useState<GenerationStage>("characters");
  const [generatedOptions, setGeneratedOptions] = useState<LorePiece[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRegenerated, setHasRegenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stageConfig = STAGE_CONFIG[stage];

  //* Set app stage on mount and cleanup on unmount
  useEffect(() => {
    setAppStage("generating");
    return () => setAppStage("home");
  }, [setAppStage]);

  //* Generate on mount and when stage changes
  useEffect(() => {
    generateCurrentStage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const generateCurrentStage = async (regenerate: boolean = false) => {
    setIsLoading(true);
    setError(null);
    setSelectedIndex(null);
    setHasRegenerated(regenerate);

    try {
      const data = await generateLore(
        stageConfig.category as
          | "characters"
          | "factions"
          | "settings"
          | "events"
          | "relics",
        theme,
        3,
        regenerate,
      );
      setGeneratedOptions(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to generate ${stageConfig.category}`,
      );
      console.error("Generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCard = (index: number) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  const handleRegenerate = async () => {
    await generateCurrentStage(true);
  };

  const handleNext = async () => {
    if (selectedIndex === null) return;

    //* Save the selected lore piece
    const selectedPiece = generatedOptions[selectedIndex];
    const stageKey = stage as keyof SelectedLore;

    updateSelectedLore(stageKey, selectedPiece);

    //* Move to next stage
    const nextStage = getNextStage(stage);
    if (nextStage) {
      if (nextStage === "full-story") {
        //* Generate draft world and navigate to story page
        setIsLoading(true);
        try {
          const selectedLore = useAppStore.getState().selectedLore;
          const response = await generateDraft(selectedLore, theme);
          // Redirect to the new world route which includes theme and id
          window.location.href = `/worlds/${encodeURIComponent(
            theme,
          )}/${response.world_id}`;
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to generate draft world",
          );
          console.error("Draft generation error:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setStage(nextStage);
        setHasRegenerated(false);
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
            onClick={() => generateCurrentStage()}
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
            isLoading={isLoading}
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
    </div>
  );
}
