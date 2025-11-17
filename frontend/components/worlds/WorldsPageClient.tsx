"use client";

import { useWorldsLogic } from "@/hooks/useWorldsLogic";
import WorldLoading from "@/components/worlds/WorldLoading";
import WorldError from "@/components/worlds/WorldError";
import WorldHero from "@/components/worlds/WorldHero";
import WorldTabbedContent from "@/components/worlds/WorldTabbedContent";
import WorldActions from "@/components/worlds/WorldActions";

export default function WorldsPageClient() {
  const {
    isLoading,
    displayError,
    parsedStory,
    paragraphs,
    lorePieces,
    displayNames,
    sortDetails,
    actualTheme,
    worldId,
  } = useWorldsLogic();

  if (isLoading) {
    return <WorldLoading />;
  }

  if (displayError) {
    return <WorldError error={displayError} />;
  }

  // Extract character piece for hero portrait
  const characterPiece = lorePieces?.find((piece) => piece.type === "character");

  return (
    <main className="bg-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <WorldHero
          parsedStory={parsedStory}
          theme={actualTheme}
          characterPiece={characterPiece}
        />
        <WorldTabbedContent
          parsedStory={parsedStory}
          paragraphs={paragraphs}
          lorePieces={lorePieces}
          displayNames={displayNames}
          sortDetails={sortDetails}
        />
      </div>
      <WorldActions theme={actualTheme} worldId={worldId} />
    </main>
  );
}
