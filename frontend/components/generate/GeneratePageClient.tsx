"use client";

import { useGenerationLogic } from "@/hooks/useGenerationLogic";
import GenerateHeader from "@/components/generate/GenerateHeader";
import GenerateLoading from "@/components/generate/GenerateLoading";
import GenerateError from "@/components/generate/GenerateError";
import GenerateGrid from "@/components/generate/GenerateGrid";
import GenerateActions from "@/components/generate/GenerateActions";
import GenerateEmpty from "@/components/generate/GenerateEmpty";
import GenerateOverlay from "@/components/generate/GenerateOverlay";

export default function GeneratePageClient() {
  const {
    stageConfig,
    isLoading,
    error,
    generatedOptions,
    selectedIndex,
    hasRegenerated,
    generateDraftMutation,
    currentLoadingMessage,
    handleSelectCard,
    handleRegenerate,
    handleNext,
    refetch,
  } = useGenerationLogic();

  return (
    <main className="container mx-auto px-4 py-12">
      <GenerateHeader
        title={stageConfig.title}
        description={stageConfig.description}
      />
      <GenerateLoading isLoading={isLoading} category={stageConfig.category} />
      <GenerateError error={error} onRefetch={refetch} />
      <GenerateGrid
        generatedOptions={generatedOptions}
        selectedIndex={selectedIndex}
        stage={stageConfig.category}
        onSelectCard={handleSelectCard}
      />
      <GenerateActions
        hasSelection={selectedIndex !== null}
        hasRegenerated={hasRegenerated}
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
