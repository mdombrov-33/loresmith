"use client";

import { useWorldsLogic } from "@/hooks/useWorldsLogic";
import { useState } from "react";
import { useWorlds } from "@/lib/queries/world";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, BookOpen } from "lucide-react";
import ExpandableWorldCards from "@/components/discover/ExpandableWorldCards";
import WorldFilters from "@/components/shared/WorldFilters";
import { WorldGridSkeleton } from "@/components/discover/LoadingSkeletons";
import { useAppStore } from "@/stores/appStore";
import { World } from "@/lib/schemas";
import EmptyMyWorldsState from "./EmptyMyWorldsState";
import EmptyPlayingState from "./EmptyPlayingState";

export default function MyWorldsPageClient() {
  const [activeTab, setActiveTab] = useState("my-worlds");
  const { user } = useAppStore();

  const [playingTheme, setPlayingTheme] = useState("");
  const [playingStatus, setPlayingStatus] = useState("");
  const [playingSort, setPlayingSort] = useState("created_at_desc");
  const [playingViewMode, setPlayingViewMode] = useState<"grid" | "row">(
    "grid",
  );

  const {
    selectedTheme,
    selectedStatus,
    selectedSort,
    handleThemeChange,
    handleStatusChange,
    handleSortChange,
    viewMode,
    setViewMode,
    allWorlds: myWorldsData,
    isAllWorldsLoading: myWorldsLoading,
  } = useWorldsLogic({ scope: "my", appStage: "my-worlds" });

  const myWorlds = myWorldsData.filter(
    (world: World) => world.user_id === user?.id,
  );

  //* Fetch playing worlds from "my" scope (includes private worlds with sessions, but no usernames)
  const { data: myPlayingWorldsData, isLoading: myPlayingWorldsLoading } =
    useWorlds({
      scope: "my",
      theme: playingTheme || undefined,
      status: playingStatus || undefined,
      sort: playingSort || undefined,
      limit: 50,
    });

  //* Fetch playing worlds from "global" scope (published worlds with sessions + usernames)
  const {
    data: globalPlayingWorldsData,
    isLoading: globalPlayingWorldsLoading,
  } = useWorlds({
    scope: "global",
    theme: playingTheme || undefined,
    status: playingStatus || undefined,
    sort: playingSort || undefined,
    limit: 50,
  });

  const myPlayingWorlds = myPlayingWorldsData?.worlds || [];
  const globalPlayingWorlds = globalPlayingWorldsData?.worlds || [];

  //* Combine both, preferring "global" version (has usernames) over "my" version
  const worldMap = new Map();
  //* Add "my" worlds first (no usernames)
  myPlayingWorlds.forEach((world: World) => {
    if (world.session_id) {
      worldMap.set(world.id, world);
    }
  });
  //* Overwrite with "global" worlds (has usernames) if they exist
  globalPlayingWorlds.forEach((world: World) => {
    if (world.session_id) {
      worldMap.set(world.id, world);
    }
  });
  const activePlayingWorlds = Array.from(worldMap.values());

  const playingWorldsLoading =
    myPlayingWorldsLoading || globalPlayingWorldsLoading;

  return (
    <main className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="from-foreground to-foreground/80 mb-3 bg-gradient-to-br bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            My Worlds
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your created worlds and continue your adventures
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-card mb-8 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-worlds" className="gap-2">
              <Sparkles className="h-4 w-4" />
              My Worlds
            </TabsTrigger>
            <TabsTrigger value="playing" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Playing
            </TabsTrigger>
          </TabsList>

          {/* My Worlds Tab */}
          <TabsContent value="my-worlds" className="space-y-6">
            {/* Filters */}
            <WorldFilters
              selectedTheme={selectedTheme}
              selectedStatus={selectedStatus}
              onThemeChange={handleThemeChange}
              onStatusChange={handleStatusChange}
              selectedSort={selectedSort}
              onSortChange={handleSortChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Worlds Grid */}
            {myWorldsLoading ? (
              <WorldGridSkeleton viewMode={viewMode} />
            ) : myWorlds.length === 0 ? (
              <EmptyMyWorldsState />
            ) : (
              <ExpandableWorldCards
                worlds={myWorlds}
                viewMode={viewMode}
                showAuthor={false}
              />
            )}
          </TabsContent>

          {/* Playing Tab */}
          <TabsContent value="playing" className="space-y-6">
            {/* Filters */}
            <WorldFilters
              selectedTheme={playingTheme}
              selectedStatus={playingStatus}
              onThemeChange={setPlayingTheme}
              onStatusChange={setPlayingStatus}
              selectedSort={playingSort}
              onSortChange={setPlayingSort}
              viewMode={playingViewMode}
              onViewModeChange={setPlayingViewMode}
              showStatusFilter={false}
            />

            {/* Worlds Grid */}
            {playingWorldsLoading ? (
              <WorldGridSkeleton viewMode={playingViewMode} />
            ) : activePlayingWorlds.length === 0 ? (
              <EmptyPlayingState />
            ) : (
              <ExpandableWorldCards
                worlds={activePlayingWorlds}
                viewMode={playingViewMode}
                showAuthor="conditional"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
