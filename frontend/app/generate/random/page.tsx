"use client";

import { useSearchParams } from "next/navigation";
import { useRandomGeneration } from "@/hooks/useRandomGeneration";
import GenerateHeader from "@/components/generate/GenerateHeader";
import GenerateLoading from "@/components/generate/GenerateLoading";
import GenerateError from "@/components/generate/GenerateError";
import GenerateGrid from "@/components/generate/GenerateGrid";
import GenerateActions from "@/components/generate/GenerateActions";
import GenerateEmpty from "@/components/generate/GenerateEmpty";
import GenerateOverlay from "@/components/generate/GenerateOverlay";
import StageProgress from "@/components/generate/StageProgress";
import StageTransition from "@/components/generate/StageTransition";
import { getThemeFont } from "@/constants/game-themes";

export default function RandomGeneratePage() {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "fantasy";
  const themeFont = getThemeFont(theme);

  const {
    stageConfig,
    isLoading,
    error,
    generatedOptions,
    selectedIndex,
    generateDraftMutation,
    currentLoadingMessage,
    handleSelectCard,
    handleRegenerate,
    handleNext,
    refetch,
  } = useRandomGeneration();

  return (
    <main className={`container mx-auto px-4 py-12 ${themeFont}`}>
      <GenerateHeader
        title={stageConfig.title}
        description={stageConfig.description}
      />
      <StageProgress currentStage={stageConfig.category} />
      <GenerateLoading
        isLoading={isLoading}
        category={stageConfig.category}
      />
      <GenerateError error={error} onRefetch={refetch} />
      <StageTransition stageKey={stageConfig.category}>
        <GenerateGrid
          generatedOptions={generatedOptions}
          selectedIndex={selectedIndex}
          stage={stageConfig.category}
          onSelectCard={handleSelectCard}
        />
      </StageTransition>
      <GenerateActions
        hasSelection={selectedIndex !== null}
        isLoading={isLoading || generateDraftMutation.isPending}
        isLastStage={stageConfig.category === "relics"}
        onRegenerate={handleRegenerate}
        onNext={handleNext}
      />
      <GenerateEmpty show={!isLoading && generatedOptions.length === 0} />
      <GenerateOverlay
        isPending={generateDraftMutation.isPending}
        currentMessage={currentLoadingMessage}
      />
    </main>
  );
}
