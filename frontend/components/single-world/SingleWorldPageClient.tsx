"use client";

import { useWorldIdLogic } from "@/hooks/useWorldIdLogic";
import SingleWorldLoading from "@/components/single-world/SingleWorldLoading";
import SingleWorldError from "@/components/single-world/SingleWorldError";
import SingleWorldHero from "@/components/single-world/SingleWorldHero";
import SingleWorldTabbedContent from "@/components/single-world/SingleWorldTabbedContent";
import SingleWorldActions from "@/components/single-world/SingleWorldActions";

export default function SingleWorldPageClient() {
  const {
    isLoading,
    displayError,
    parsedStory,
    paragraphs,
    lorePieces,
    displayNames,
    actualTheme,
    worldId,
    world,
  } = useWorldIdLogic();

  if (isLoading) {
    return <SingleWorldLoading />;
  }

  if (displayError) {
    return <SingleWorldError error={displayError} />;
  }

  //* Extract character piece for hero portrait
  const characterPiece = lorePieces?.find(
    (piece) => piece?.type === "character",
  );

  return (
    <main className="bg-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <SingleWorldHero
          parsedStory={parsedStory}
          theme={actualTheme}
          characterPiece={characterPiece}
          activeSessions={world?.active_sessions}
          worldId={worldId}
          rating={world?.rating}
          userRating={world?.user_rating}
          ratingCount={world?.rating_count}
        />
        <SingleWorldTabbedContent
          parsedStory={parsedStory}
          paragraphs={paragraphs}
          lorePieces={lorePieces}
          displayNames={displayNames}
        />
      </div>
      <SingleWorldActions theme={actualTheme} worldId={worldId} />
    </main>
  );
}
