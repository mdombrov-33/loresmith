"use client";

import { useWorldIdLogic } from "@/hooks/useWorldIdLogic";
import SingleWorldLoading from "@/components/single-world/SingleWorldLoading";
import SingleWorldError from "@/components/single-world/SingleWorldError";
import SingleWorldHero from "@/components/single-world/SingleWorldHero";
import SingleWorldTabbedContent from "@/components/single-world/SingleWorldTabbedContent";
import SingleWorldMetadata from "@/components/single-world/SingleWorldMetadata";

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
    <main className="bg-background pb-20">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <SingleWorldHero
          parsedStory={parsedStory}
          theme={actualTheme}
          characterPiece={characterPiece}
          worldId={worldId}
          world={world}
        />

        {/* Two-column layout: Tabs left, Metadata sidebar right */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Tabbed Content (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            <SingleWorldTabbedContent
              parsedStory={parsedStory}
              paragraphs={paragraphs}
              lorePieces={lorePieces}
              displayNames={displayNames}
            />
          </div>

          {/* Right: Metadata Sidebar (1/3 width on desktop) */}
          <div className="lg:col-span-1">
            <SingleWorldMetadata
              world={world}
              theme={actualTheme}
              activeSessions={world?.active_sessions}
              rating={world?.rating}
              userRating={world?.user_rating}
              ratingCount={world?.rating_count}
              worldId={worldId}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
