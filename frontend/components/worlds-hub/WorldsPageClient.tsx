"use client";

import { useWorldsHubLogic } from "@/hooks/useWorldsHubLogic";
import MyHubStats from "@/components/worlds-hub/MyHubStats";
import MyHubActions from "@/components/worlds-hub/MyHubActions";
import MyHubFilters from "@/components/worlds-hub/MyHubFilters";
import MyHubTable from "@/components/worlds-hub/MyHubTable";
import DiscoverFilters from "@/components/worlds-hub/DiscoverFilters";
import SearchBar from "@/components/worlds-hub/DiscoverSearch";
import DiscoverGrid from "@/components/worlds-hub/DiscoverGrid";
import LoadingState from "@/components/worlds-hub/states/LoadingState";
import ErrorState from "@/components/worlds-hub/states/ErrorState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function WorldsPageClient() {
  const {
    selectedScope,
    setSelectedScope,
    selectedTheme,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleThemeChange,
    worlds,
    myWorlds,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useWorldsHubLogic();

  return (
    <main className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-4xl font-bold">World Hub</h1>
          <p className="text-muted-foreground text-lg">
            Manage your worlds, discover new adventures, and track your active
            sessions
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={selectedScope}
          onValueChange={(value) => setSelectedScope(value as "my" | "global")}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="my" className="px-8">
              My Hub
            </TabsTrigger>
            <TabsTrigger value="global" className="px-8">
              Discover
            </TabsTrigger>
          </TabsList>

          {/* MY HUB TAB - Dashboard Layout */}
          <TabsContent value="my" className="mt-0 space-y-6">
            {/* Quick Actions */}
            <MyHubActions myWorlds={myWorlds} />

            {/* Stats */}
            <MyHubStats myWorlds={myWorlds} scope="my" />

            {/* Filters */}
            <MyHubFilters
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              worldCount={worlds.length}
            />

            {/* Worlds Table */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border-border bg-card/50 h-24 animate-pulse rounded-lg border"
                  />
                ))}
              </div>
            ) : error ? (
              <ErrorState error={error} />
            ) : (
              <>
                <MyHubTable worlds={worlds} isLoading={isLoading} />
                {totalPages > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          if (totalPages <= 5) return i + 1;
                          if (currentPage <= 3) return i + 1;
                          if (currentPage >= totalPages - 2)
                            return totalPages - 4 + i;
                          return currentPage - 2 + i;
                        },
                      ).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1),
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>

          {/* DISCOVER TAB - Search & Filter Layout */}
          <TabsContent value="global" className="mt-0 space-y-6">
            {/* Search */}
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={handleSearch}
              isLoading={isLoading}
            />

            {/* Filters */}
            <DiscoverFilters
              selectedTheme={selectedTheme}
              selectedStatus={selectedStatus}
              onThemeChange={handleThemeChange}
              onStatusChange={setSelectedStatus}
            />

            {/* Results */}
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState error={error} />
            ) : (
              <>
                <DiscoverGrid worlds={worlds} scope={selectedScope} />
                {totalPages > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ),
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1),
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
