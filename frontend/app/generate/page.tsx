"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  GenerationStage,
  SelectedLore,
  LorePiece,
} from "@/types/generate-world";
import { CharacterCard } from "@/components/generate/CharacterCard";
import { ActionButtons } from "@/components/generate/ActionButtons";
import { generateLore } from "@/lib/api";

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "fantasy";

  // State management
  const [stage, setStage] = useState<GenerationStage>("characters");
  const [selectedLore, setSelectedLore] = useState<SelectedLore>({});
  const [generatedOptions, setGeneratedOptions] = useState<LorePiece[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRegenerated, setHasRegenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate on mount
  useEffect(() => {
    generateCharacters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateCharacters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateLore("characters", theme, 3);
      setGeneratedOptions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate characters",
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
    setHasRegenerated(true);
    setSelectedIndex(null);
    await generateCharacters();
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      // Save selection
      setSelectedLore({
        ...selectedLore,
        [stage]: generatedOptions[selectedIndex],
      });
      console.log("Moving to next stage...");
      // TODO: Move to next stage
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">
          Choose Your {stage.charAt(0).toUpperCase() + stage.slice(1)}
        </h1>
        <p className="text-muted-foreground">
          Select one of the generated options below
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 text-center">
          <div className="border-primary inline-block h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-4">Generating characters...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border-destructive text-destructive mb-8 rounded-lg border p-4">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
          <button
            onClick={generateCharacters}
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
            {generatedOptions.map((option, index) => (
              <CharacterCard
                key={index}
                character={option}
                isSelected={selectedIndex === index}
                onSelect={() => handleSelectCard(index)}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <ActionButtons
            hasSelection={selectedIndex !== null}
            hasRegenerated={hasRegenerated}
            isLoading={isLoading}
            onRegenerate={handleRegenerate}
            onNext={handleNext}
          />
        </>
      )}

      {/* Empty State */}
      {!isLoading && generatedOptions.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No characters generated yet</p>
        </div>
      )}
    </div>
  );
}
