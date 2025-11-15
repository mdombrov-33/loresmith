"use client";

import { useSearchParams } from "next/navigation";
import { useGenerationLogic } from "@/hooks/useGenerationLogic";
import GenerateHeader from "@/components/generate/GenerateHeader";
import GenerateLoading from "@/components/generate/GenerateLoading";
import GenerateError from "@/components/generate/GenerateError";
import GenerateGrid from "@/components/generate/GenerateGrid";
import GenerateActions from "@/components/generate/GenerateActions";
import GenerateEmpty from "@/components/generate/GenerateEmpty";
import GenerateOverlay from "@/components/generate/GenerateOverlay";
import ActionButton from "@/components/shared/ActionButton";
import StageProgress from "@/components/generate/StageProgress";
import StageTransition from "@/components/generate/StageTransition";
import { getThemeFont } from "@/constants/game-themes";

export default function GeneratePageClient() {
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
    generationMode,
    handleSelectCard,
    handleRegenerate,
    handleNext,
    handleSelectRandom,
    handleSelectCustom,
    refetch,
  } = useGenerationLogic();

  return (
    <main className={`container mx-auto px-4 py-12 ${themeFont}`}>
      {generationMode === null ? (
        <>
          <GenerateHeader
            title="Choose Your Adventure Type"
            description="Select how you'd like to generate your world"
          />
          <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <ActionButton
              onClick={handleSelectRandom}
              size="lg"
              className="w-full px-12 py-6 text-xl font-semibold sm:w-auto"
            >
              Random Adventure
            </ActionButton>
            <ActionButton
              onClick={handleSelectCustom}
              disabled
              size="lg"
              className="w-full px-12 py-6 text-xl font-semibold sm:w-auto"
            >
              Custom Adventure (Coming Soon)
            </ActionButton>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}
    </main>
  );
}
