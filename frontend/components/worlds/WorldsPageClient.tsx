"use client";

import { useWorldsLogic } from "@/hooks/useWorldsLogic";
import WorldLoading from "@/components/worlds/WorldLoading";
import WorldError from "@/components/worlds/WorldError";
import WorldHeader from "@/components/worlds/WorldHeader";
import WorldQuestDescription from "@/components/worlds/WorldQuestDescription";
import WorldStoryContent from "@/components/worlds/WorldStoryContent";
import WorldLorePieces from "@/components/worlds/WorldLorePieces";
import WorldActions from "@/components/worlds/WorldActions";

export default function WorldsPageClient() {
  const {
    isLoading,
    displayError,
    parsedStory,
    paragraphs,
    lorePieces,
    displayNames,
    truncateText,
    sortDetails,
    actualTheme,
  } = useWorldsLogic();

  if (isLoading) {
    return <WorldLoading />;
  }

  if (displayError) {
    return <WorldError error={displayError} />;
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <WorldHeader parsedStory={parsedStory} />
      <WorldQuestDescription parsedStory={parsedStory} />
      <WorldStoryContent paragraphs={paragraphs} />
      <WorldLorePieces
        lorePieces={lorePieces}
        displayNames={displayNames}
        truncateText={truncateText}
        sortDetails={sortDetails}
      />
      <WorldActions theme={actualTheme} />
    </main>
  );
}
