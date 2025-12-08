"use client";

import { useSearchParams } from "next/navigation";
import { useRandomGeneration } from "@/hooks/useRandomGeneration";
import GenerateHeader from "@/components/generate/GenerateHeader";
import GenerateLoading from "@/components/generate/GenerateLoading";
import GenerateError from "@/components/generate/GenerateError";
import GenerateGrid from "@/components/generate/GenerateGrid";
import GenerateActions from "@/components/generate/GenerateActions";
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
    loreJob,
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
        job={loreJob}
      />
      <GenerateError error={error} isLoading={isLoading} onRefetch={refetch} />
      {!isLoading && (
        <StageTransition stageKey={stageConfig.category}>
          <GenerateGrid
            generatedOptions={generatedOptions}
            selectedIndex={selectedIndex}
            stage={stageConfig.category}
            onSelectCard={handleSelectCard}
          />
        </StageTransition>
      )}
      <GenerateActions
        hasSelection={selectedIndex !== null}
        isLoading={isLoading || generateDraftMutation.isPending}
        isLastStage={stageConfig.category === "relics"}
        hasError={!!error}
        onRegenerate={handleRegenerate}
        onNext={handleNext}
      />
      <GenerateOverlay
        isPending={generateDraftMutation.isPending}
        currentMessage={currentLoadingMessage}
        job={generateDraftMutation.job}
      />
    </main>
  );
}
