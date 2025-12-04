"use client";

import { useWorldsLogic } from "@/hooks/useWorldsLogic";
import { useState } from "react";
import { useWorlds } from "@/lib/queries/world";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Globe, BookOpen } from "lucide-react";
import ExpandableWorldCards from "@/components/discover/ExpandableWorldCards";
import DiscoverFilters from "@/components/discover/DiscoverFilters";
import { WorldGridSkeleton } from "@/components/discover/LoadingSkeletons";

export default function MyWorlds() {
  const [activeTab, setActiveTab] = useState("my-worlds");

  // Use unified hook for my-worlds scope
  const {
    selectedTheme,
    selectedStatus,
    selectedSort,
    handleThemeChange,
    handleStatusChange,
    handleSortChange,
    viewMode,
    setViewMode,
    allWorlds: myWorlds,
    isAllWorldsLoading: myWorldsLoading,
  } = useWorldsLogic({ scope: "my", appStage: "my-worlds" });

  //* Fetch playing worlds (worlds I'm in adventures for)
  const { data: playingWorldsData, isLoading: playingWorldsLoading } =
    useWorlds({
      scope: "global",
      limit: 50,
    });

  const playingWorlds = playingWorldsData?.worlds || [];

  //* Filter playing worlds to only those with active sessions
  const activePlayingWorlds = playingWorlds.filter((world) => world.session_id);

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
            <DiscoverFilters
              selectedTheme={selectedTheme}
              selectedStatus={selectedStatus}
              onThemeChange={handleThemeChange}
              onStatusChange={handleStatusChange}
              selectedSort={selectedSort}
              onSortChange={handleSortChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />{" "}
            {/* Worlds Grid */}
            {myWorldsLoading ? (
              <WorldGridSkeleton viewMode={viewMode} />
            ) : myWorlds.length === 0 ? (
              <div className="border-border bg-card/50 flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border p-12">
                <Globe className="text-muted-foreground h-16 w-16" />
                <h3 className="text-foreground text-xl font-semibold">
                  No Worlds Yet
                </h3>
                <p className="text-muted-foreground text-center">
                  Start creating your first world by clicking the Create button
                  above!
                </p>
              </div>
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
            {playingWorldsLoading ? (
              <WorldGridSkeleton viewMode="grid" />
            ) : activePlayingWorlds.length === 0 ? (
              <div className="border-border bg-card/50 flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border p-12">
                <BookOpen className="text-muted-foreground h-16 w-16" />
                <h3 className="text-foreground text-xl font-semibold">
                  No Active Adventures
                </h3>
                <p className="text-muted-foreground text-center">
                  Start an adventure in any published world to see it here!
                </p>
              </div>
            ) : (
              <ExpandableWorldCards
                worlds={activePlayingWorlds}
                viewMode="grid"
                showAuthor="conditional"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
