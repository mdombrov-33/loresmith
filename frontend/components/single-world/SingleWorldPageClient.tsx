"use client";

import { useState } from "react";
import { useWorldIdLogic } from "@/hooks/useWorldIdLogic";
import SingleWorldLoading from "@/components/single-world/SingleWorldLoading";
import SingleWorldError from "@/components/single-world/SingleWorldError";
import SingleWorldHero from "@/components/single-world/SingleWorldHero";
import SingleWorldTabbedContent from "@/components/single-world/SingleWorldTabbedContent";
import SingleWorldMetadata from "@/components/single-world/SingleWorldMetadata";
import { ActionLoading } from "@/components/shared/LoadingStates";

export default function SingleWorldPageClient() {
  const [isStartingAdventure, setIsStartingAdventure] = useState(false);

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

  if (isStartingAdventure) {
    return (
      <ActionLoading
        title="Initializing Adventure"
        description="Preparing your journey..."
      />
    );
  }

  //* Extract character piece for hero portrait
  const characterPiece = lorePieces?.find(
    (piece) => piece?.type === "character",
  );

  return (
    <main className="from-background via-background to-muted/10 min-h-screen bg-gradient-to-b pb-20">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <SingleWorldHero
          parsedStory={parsedStory}
          theme={actualTheme}
          characterPiece={characterPiece}
          worldId={worldId}
          world={world}
        />

        {/* Two-column cinematic layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Left Column: Main Content (2/3 width) */}
          <div className="divider-glow lg:col-span-2 lg:pr-8">
            <div className="content-panel rounded-xl p-6 md:p-8">
              <SingleWorldTabbedContent
                parsedStory={parsedStory}
                paragraphs={paragraphs}
                lorePieces={lorePieces}
                displayNames={displayNames}
              />
            </div>
          </div>

          {/* Right Column: Sidebar (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sidebar-panel rounded-xl p-6">
              <SingleWorldMetadata
                world={world}
                theme={actualTheme}
                activeSessions={world?.active_sessions}
                rating={world?.rating}
                userRating={world?.user_rating}
                ratingCount={world?.rating_count}
                worldId={worldId}
                onAdventureStarting={setIsStartingAdventure}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
