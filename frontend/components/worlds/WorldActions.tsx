"use client";

import { useRouter } from "next/navigation";
import ActionButton from "@/components/shared/ActionButton";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Compass, Wand2, Eye, Home, ChevronRight, Play } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useStartAdventure, useCheckActiveSession } from "@/lib/queries";

interface WorldActionsProps {
  theme: string;
  worldId: number;
}

export default function WorldActions({ theme, worldId }: WorldActionsProps) {
  const router = useRouter();
  const { theme: currentTheme } = useAppStore();
  const startAdventureMutation = useStartAdventure();
  const { data: sessionCheck, isLoading: isCheckingSession } = useCheckActiveSession(worldId);

  const handleCreateNewStory = () => {
    router.push(`/generate?theme=${theme}`);
  };

  const handleExploreWorlds = () => {
    const { searchTheme, searchStatus } = useAppStore.getState();
    const params = new URLSearchParams();
    if (searchTheme) params.set("theme", searchTheme);
    if (searchStatus) params.set("status", searchStatus);
    const query = params.toString();
    router.push(query ? `/worlds-hub?${query}` : "/worlds-hub");
  };

  const handleReturnHome = () => {
    const themeToUse = currentTheme || theme || "fantasy";
    router.push(`/?theme=${themeToUse}`);
  };

  const handleBeginAdventure = async () => {
    try {
      //* If active session exists, resume it
      if (sessionCheck?.has_active_session && sessionCheck?.session) {
        router.push(`/adventure/${sessionCheck.session.id}`);
      } else {
        //* Otherwise start a new session
        const result = await startAdventureMutation.mutateAsync(worldId);
        router.push(`/adventure/${result.session_id}`);
      }
    } catch (error) {
      console.error("Failed to start adventure:", error);
    }
  };

  const hasActiveSession = sessionCheck?.has_active_session ?? false;

  return (
    <>
      {startAdventureMutation.isPending && (
        <LoadingSpinner
          title={hasActiveSession ? "Resuming Adventure" : "Initializing Adventure"}
          description={hasActiveSession ? "Loading your journey..." : "Preparing your journey..."}
        />
      )}
      <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border/50 sticky bottom-0 z-20 border-t py-6 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            {/* Primary CTA */}
            <ActionButton
              size="lg"
              onClick={handleBeginAdventure}
              disabled={startAdventureMutation.isPending || isCheckingSession}
              className="group hover:shadow-primary/25 h-14 gap-3 px-8 text-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              {hasActiveSession ? (
                <>
                  <Play className="h-5 w-5 transition-transform group-hover:scale-110" />
                  {startAdventureMutation.isPending ? "Resuming..." : "Resume Your Adventure"}
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              ) : (
                <>
                  <Compass className="h-5 w-5 transition-transform group-hover:rotate-12" />
                  {startAdventureMutation.isPending ? "Starting..." : "Begin Your Adventure"}
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </ActionButton>

          {/* Secondary Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <ActionButton
              variant="outline"
              size="sm"
              onClick={() => handleCreateNewStory()}
              className="gap-2 transition-all hover:scale-105"
            >
              <Wand2 className="h-4 w-4" />
              Create New Story
            </ActionButton>
            <ActionButton
              variant="outline"
              size="sm"
              onClick={() => handleExploreWorlds()}
              className="gap-2 transition-all hover:scale-105"
            >
              <Eye className="h-4 w-4" />
              Explore Worlds
            </ActionButton>
            <ActionButton
              variant="outline"
              size="sm"
              onClick={() => handleReturnHome()}
              className="gap-2 transition-all hover:scale-105"
            >
              <Home className="h-4 w-4" />
              Return Home
            </ActionButton>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
